"use client"

import { useState, useEffect } from "react"
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit2, Download, Trash2, ExternalLink, Clock, Zap, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface Project {
  id: string
  name: string
  tokensUsed: number
  createdAt: string
  lastModified: string
  framework: string
  model: string
  prompt: string
  files: any[]
  settings: any
  chatMessages: any[]
}

export default function ChatHistoryPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [loading, setLoading] = useState(true)
  const { user, isLoading, logout } = useKindeAuth()
  const router = useRouter()

  useEffect(() => {
    const checkUserAndFetchProjects = async () => {
      if (isLoading) return

      if (!user) {
        router.push("/auth/login?redirect=/chat-history")
        return
      }

      try {
        setProjects(getMockProjects())
      } catch (error) {
        console.error("Error in checkUserAndFetchProjects:", error)
        setProjects(getMockProjects())
      } finally {
        setLoading(false)
      }
    }

    checkUserAndFetchProjects()
  }, [user, isLoading, router])

  const getMockProjects = (): Project[] => [
    {
      id: "1",
      name: "E-commerce Landing Page",
      tokensUsed: 2450,
      createdAt: "2024-01-15",
      lastModified: "2024-01-15",
      framework: "nextjs-full",
      model: "gpt-4",
      prompt: "Create a modern e-commerce landing page with product showcase",
      files: [],
      settings: { model: "gpt-4", temperature: 0.7, techStack: "nextjs-full" },
      chatMessages: [],
    },
    {
      id: "2",
      name: "Portfolio Website",
      tokensUsed: 1890,
      createdAt: "2024-01-14",
      lastModified: "2024-01-14",
      framework: "react-tailwind",
      model: "claude-3-sonnet",
      prompt: "Build a personal portfolio website for a web developer",
      files: [],
      settings: { model: "claude-3-sonnet", temperature: 0.5, techStack: "react-tailwind" },
      chatMessages: [],
    },
  ]

  const handleEditName = async (id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const handleSaveName = async (id: string) => {
    try {
      // Placeholder for future implementation with Kinde API
      console.log("Saving project name with Kinde API:", editingName)
    } catch (error) {
      console.error("Error updating project name:", error)
      setProjects(projects.map((p) => (p.id === id ? { ...p, name: editingName } : p)))
    }

    setEditingId(null)
    setEditingName("")
  }

  const handleDeleteProject = async (id: string) => {
    try {
      // Placeholder for future implementation with Kinde API
      console.log("Deleting project with Kinde API:", id)
    } catch (error) {
      console.error("Error deleting project:", error)
      setProjects(projects.filter((p) => p.id !== id))
    }
  }

  const handleExportProject = (project: Project) => {
    const exportData = {
      name: project.name,
      prompt: project.prompt,
      files: project.files,
      settings: project.settings,
      tokensUsed: project.tokensUsed,
      createdAt: project.createdAt,
      framework: project.framework,
      model: project.model,
      chatMessages: project.chatMessages,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${project.name.toLowerCase().replace(/\s+/g, "-")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const totalTokens = projects.reduce((sum, p) => sum + p.tokensUsed, 0)

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-black">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
          <div className="milky-way"></div>
        </div>
        <div className="relative z-10 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/70">Loading your projects...</p>
        </div>
      </div>
    )
  }

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
                />
              </Link>
            </div>
            <nav className="flex items-center gap-6 text-white/80 text-sm">
              <Link href="/chat-history" className="text-white font-medium">
                chat history
              </Link>
              <Link href="/tutorial" className="hover:text-white transition-colors">
                tutorial
              </Link>
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-white/70 text-xs">{user.email}</span>
                  <button onClick={() => logout()} className="hover:text-white transition-colors">
                    sign out
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  sign in
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Project History</h1>
            <p className="text-white/70">Manage your generated projects and track token usage</p>
          </div>

          {/* Stats Card */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{projects.length}</div>
                  <div className="text-white/70 text-sm">Total Projects</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</div>
                  <div className="text-white/70 text-sm">Tokens Used</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(totalTokens / projects.length || 0)}</div>
                  <div className="text-white/70 text-sm">Avg per Project</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects List */}
          <div className="space-y-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {editingId === project.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveName(project.id)
                                if (e.key === "Escape") setEditingId(null)
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveName(project.id)}
                              className="bg-white text-black hover:bg-white/90"
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditName(project.id, project.name)}
                              className="text-white/70 hover:text-white hover:bg-white/10 p-1"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>

                      <p className="text-white/70 text-sm mb-3 line-clamp-2">{project.prompt}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {project.framework}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {project.model}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-white/30 flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3" />
                          {project.tokensUsed.toLocaleString()} tokens
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-white/50 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/editor?project=${project.id}`}>
                        <Button size="sm" className="bg-white text-black hover:bg-white/90">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportProject(project)}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-12 text-center">
                <div className="text-white/50 mb-4">
                  <Clock className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
                  <p>Start creating your first project from the homepage</p>
                </div>
                <Link href="/">
                  <Button className="bg-white text-black hover:bg-white/90">Create Project</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
