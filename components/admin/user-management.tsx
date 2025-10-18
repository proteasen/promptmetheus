"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Crown, ArrowLeft, Search, Users } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: string
  email: string
  createdAt: Date
  dailyTokenUsage: number
  lastResetDate: Date
  _count: {
    chats: number
    apiKeys: number
  }
}

interface UserManagementProps {
  admin: { id: string; email: string }
  users: User[]
  dailyLimit: number // Pass daily limit as prop instead of accessing env var
}

export function UserManagement({ admin, users, dailyLimit }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState(users)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = users.filter((user) => user.email.toLowerCase().includes(term.toLowerCase()))
    setFilteredUsers(filtered)
  }

  const handleResetTokens = async (userId: string) => {
    if (confirm("Are you sure you want to reset this user's daily token usage?")) {
      try {
        const response = await fetch(`/api/admin/users/${userId}/reset-tokens`, {
          method: "POST",
        })

        if (response.ok) {
          // Refresh the page to show updated data
          window.location.reload()
        } else {
          alert("Failed to reset tokens")
        }
      } catch (error) {
        alert("Failed to reset tokens")
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-accent" />
                <h1 className="text-xl font-bold text-foreground">User Management</h1>
              </div>
            </div>
            <span className="text-muted-foreground text-sm">{admin.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Users</h2>
              <p className="text-muted-foreground">Manage user accounts and monitor usage</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{filteredUsers.length} users</span>
            </div>
          </div>

          {/* Search */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 border-border focus:ring-accent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{user.email}</h3>
                        {user.email === admin.email && (
                          <span className="px-2 py-1 bg-accent text-accent-foreground text-xs rounded">Admin</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                        <span>•</span>
                        <span>{user._count.chats} chats</span>
                        <span>•</span>
                        <span>{user._count.apiKeys} API keys</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {user.dailyTokenUsage.toLocaleString()} / {dailyLimit.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">tokens today</p>
                        <div className="w-32 bg-muted rounded-full h-1 mt-1">
                          <div
                            className="bg-accent h-1 rounded-full transition-all"
                            style={{
                              width: `${Math.min((user.dailyTokenUsage / dailyLimit) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetTokens(user.id)}
                          className="border-border text-foreground hover:bg-muted bg-transparent"
                        >
                          Reset Tokens
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card className="border-border">
              <CardContent className="text-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "No users have registered yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
