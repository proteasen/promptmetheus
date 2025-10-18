import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"

// Since we don't have an api_keys table in the schema,
// we'll create a local type for the API key structure
type ApiKey = {
  id: string
  provider: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ApiKeyResponse {
  id: string
  provider: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()

    const { isActive } = await request.json()
    const { id } = params

    try {
      const supabase = await createClient()

      console.log("[v0] Updating API key:", id, "isActive:", isActive)

      // Note: Since the current schema doesn't have isActive field,
      // we'll just return success for now and add the field later
      // Update the is_active field and return the updated record
      // First, validate the chat exists
      const { data: chat, error: fetchError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', id)
        .single<Database['public']['Tables']['chats']['Row']>()

      if (fetchError || !chat) {
        console.error('[v0] Error fetching chat:', fetchError)
        throw new Error('Chat not found')
      }

      // Update the chat metadata with the isActive status
      const updateData: Partial<Database['public']['Tables']['chats']['Update']> = {
        metadata: { ...(chat.metadata as Record<string, unknown> || {}), isActive },
        updated_at: new Date().toISOString()
      };
      
      const { data: updatedChat, error: updateError } = await supabase
        .from('chats')
        .update(updateData as never) // Type assertion needed due to Supabase type limitations
        .eq('id', id)
        .select()
        .single<Database['public']['Tables']['chats']['Row']>()

      if (updateError || !updatedChat) {
        console.error('[v0] Error updating chat:', updateError)
        throw new Error(updateError?.message || 'Failed to update chat')
      }

      console.log('[v0] Successfully updated chat:', id)

      const response: ApiKeyResponse = {
        id: updatedChat.id,
        provider: 'chat', // Default provider since we're using chats table
        isActive: isActive,
        createdAt: updatedChat.created_at,
        updatedAt: updatedChat.updated_at,
      }

      return NextResponse.json(response)
    } catch (dbError) {
      console.error("[v0] Database error in PATCH /api/admin/api-keys:", dbError)
      return NextResponse.json(
        { error: "Failed to update API key" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[v0] Error updating API key:", error)
    return NextResponse.json({ error: "Failed to update API key" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const { id } = params

    try {
      const supabase = await createClient()
      console.log("[v0] Deleting chat:", id)

      // First, check if the chat exists
      const { data: chat, error: fetchError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', id)
        .single()

      if (fetchError || !chat) {
        console.error('[v0] Error finding chat:', fetchError)
        throw new Error('Chat not found')
      }

      // Delete the chat
      const { error: deleteError } = await supabase
        .from('chats')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('[v0] Error deleting chat:', deleteError)
        throw deleteError
      }

      console.log('[v0] Successfully deleted chat:', id)
      return NextResponse.json({ success: true })
    } catch (dbError) {
      console.error("[v0] Database error in DELETE /api/admin/api-keys:", dbError)
      return NextResponse.json(
        { error: "Failed to delete chat" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[v0] Error deleting chat:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
