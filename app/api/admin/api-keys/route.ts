import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"

// Using Chat type since we're using the chats table
type Chat = Database['public']['Tables']['chats']['Row']

interface ApiKeyResponse {
  id: string
  provider: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function GET() {
  try {
    await requireAdmin()

    try {
      const supabase = await createClient()

      console.log("[v0] Fetching API keys from Supabase...")

      const { data: chats, error } = await supabase
        .from("chats")
        .select("*")
        .order("created_at", { ascending: false })
        .returns<Chat[]>()

      if (error) {
        console.error("[v0] Supabase error in GET /api/admin/api-keys:", error)
        throw error
      }

      console.log("[v0] Successfully fetched chats:", chats?.length || 0)

      // Transform chat data to match API key format
      const transformedKeys: ApiKeyResponse[] = (chats || []).map((chat) => ({
        id: chat.id,
        provider: 'chat', // Default provider since we're using chats table
        isActive: (chat.metadata as { isActive?: boolean })?.isActive ?? true,
        createdAt: chat.created_at,
        updatedAt: chat.updated_at,
      }))

      return NextResponse.json(transformedKeys)
    } catch (dbError) {
      console.error("[v0] Database error in GET /api/admin/api-keys:", dbError)
      // Return error response if database is unavailable
      return NextResponse.json(
        { error: "Failed to fetch API keys" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[v0] Auth error in GET /api/admin/api-keys:", error)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const { provider, apiKey } = await request.json()

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      )
    }

    try {
      const supabase = await createClient()

      console.log("[v0] Creating chat with API key for provider:", provider)

      // Create a new chat with the API key in the metadata
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          user_id: 'system', // or get from session if available
          title: `API Key - ${provider}`,
          model: provider,
          metadata: { 
            apiKey: apiKey,
            isActive: true 
          }
        } as never) // Type assertion needed due to Supabase type limitations
        .select()
        .single<Chat>()

      if (createError || !newChat) {
        console.error("[v0] Error creating chat:", createError)
        throw createError || new Error('Failed to create chat')
      }

      console.log("[v0] Successfully created chat with API key:", newChat.id)

      return NextResponse.json({
        id: newChat.id,
        provider: newChat.model || provider,
        isActive: (newChat.metadata as { isActive?: boolean })?.isActive ?? true,
        createdAt: newChat.created_at,
        updatedAt: newChat.updated_at,
      })
    } catch (dbError) {
      console.error("[v0] Database error in POST /api/admin/api-keys:", dbError)
      return NextResponse.json(
        { error: "Failed to create API key" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[v0] Error adding API key:", error)
    return NextResponse.json({ error: "Failed to add API key" }, { status: 500 })
  }
}
