"use client"

let ChatOpenAI: any, ChatAnthropic: any, ChatGoogleGenerativeAI: any, HumanMessage: any, SystemMessage: any

async function initializeLangChainModules() {
  if (ChatOpenAI && ChatAnthropic && ChatGoogleGenerativeAI && HumanMessage && SystemMessage) {
    return // Already initialized
  }

  try {
    const openaiModule = await import("@langchain/openai")
    ChatOpenAI = openaiModule.ChatOpenAI
  } catch (error) {
    console.log("[v0] LangChain OpenAI import failed:", error)
    ChatOpenAI = null
  }

  try {
    const anthropicModule = await import("@langchain/anthropic")
    ChatAnthropic = anthropicModule.ChatAnthropic
  } catch (error) {
    console.log("[v0] LangChain Anthropic import failed:", error)
    ChatAnthropic = null
  }

  try {
    const googleModule = await import("@langchain/google-genai")
    ChatGoogleGenerativeAI = googleModule.ChatGoogleGenerativeAI
  } catch (error) {
    console.log("[v0] LangChain Google import failed:", error)
    ChatGoogleGenerativeAI = null
  }

  try {
    const coreModule = await import("@langchain/core/messages")
    HumanMessage = coreModule.HumanMessage
    SystemMessage = coreModule.SystemMessage
  } catch (error) {
    console.log("[v0] LangChain core messages import failed:", error)
    HumanMessage = null
    SystemMessage = null
  }
}

export interface LLMProvider {
  name: string
  displayName: string
  models: string[]
}

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    name: "openai",
    displayName: "OpenAI",
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    name: "claude",
    displayName: "Anthropic Claude",
    models: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
  },
  {
    name: "gemini",
    displayName: "Google Gemini",
    models: ["gemini-pro", "gemini-pro-vision"],
  },
  {
    name: "qwen",
    displayName: "Qwen",
    models: ["qwen-turbo", "qwen-plus", "qwen-max"],
  },
]

export async function getAvailableProviders(): Promise<LLMProvider[]> {
  try {
    const response = await fetch("/api/admin/providers")
    if (!response.ok) {
      console.log("[v0] API error getting providers, returning all")
      return LLM_PROVIDERS
    }
    const data = await response.json()
    return data.providers || LLM_PROVIDERS
  } catch (error) {
    console.log("[v0] Error getting available providers:", error)
    return LLM_PROVIDERS
  }
}

export async function generateCode({
  prompt,
  files = [],
  settings,
  userId,
}: {
  prompt: string
  files?: Array<{ name: string; content: string; type: string }>
  settings: {
    model: string
    temperature: number
    framework: string
  }
  userId?: string | null
}): Promise<{
  code: string
  framework: string
  files: Array<{ name: string; content: string; type: string }>
  tokensUsed: number
  buildErrors: string[]
}> {
  try {
    const response = await fetch("/api/editor/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        files,
        settings,
        userId,
      }),
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("[v0] Code generation error:", error)

    const demoCode = generateDemoCode(prompt, settings.framework)

    return {
      code: demoCode.code,
      framework: settings.framework,
      files: demoCode.files,
      tokensUsed: 0,
      buildErrors: [],
    }
  }
}

function generateDemoCode(prompt: string, framework: string) {
  const promptLower = prompt.toLowerCase()

  if (promptLower.includes("crm") || promptLower.includes("customer")) {
    return {
      code: `import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
