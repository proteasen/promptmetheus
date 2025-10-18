import { getCurrentUser } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase/server"

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim()) || [
  "jensen.kohw@gmail.com",
  "admin@promptmetheus.com",
  "support@promptmetheus.com",
]

console.log("[v0] Admin emails configured:", ADMIN_EMAILS)

export async function isAdmin(email: string): Promise<boolean> {
  const isAdminUser = ADMIN_EMAILS.includes(email)
  console.log("[v0] Checking admin status for:", email, "Result:", isAdminUser)
  return isAdminUser
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  console.log("[v0] Current user in requireAdmin:", user)

  if (!user) {
    console.log("[v0] No user found, redirecting to login")
    throw new Error("Authentication required. Please log in to continue.")
  }

  if (!user.email) {
    console.log("[v0] User has no email")
    throw new Error("User email not found. Please contact support.")
  }

  const adminStatus = await isAdmin(user.email)
  if (!adminStatus) {
    console.log("[v0] User is not admin:", user.email)
    throw new Error(`Admin access required. Contact support if you believe this is an error. (${user.email})`)
  }

  console.log("[v0] Admin access granted for:", user.email)
  return user
}

export async function getSystemStats() {
  try {
    const supabase = createServerClient()

    const [usersResult, chatsResult, messagesResult, tokensResult, apiKeysResult] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("chats").select("*", { count: "exact", head: true }),
      supabase.from("messages").select("*", { count: "exact", head: true }),
      supabase.from("users").select("daily_token_usage"),
      supabase.from("api_keys").select("provider, is_active").eq("is_active", true),
    ])

    const totalUsers = usersResult.count || 0
    const totalChats = chatsResult.count || 0
    const totalMessages = messagesResult.count || 0

    const totalTokensToday = tokensResult.data?.reduce((sum, user) => sum + (user.daily_token_usage || 0), 0) || 0

    // Count active users today (users who have reset their tokens today)
    const today = new Date().toDateString()
    const { count: activeUsersToday } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .gte("last_reset_date", new Date(new Date().setHours(0, 0, 0, 0)).toISOString())

    // Group API keys by provider
    const apiKeysByProvider: Record<string, number> = {}
    if (apiKeysResult.data) {
      apiKeysResult.data.forEach((key) => {
        apiKeysByProvider[key.provider] = (apiKeysByProvider[key.provider] || 0) + 1
      })
    }

    return {
      totalUsers,
      totalChats,
      totalMessages,
      totalTokensToday,
      activeUsersToday: activeUsersToday || 0,
      apiKeysByProvider,
    }
  } catch (error) {
    console.error("[v0] Database error in getSystemStats:", error)
    return {
      totalUsers: 0,
      totalChats: 0,
      totalMessages: 0,
      totalTokensToday: 0,
      activeUsersToday: 0,
      apiKeysByProvider: {},
    }
  }
}

export async function getRecentActivity() {
  try {
    const supabase = createServerClient()

    const { data: recentChats } = await supabase
      .from("chats")
      .select(`
        id,
        title,
        updated_at,
        users!inner(email),
        messages(count)
      `)
      .order("updated_at", { ascending: false })
      .limit(10)

    const { data: recentUsers } = await supabase
      .from("users")
      .select(`
        id,
        email,
        created_at,
        daily_token_usage,
        chats(count)
      `)
      .order("created_at", { ascending: false })
      .limit(10)

    // Transform data to match expected format
    const formattedChats = (recentChats || []).map((chat) => ({
      id: chat.id,
      title: chat.title || "Untitled Chat",
      updatedAt: new Date(chat.updated_at),
      user: { email: chat.users?.email || "Unknown" },
      _count: { messages: chat.messages?.length || 0 },
    }))

    const formattedUsers = (recentUsers || []).map((user) => ({
      id: user.id,
      email: user.email,
      createdAt: new Date(user.created_at),
      dailyTokenUsage: user.daily_token_usage || 0,
      _count: { chats: user.chats?.length || 0 },
    }))

    return {
      recentChats: formattedChats,
      recentUsers: formattedUsers,
    }
  } catch (error) {
    console.error("[v0] Database error in getRecentActivity:", error)
    return {
      recentChats: [],
      recentUsers: [],
    }
  }
}

export async function getUsersWithStats() {
  try {
    const supabase = createServerClient()

    const { data: users } = await supabase
      .from("users")
      .select(`
        id,
        email,
        created_at,
        daily_token_usage,
        last_reset_date,
        chats(count),
        api_keys(count)
      `)
      .order("created_at", { ascending: false })

    return (users || []).map((user) => ({
      id: user.id,
      email: user.email,
      createdAt: new Date(user.created_at),
      dailyTokenUsage: user.daily_token_usage || 0,
      lastResetDate: new Date(user.last_reset_date || user.created_at),
      _count: {
        chats: user.chats?.length || 0,
        apiKeys: user.api_keys?.length || 0,
      },
    }))
  } catch (error) {
    console.error("[v0] Database error in getUsersWithStats:", error)
    return []
  }
}
