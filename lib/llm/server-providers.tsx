"use client"

import { createServerClient } from "@/lib/supabase/server"

export async function getAdminApiKey(provider: string): Promise<string | null> {
  try {
    const supabase = createServerClient()

    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("provider", provider)
      .eq("is_active", true)
      .single()

    if (error || !apiKey) {
      console.log(`[v0] No active API key found for provider: ${provider}`)
      return null
    }

    try {
      const { decrypt } = await import("@/lib/encryption")
      return decrypt(apiKey.key_hash)
    } catch (error) {
      console.error("Failed to decrypt API key:", error)
      return null
    }
  } catch (error) {
    console.error("Database error in getAdminApiKey:", error)
    return null
  }
}

export async function checkRateLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const dailyLimit = Number.parseInt(process.env.DAILY_TOKEN_LIMIT || "100000")

  try {
    const supabase = createServerClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("daily_token_usage, last_reset_date")
      .eq("id", userId)
      .single()

    if (error || !user) {
      console.log("[v0] User not found for rate limit check")
      return { allowed: true, remaining: dailyLimit }
    }

    const today = new Date()
    const lastReset = new Date(user.last_reset_date)

    // Reset daily usage if it's a new day
    if (today.toDateString() !== lastReset.toDateString()) {
      await supabase
        .from("users")
        .update({
          daily_token_usage: 0,
          last_reset_date: today.toISOString(),
        })
        .eq("id", userId)

      return { allowed: true, remaining: dailyLimit }
    }

    const remaining = dailyLimit - (user.daily_token_usage || 0)
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
    }
  } catch (error) {
    console.log("[v0] Rate limit check error:", error)
    return { allowed: true, remaining: dailyLimit }
  }
}

export async function updateTokenUsage(userId: string, tokens: number): Promise<void> {
  try {
    const supabase = createServerClient()

    const { data: user } = await supabase.from("users").select("daily_token_usage").eq("id", userId).single()

    const currentUsage = user?.daily_token_usage || 0

    await supabase
      .from("users")
      .update({
        daily_token_usage: currentUsage + tokens,
      })
      .eq("id", userId)
  } catch (error) {
    console.log("[v0] Token usage update error:", error)
  }
}

export async function generateResponse(
  provider: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  attachments: Array<{ filename: string; mimeType: string; data: string }> = [],
): Promise<{ content: string; tokens: number }> {
  // For now, return mock responses since LangChain setup is complex
  // This can be enhanced later with actual LLM integration

  const mockContent = generateMockResponse(messages[messages.length - 1]?.content || "")

  return {
    content: mockContent,
    tokens: Math.ceil(mockContent.length / 4), // Rough token estimation
  }
}

function generateMockResponse(prompt: string): string {
  const promptLower = prompt.toLowerCase()

  if (promptLower.includes("crm") || promptLower.includes("customer")) {
    return `I've created a comprehensive CRM dashboard with customer management, deal tracking, and analytics. The interface includes customer cards, status badges, and pipeline visualization with realistic demo data.`
  }

  if (promptLower.includes("dashboard") || promptLower.includes("analytics")) {
    return `I've built a modern dashboard with key metrics, data visualization, and interactive components. The layout is responsive and includes charts, cards, and real-time data displays.`
  }

  if (promptLower.includes("form") || promptLower.includes("input")) {
    return `I've created a user-friendly form with proper validation, error handling, and accessibility features. The form includes all necessary fields with appropriate input types and styling.`
  }

  return `I've generated a modern React application based on your request. The code includes proper TypeScript types, Tailwind CSS styling, and follows best practices for component architecture and user experience.`
}

export function generateDemoCode(prompt: string, framework: string) {
  const promptLower = prompt.toLowerCase()

  if (promptLower.includes("crm")) {
    return {
      code: `import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function CRMDashboard() {
  const [customers, setCustomers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', deals: 3, value: 15000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Prospect', deals: 1, value: 5000 },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active', deals: 5, value: 25000 }
  ])

  const totalValue = customers.reduce((sum, c) => sum + c.value, 0)
  const activeCustomers = customers.filter(c => c.status === 'Active').length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">CRM Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCustomers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$\{totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">68%</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Customer Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    <p className="text-gray-600">{customer.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={customer.status === 'Active' ? 'default' : 'secondary'}>
                      {customer.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{customer.deals} deals</span>
                    <span className="font-semibold">$\{customer.value.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}`,
      files: [
        {
          name: "CRMDashboard.tsx",
          content: "CRM Dashboard Component",
          type: "component",
        },
      ],
    }
  }

  return {
    code: `import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function GeneratedApp() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Generated Application</h1>
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your application has been generated based on: "${prompt}"</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}`,
    files: [
      {
        name: "GeneratedApp.tsx",
        content: "Generated Application Component",
        type: "component",
      },
    ],
  }
}
