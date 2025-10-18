import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"

type Chat = Database['public']['Tables']['chats']['Row']
type ChatInsert = Database['public']['Tables']['chats']['Insert']
type MessageInsert = Database['public']['Tables']['messages']['Insert']
type ChatWithMessages = Chat & {
  messages?: Database['public']['Tables']['messages']['Row'][]
}

export const dynamic = 'force-dynamic'

// Handle chat operations
export async function handler(request: Request) {
  if (request.method === 'GET') {
    try {
      const { getUser } = getKindeServerSession()
      const user = await getUser()

      if (!user || !user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const supabase = await createClient()
      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return NextResponse.json(chats || [])
    } catch (error) {
      console.error('Error fetching chats:', error)
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      )
    }
  }

  if (request.method === 'POST') {
    try {
      const { getUser } = getKindeServerSession()
      const user = await getUser()

      if (!user || !user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { title, message } = await request.json()
      const supabase = await createClient()

      // Start a transaction
      const chatData: ChatInsert = {
        user_id: user.id,
        title: title || 'New Chat',
        model: 'gpt-4',
      }

      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert(chatData as any) // Type assertion to fix TypeScript error
        .select()
        .single<Chat>()

      if (chatError) throw chatError

      // If there's an initial message, add it to the chat
      if (message && chat) {
        const messageData: MessageInsert = {
          chat_id: chat.id,
          user_id: user.id,
          role: 'user',
          content: message,
        }

        const { error: messageError } = await supabase
          .from('messages')
          .insert(messageData as any) // Type assertion to fix TypeScript error

        if (messageError) throw messageError
      }

      return NextResponse.json(chat)
    } catch (error) {
      console.error('Error creating chat:', error)
      return NextResponse.json(
        { error: 'Failed to create chat' },
        { status: 500 }
      )
    }
  }

  if (request.method === 'DELETE') {
    try {
      const { getUser } = getKindeServerSession()
      const user = await getUser()

      if (!user || !user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { chatId } = await request.json()
      const supabase = await createClient()

      // Verify the chat belongs to the user
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .eq('user_id', user.id)
        .single()

      if (chatError) throw chatError
      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found or access denied' },
          { status: 404 }
        )
      }

      // Delete all messages in the chat
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId)

      if (messagesError) throw messagesError

      // Delete the chat
      const { error: deleteError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)

      if (deleteError) throw deleteError

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Error deleting chat:', error)
      return NextResponse.json(
        { error: 'Failed to delete chat' },
        { status: 500 }
      )
    }
  }
}
