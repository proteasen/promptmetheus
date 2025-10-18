import { requireAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

type Chat = {
  id: string
  user_id: string
  title: string
  model: string
  created_at: string
  updated_at: string
  metadata: {
    dailyTokenUsage?: number
    lastResetDate?: string
    [key: string]: any
  }
}

export async function POST(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Get the user's chat to update their token usage in metadata
    const { data: chatData, error: fetchError } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', params.id)
      .single<Chat>()

    if (fetchError || !chatData) {
      console.error("Error finding user's chat:", fetchError)
      return NextResponse.json(
        { error: "User chat not found" },
        { status: 404 }
      )
    }

    // Update the metadata with reset token information
    const updatedMetadata = {
      ...(chatData.metadata || {}),
      dailyTokenUsage: 0,
      lastResetDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Update the chat with the new metadata
    const { data: updatedChat, error } = await supabase
      .from('chats')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString()
      } as never) // Type assertion needed for Supabase client
      .eq('id', chatData.id)
      .select()
      .single<Chat>()

    if (error) {
      console.error("Error resetting tokens:", error)
      throw error
    }

    return NextResponse.json({ 
      success: true,
      userId: params.id,
      chatId: updatedChat?.id,
      resetAt: new Date().toISOString(),
      dailyTokenUsage: 0
    })

  } catch (error) {
    console.error("Error in reset-tokens endpoint:", error)
    return NextResponse.json(
      { 
        error: "Failed to reset tokens",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
}
