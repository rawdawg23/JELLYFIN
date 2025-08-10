"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Mail,
  Calendar,
  Clock,
  Star,
  Settings,
  Shield,
  Crown,
  Edit,
  Save,
  X,
  Camera,
  Activity,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"

export function UserProfile() {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
  })

  if (!user) return null

  const handleSave = () => {
    updateProfile(editForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm({
      username: user.username,
      email: user.email,
    })
    setIsEditing(false)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return <User className="h-4 w-4 text-purple-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-gradient-to-r from-yellow-500 to-orange-500",
      moderator: "bg-gradient-to-r from-blue-500 to-indigo-500",
      user: "bg-gradient-to-r from-purple-500 to-indigo-500",
    }
    return colors[role as keyof typeof colors] || colors.user
  }

  return (
    <div className="space-y-6">
      <Card className="ios-card border-0">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-purple-200">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full ios-button text-white border-0 p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">{user.username}</h2>
                <Badge className={`ios-badge text-white border-0 ${getRoleBadge(user.role)}`}>
                  {getRoleIcon(user.role)}
                  <span className="ml-1 capitalize">{user.role}</span>
                </Badge>
              </div>
              {user.plan && (
                <Badge className="ios-badge bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)} Plan
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="ios-button">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} size="sm" className="ios-button text-white border-0">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="ios-search border-0"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                      <User className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">{user.username}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="ios-search border-0"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                      <Mail className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{formatUKDateTime(user.joinDate)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Last Active</Label>
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">{getRelativeTime(user.lastActive)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ios-card border-0">
            <CardHeader>
              <CardTitle>Account Statistics</CardTitle>
              <CardDescription>Your activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-muted-foreground">Forum Posts</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-xl">
                  <div className="text-2xl font-bold text-indigo-600">3</div>
                  <div className="text-sm text-muted-foreground">Support Tickets</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-sm text-muted-foreground">Messages Sent</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">45</div>
                  <div className="text-sm text-muted-foreground">Days Active</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="ios-card border-0">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions and interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Posted in General Discussion", time: "2 hours ago", type: "forum" },
                  { action: "Created support ticket #1234", time: "1 day ago", type: "ticket" },
                  { action: "Sent message to @admin", time: "2 days ago", type: "message" },
                  { action: "Updated profile information", time: "3 days ago", type: "profile" },
                  { action: "Joined the community", time: "1 week ago", type: "system" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge className="ios-badge text-xs bg-purple-100 text-purple-700 border-0">{activity.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="ios-card border-0">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your preferences and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Settings panel coming soon! You'll be able to manage notifications, privacy, and security settings.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
