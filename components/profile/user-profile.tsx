"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  Settings,
  Shield,
  Bell,
  Palette,
  Monitor,
  Smartphone,
  Crown,
  Edit3,
  Save,
  X,
  Camera,
  Mail,
  Calendar,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { JellyfinQuickConnectSection } from "./jellyfin-quick-connect-section"
import { EmbyConnectSection } from "./emby-connect-section"

export function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    displayName: user?.displayName || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
  })

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving user data:", editedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedUser({
      username: user?.username || "",
      email: user?.email || "",
      displayName: user?.displayName || "",
      bio: user?.bio || "",
      location: user?.location || "",
      website: user?.website || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="border-0 bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-purple-600/10" />
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                <AvatarImage src="/placeholder-user.jpg" alt={user?.username} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {user?.displayName || user?.username}
                </h1>
                <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-400">@{user?.username}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined Dec 2023
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-violet-200 dark:border-violet-800">
          <TabsTrigger value="general" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="jellyfin" className="gap-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Jellyfin</span>
          </TabsTrigger>
          <TabsTrigger value="emby" className="gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Emby</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={editedUser.username}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, username: e.target.value }))}
                    disabled={!isEditing}
                    className="bg-white/70 dark:bg-black/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedUser.email}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="bg-white/70 dark:bg-black/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={editedUser.displayName}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, displayName: e.target.value }))}
                    disabled={!isEditing}
                    className="bg-white/70 dark:bg-black/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editedUser.location}
                    onChange={(e) => setEditedUser((prev) => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="City, Country"
                    className="bg-white/70 dark:bg-black/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={editedUser.website}
                  onChange={(e) => setEditedUser((prev) => ({ ...prev, website: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="https://your-website.com"
                  className="bg-white/70 dark:bg-black/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={editedUser.bio}
                  onChange={(e) => setEditedUser((prev) => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  className="w-full min-h-[100px] px-3 py-2 bg-white/70 dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jellyfin">
          <JellyfinQuickConnectSection />
        </TabsContent>

        <TabsContent value="emby">
          <EmbyConnectSection />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-violet-600" />
                Security Settings
              </CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
                  <div>
                    <h4 className="font-semibold">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div>
                    <h4 className="font-semibold">Login Notifications</h4>
                    <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div>
                    <h4 className="font-semibold">Active Sessions</h4>
                    <p className="text-sm text-muted-foreground">Manage your active login sessions</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-violet-600" />
                Preferences
              </CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-semibold">Theme</h4>
                      <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Dark Mode
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-indigo-600" />
                    <div>
                      <h4 className="font-semibold">Notifications</h4>
                      <p className="text-sm text-muted-foreground">Manage notification preferences</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
