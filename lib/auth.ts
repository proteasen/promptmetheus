import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { cookies } from "next/headers"

export async function getCurrentUser() {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
      // Fallback to cookie-based auth
      const cookieStore = await cookies()
      const userEmail = cookieStore.get("user-email")?.value
      const isUserAdmin = cookieStore.get("user-admin")?.value === "true"

      if (!userEmail) {
        return null
      }

      return {
        email: userEmail,
        is_admin: isUserAdmin || process.env.ADMIN_EMAILS?.split(",").includes(userEmail) || false,
        id: userEmail,
        daily_token_usage: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    return {
      email: user.email || "",
      is_admin: process.env.ADMIN_EMAILS?.split(",").includes(user.email || "") || false,
      id: user.id,
      daily_token_usage: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("user-email")
  cookieStore.delete("user-admin")
}

export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

export async function isUserAdmin() {
  const user = await getCurrentUser()
  return user?.is_admin || false
}
