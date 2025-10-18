"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LLM_PROVIDERS } from "@/lib/llm/providers"
import { Eye, EyeOff, Plus, Trash2, Check } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ApiKey {
  id: string
  provider: string
  createdAt: Date
  updatedAt: Date
}

interface ApiKeyManagerProps {
  existingKeys: ApiKey[]
}

export function ApiKeyManager({ existingKeys }: ApiKeyManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>(existingKeys)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProvider, setNewProvider] = useState("")
  const [newKey, setNewKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAddKey = async () => {
    if (!newProvider || !newKey.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/settings/api-keys", {
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
        setKeys((prev) => [...prev, newApiKey])
        setNewProvider("")
        setNewKey("")
        setShowAddForm(false)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to add API key")
      }
    } catch (error) {
      alert("Failed to add API key")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return

    try {
      const response = await fetch(`/api/settings/api-keys/${keyId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setKeys((prev) => prev.filter((key) => key.id !== keyId))
      } else {
        alert("Failed to delete API key")
      }
    } catch (error) {
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
                <div>
                  <h4 className="font-medium text-foreground">{getProviderDisplayName(key.provider)}</h4>
                  <p className="text-sm text-muted-foreground">
                    Added {formatDistanceToNow(new Date(key.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
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
                <CardTitle className="text-foreground">Add API Key</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your API key will be encrypted and stored securely
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
                      placeholder="Enter your API key"
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
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All Providers Configured</h3>
            <p className="text-muted-foreground">You have API keys configured for all available providers</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
