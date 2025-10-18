import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import { Markdown } from '@/components/markdown';
import { Message } from '@/hooks/useChat';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  className?: string;
}

export function ChatMessage({ message, isStreaming = false, className }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const avatar = useMemo(() => {
    if (isUser) {
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      );
    }
    
    return (
      <Avatar className="h-8 w-8 bg-primary/10 text-primary">
        <AvatarFallback>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    );
  }, [isUser]);

  const content = useMemo(() => {
    if (isStreaming && !message.content) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
    }
    
    return <Markdown>{message.content}</Markdown>;
  }, [message.content, isStreaming]);

  return (
    <div
      className={cn(
        'group flex items-start gap-4 py-4 px-4',
        isUser ? 'bg-background' : 'bg-muted/50',
        className
      )}
    >
      {avatar}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none break-words">
          {content}
        </div>
      </div>
    </div>
  );
}
