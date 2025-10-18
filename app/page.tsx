"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState, useCallback, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUp, Upload, Settings, Edit, X, Paperclip } from "lucide-react"
import dynamic from "next/dynamic"

const AttachPopup = dynamic(
  () => import("@/components/landing/attach-popup").then((mod) => ({ default: mod.AttachPopup })),
  {
    loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32" />,
  },
)

const SettingsPopup = dynamic(
  () => import("@/components/landing/settings-popup").then((mod) => ({ default: mod.SettingsPopup })),
  {
    loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-32" />,
  },
)

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [activePopup, setActivePopup] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<Array<{
    name: string;
    type: string;
    size: number;
    extension: string;
    content: string;
    description: string;
    estimatedTokens: number;
    isProcessable: boolean;
    lastModified?: number;
  }>>([]);
  
  const [settings, setSettings] = useState({
    model: "gpt-4",
    temperature: 0.7,
    techStack: "nextjs-full",
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const userData = await response.json()
          setUser(userData.user)
        }
      } catch (error) {
        console.log("Not authenticated")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const submitButtonText = useMemo(() => {
    if (!user && prompt.trim()) {
      return "Sign in to generate"
    }
    return ""
  }, [user, prompt])

  const handlePromptSubmit = useCallback(async () => {
    if (!user) {
      window.location.href = `/api/auth/login?post_login_redirect_url=${encodeURIComponent("/editor")}`
      return
    }

    if (prompt.trim()) {
      try {
        // Create a new chat first
        const chatResponse = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : '')
          })
        });

        if (!chatResponse.ok) {
          throw new Error('Failed to create chat');
        }

        const { chatId } = await chatResponse.json();
        
        // Upload files if any
        if (attachedFiles.length > 0) {
          const uploadPromises = attachedFiles.map(async (file) => {
            const response = await fetch(`/api/chats/${chatId}/files`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: file.name,
                type: file.type,
                content: file.content,
                metadata: {
                  size: file.size,
                  extension: file.extension,
                  estimatedTokens: file.estimatedTokens,
                  isProcessable: file.isProcessable
                }
              })
            });
            return response.json();
          });

          await Promise.all(uploadPromises);
        }

        // Redirect to editor with the new chat ID
        const params = new URLSearchParams({
          chatId,
          prompt: prompt,
          settings: JSON.stringify(settings),
        });
        
        window.location.href = `/editor?${params.toString()}`;
      } catch (error) {
        console.error('Error creating chat:', error);
        // Handle error appropriately
      }
    }
  }, [user, prompt, attachedFiles, settings])

  const handlePopupToggle = useCallback((popupType: string) => {
    setActivePopup((current) => (current === popupType ? null : popupType))
  }, [])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-black">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
        <div className="milky-way"></div>
      </div>

      <header className="relative z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/images/prompt-royale-logo.png"
                  alt="Prompt Royale Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                  priority
                  sizes="48px"
                />
              </Link>
            </div>
            <nav className="flex items-center gap-6 text-white/80 text-sm">
              {user ? (
                <>
                  <Link href="/chat-history" className="hover:text-white transition-colors">
                    chat history
                  </Link>
                  <Link href="/tutorial" className="hover:text-white transition-colors">
                    tutorial
                  </Link>
                  <Link href="/api/auth/logout" className="hover:text-white transition-colors">
                    sign out
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/tutorial" className="hover:text-white transition-colors">
                    tutorial
                  </Link>
                  <Link href="/api/auth/login" className="hover:text-white transition-colors">
                    sign in
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="text-center space-y-8 px-6 w-full max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-balance mb-12">prompt, prototype, pilot.</h2>

          <Card className="mx-auto bg-white border-0 shadow-2xl max-w-2xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <Textarea
                      placeholder="Enter your prompt and instructions."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="text-base py-3 px-3 border-gray-200 focus:ring-2 focus:ring-gray-300 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-500 min-h-[100px] max-h-[250px] resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      onClick={handlePromptSubmit}
                      disabled={!prompt.trim() || isLoading}
                      className="bg-black text-white hover:bg-gray-800 p-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      title={submitButtonText}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    {!user && prompt.trim() && (
                      <span className="text-xs text-gray-500 text-center">Sign in required</span>
                    )}
                  </div>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.slice(0, 5).map((file, index) => (
                      <div key={index} className="bg-gray-100 rounded-lg p-2 flex items-center gap-2 text-sm">
                        <Paperclip className="w-4 h-4" />
                        <span className="truncate max-w-[100px]">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAttachedFiles((files) => files.filter((_, i) => i !== index))}
                          className="p-0 h-auto hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                    {attachedFiles.length > 5 && (
                      <div className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center text-xs font-medium">
                        +{attachedFiles.length - 5}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePopupToggle("attach");
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activePopup === "attach"
                        ? "bg-white text-black border-black"
                        : "bg-black text-white border-black hover:bg-gray-700 hover:border-gray-700"
                    }`}
                  >
                    <Upload className="w-3 h-3 mr-1.5" />
                    Attach
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePopupToggle("settings")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activePopup === "settings"
                        ? "bg-white text-black border-black"
                        : "bg-black text-white border-black hover:bg-gray-700 hover:border-gray-700"
                    }`}
                  >
                    <Settings className="w-3 h-3 mr-1.5" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePopupToggle("edit")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activePopup === "edit"
                        ? "bg-white text-black border-black"
                        : "bg-black text-white border-black hover:bg-gray-700 hover:border-gray-700"
                    }`}
                  >
                    <Edit className="w-3 h-3 mr-1.5" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8">
            {activePopup === "attach" && (
              <AttachPopup
                onClose={() => setActivePopup(null)}
                onFilesAttached={setAttachedFiles}
                attachedFiles={attachedFiles}
              />
            )}

            {activePopup === "settings" && (
              <SettingsPopup onClose={() => setActivePopup(null)} settings={settings} onSettingsChange={setSettings} />
            )}

            {activePopup === "edit" && (
              <Card className="bg-white border-0 shadow-2xl mt-4">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Edit Mode</h3>
                    <Button variant="ghost" onClick={() => setActivePopup(null)} className="p-1">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Edit mode will be available in the Editor Panel after you submit your prompt. Click components in
                    the preview to select and modify them.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <div className="pb-24"></div>
      </main>
    </div>
  )
}
