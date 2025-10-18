import { requireAdmin, getUsersWithStats } from "@/lib/admin"
import { redirect } from "next/navigation"
import { UserManagement } from "@/components/admin/user-management"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  try {
    // Verify admin access
    const admin = await requireAdmin()
    if (!admin) {
      console.error("[v0] No admin user found")
      redirect("/auth/login?message=Admin access required")
    }

    console.log("[v0] Admin access confirmed for:", admin.email)
    
    // Fetch users with their stats
    const users = await getUsersWithStats()
    const dailyLimit = Number.parseInt(process.env.DAILY_TOKEN_LIMIT || "100000")
    
    return (
      <UserManagement 
        admin={{ id: admin.id, email: admin.email }} 
        users={users} 
        dailyLimit={dailyLimit} 
      />
    )
  } catch (error) {
    console.error("[v0] Error in admin users page:", error)
    
    // Handle different error types
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An error occurred while loading the users page"
    
    // Redirect to login with appropriate message
    redirect(`/auth/login?message=${encodeURIComponent(errorMessage)}`)
  }
}
