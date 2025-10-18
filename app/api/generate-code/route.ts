import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { generateCode, parseGeneratedCode, saveGeneratedCode } from "@/lib/code-generation"
import { checkRateLimit, updateTokenUsage } from "@/lib/llm/server-providers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, title, framework = "nextjs", provider = "openai", model = "gpt-4" } = await request.json()

    if (!prompt || !title) {
      return NextResponse.json({ error: "Prompt and title are required" }, { status: 400 })
    }

    // Check rate limit
    const rateLimit = await checkRateLimit(user.id)
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Daily token limit exceeded. Please try again tomorrow." }, { status: 429 })
    }

    try {
      // Generate code using LLM
      const { content, tokens } = await generateCode(user.id, prompt, framework, provider, model)

      // Parse the generated code
      const { title: generatedTitle, description, files } = await parseGeneratedCode(content)

      // Use provided title or fallback to generated title
      const finalTitle = title || generatedTitle

      // Save to database
      const projectId = await saveGeneratedCode(user.id, finalTitle, description, framework, files)

      // Update token usage
      await updateTokenUsage(user.id, tokens)

      // Return the project data
      const project = {
        id: projectId,
        title: finalTitle,
        description,
        framework,
        files,
        createdAt: new Date(),
      }

      return NextResponse.json(project)
    } catch (llmError: any) {
      console.error("Code generation error:", llmError)
      return NextResponse.json({ error: `Code generation failed: ${llmError.message}` }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating code:", error)
    return NextResponse.json({ error: "Failed to generate code" }, { status: 500 })
  }
}
