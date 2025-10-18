"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Bot, User, Settings, Loader2 } from "lucide-react"

interface Message {
  id: number
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  messages: Message[]
  isGenerating: boolean
}

export function ChatInterface({ messages, isGenerating }: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <ScrollArea className="h-full">
      <div ref={scrollRef} className="p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-3">
            <div className="flex-shrink-0">
              {message.type === "user" && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              {message.type === "assistant" && (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              {message.type === "system" && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {message.type === "user" ? "You" : message.type === "assistant" ? "AI" : "System"}
                </Badge>
                <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
              </div>
              <div
                className={`text-sm rounded-lg p-3 ${
                  message.type === "user"
                    ? "bg-blue-600 text-white"
                    : message.type === "assistant"
                      ? "bg-gray-700 text-gray-100"
                      : "bg-gray-800 text-gray-300"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  AI
                </Badge>
                <span className="text-xs text-gray-400">now</span>
              </div>
              <div className="bg-gray-700 text-gray-100 text-sm rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
