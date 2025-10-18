import { useRef, useEffect, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatInterface() {
  const {
    chatId,
    chats,
    messages,
    isLoading,
    error,
    loadChats,
    loadChat,
    createChat,
    sendMessage,
    cancelStream,
    isStreaming,
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, [loadChats]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (content: string, files: File[] = []) => {
    try {
      let currentChatId = chatId;
      
      // Create a new chat if this is the first message
      if (!currentChatId) {
        currentChatId = await createChat(content.slice(0, 50));
      }
      
      // Handle file uploads if any
      if (files.length > 0) {
        // In a real app, you would upload files to your server here
        // For now, we'll just include the file names in the message
        const fileNames = files.map(file => file.name).join(', ');
        content = `${content}\n\n[Attachments: ${fileNames}]`;
      }
      
      await sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  const handleNewChat = async () => {
    await createChat();
    setIsSidebarOpen(false);
  };
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-20 w-64 bg-background border-r transition-transform duration-300 ease-in-out transform',
          'md:relative md:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start gap-2"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              New chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  loadChat(chat.id);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  'w-full text-left p-2 rounded-md text-sm truncate',
                  'hover:bg-muted',
                  chatId === chat.id ? 'bg-muted font-medium' : ''
                )}
              >
                {chat.title}
              </button>
            ))}
            {isLoading && !chats.length && (
              <div className="flex justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!isLoading && !chats.length && (
              <p className="text-center text-sm text-muted-foreground p-4">
                No chats yet. Start a new chat!
              </p>
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground">
              <p>Powered by LangChain & Next.js</p>
              <p>Model: GPT-4</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <h2 className="text-lg font-semibold">
              {chatId ? chats.find(c => c.id === chatId)?.title : 'New Chat'}
            </h2>
          </div>
          
          {isStreaming && (
            <Button
              variant="outline"
              size="sm"
              onClick={cancelStream}
              className="gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Stop generating
            </Button>
          )}
        </header>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="max-w-md space-y-4">
                <h1 className="text-2xl font-bold">How can I help you today?</h1>
                <p className="text-muted-foreground">
                  Ask me anything, from creative ideas to technical explanations. 
                  I'm here to help with coding, writing, analysis, and more.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id || index}
                  message={message}
                  isStreaming={message.isStreaming}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {isLoading && messages.length === 0 && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {error && (
            <div className="p-4 text-center text-red-500">
              Error: {error.message}
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="border-t p-4">
          <ChatInput
            onSend={handleSendMessage}
            isStreaming={isStreaming}
            disabled={isLoading}
          />
          <p className="text-xs text-center text-muted-foreground mt-2">
            AI may produce inaccurate information. Verify important details.
          </p>
        </div>
      </div>
    </div>
  );
}
