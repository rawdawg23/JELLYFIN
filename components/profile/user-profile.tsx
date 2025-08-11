"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Settings,
  Shield,
  Bell,
  Palette,
  Globe,
  Save,
  Edit3,
  Camera,
  Star,
  Crown,
  Zap,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { JellyfinQuickConnectSection } from "./jellyfin-quick-connect-section"
import { EmbyConnectSection } from "./emby-connect-section"

export function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: user?.email || "john.doe@example.com",
    phone: "+44 7700 900123",
    location: "London, UK",
    bio: "Media enthusiast and streaming aficionado. Love discovering new content and sharing recommendations.",
    website: "https://johndoe.dev",
    joinDate: "2024-01-15",
  })

  const handleSave = () => {
    setIsEditing(false)
    // Here you would typically save to your backend
    console.log("Saving profile data:", profileData)
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Profile Header */}
      <Card className="ios-card border-0 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src="/placeholder-user.jpg" alt="Profile" />
                <AvatarFallback className="bg-purple-500 text-white text-xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-purple-600 hover:bg-purple-50 shadow-lg"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="text-white mb-2">
              <h2 className="text-2xl font-bold">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-purple-100">@{user?.username || "username"}</p>
            </div>
          </div>
          <div className="absolute top-4 right-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              <Crown className="h-3 w-3 mr-1" />
              Premium Member
            </Badge>
          </div>
        </div>
        <CardContent className="pt-16 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-muted-foreground">{profileData.bio}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profileData.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(profileData.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
              className="ios-button"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="jellyfin">
            <Zap className="h-4 w-4 mr-2" />
            Jellyfin
          </TabsTrigger>
          <TabsTrigger value="emby">
            <Star className="h-4 w-4 mr-2" />
            Emby
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card className="ios-card border-0">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    disabled={!isEditing}
                    className="ios-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    disabled={!isEditing}
                    className="ios-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="ios-input pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      disabled={!isEditing}
                      className="ios-input pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={!isEditing}
                      className="ios-input pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      disabled={!isEditing}
                      className="ios-input pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-3 py-2 border border-input bg-background rounded-xl text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3">
                  <Button onClick={() => setIsEditing(false)} variant="outline" className="ios-button">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="ios-button text-white border-0">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="ios-card border-0 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">4.8</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
            <Card className="ios-card border-0 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">127</div>
                <div className="text-sm text-muted-foreground">Hours Watched</div>
              </CardContent>
            </Card>
            <Card className="ios-card border-0 text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Crown className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">Premium</div>
                <div className="text-sm text-muted-foreground">Membership</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jellyfin" className="space-y-6">
          <JellyfinQuickConnectSection />
        </TabsContent>

        <TabsContent value="emby" className="space-y-6">
          <EmbyConnectSection />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="ios-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Manage your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Email Notifications</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Push Notifications</div>
                    <div className="text-sm text-muted-foreground">Browser notifications</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Disabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing Updates</div>
                    <div className="text-sm text-muted-foreground">News and promotions</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Enabled
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="ios-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>Control your privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Profile Visibility</div>
                    <div className="text-sm text-muted-foreground">Who can see your profile</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Public
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Activity Status</div>
                    <div className="text-sm text-muted-foreground">Show when you're online</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Data Analytics</div>
                    <div className="text-sm text-muted-foreground">Help improve our service</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Enabled
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="ios-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize your interface</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Theme</div>
                    <div className="text-sm text-muted-foreground">Choose your preferred theme</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Light
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Language</div>
                    <div className="text-sm text-muted-foreground">Interface language</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    English
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Compact Mode</div>
                    <div className="text-sm text-muted-foreground">Reduce spacing and padding</div>
                  </div>
                  <Button variant="outline" size="sm" className="ios-button bg-transparent">
                    Disabled
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="ios-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account
                </CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full ios-button justify-start bg-transparent">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full ios-button justify-start bg-transparent">
                  Download Data
                </Button>
                <Button
                  variant="outline"
                  className="w-full ios-button justify-start text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                >
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
