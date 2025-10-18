import { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, X, FileText, Image, Code, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FileWithPreview = File & {
  preview: string;
  type: 'image' | 'code' | 'document' | 'other';
};

interface FileUploadProps {
  onFilesSelected: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  className?: string;
  accept?: string;
}

export function FileUpload({
  onFilesSelected,
  maxFiles = 5,
  className,
  accept = 'image/*,.pdf,.md,.txt,.js,.ts,.jsx,.tsx,.json,.css,.html',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const getFileType = (file: File): FileWithPreview['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('text/') || 
        ['.js', '.ts', '.jsx', '.tsx', '.json', '.css', '.html', '.md', '.txt']
          .some(ext => file.name.toLowerCase().endsWith(ext))) {
      return 'code';
    }
    return 'document';
  };

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList)
      .filter(file => file.size <= 5 * 1024 * 1024) // 5MB limit
      .slice(0, maxFiles - files.length)
      .map(file => {
        const fileWithPreview = Object.assign(file, {
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
          type: getFileType(file),
        }) as FileWithPreview;
        return fileWithPreview;
      });

    if (newFiles.length > 0) {
      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
      onFilesSelected(updatedFiles);
    }
  }, [files, maxFiles, onFilesSelected]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset the input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const removedFile = newFiles.splice(index, 1)[0];
    
    // Revoke the object URL to avoid memory leaks
    if (removedFile.preview) {
      URL.revokeObjectURL(removedFile.preview);
    }
    
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  // Clean up object URLs on unmount
  const cleanup = useCallback(() => {
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  }, [files]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const getFileIcon = (type: FileWithPreview['type']) => {
    switch (type) {
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'code':
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">
          Drag & drop files here, or click to select
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Supported: Images, PDFs, and text files (max {maxFiles} files, 5MB each)
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxFiles}
        >
          Select Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          multiple={maxFiles > 1}
          disabled={files.length >= maxFiles}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Selected Files ({files.length}/{maxFiles})</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex items-center justify-between p-2 text-sm border rounded-md"
              >
                <div className="flex items-center space-x-2">
                  {getFileIcon(file.type)}
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
