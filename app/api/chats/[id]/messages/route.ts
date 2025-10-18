import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { db } from "@/lib/db"
import { generateResponse, checkRateLimit, updateTokenUsage } from "@/lib/llm/server-providers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, attachments = [], provider = "openai", model = "gpt-3.5-turbo" } = await request.json()

    // Verify chat ownership
    const chat = await db.project.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 10, // Get last 10 messages for context
        },
      },
    })

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Daily token limit exceeded. Please try again tomorrow." }, { status: 429 })
    }

    // Create user message
    const userMessage = await db.chatMessage.create({
      data: {
        projectId: params.id,
        userId: user.id,
        role: "user",
        content,
        tokensUsed: 0,
      },
    })

    try {
      // Prepare conversation history
      const conversationHistory = [
        ...chat.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user",
          content,
        },
      ]

      const { content: assistantContent, tokens } = await generateResponse(
        provider,
        model,
        conversationHistory,
        attachments,
      )

      // Create assistant message
      const assistantMessage = await db.chatMessage.create({
        data: {
          projectId: params.id,
          userId: user.id,
          role: "assistant",
          content: assistantContent,
          tokensUsed: tokens,
        },
      })

      // Update token usage
      await updateTokenUsage(user.id, tokens)

      // Update chat timestamp and title if it's the first message
      const updateData: any = { updatedAt: new Date() }
      if (chat.messages.length === 0 && content.length > 0) {
        // Generate a title from the first message
        const title = content.length > 50 ? content.substring(0, 47) + "..." : content
        updateData.title = title
      }

      await db.project.update({
        where: { id: params.id },
        data: updateData,
      })

      return NextResponse.json({
        userMessage,
        assistantMessage,
      })
    } catch (llmError: any) {
      console.error("LLM generation error:", llmError)

      // Create error message
      const assistantMessage = await db.chatMessage.create({
        data: {
          projectId: params.id,
          userId: user.id,
          role: "assistant",
          content: `I apologize, but I encountered an error: ${llmError.message}. Please contact an administrator to check the API key configuration.`,
          tokensUsed: 0,
        },
      })

      return NextResponse.json({
        userMessage,
        assistantMessage,
      })
    }
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
