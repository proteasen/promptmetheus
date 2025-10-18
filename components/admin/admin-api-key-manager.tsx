"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { LLM_PROVIDERS } from "@/lib/llm/providers"
import { Eye, EyeOff, Plus, Trash2, Check, Settings } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AdminApiKey {
  id: string
  provider: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface AdminApiKeyManagerProps {
  existingKeys: AdminApiKey[]
}

export function AdminApiKeyManager({ existingKeys }: AdminApiKeyManagerProps) {
  const [keys, setKeys] = useState<AdminApiKey[]>(existingKeys)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProvider, setNewProvider] = useState("")
  const [newKey, setNewKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setKeys(existingKeys)
  }, [existingKeys])

  const refreshKeys = async () => {
    try {
      console.log("[v0] Refreshing API keys...")
      const response = await fetch("/api/admin/api-keys")
      if (response.ok) {
        const updatedKeys = await response.json()
        setKeys(updatedKeys)
        console.log("[v0] Successfully refreshed API keys:", updatedKeys.length)
      }
    } catch (error) {
      console.error("[v0] Error refreshing keys:", error)
    }
  }

  const handleAddKey = async () => {
    if (!newProvider || !newKey.trim()) return

    setLoading(true)
    try {
      console.log("[v0] Adding API key for provider:", newProvider)
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: newProvider,
          apiKey: newKey.trim(),
        }),
      })

      if (response.ok) {
        const newApiKey = await response.json()
        console.log("[v0] Successfully added API key:", newApiKey.id)
        setKeys((prev) => [...prev, newApiKey])
        setNewProvider("")
        setNewKey("")
        setShowAddForm(false)
        // Refresh to ensure we have the latest data
        await refreshKeys()
      } else {
        const error = await response.json()
        console.error("[v0] Error adding API key:", error)
        alert(error.error || "Failed to add API key")
      }
    } catch (error) {
      console.error("[v0] Network error adding API key:", error)
      alert("Failed to add API key")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleKey = async (keyId: string, isActive: boolean) => {
    try {
      console.log("[v0] Toggling API key:", keyId, "to", isActive)
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        console.log("[v0] Successfully toggled API key:", keyId)
        setKeys((prev) => prev.map((key) => (key.id === keyId ? { ...key, isActive } : key)))
      } else {
        console.error("[v0] Error toggling API key:", keyId)
        alert("Failed to update API key")
      }
    } catch (error) {
      console.error("[v0] Network error toggling API key:", error)
      alert("Failed to update API key")
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key? This will affect all users.")) return

    try {
      console.log("[v0] Deleting API key:", keyId)
      const response = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        console.log("[v0] Successfully deleted API key:", keyId)
        setKeys((prev) => prev.filter((key) => key.id !== keyId))
        // Refresh to ensure we have the latest data
        await refreshKeys()
      } else {
        console.error("[v0] Error deleting API key:", keyId)
        alert("Failed to delete API key")
      }
    } catch (error) {
      console.error("[v0] Network error deleting API key:", error)
      alert("Failed to delete API key")
    }
  }

  const getProviderDisplayName = (provider: string) => {
    return LLM_PROVIDERS.find((p) => p.name === provider)?.displayName || provider
  }

  const availableProviders = LLM_PROVIDERS.filter((provider) => !keys.some((key) => key.provider === provider.name))

  return (
    <div className="space-y-6">
      {/* Existing Keys */}
      {keys.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Configured API Keys</h3>
          {keys.map((key) => (
            <Card key={key.id} className="border-border">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">{getProviderDisplayName(key.provider)}</h4>
                    <p className="text-sm text-muted-foreground">
                      Added {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={key.isActive} onCheckedChange={(checked) => handleToggleKey(key.id, checked)} />
                    <span className="text-sm text-muted-foreground">{key.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {key.isActive && <Check className="h-4 w-4 text-green-500" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Key */}
      {availableProviders.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Add New API Key</h3>
            {!showAddForm && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add API Key
              </Button>
            )}
          </div>

          {showAddForm && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Add System API Key</CardTitle>
                <CardDescription className="text-muted-foreground">
                  This API key will be used by all users in the system. It will be encrypted and stored securely.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider" className="text-foreground">
                    Provider
                  </Label>
                  <Select value={newProvider} onValueChange={setNewProvider}>
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProviders.map((provider) => (
                        <SelectItem key={provider.name} value={provider.name}>
                          {provider.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey" className="text-foreground">
                    API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="apiKey"
                      type={showKey ? "text" : "password"}
                      placeholder="Enter the API key"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="border-border focus:ring-accent pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAddKey}
                    disabled={loading || !newProvider || !newKey.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? "Adding..." : "Add Key"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setNewProvider("")
                      setNewKey("")
                    }}
                    className="border-border text-foreground hover:bg-muted bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {availableProviders.length === 0 && keys.length === LLM_PROVIDERS.length && (
        <Card className="border-border">
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All Providers Configured</h3>
            <p className="text-muted-foreground">System API keys are configured for all available providers</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
