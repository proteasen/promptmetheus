import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

// Using the built-in File type

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  isStreaming?: boolean;
};

export type Chat = {
  id: string;
  title: string;
  updatedAt: string;
  messages: Message[];
};

export function useChat(initialChatId?: string) {
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const [chats, setChats] = useState<Array<{ id: string; title: string; updatedAt: string }>>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chats list
  const loadChats = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.chats.list();
      // Transform the chat data to match our Chat type
      const transformedChats = data.chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        updatedAt: chat.updated_at || new Date().toISOString(),
      }));
      setChats(transformedChats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chats'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load a specific chat
  const loadChat = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [chatData, messagesData] = await Promise.all([
        api.chats.get(id),
        api.messages.list(id),
      ]);
      
      setChatId(id);
      setMessages(messagesData.messages);
      
      // Update the chat in the chats list
      setChats(prevChats => {
        const chat = chatData.chat;
        const existingIndex = prevChats.findIndex(c => c.id === id);
        
        if (existingIndex >= 0) {
          const updated = [...prevChats];
          updated[existingIndex] = {
            id: chat.id,
            title: chat.title,
            updatedAt: chat.updated_at,
          };
          return updated;
        }
        
        return [
          {
            id: chat.id,
            title: chat.title,
            updatedAt: chat.updated_at,
          },
          ...prevChats,
        ];
      });
      
      return chatData.chat;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load chat'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new chat
  const createChat = useCallback(async (title: string = 'New Chat') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { chatId: newChatId } = await api.chats.create(title);
      setChatId(newChatId);
      setMessages([]);
      
      // Refresh the chats list
      await loadChats();
      
      return newChatId;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create chat'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadChats]);

  // Send a message
  const sendMessage = useCallback(async (content: string, files: File[] = []) => {
    if (!chatId) {
      throw new Error('No active chat');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Create a new abort controller for this request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      
      // Add user message to the UI immediately
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Handle file uploads if any
      let fileContents = '';
      if (files.length > 0) {
        fileContents = await Promise.all(
          files.map(file => 
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(`[Attachment: ${file.name}]\n${e.target?.result || ''}`);
              reader.readAsText(file);
            })
          )
        ).then(contents => contents.join('\n\n'));
      }
      
      const fullContent = fileContents ? `${content}\n\n${fileContents}` : content;
      
      // Save user message to the database
      const { message: savedUserMessage } = await api.messages.send(
        chatId,
        fullContent,
        'user'
      );
      
      // Update the temporary message with the saved message
      setMessages(prev => 
        prev.map(m => 
          m.id === userMessage.id 
            ? { ...savedUserMessage, isStreaming: false }
            : m
        )
      );
      
      // Add a placeholder for the assistant's response
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Stream the assistant's response
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullContent,
          chatId,
        }),
        signal: abortControllerRef.current?.signal,
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate response');
      }
      
      if (!response.body) {
        throw new Error('No response body');
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantContent = '';
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.replace(/^data: /, '');
              
              if (data === '[DONE]') {
                done = true;
                break;
              }
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  assistantContent += parsed.content;
                  
                  setMessages(prev => 
                    prev.map(m => 
                      m.id === assistantMessageId
                        ? { 
                            ...m, 
                            content: assistantContent,
                            isStreaming: !done,
                          }
                        : m
                    )
                  );
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }
      
      // Final update to remove the streaming flag
      setMessages(prev => 
        prev.map(m => 
          m.id === assistantMessageId
            ? { ...m, isStreaming: false }
            : m
        )
      );
      
      // Refresh the chats list to update the last message preview
      await loadChats();
      
    } catch (err) {
      // Don't show aborted errors (happens when user cancels)
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [chatId, loadChats]);

  // Cancel the current streaming response
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      
      // Remove the streaming message if it exists
      setMessages(prev => 
        prev.filter(m => !m.isStreaming)
      );
      
      return true;
    }
    return false;
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // State
    chatId,
    chats,
    messages,
    isLoading,
    error,
    
    // Actions
    loadChats,
    loadChat,
    createChat,
    sendMessage,
    cancelStream,
    
    // Derived state
    currentChat: chatId ? chats.find(chat => chat.id === chatId) : null,
    isStreaming: messages.some(m => m.isStreaming),
  };
}
