import { type NextRequest, NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { checkRateLimit, updateTokenUsage, generateResponse, generateDemoCode } from "@/lib/llm/server-providers"

export async function POST(request: NextRequest) {
  try {
    const { prompt, files, settings } = await request.json()

    let userId = null
    try {
      const { getUser } = getKindeServerSession()
      const user = await getUser()
      userId = user?.id
    } catch (error) {
      console.log("[v0] Kinde not configured - using preview mode")
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt provided" }, { status: 400 })
    }

    const generatedCode = await generateCodeServerSide({
      prompt,
      files: files || [],
      settings: {
        model: settings?.model || "gpt-4",
        temperature: settings?.temperature || 0.7,
        framework: settings?.framework || "react",
      },
      userId,
    })

    return NextResponse.json({
      success: true,
      content: generatedCode.code,
      code: generatedCode.code,
      framework: generatedCode.framework,
      files: generatedCode.files,
      usage: { used: generatedCode.tokensUsed, limit: 10000 },
      tokens: generatedCode.tokensUsed,
      buildErrors: generatedCode.buildErrors || [],
    })
  } catch (error) {
    console.error("[v0] Editor generation error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Generation failed",
        success: false,
      },
      { status: 500 },
    )
  }
}

async function generateCodeServerSide({
  prompt,
  files = [],
  settings,
  userId,
}: {
  prompt: string
  files?: Array<{ name: string; content: string; type: string }>
  settings: {
    model: string
    temperature: number
    framework: string
  }
  userId?: string | null
}): Promise<{
  code: string
  framework: string
  files: Array<{ name: string; content: string; type: string }>
  tokensUsed: number
  buildErrors: string[]
}> {
  try {
    if (userId) {
      const rateLimit = await checkRateLimit(userId)
      if (!rateLimit.allowed) {
        throw new Error("Daily token limit exceeded")
      }
    }

    const systemPrompt = `You are an expert full-stack developer. Generate complete, functional ${settings.framework} code based on the user's request.

Requirements:
- Generate production-ready code with proper error handling
- Use modern best practices and clean architecture
- Include proper TypeScript types and interfaces
- Use Tailwind CSS for styling
- Make components responsive and accessible
- Include realistic demo data and functionality
- Return only the code, no explanations

Framework: ${settings.framework}
Files attached: ${files.length > 0 ? files.map((f) => f.name).join(", ") : "None"}`

    let contextualPrompt = prompt
    if (files.length > 0) {
      const fileContext = files.map((f) => `File: ${f.name}\n${f.content}`).join("\n\n")
      contextualPrompt = `${prompt}\n\nContext from attached files:\n${fileContext}`
    }

    let provider = "openai"
    if (settings.model.includes("claude")) provider = "claude"
    if (settings.model.includes("gemini")) provider = "gemini"

    let response
    try {
      response = await generateResponse(provider, settings.model, [
        { role: "system", content: systemPrompt },
        { role: "user", content: contextualPrompt },
      ])
    } catch (error) {
      console.log("[v0] LLM API call failed, using demo mode:", error)
      const demoCode = generateDemoCode(prompt, settings.framework)
      return {
        code: demoCode.code,
        framework: settings.framework,
        files: demoCode.files,
        tokensUsed: 0,
        buildErrors: [],
      }
    }

    if (userId) {
      await updateTokenUsage(userId, response.tokens)
    }

    const generatedCode = response.content
    const detectedFramework = settings.framework || "react"

    return {
      code: generatedCode,
      framework: detectedFramework,
      files: [
        {
          name: `${prompt.toLowerCase().includes("crm") ? "CRM" : "App"}Component.tsx`,
          content: generatedCode,
          type: "component",
        },
      ],
      tokensUsed: response.tokens,
      buildErrors: [],
    }
  } catch (error) {
    console.error("[v0] Code generation error:", error)

    const demoCode = generateDemoCode(prompt, settings.framework)

    return {
      code: demoCode.code,
      framework: settings.framework,
      files: demoCode.files,
      tokensUsed: 0,
      buildErrors: [],
    }
  }
}
