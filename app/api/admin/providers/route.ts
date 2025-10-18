import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"
import { LLM_PROVIDERS } from "@/lib/llm/providers"

type Chat = Database['public']['Tables']['chats']['Row']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get all chats that represent API keys and are active
    const { data: activeChats, error } = await supabase
      .from('chats')
      .select('model, metadata')
      .not('metadata->>apiKey', 'is', null)
      .eq('metadata->>isActive', 'true')
      .returns<Array<Pick<Chat, 'model' | 'metadata'>>>()

    if (error) {
      console.log("[v0] Database error getting providers, returning all:", error)
      return NextResponse.json({ providers: LLM_PROVIDERS })
    }

    // Extract unique provider names from active chats
    const activeProviders = new Set(activeChats?.map(chat => chat.model).filter(Boolean) || [])
    const availableProviders = LLM_PROVIDERS.filter((provider) => 
      activeProviders.has(provider.name)
    )

    return NextResponse.json({ providers: availableProviders })
  } catch (error) {
    console.log("[v0] Error getting available providers:", error)
    return NextResponse.json({ providers: LLM_PROVIDERS })
  }
}
