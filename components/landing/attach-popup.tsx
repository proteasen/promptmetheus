"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Upload, FileText, ImageIcon, Code, Database, Archive } from "lucide-react"
import { useState, useRef } from "react"

interface AttachPopupProps {
  onClose: () => void
  onFilesAttached: (files: any[]) => void
  attachedFiles: any[]
}

export function AttachPopup({ onClose, onFilesAttached, attachedFiles }: AttachPopupProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = [
    // Images
    ".jpg",
    ".jpeg",
    ".png",
    ".svg",
    ".gif",
    ".webp",
    ".bmp",
    ".ico",
    // Web Technologies
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".css",
    ".html",
    ".htm",
    ".vue",
    ".svelte",
    // Programming Languages
    ".py",
    ".go",
    ".rs",
    ".java",
    ".cpp",
    ".c",
    ".cs",
    ".php",
    ".rb",
    ".swift",
    ".kt",
    ".scala",
    ".r",
    ".m",
    ".sh",
    ".bat",
    ".ps1",
    // Data & Config
    ".json",
    ".xml",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".env",
    ".csv",
    ".sql",
    // Documentation
    ".md",
    ".txt",
    ".rtf",
    ".pdf",
    // Design Files
    ".fig",
    ".sketch",
    ".xd",
    ".psd",
    ".ai",
    // Archives
    ".zip",
    ".tar",
    ".gz",
    ".rar",
  ]

  const processFile = async (file: File): Promise<any> => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase()

    return new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        const result = e.target?.result
        let processedContent = ""
        let fileDescription = ""
        let estimatedTokens = 0

        // Handle different file types
        if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico"].includes(extension.slice(1))) {
          // Image files - convert to base64
          processedContent = result as string
          fileDescription = `Image file: ${file.name} (${Math.round(file.size / 1024)}KB)`
          estimatedTokens = Math.ceil((result as string).length / 4)
        } else if (["pdf", "zip", "tar", "gz", "rar", "psd", "ai", "xd"].includes(extension.slice(1))) {
          // Binary files that need JSON description
          processedContent = JSON.stringify(
            {
              type: "binary_file",
              name: file.name,
              extension: extension,
              size: file.size,
              description: `Binary file: ${file.name}. This is a ${extension.slice(1).toUpperCase()} file that contains ${getBinaryFileDescription(extension)}. The file size is ${Math.round(file.size / 1024)}KB.`,
              metadata: {
                lastModified: file.lastModified,
                mimeType: file.type,
              },
            },
            null,
            2,
          )
          fileDescription = `Binary file converted to JSON description`
          estimatedTokens = Math.ceil(processedContent.length / 4)
        } else {
          // Text-based files - read as text
          const textContent = result as string
          processedContent = textContent
          fileDescription = `${getLanguageDescription(extension)} file: ${file.name}`
          estimatedTokens = Math.ceil(textContent.length / 4)
        }

        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          extension: extension,
          content: processedContent,
          description: fileDescription,
          estimatedTokens,
          isProcessable: isLLMProcessable(extension),
          lastModified: file.lastModified,
        }

        resolve(fileData)
      }

      // Read file based on type
      if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "ico"].includes(extension.slice(1))) {
        reader.readAsDataURL(file)
      } else if (["pdf", "zip", "tar", "gz", "rar", "psd", "ai", "xd"].includes(extension.slice(1))) {
        reader.readAsArrayBuffer(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const isLLMProcessable = (extension: string): boolean => {
    const processableTypes = [
      ".js",
      ".ts",
      ".jsx",
      ".tsx",
      ".css",
      ".html",
      ".htm",
      ".vue",
      ".svelte",
      ".py",
      ".go",
      ".rs",
      ".java",
      ".cpp",
      ".c",
      ".cs",
      ".php",
      ".rb",
      ".swift",
      ".kt",
      ".scala",
      ".r",
      ".m",
      ".sh",
      ".bat",
      ".ps1",
      ".json",
      ".xml",
      ".yaml",
      ".yml",
      ".toml",
      ".ini",
      ".env",
      ".csv",
      ".sql",
      ".md",
      ".txt",
      ".rtf",
    ]
    return processableTypes.includes(extension)
  }

  const getLanguageDescription = (extension: string): string => {
    const descriptions: { [key: string]: string } = {
      ".py": "Python",
      ".go": "Go",
      ".rs": "Rust",
      ".java": "Java",
      ".cpp": "C++",
      ".c": "C",
      ".cs": "C#",
      ".php": "PHP",
      ".rb": "Ruby",
      ".swift": "Swift",
      ".kt": "Kotlin",
      ".scala": "Scala",
      ".r": "R",
      ".m": "Objective-C/MATLAB",
      ".sh": "Shell Script",
      ".bat": "Batch Script",
      ".ps1": "PowerShell",
      ".js": "JavaScript",
      ".ts": "TypeScript",
      ".jsx": "React JSX",
      ".tsx": "React TypeScript",
      ".vue": "Vue.js",
      ".svelte": "Svelte",
      ".css": "CSS",
      ".html": "HTML",
      ".htm": "HTML",
      ".json": "JSON",
      ".xml": "XML",
      ".yaml": "YAML",
      ".yml": "YAML",
      ".toml": "TOML",
      ".ini": "INI Config",
      ".env": "Environment",
      ".csv": "CSV Data",
      ".sql": "SQL",
      ".md": "Markdown",
      ".txt": "Text",
      ".rtf": "Rich Text",
    }
    return descriptions[extension] || "Code"
  }

  const getBinaryFileDescription = (extension: string): string => {
    const descriptions: { [key: string]: string } = {
      ".pdf": "formatted text, images, and document structure",
      ".zip": "compressed files and folders",
      ".tar": "archived files and directories",
      ".gz": "compressed data",
      ".rar": "compressed files and folders",
      ".psd": "layered image data and design elements",
      ".ai": "vector graphics and design elements",
      ".xd": "UI/UX design layouts and components",
      ".fig": "design components and layouts",
      ".sketch": "design artboards and symbols",
    }
    return descriptions[extension] || "binary data"
  }

  const handleFileSelect = async (files: FileList) => {
    console.log("[v0] File selection started, files count:", files.length)

    const fileArray = Array.from(files)
    const validFiles: File[] = []

    // Validate files
    for (const file of fileArray) {
      const extension = "." + file.name.split(".").pop()?.toLowerCase()
      const isValidType = acceptedTypes.includes(extension)
      const isValidSize = file.size <= 10 * 1024 * 1024 // Increased to 10MB per file

      if (!isValidType) {
        alert(`File type ${extension} not supported. Supported types: ${acceptedTypes.join(", ")}`)
        continue
      }
      if (!isValidSize) {
        alert(`File ${file.name} exceeds 10MB limit`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Check total size limit
    const totalSize = [...attachedFiles, ...validFiles].reduce((sum, file) => sum + (file.size || 0), 0)
    if (totalSize > 25 * 1024 * 1024) {
      // 25MB total limit
      alert("Total file size exceeds 25MB limit")
      return
    }

    // Process files
    const processedFiles = []
    for (const file of validFiles) {
      try {
        console.log("[v0] Processing file:", file.name)
        const processedFile = await processFileWithTimeout(file)
        processedFiles.push(processedFile)
        console.log("[v0] File processed successfully:", file.name)
      } catch (error) {
        console.error(`[v0] Error processing file ${file.name}:`, error)
        alert(`Error processing file ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    onFilesAttached([...attachedFiles, ...processedFiles])
  }

  const processFileWithTimeout = (file: File): Promise<any> => {
    return Promise.race([
      processFile(file),
      new Promise((_, reject) => setTimeout(() => reject(new Error("File processing timeout")), 30000)),
    ])
  }

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "svg", "gif", "webp", "bmp", "ico"].includes(ext || ""))
      return <ImageIcon className="w-4 h-4" />
    if (
      [
        "js",
        "ts",
        "jsx",
        "tsx",
        "css",
        "html",
        "htm",
        "vue",
        "svelte",
        "py",
        "go",
        "rs",
        "java",
        "cpp",
        "c",
        "cs",
        "php",
        "rb",
        "swift",
        "kt",
        "scala",
        "r",
        "m",
        "sh",
        "bat",
        "ps1",
      ].includes(ext || "")
    )
      return <Code className="w-4 h-4" />
    if (["json", "xml", "yaml", "yml", "toml", "ini", "env", "csv", "sql"].includes(ext || ""))
      return <Database className="w-4 h-4" />
    if (["zip", "tar", "gz", "rar"].includes(ext || "")) return <Archive className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }

  return (
    <Card className="mx-auto bg-white border-0 shadow-2xl mt-4 max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Attach Files
          </CardTitle>
          <Button variant="ghost" onClick={onClose} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFileSelect(e.dataTransfer.files)
          }}
          onClick={() => fileInputRef.current?.click()} // Added click handler to entire drop zone
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
          <p className="text-sm text-gray-500 mb-4">
            Supports: Images, Code (Python, Go, Rust, Java, C++, JS, TS, etc.), Data files, Documents, Design files,
            Archives
          </p>
          <Button
            onClick={(e) => {
              e.stopPropagation() // Prevent event bubbling
              e.preventDefault() // Added preventDefault for better browser compatibility
              console.log("[v0] File input button clicked")
              fileInputRef.current?.click()
            }}
            className="bg-black text-white hover:bg-gray-800"
          >
            Choose Files
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(",")}
            onChange={(e) => {
              console.log("[v0] File input changed, files:", e.target.files?.length || 0) // Added logging
              if (e.target.files) {
                handleFileSelect(e.target.files)
                e.target.value = "" // Reset input
              }
            }}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-900">Accepted Files:</span>
            <span className="text-gray-600">Max 25MB total, 10MB per file</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-green-100 p-2 rounded border border-green-200">
              <div className="font-medium text-green-900">Images & Media</div>
              <div className="text-green-800">.jpg, .png, .svg, .gif, .webp</div>
            </div>
            <div className="bg-blue-100 p-2 rounded border border-blue-200">
              <div className="font-medium text-blue-900">Programming</div>
              <div className="text-blue-800">.py, .go, .rs, .java, .js, .ts, .cpp</div>
            </div>
            <div className="bg-purple-100 p-2 rounded border border-purple-200">
              <div className="font-medium text-purple-900">Web & Config</div>
              <div className="text-purple-800">.html, .css, .json, .yaml, .env</div>
            </div>
            <div className="bg-orange-100 p-2 rounded border border-orange-200">
              <div className="font-medium text-orange-900">Design & Docs</div>
              <div className="text-orange-800">.fig, .sketch, .pdf, .md, .zip</div>
            </div>
          </div>
        </div>

        {attachedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Attached Files ({attachedFiles.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 p-2 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.name)}
                    <div className="flex flex-col">
                      <span className="text-sm truncate text-gray-900">{file.name}</span>
                      <span className="text-xs text-gray-600">{file.description}</span>
                      {!file.isProcessable && (
                        <span className="text-xs text-amber-700">Converted to JSON description</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{Math.round(file.size / 1024)}KB</span>
                    <span>~{file.estimatedTokens} tokens</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFilesAttached(attachedFiles.filter((_, i) => i !== index))}
                      className="p-0 h-auto hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
