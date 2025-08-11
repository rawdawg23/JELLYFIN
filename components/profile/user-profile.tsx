"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  Settings,
  Shield,
  Bell,
  Key,
  Server,
  Activity,
  Clock,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
} from "lucide-react"
import { JellyfinQuickConnectSection } from "@/components/profile/jellyfin-quick-connect-section"
import { EmbyConnectSection } from "@/components/profile/emby-connect-section"
import { useAuth } from "@/providers/auth-provider"

interface UserDevice {
  id: string
  name: string
  type: "mobile" | "desktop" | "tablet" | "tv"
  lastActive: Date
  isOnline: boolean
  location?: string
}

interface UserSession {
  id: string
  deviceName: string
  ipAddress: string
  location: string
  startTime: Date
  isActive: boolean
}

export function UserProfile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [userDevices] = useState<UserDevice[]>([
    {
      id: "1",
      name: "iPhone 15 Pro",
      type: "mobile",
      lastActive: new Date(),
      isOnline: true,
      location: "London, UK",
    },
    {
      id: "2",
      name: "MacBook Pro",
      type: "desktop",
      lastActive: new Date(Date.now() - 300000),
      isOnline: false,
      location: "London, UK",
    },
    {
      id: "3",
      name: "iPad Air",
      type: "tablet",
      lastActive: new Date(Date.now() - 3600000),
      isOnline: false,
      location: "London, UK",
    },
  ])

  const [userSessions] = useState<UserSession[]>([
    {
      id: "1",
      deviceName: "Chrome Browser",
      ipAddress: "192.168.1.100",
      location: "London, UK",
      startTime: new Date(Date.now() - 7200000),
      isActive: true,
    },
    {
      id: "2",
      deviceName: "Mobile App",
      ipAddress: "192.168.1.101",
      location: "London, UK",
      startTime: new Date(Date.now() - 1800000),
      isActive: true,
    },
  ])

  const [profileData, setProfileData] = useState({
    displayName: user?.username || "User",
    email: "user@example.com",
    phone: "",
    location: "London, UK",
    bio: "Media enthusiast and Jellyfin power user",
  })

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "mobile":
        return Smartphone
      case "desktop":
        return Monitor
      case "tablet":
        return Tablet
      default:
        return Monitor
    }
  }

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "Active now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  const handleSaveProfile = () => {
    setIsEditing(false)
    // Here you would typically save to your backend
  }

  if (!user) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
        <CardContent className="text-center py-20">
          <User className="w-20 h-20 text-white/40 mx-auto mb-8" />
          <h3 className="text-2xl font-bold text-white mb-4">Please Sign In</h3>
          <p className="text-white/60 text-lg">You need to be signed in to view your profile.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-indigo-600/20 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10" />
        <CardContent className="relative p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-white">{profileData.displayName}</h1>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-white/70 text-lg mb-4">{profileData.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Member since {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm"
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/10 border-white/20 rounded-2xl p-2 backdrop-blur-sm">
          <TabsTrigger
            value="profile"
            className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="servers"
            className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3"
          >
            <Server className="w-4 h-4 mr-2" />
            Servers
          </TabsTrigger>
          <TabsTrigger
            value="devices"
            className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3"
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Devices
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3"
          >
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Personal Information</CardTitle>
              <CardDescription className="text-white/60">Manage your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20 text-white rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20 text-white rounded-xl"
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    disabled={!isEditing}
                    className="bg-white/10 border-white/20 text-white rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-white">
                  Bio
                </Label>
                <Input
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  disabled={!isEditing}
                  className="bg-white/10 border-white/20 text-white rounded-xl"
                  placeholder="Tell us about yourself"
                />
              </div>
              {isEditing && (
                <div className="flex gap-4">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="servers" className="mt-8">
          <div className="space-y-8">
            <JellyfinQuickConnectSection />
            <EmbyConnectSection />
          </div>
        </TabsContent>

        <TabsContent value="devices" className="mt-8">
          <div className="space-y-8">
            {/* Connected Devices */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Connected Devices</CardTitle>
                <CardDescription className="text-white/60">
                  Manage devices that have access to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userDevices.map((device) => {
                  const DeviceIcon = getDeviceIcon(device.type)
                  return (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <DeviceIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{device.name}</h4>
                          <p className="text-white/60 text-sm">
                            {device.location} • {formatLastActive(device.lastActive)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            device.isOnline
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }
                        >
                          {device.isOnline ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                          {device.isOnline ? "Online" : "Offline"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Active Sessions */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Active Sessions</CardTitle>
                <CardDescription className="text-white/60">Current login sessions across all devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{session.deviceName}</h4>
                        <p className="text-white/60 text-sm">
                          {session.ipAddress} • {session.location} • Started {formatLastActive(session.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                      >
                        End Session
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-8">
          <div className="space-y-8">
            {/* Security Overview */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Security Overview</CardTitle>
                <CardDescription className="text-white/60">Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-green-500/20 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Your account security is strong. All recommended security measures are enabled.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Password Security</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-white/80">Strong Password</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-white/80">Two-Factor Authentication</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">Account Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-white/80">Login Notifications</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                        <span className="text-white/80">Suspicious Activity Alerts</span>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl">
                    <Key className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Security Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-8">
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Account Settings</CardTitle>
              <CardDescription className="text-white/60">Configure your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-blue-400" />
                      <span className="text-white/80">Email Notifications</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                    >
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-400" />
                      <span className="text-white/80">Push Notifications</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                    >
                      Configure
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Privacy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-white/80">Profile Visibility</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Private</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-white/80">Activity Status</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Visible</Badge>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
