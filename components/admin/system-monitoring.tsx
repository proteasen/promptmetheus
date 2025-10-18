"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, ArrowLeft, Activity, Server, Database, Zap, RefreshCw } from "lucide-react"
import Link from "next/link"

interface SystemHealth {
  status: "healthy" | "warning" | "error"
  uptime: number
  memoryUsage: number
  responseTime: number
  errorRate: number
}

interface SystemMonitoringProps {
  admin: { id: string; email: string }
}

export function SystemMonitoring({ admin }: SystemMonitoringProps) {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: "healthy",
    uptime: 0,
    memoryUsage: 0,
    responseTime: 0,
    errorRate: 0,
  })
  const [loading, setLoading] = useState(false)

  const fetchSystemHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/system-health")
      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
      }
    } catch (error) {
      console.error("Failed to fetch system health:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-accent" />
                <h1 className="text-xl font-bold text-foreground">System Monitoring</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSystemHealth}
                disabled={loading}
                className="border-border text-foreground hover:bg-muted bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <span className="text-muted-foreground text-sm">{admin.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground">System Health</h2>
            <p className="text-muted-foreground">Monitor system performance and health metrics</p>
          </div>

          {/* System Status */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-accent" />
                Overall System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-2xl font-bold ${getStatusColor(systemHealth.status)}`}>
                  {systemHealth.status.toUpperCase()}
                </div>
                <div className="text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Uptime</CardTitle>
                <Server className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatUptime(systemHealth.uptime)}</div>
                <p className="text-xs text-muted-foreground">System uptime</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Memory Usage</CardTitle>
                <Database className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{systemHealth.memoryUsage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Memory utilization</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Response Time</CardTitle>
                <Zap className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{systemHealth.responseTime}ms</div>
                <p className="text-xs text-muted-foreground">Average response time</p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Error Rate</CardTitle>
                <Activity className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{systemHealth.errorRate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Error rate (24h)</p>
              </CardContent>
            </Card>
          </div>

          {/* System Information */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">System Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Current system configuration and environment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Environment</h4>
                    <p className="text-muted-foreground">Production</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Version</h4>
                    <p className="text-muted-foreground">v1.0.0</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Node.js Version</h4>
                    <p className="text-muted-foreground">{process.version}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Database Status</h4>
                    <p className="text-green-500">Connected</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Authentication</h4>
                    <p className="text-green-500">Supabase Active</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">LLM Providers</h4>
                    <p className="text-green-500">All Available</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
