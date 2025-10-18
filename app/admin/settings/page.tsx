import { requireAdmin } from "@/lib/admin"
import { AdminApiKeyManager } from "@/components/admin/admin-api-key-manager"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type ApiKey = {
  id: string
  provider: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          provider: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

export const dynamic = "force-dynamic"

export default async function AdminSettingsPage() {
  console.log("[v0] Admin settings page loading")

  try {
    // Verify admin access
    const admin = await requireAdmin()
    if (!admin) {
      console.error("[v0] No admin user found")
      redirect("/auth/login?message=Admin access required")
    }

    console.log("[v0] Admin access confirmed for:", admin.email)
    
    // Initialize Supabase client
    const supabase = await createClient()
    let apiKeys: ApiKey[] = []

    try {
      console.log("[v0] Fetching API keys from Supabase...")
      
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, provider, created_at, updated_at, is_active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching API keys:", error)
        throw new Error("Failed to fetch API keys")
      }

      // Transform data to match expected format
      apiKeys = (data || []).map((key: Database['public']['Tables']['api_keys']['Row']) => ({
        id: key.id,
        provider: key.provider,
        isActive: key.is_active ?? true,
        createdAt: new Date(key.created_at),
        updatedAt: new Date(key.updated_at),
      }))

      console.log(`[v0] Successfully fetched ${apiKeys.length} API keys`)
      
    } catch (error) {
      console.error("[v0] Error in API key management:", error)
      // Continue with empty array to show the UI with error state
      apiKeys = []
    }

    return (
      <div className="min-h-screen bg-black starry-background">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">Admin Settings</h1>
              <p className="text-white/70 mt-2">Manage system-wide API keys and configuration</p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">API Key Management</h2>
                <p className="text-white/70 mb-6">
                  Configure API keys for LLM providers. These keys will be used by all users in the system.
                </p>
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
                  <AdminApiKeyManager existingKeys={apiKeys} />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("[v0] Admin settings error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    
    return (
      <div className="min-h-screen bg-black starry-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">
            {errorMessage.includes('access') ? 'Access Denied' : 'Error'}
          </h1>
          <p className="text-white/70 mb-6">
            {errorMessage}
            {!errorMessage.endsWith('.') && '.'} Please try again or contact support if the issue persists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Return Home
            </a>
            <a
              href="/auth/login"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }
}
