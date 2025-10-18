"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => {
      // Check file size (3MB limit)
      if (file.size > 3 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 3MB.`)
        return false
      }
      return true
    })

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,text/*,.pdf,.doc,.docx"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        className="border-border text-foreground hover:bg-muted bg-transparent"
      >
        <Paperclip className="h-4 w-4" />
      </Button>
    </>
  )
}
