"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User,
  Mail,
  Calendar,
  Crown,
  Shield,
  Settings,
  Bell,
  Lock,
  Activity,
  Edit3,
  Save,
  X,
  CheckCircle,
  Clock,
  Zap,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"
import { JellyfinQuickConnectSection } from "./jellyfin-quick-connect-section"

export function UserProfile() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  })

  if (!user) {
    return (
      <Card className="ios-card border-0">
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    )
  }

  const handleSaveProfile = () => {
    updateProfile(editForm)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditForm({
      username: user.username,
      email: user.email,
    })
    setIsEditing(false)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="ios-badge bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case "moderator":
        return (
          <Badge className="ios-badge bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
            <Shield className="h-3 w-3 mr-1" />
            Moderator
          </Badge>
        )
      default:
        return (
          <Badge className="ios-badge bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
            <User className="h-3 w-3 mr-1" />
            User
          </Badge>
        )
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "admin":
        return (
          <Badge className="ios-badge bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            Admin Access
          </Badge>
        )
      case "premium":
        return (
          <Badge className="ios-badge bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        )
      case "family":
        return (
          <Badge className="ios-badge bg-gradient-to-r from-green-500 to-teal-600 text-white border-0">
            <User className="h-3 w-3 mr-1" />
            Family
          </Badge>
        )
      default:
        return <Badge className="ios-badge bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0">Basic</Badge>
    }
  }

  // Mock activity data
  const recentActivity = [
    {
      id: "1",
      type: "login",
      description: "Signed in to account",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      icon: <User className="h-4 w-4" />,
    },
    {
      id: "2",
      type: "jellyfin_connect",
      description: "Connected to Jellyfin server",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      icon: <Zap className="h-4 w-4" />,
    },
    {
      id: "3",
      type: "profile_update",
      description: "Updated profile information",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      icon: <Edit3 className="h-4 w-4" />,
    },
    {
      id: "4",
      type: "subscription",
      description: "Subscription renewed",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      icon: <Crown className="h-4 w-4" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            User Profile
          </h2>
          <p className="text-lg text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="jellyfin">
            <Zap className="h-4 w-4 mr-2" />
            Jellyfin
          </TabsTrigger>
          <TabsTrigger value="activity">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="ios-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{user.username}</h3>
                      {getRoleBadge(user.role)}
                    </div>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2">{getPlanBadge(user.plan || "basic")}</div>
                  </div>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="ios-button bg-transparent"
                >
                  {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="ios-search border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="ios-search border-0"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} className="ios-button text-white border-0">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={handleCancelEdit} variant="outline" className="ios-button bg-transparent">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Username</p>
                        <p className="font-medium">{user.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Mail className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="font-medium">{formatUKDateTime(user.joinDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Active</p>
                        <p className="font-medium">{getRelativeTime(user.lastActive)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jellyfin" className="space-y-6">
          <JellyfinQuickConnectSection />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="ios-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your recent account activity and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="p-2 bg-purple-500 rounded-lg text-white">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{getRelativeTime(activity.timestamp)}</p>
                    </div>
                    <Badge className="ios-badge bg-green-100 text-green-700 border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Success
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="ios-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-500" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Enable
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Browser push notifications</p>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="ios-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-500" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full ios-button bg-transparent">
                  <Lock className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full ios-button bg-transparent">
                  <Shield className="h-4 w-4 mr-2" />
                  Two-Factor Authentication
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
