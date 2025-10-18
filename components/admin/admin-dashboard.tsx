"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, MessageSquare, Zap, Settings, LogOut, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { LLM_PROVIDERS } from "@/lib/llm/providers"

interface SystemStats {
  totalUsers: number
  totalChats: number
  totalMessages: number
  totalTokensToday: number
  activeUsersToday: number
  apiKeysByProvider: Record<string, number>
}

interface RecentActivity {
  recentChats: Array<{
    id: string
    title: string
    updatedAt: Date
    user: { email: string }
    _count: { messages: number }
  }>
  recentUsers: Array<{
    id: string
    email: string
    createdAt: Date
    dailyTokenUsage: number
    _count: { chats: number }
  }>
}

interface User {
  id: string
  email: string
}

interface AdminDashboardProps {
  user: User
  systemStats: SystemStats
  recentActivity: RecentActivity
}

export function AdminDashboard({ user, systemStats, recentActivity }: AdminDashboardProps) {
  const totalTokensUsed = systemStats.totalTokensToday * 30 // Estimate monthly usage
  const averageTokensPerDay = systemStats.totalTokensToday
  const estimatedDaysRemaining =
    averageTokensPerDay > 0 ? Math.floor(1000000 / averageTokensPerDay) : Number.POSITIVE_INFINITY // Assuming 1M token limit

  return (
    <div className="min-h-screen bg-black starry-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/images/prompt-royale-logo.png"
                  alt="Prompt Royale"
                  width={32}
                  height={32}
                  className="hover:opacity-80 transition-opacity"
                />
                <h1 className="text-2xl font-bold text-white">promptmetheus admin</h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">ADMIN</span>
                <span className="text-white/70 text-sm">{user.email}</span>
              </div>
              <Button variant="ghost" asChild className="text-white/70 hover:text-white hover:bg-white/10">
                <Link href="/">
                  <LogOut className="h-4 w-4 mr-2" />
                  Exit Admin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">System Overview</h2>
            <p className="text-white/70">Monitor and manage the promptmetheus platform</p>
          </div>

          <Card className="border-white/20 bg-black/40 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">System Status: Operational</span>
                </div>
                <span className="text-white/70 text-sm">Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-white/20 bg-black/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Prompts</CardTitle>
                <MessageSquare className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{systemStats.totalChats}</div>
                <p className="text-xs text-white/70">by {systemStats.totalUsers} users</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Tokens</CardTitle>
                <Zap className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalTokensUsed.toLocaleString()}</div>
                <p className="text-xs text-white/70">across all LLMs</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Days Remaining</CardTitle>
                <Clock className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {estimatedDaysRemaining === Number.POSITIVE_INFINITY ? "∞" : estimatedDaysRemaining}
                </div>
                <p className="text-xs text-white/70">at current usage rate</p>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">API Keys</CardTitle>
                <Settings className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {Object.values(systemStats.apiKeysByProvider).reduce((a, b) => a + b, 0)}
                </div>
                <p className="text-xs text-white/70">Configured keys</p>
              </CardContent>
            </Card>
          </div>

          {/* Provider Stats */}
          <Card className="border-white/20 bg-black/40 backdrop-blur-sm">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">API Key Status</CardTitle>
                <CardDescription className="text-white/70">Current LLM provider API key configuration</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {LLM_PROVIDERS.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <span className="text-white font-medium">{provider.displayName}</span>
                    <span
                      className={`font-bold ${systemStats.apiKeysByProvider[provider.name] ? "text-green-400" : "text-red-400"}`}
                    >
                      {systemStats.apiKeysByProvider[provider.name] ? "✓" : "✗"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-white group-hover:text-white/80" />
                  User Management
                </CardTitle>
                <CardDescription className="text-white/70">View all users by email and manage accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-white text-black hover:bg-white/90">
                  <Link href="/admin/users">View All Users</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-white group-hover:text-white/80" />
                  System Monitoring
                </CardTitle>
                <CardDescription className="text-white/70">
                  Site statistics, token usage, and projections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-white text-black hover:bg-white/90">
                  <Link href="/admin/monitoring">View Statistics</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Settings className="h-5 w-5 text-white group-hover:text-white/80" />
                  System Settings
                </CardTitle>
                <CardDescription className="text-white/70">Configure system-wide settings and limits</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-white text-black hover:bg-white/90">
                  <Link href="/admin/settings">System Settings</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-white/20 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Recent Chat Activity</CardTitle>
                <CardDescription className="text-white/70">Latest prompts and responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {recentActivity.recentChats.length === 0 ? (
                    <div className="text-center py-8 text-white/70">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No chat activity yet</p>
                    </div>
                  ) : (
                    recentActivity.recentChats.map((chat) => (
                      <Link
                        key={chat.id}
                        href={`/editor?chatId=${chat.id}`}
                        className="block p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">{chat.title}</p>
                            <p className="text-sm text-white/70">{chat.user.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-white">{chat._count.messages} messages</p>
                            <p className="text-xs text-white/70">
                              {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/20 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">User Activity</CardTitle>
                <CardDescription className="text-white/70">All users with chat and token statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                  {recentActivity.recentUsers.length === 0 ? (
                    <div className="text-center py-8 text-white/70">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No users registered yet</p>
                    </div>
                  ) : (
                    recentActivity.recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                      >
                        <div>
                          <p className="font-medium text-white">{user.email}</p>
                          <p className="text-sm text-white/70">
                            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white">{user._count.chats} chats</p>
                          <p className="text-xs text-white/70">{user.dailyTokenUsage.toLocaleString()} tokens used</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
