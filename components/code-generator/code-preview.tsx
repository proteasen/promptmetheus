"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Eye, Code, FileText } from "lucide-react"
import type { GeneratedProject } from "@/lib/code-generation"

interface CodePreviewProps {
  project: GeneratedProject
  onDownload: (project: GeneratedProject) => void
}

export function CodePreview({ project, onDownload }: CodePreviewProps) {
  const [selectedFile, setSelectedFile] = useState<string>(Object.keys(project.files)[0] || "")
  const [previewMode, setPreviewMode] = useState<"code" | "preview">("code")

  const fileEntries = Object.entries(project.files)
  const currentFileContent = project.files[selectedFile] || ""

  const getFileLanguage = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase()
    switch (ext) {
      case "tsx":
      case "ts":
        return "typescript"
      case "jsx":
      case "js":
        return "javascript"
      case "css":
        return "css"
      case "html":
        return "html"
      case "json":
        return "json"
      case "md":
        return "markdown"
      default:
        return "text"
    }
  }

  const canPreview = project.framework === "html" || Object.keys(project.files).includes("index.html")

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">{project.title}</h2>
            <p className="text-muted-foreground text-sm">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {canPreview && (
              <div className="flex bg-muted rounded-lg p-1">
                <Button
                  variant={previewMode === "code" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("code")}
                  className="h-8"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Code
                </Button>
                <Button
                  variant={previewMode === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("preview")}
                  className="h-8"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            )}
            <Button
              onClick={() => onDownload(project)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4 mr-2" />
              Download ZIP
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {previewMode === "preview" && canPreview ? (
          <div className="h-full">
            <iframe
              srcDoc={project.files["index.html"] || ""}
              className="w-full h-full border-0"
              title="Project Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          <div className="flex h-full">
            {/* File Explorer */}
            <div className="w-64 border-r border-border bg-card overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Files ({fileEntries.length})
                </h3>
                <div className="space-y-1">
                  {fileEntries.map(([filename]) => (
                    <button
                      key={filename}
                      onClick={() => setSelectedFile(filename)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedFile === filename
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {filename}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-hidden">
              {selectedFile ? (
                <div className="h-full flex flex-col">
                  <div className="border-b border-border bg-card px-4 py-2">
                    <span className="text-sm font-medium text-foreground">{selectedFile}</span>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <pre className="p-4 text-sm text-foreground bg-background h-full overflow-auto">
                      <code className={`language-${getFileLanguage(selectedFile)}`}>{currentFileContent}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a file to view its contents</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
