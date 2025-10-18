"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Send, Eye, Code as CodeIcon, Settings as SettingsIcon, Paperclip, ChevronDown } from "lucide-react"
import { CodePreview } from "@/components/editor/code-preview"
import { TokenCounter } from "@/components/editor/token-counter"
import { ChatInterface } from "@/components/editor/chat-interface"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface File {
  name: string
  type: string
  size: number
  content: string
  description: string
  estimatedTokens: number
  isProcessable: boolean
  lastModified?: number
}

interface Settings {
  model: string
  temperature: number
  techStack: string
}

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [prompt, setPrompt] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [settings, setSettings] = useState<Settings>({
    model: "gpt-4",
    temperature: 0.7,
    techStack: "nextjs-full"
  })
  const [generatedCode, setGeneratedCode] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenUsage, setTokenUsage] = useState({ used: 0, limit: 10000 })
  const [chatMessages, setChatMessages] = useState<Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
  }>>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [buildErrors, setBuildErrors] = useState<string[]>([])

    // Load initial data from URL params
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const chatId = searchParams.get('chatId')
        const urlPrompt = searchParams.get('prompt') || ''
        
        if (chatId) {
          // Load existing chat
          const [chatRes, messagesRes] = await Promise.all([
            fetch(`/api/chats/${chatId}`),
            fetch(`/api/chats/${chatId}/messages`)
          ])
          
          if (chatRes.ok && messagesRes.ok) {
            const chatData = await chatRes.json()
            const messagesData = await messagesRes.json()
            
            setPrompt(chatData.title)
            setGeneratedCode(chatData.generatedCode || '')
            setChatMessages(messagesData.messages || [])
            setSettings(chatData.settings || {
              model: 'gpt-4',
              temperature: 0.7,
              techStack: 'nextjs-full'
            })
          } else {
            throw new Error('Failed to load chat')
          }
        } else if (urlPrompt) {
          // New chat with prompt
          setPrompt(urlPrompt)
          const urlFiles = searchParams.get('files')
          const urlSettings = searchParams.get('settings')
          
          if (urlFiles) {
            try {
              setFiles(JSON.parse(urlFiles))
            } catch (e) {
              console.error('Failed to parse files', e)
            }
          }
          
          if (urlSettings) {
            try {
              setSettings(JSON.parse(urlSettings))
            } catch (e) {
              console.error('Failed to parse settings', e)
            }
          }
          
          // Generate initial code
          await generateCode(urlPrompt, 
            urlFiles ? JSON.parse(urlFiles) : [],
            urlSettings ? JSON.parse(urlSettings) : {
              model: 'gpt-4',
              temperature: 0.7,
              techStack: 'nextjs-full'
            }
          )
        }
      } catch (error) {
        console.error('Error loading chat:', error)
        // Redirect to home on error
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialData()
  }, [searchParams, router])

  const generateCode = async (prompt: string, files: File[], settings: Settings) => {
    try {
      setIsGenerating(true)
      
      // Call the API to generate code
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          files,
          settings,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const data = await response.json()
      setGeneratedCode(data.generatedCode || '')
      
      // Update token usage
      if (data.tokenUsage) {
        setTokenUsage(prev => ({
          ...prev,
          used: data.tokenUsage.used || 0,
          limit: data.tokenUsage.limit || 10000
        }))
      }
      
      // Add assistant message
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Here\'s the generated code based on your prompt.',
          timestamp: new Date()
        }
      ])
      
      return data.generatedCode
    } catch (error) {
      console.error('Error generating code:', error)
      setBuildErrors([error instanceof Error ? error.message : 'Failed to generate code'])
      return ''
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isGenerating) return
    
    // Add user message to chat
    const userMessage = {
      role: 'user' as const,
      content: newMessage,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setNewMessage('')
    
    try {
      setIsGenerating(true)
      
      // Call the chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          settings,
          currentCode: generatedCode
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      
      // Update chat with assistant's response
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        }
      ])
      
      // Update code if provided in response
      if (data.generatedCode) {
        setGeneratedCode(data.generatedCode)
      }
      
      // Update token usage
      if (data.tokenUsage) {
        setTokenUsage(prev => ({
          ...prev,
          used: (prev.used || 0) + (data.tokenUsage.used || 0)
        }))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setChatMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request.',
          timestamp: new Date()
        }
      ])
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleDownload = () => {
    if (!generatedCode) return
    
    const element = document.createElement('a')
    const file = new Blob([generatedCode], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `generated-${new Date().toISOString().split('T')[0]}.tsx`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }
    // No demo data initialization needed
    ]
    setProducts(mockProducts)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">E-commerce Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total Sales</div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">$12,450</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </div>
          </div>
          
          <div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Active Users</div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </div>
          </div>
          
          <div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Products</div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">+3 new this week</p>
            </div>
          </div>
          
          <div>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Conversion Rate</div>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">3.2%</div>
              <p className="text-xs text-muted-foreground">+0.5% from last month</p>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div>
          <div>
            <div>Product Management</div>
          </div>
          <div>
            <div className="space-y-4">
              {products.map((item) => {
                const { sales, price, stock, name } = item; // Declare the item variable here
                return (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{name}</div>
                      <p className="text-sm text-gray-600">Stock: {stock} units</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-gray-800 text-white px-2 py-1 rounded">{sales} sales</div>
                      <span className="font-bold">{price}</span>
                      <Button size="sm">Edit</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
`
    setGeneratedCode(demoCode)

    const demoMessages = [
      {
        id: 1,
        type: "system",
        content: "🎯 Demo mode activated! Generated a modern e-commerce dashboard with React components.",
        timestamp: new Date(),
      },
      {
        id: 2,
        type: "assistant",
        content:
          "I've created a comprehensive dashboard with product management, analytics cards, and interactive components. The preview shows a fully functional React application with mock data integration.",
        timestamp: new Date(),
      },
    ]
    setChatMessages(demoMessages)
  }

  const detectFramework = (code: string): string => {
    if (code.includes("import React") || code.includes("useState") || code.includes("useEffect")) {
      return "react"
    }
    if (code.includes("Vue.createApp") || code.includes("<template>") || code.includes("vue")) {
      return "vue"
    }
    if (code.includes("@angular") || (code.includes("Component") && code.includes("selector:"))) {
      return "angular"
    }
    if (code.includes("<!DOCTYPE html>") && !code.includes("import")) {
      return "vanilla"
    }
    return "react" // default
  }

  const generateCode = async (prompt: string, files: any[], settings: any) => {
    setIsGenerating(true)
    setBuildErrors([])

    const systemMessage = {
      id: Date.now(),
      type: "system",
      content: "🔄 Analyzing requirements and detecting optimal framework...",
      timestamp: new Date(),
    }
    setChatMessages([systemMessage])

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
          messages: [],
          frameworkHint: settings.techStack || "auto-detect",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Generation failed")
      }

      // Detect framework from generated code
      const framework = detectFramework(data.content)
      setDetectedFramework(framework)

      // Mock API endpoints if full-stack features detected
      const mockApis = generateMockApis(data.content)

      setTokenUsage(data.usage)
      setGeneratedCode(data.content)

      const completionMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: `✅ Code generation complete! Framework Detected: ${framework.toUpperCase()} | Tech Stack: ${settings.techStack || "Auto-selected"} | Token Usage: ${data.tokens} tokens${mockApis.length > 0 ? ` | API Endpoints: ${mockApis.length} mock endpoints created` : ""} | The preview is now available with full ${framework} compatibility and error detection.`,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, completionMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "system",
        content: `❌ Generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    }

    setIsGenerating(false)
  }

  const generateMockApis = (code: string): string[] => {
    const mockApis: string[] = []

    // Detect API calls in the code
    const apiPatterns = [
      /fetch$$['"`]([^'"`]+)['"`]$$/g,
      /axios\.get$$['"`]([^'"`]+)['"`]$$/g,
      /\.post$$['"`]([^'"`]+)['"`]$$/g,
      /api\/([a-zA-Z0-9/]+)/g,
    ]

    apiPatterns.forEach((pattern) => {
      const matches = code.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          if (!mockApis.includes(match)) {
            mockApis.push(match)
          }
        })
      }
    })

    return mockApis
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: newMessage,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, userMessage])
    const currentMessage = newMessage
    setNewMessage("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/editor/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `Modify the existing code based on this request: ${currentMessage}${selectedComponent ? ` Focus on the ${selectedComponent} component.` : ""}`,
          files,
          settings,
          messages: chatMessages.filter((msg) => msg.type !== "system").slice(-5), // Last 5 messages for context
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Response failed")
      }

      // Update token usage and code
      setTokenUsage(data.usage)
      if (data.content.includes("```") || data.content.includes("<")) {
        setGeneratedCode(data.content)
      }

      const aiResponse = {
        id: Date.now() + 1,
        type: "assistant",
        content: data.content,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    }

    setIsGenerating(false)
  }

  const handleComponentSelection = (component: string) => {
    setSelectedComponent(component)
    const selectionMessage = {
      id: Date.now(),
      type: "system",
      content: `Selected component: ${component}. You can now ask me to modify this specific part of your application.`,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, selectionMessage])
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold">Code Editor</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Chat */}
        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium">Chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              newMessage={newMessage}
              onNewMessageChange={setNewMessage}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Main content - Code preview */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Preview</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant={activeTab === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant={activeTab === 'code' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('code')}
                >
                  <CodeIcon className="w-4 h-4 mr-2" />
                  Code
                </Button>
              </div>
                  }
                }}
                className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
