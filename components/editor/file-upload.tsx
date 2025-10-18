'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, FileText, Image as ImageIcon, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface FileWithPreview extends File {
  preview: string
  isProcessable: boolean
  estimatedTokens: number
  description: string
  content?: string
}

interface FileUploadProps {
  isOpen: boolean
  onClose: () => void
  onFilesSelected: (files: FileWithPreview[]) => void
  existingFiles: FileWithPreview[]
}

export function FileUpload({ isOpen, onClose, onFilesSelected, existingFiles }: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const isImage = file.type.startsWith('image/')
      const isCode = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json'].some(ext => 
        file.name.endsWith(ext)
      )
      
      // Create a new File instance with the original file data
      const fileWithPreview = new File(
        [file],
        file.name,
        { type: file.type, lastModified: file.lastModified }
      ) as FileWithPreview
      
      // Add our custom properties
      fileWithPreview.preview = URL.createObjectURL(file)
      fileWithPreview.isProcessable = isImage || isCode
      fileWithPreview.estimatedTokens = Math.ceil(file.size / 4) // Rough estimate
      fileWithPreview.description = isImage 
        ? `Image: ${file.name}` 
        : isCode 
          ? `Code file: ${file.name}`
          : `File: ${file.name}`
      
      return fileWithPreview
    })

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'text/*': ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.md']
    },
    maxSize: 3 * 1024 * 1024, // 3MB
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      URL.revokeObjectURL(newFiles[index].preview)
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const handleSave = () => {
    onFilesSelected([...existingFiles, ...files])
    setFiles([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Upload Files</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <UploadCloud className="h-12 w-12 mx-auto text-gray-400" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Drag & drop files here, or click to select files
                </p>
                <p className="text-xs text-gray-500">
                  Supports images, code files (max 3MB)
                </p>
              </>
            )}
          </div>
        </div>

        {(files.length > 0 || existingFiles.length > 0) && (
          <div className="space-y-2">
            <h3 className="font-medium">Selected Files</h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {[...existingFiles, ...files].map((file, index) => (
                <div 
                  key={file.name + index} 
                  className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-2">
                    {file.type.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-sm truncate max-w-xs">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  {index >= existingFiles.length && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index - existingFiles.length)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={files.length === 0}
          >
            Add Files
          </Button>
        </div>
      </div>
    </div>
  )
}
