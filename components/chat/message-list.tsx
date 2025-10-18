import { Card, CardContent } from "@/components/ui/card"
import { User, Bot, Paperclip } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  role: string
  content: string
  tokens: number
  provider: string | null
  createdAt: Date
  attachments: Array<{
    id: string
    filename: string
    mimeType: string
    size: number
    data: string
  }>
}

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-16">
        <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Start the conversation</h3>
        <p className="text-muted-foreground">Send a message to begin chatting with AI</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
              }`}
            >
              {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <Card className={`border-border ${message.role === "user" ? "bg-primary/5" : "bg-card"}`}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {message.attachments.length > 0 && (
                    <div className="space-y-2">
                      {message.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded"
                        >
                          <Paperclip className="h-3 w-3" />
                          <span>{attachment.filename}</span>
                          <span className="text-xs">({(attachment.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                    {message.provider && <span>• {message.provider}</span>}
                    {message.tokens > 0 && <span>• {message.tokens} tokens</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  )
}
