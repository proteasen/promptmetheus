import { requireAdmin } from "@/lib/admin"
import { redirect } from "next/navigation"
import { SystemMonitoring } from "@/components/admin/system-monitoring"

export const dynamic = "force-dynamic"

export default async function AdminMonitoringPage() {
  try {
    const admin = await requireAdmin()
    
    if (!admin) {
      redirect("/auth/login?message=No admin user found. Please set up an admin account first.")
    }
    
    return <SystemMonitoring admin={admin} />
  } catch (error) {
    console.error("Admin monitoring error:", error)
    redirect("/auth/login?message=Admin access required")
  }
}
