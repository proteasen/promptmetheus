import { requireAdmin, getSystemStats, getRecentActivity } from "@/lib/admin"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

type SystemStats = Awaited<ReturnType<typeof getSystemStats>>
type RecentActivity = Awaited<ReturnType<typeof getRecentActivity>>

export const dynamic = "force-dynamic"

export const revalidate = 0 // Disable cache for admin pages

export default async function AdminPage() {
  try {
    // Verify admin access with proper error handling
    const user = await requireAdmin()
    if (!user) {
      console.error("[v0] No admin user found")
      redirect("/auth/login?message=Admin access required")
    }

    console.log("[v0] Admin access confirmed for:", user.email)

    // Fetch data in parallel with error boundaries
    let systemStats: SystemStats | null = null
    let recentActivity: RecentActivity | null = null
    let statsError: string | null = null
    let activityError: string | null = null

    try {
      ;[systemStats, recentActivity] = await Promise.all([
        getSystemStats(),
        getRecentActivity(),
      ])
    } catch (error) {
      console.error("[v0] Error fetching admin data:", error)
      statsError = "Failed to load system statistics"
      activityError = "Failed to load recent activity"
    }

    // If both data fetches failed, show error
    if ((!systemStats || !recentActivity) && (statsError || activityError)) {
      const errorMessage = [
        statsError,
        activityError,
      ]
        .filter(Boolean)
        .join(" and ")
      
      redirect(`/admin/error?message=${encodeURIComponent(errorMessage)}`)
    }

    // If we have partial data, we can still render the dashboard with what we have
    return (
      <AdminDashboard 
        user={user} 
        systemStats={systemStats || {
          totalUsers: 0,
          totalChats: 0,
          totalMessages: 0,
          totalTokensToday: 0,
          activeUsersToday: 0,
          apiKeysByProvider: {},
        }}
        recentActivity={recentActivity || {
          recentChats: [],
          recentUsers: [],
        }}
      />
    )
  } catch (error) {
    console.error("[v0] Admin page error:", error)
    const errorMessage = error instanceof Error 
      ? error.message 
      : "An unexpected error occurred"
    
    redirect(`/auth/login?message=${encodeURIComponent(errorMessage)}`)
  }
}
