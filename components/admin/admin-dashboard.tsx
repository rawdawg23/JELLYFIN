"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  UserPlus,
  Activity,
  Clock,
  Search,
  Download,
  Eye,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Server,
  Smartphone,
  Monitor,
  Tablet,
  Tv,
  Calendar,
  Globe,
  Mail,
  Phone,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

interface AdminUser {
  id: string
  username: string
  displayName: string
  email: string
  phone?: string
  avatar: string
  role: "user" | "admin" | "moderator"
  status: "online" | "offline" | "banned" | "suspended"
  joinDate: Date
  lastActive: Date
  lastLogin: Date
  location?: {
    country: string
    city: string
    ip: string
  }
  deviceInfo?: {
    type: "desktop" | "mobile" | "tablet" | "tv"
    browser: string
    os: string
  }
  subscription?: {
    plan: string
    status: "active" | "expired" | "cancelled"
    expiresAt?: Date
  }
  stats: {
    totalSessions: number
    totalWatchTime: number // in minutes
    favoriteGenre: string
    devicesUsed: number
  }
}

// Mock admin users data
const ADMIN_USERS: AdminUser[] = [
  {
    id: "user-1",
    username: "moviebuff_uk",
    displayName: "Alex Thompson",
    email: "alex.thompson@email.com",
    phone: "+44 7700 900123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    role: "user",
    status: "online",
    joinDate: new Date(Date.now() - 86400000 * 30),
    lastActive: new Date(),
    lastLogin: new Date(Date.now() - 3600000),
    location: {
      country: "United Kingdom",
      city: "London",
      ip: "192.168.1.100",
    },
    deviceInfo: {
      type: "desktop",
      browser: "Chrome 120",
      os: "Windows 11",
    },
    subscription: {
      plan: "Premium",
      status: "active",
      expiresAt: new Date(Date.now() + 86400000 * 30),
    },
    stats: {
      totalSessions: 145,
      totalWatchTime: 2340,
      favoriteGenre: "Action",
      devicesUsed: 3,
    },
  },
  {
    id: "user-2",
    username: "anime_lover_jp",
    displayName: "Yuki Tanaka",
    email: "yuki.tanaka@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki",
    role: "user",
    status: "online",
    joinDate: new Date(Date.now() - 86400000 * 15),
    lastActive: new Date(Date.now() - 300000),
    lastLogin: new Date(Date.now() - 1800000),
    location: {
      country: "Japan",
      city: "Tokyo",
      ip: "203.0.113.45",
    },
    deviceInfo: {
      type: "mobile",
      browser: "Safari Mobile",
      os: "iOS 17",
    },
    subscription: {
      plan: "Basic",
      status: "active",
      expiresAt: new Date(Date.now() + 86400000 * 15),
    },
    stats: {
      totalSessions: 89,
      totalWatchTime: 1560,
      favoriteGenre: "Anime",
      devicesUsed: 2,
    },
  },
  {
    id: "user-3",
    username: "series_addict_us",
    displayName: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 555-0123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    role: "moderator",
    status: "online",
    joinDate: new Date(Date.now() - 86400000 * 45),
    lastActive: new Date(Date.now() - 120000),
    lastLogin: new Date(Date.now() - 600000),
    location: {
      country: "United States",
      city: "New York",
      ip: "198.51.100.25",
    },
    deviceInfo: {
      type: "tv",
      browser: "Smart TV App",
      os: "Android TV",
    },
    subscription: {
      plan: "Premium Plus",
      status: "active",
      expiresAt: new Date(Date.now() + 86400000 * 60),
    },
    stats: {
      totalSessions: 234,
      totalWatchTime: 4560,
      favoriteGenre: "Drama",
      devicesUsed: 4,
    },
  },
  {
    id: "user-4",
    username: "music_master_de",
    displayName: "Hans Mueller",
    email: "hans.mueller@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hans",
    role: "user",
    status: "offline",
    joinDate: new Date(Date.now() - 86400000 * 60),
    lastActive: new Date(Date.now() - 900000),
    lastLogin: new Date(Date.now() - 7200000),
    location: {
      country: "Germany",
      city: "Berlin",
      ip: "203.0.113.78",
    },
    deviceInfo: {
      type: "desktop",
      browser: "Firefox 121",
      os: "Ubuntu 22.04",
    },
    subscription: {
      plan: "Basic",
      status: "expired",
      expiresAt: new Date(Date.now() - 86400000 * 5),
    },
    stats: {
      totalSessions: 67,
      totalWatchTime: 890,
      favoriteGenre: "Classical",
      devicesUsed: 1,
    },
  },
  {
    id: "user-5",
    username: "documentary_fan_ca",
    displayName: "Emma Wilson",
    email: "emma.wilson@email.com",
    phone: "+1 416-555-0199",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    role: "user",
    status: "online",
    joinDate: new Date(Date.now() - 86400000 * 20),
    lastActive: new Date(Date.now() - 60000),
    lastLogin: new Date(Date.now() - 300000),
    location: {
      country: "Canada",
      city: "Toronto",
      ip: "198.51.100.67",
    },
    deviceInfo: {
      type: "tablet",
      browser: "Safari",
      os: "iPadOS 17",
    },
    subscription: {
      plan: "Premium",
      status: "active",
      expiresAt: new Date(Date.now() + 86400000 * 25),
    },
    stats: {
      totalSessions: 156,
      totalWatchTime: 2890,
      favoriteGenre: "Documentary",
      devicesUsed: 2,
    },
  },
  {
    id: "user-6",
    username: "banned_user",
    displayName: "John Doe",
    email: "john.doe@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    role: "user",
    status: "banned",
    joinDate: new Date(Date.now() - 86400000 * 10),
    lastActive: new Date(Date.now() - 86400000 * 2),
    lastLogin: new Date(Date.now() - 86400000 * 2),
    location: {
      country: "Unknown",
      city: "Unknown",
      ip: "192.0.2.1",
    },
    deviceInfo: {
      type: "desktop",
      browser: "Chrome 119",
      os: "Windows 10",
    },
    subscription: {
      plan: "Basic",
      status: "cancelled",
    },
    stats: {
      totalSessions: 12,
      totalWatchTime: 45,
      favoriteGenre: "Unknown",
      devicesUsed: 1,
    },
  },
]

export function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          // Randomly update online status
          if (Math.random() < 0.1 && user.status !== "banned" && user.status !== "suspended") {
            return {
              ...user,
              status: user.status === "online" ? "offline" : ("online" as any),
              lastActive: user.status === "offline" ? new Date() : user.lastActive,
            }
          }
          return user
        }),
      )
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Check if user is admin
  if (!user || user.role !== "admin") {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
        <CardContent className="text-center py-20">
          <Shield className="w-20 h-20 text-red-400 mx-auto mb-8" />
          <h3 className="text-2xl font-bold text-white mb-4">Access Denied</h3>
          <p className="text-white/60 text-lg">You need administrator privileges to access this section.</p>
        </CardContent>
      </Card>
    )
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  // Calculate stats
  const totalUsers = users.length
  const onlineUsers = users.filter((u) => u.status === "online").length
  const newUsersToday = users.filter((u) => {
    const today = new Date()
    const userJoinDate = new Date(u.joinDate)
    return userJoinDate.toDateString() === today.toDateString()
  }).length
  const bannedUsers = users.filter((u) => u.status === "banned").length

  const formatLastActive = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Active now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "offline":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "banned":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "suspended":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "moderator":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "user":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "desktop":
        return Monitor
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      case "tv":
        return Tv
      default:
        return Monitor
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <p className="text-white/70 text-lg">Monitor user registrations, activity, and manage platform access</p>
        </div>
        <div className="flex gap-4">
          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{totalUsers}</div>
            <div className="text-sm text-white/60">Total Users</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{onlineUsers}</div>
            <div className="text-sm text-white/60">Online Now</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{newUsersToday}</div>
            <div className="text-sm text-white/60">New Today</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{bannedUsers}</div>
            <div className="text-sm text-white/60">Banned Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <Input
                  placeholder="Search users by username, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="banned">Banned</option>
                <option value="suspended">Suspended</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-2xl text-white">User Management</CardTitle>
          <CardDescription className="text-white/60">
            {filteredUsers.length} of {totalUsers} users shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((adminUser) => {
              const DeviceIcon = getDeviceIcon(adminUser.deviceInfo?.type || "desktop")
              return (
                <div
                  key={adminUser.id}
                  className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedUser(selectedUser?.id === adminUser.id ? null : adminUser)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={adminUser.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{adminUser.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold">{adminUser.displayName}</h4>
                          <Badge className={getRoleBadge(adminUser.role)}>{adminUser.role}</Badge>
                        </div>
                        <p className="text-white/60 text-sm">@{adminUser.username}</p>
                        <p className="text-white/50 text-xs">{adminUser.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge className={getStatusBadge(adminUser.status)}>
                          {adminUser.status === "online" && <Activity className="w-3 h-3 mr-1" />}
                          {adminUser.status === "offline" && <XCircle className="w-3 h-3 mr-1" />}
                          {adminUser.status === "banned" && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {adminUser.status}
                        </Badge>
                        <p className="text-white/50 text-xs mt-1">{formatLastActive(adminUser.lastActive)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <DeviceIcon className="w-5 h-5 text-white/60" />
                        <div className="text-right">
                          <p className="text-white/70 text-sm">{adminUser.location?.city}</p>
                          <p className="text-white/50 text-xs">{adminUser.location?.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedUser?.id === adminUser.id && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <Tabs defaultValue="details" className="w-full">
                        <TabsList className="bg-white/10 border-white/20 rounded-xl p-1">
                          <TabsTrigger
                            value="details"
                            className="text-white data-[state=active]:bg-white/20 rounded-lg"
                          >
                            Details
                          </TabsTrigger>
                          <TabsTrigger
                            value="activity"
                            className="text-white data-[state=active]:bg-white/20 rounded-lg"
                          >
                            Activity
                          </TabsTrigger>
                          <TabsTrigger
                            value="subscription"
                            className="text-white data-[state=active]:bg-white/20 rounded-lg"
                          >
                            Subscription
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-3">
                              <h5 className="text-white font-semibold">Contact Information</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-white/70">
                                  <Mail className="w-4 h-4" />
                                  <span>{adminUser.email}</span>
                                </div>
                                {adminUser.phone && (
                                  <div className="flex items-center gap-2 text-white/70">
                                    <Phone className="w-4 h-4" />
                                    <span>{adminUser.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 text-white/70">
                                  <MapPin className="w-4 h-4" />
                                  <span>
                                    {adminUser.location?.city}, {adminUser.location?.country}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                  <Globe className="w-4 h-4" />
                                  <span>{adminUser.location?.ip}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h5 className="text-white font-semibold">Device Information</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-white/70">
                                  <DeviceIcon className="w-4 h-4" />
                                  <span>{adminUser.deviceInfo?.type}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                  <Monitor className="w-4 h-4" />
                                  <span>{adminUser.deviceInfo?.browser}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                  <Server className="w-4 h-4" />
                                  <span>{adminUser.deviceInfo?.os}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h5 className="text-white font-semibold">Account Dates</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-white/70">
                                  <Calendar className="w-4 h-4" />
                                  <span>Joined: {adminUser.joinDate.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                  <Clock className="w-4 h-4" />
                                  <span>Last Login: {adminUser.lastLogin.toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                  <Activity className="w-4 h-4" />
                                  <span>Last Active: {formatLastActive(adminUser.lastActive)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="activity" className="mt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                              <div className="text-2xl font-bold text-white mb-1">{adminUser.stats.totalSessions}</div>
                              <div className="text-sm text-white/60">Total Sessions</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                              <div className="text-2xl font-bold text-white mb-1">
                                {Math.floor(adminUser.stats.totalWatchTime / 60)}h
                              </div>
                              <div className="text-sm text-white/60">Watch Time</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                              <div className="text-2xl font-bold text-white mb-1">{adminUser.stats.devicesUsed}</div>
                              <div className="text-sm text-white/60">Devices Used</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 text-center">
                              <div className="text-lg font-bold text-white mb-1">{adminUser.stats.favoriteGenre}</div>
                              <div className="text-sm text-white/60">Favorite Genre</div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="subscription" className="mt-4">
                          <div className="space-y-4">
                            {adminUser.subscription && (
                              <div className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="text-white font-semibold">Subscription Details</h5>
                                  <Badge
                                    className={
                                      adminUser.subscription.status === "active"
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : adminUser.subscription.status === "expired"
                                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                                          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                    }
                                  >
                                    {adminUser.subscription.status}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-white/60">Plan:</span>
                                    <span className="text-white ml-2 font-semibold">{adminUser.subscription.plan}</span>
                                  </div>
                                  {adminUser.subscription.expiresAt && (
                                    <div>
                                      <span className="text-white/60">Expires:</span>
                                      <span className="text-white ml-2">
                                        {adminUser.subscription.expiresAt.toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex gap-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                              >
                                View Payment History
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                              >
                                Manage Subscription
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>

                      {/* Admin Actions */}
                      <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 rounded-xl"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30 rounded-xl"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                        {adminUser.status !== "banned" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Ban User
                          </Button>
                        )}
                        {adminUser.status === "banned" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30 rounded-xl"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Unban User
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
              <p className="text-white/60">No users match your current search criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
