import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Check database connection
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // Test database connection
    const { data: dbTest, error: dbError } = await supabase
      .from('chats')
      .select('*')
      .limit(1)

    if (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 503 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { status: 'error', message: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV,
      database: 'connected',
      openai: 'configured',
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    )
  }
}
