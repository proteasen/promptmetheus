import { useState, useRef, KeyboardEvent, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, SendHorizonal, X } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { cn } from '@/lib/utils';

export interface ChatInputProps {
  onSend: (message: string, files?: File[]) => Promise<void>;
  isStreaming?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  onSend,
  isStreaming = false,
  className,
  placeholder = 'Type a message...',
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && files.length === 0) || isStreaming) {
      return;
    }

    try {
      await onSend(trimmedMessage, files);
      setMessage('');
      setFiles([]);
      setIsFileUploadOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
  }, []);

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className={cn('w-full', className)}>
      {isFileUploadOpen && (
        <div className="mb-4">
          <FileUpload 
            onFilesSelected={handleFilesSelected} 
            maxFiles={5}
            className="mb-2"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsFileUploadOpen(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Close file upload
          </Button>
        </div>
      )}

      {files.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1 text-sm"
            >
              <span className="truncate max-w-[120px]">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-muted-foreground hover:text-foreground"
                disabled={disabled || isStreaming}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] max-h-[200px] pr-12 resize-none"
          rows={1}
          disabled={disabled || isStreaming}
        />
        <div className="absolute right-2 bottom-2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsFileUploadOpen(!isFileUploadOpen)}
            disabled={disabled || isStreaming}
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach files</span>
          </Button>
          <Button 
            type="submit" 
            size="icon" 
            className="h-8 w-8"
            disabled={disabled || isStreaming || (!message.trim() && files.length === 0)}
          >
            <SendHorizonal className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
