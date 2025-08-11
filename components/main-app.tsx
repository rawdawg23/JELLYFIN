"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Server,
  Users,
  Play,
  Settings,
  Crown,
  MessageSquare,
  Cpu,
  HardDrive,
  Activity,
  RefreshCw,
  Monitor,
  Database,
  BarChart3,
  User,
  Ticket,
  Mail,
  LogIn,
  Menu,
  X,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  Search,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  MapPin,
  UserCog,
} from "lucide-react"
import { ThreeDHeroSlider } from "@/components/3d-hero-slider"
import { PremiumSection } from "@/components/paypal-button"
import { UserProfile } from "@/components/profile/user-profile"
import { ForumSystem } from "@/components/forum/forum-system"
import { MessagingSystem } from "@/components/messaging/messaging-system"
import { TicketSystem } from "@/components/tickets/ticket-system"
import { LoginModal } from "@/components/auth/login-modal"
import { LiveMap3D } from "@/components/3d-live-map"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import {
  DEMO_SERVERS,
  getServerStatusBadge,
  formatLastSeen,
  jellyfinAPI,
  type JellyfinServer,
} from "@/lib/jellyfin-api"
import { useAuth } from "@/providers/auth-provider"

// Enhanced Floating Particles with Glassmorphism
function FloatingParticles() {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      delay: number
      color: string
      speed: number
      opacity: number
    }>
  >([])

  useEffect(() => {
    const colors = [
      "rgba(147, 51, 234, 0.4)", // Purple
      "rgba(59, 130, 246, 0.4)", // Blue
      "rgba(16, 185, 129, 0.4)", // Green
      "rgba(245, 101, 101, 0.4)", // Red
      "rgba(251, 191, 36, 0.4)", // Yellow
      "rgba(236, 72, 153, 0.4)", // Pink
    ]
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 3,
      delay: Math.random() * 15,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 25 + 15,
      opacity: Math.random() * 0.6 + 0.2,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full blur-sm animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.speed}s`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  )
}

// Enhanced Server Status Card with Glassmorphism
function ServerStatusCard({ server }: { server: JellyfinServer }) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const StatusIcon = server.status === "online" ? CheckCircle : server.status === "maintenance" ? AlertCircle : XCircle
  const statusColor =
    server.status === "online" ? "text-green-400" : server.status === "maintenance" ? "text-yellow-400" : "text-red-400"

  return (
    <Card
      className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 hover:bg-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-all duration-700" />

      {/* Glowing border effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-indigo-500/30 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl" />

      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110">
                <Server className="h-7 w-7 text-white" />
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-slate-900 ${
                  server.status === "online"
                    ? "bg-green-500 shadow-lg shadow-green-500/50"
                    : server.status === "maintenance"
                      ? "bg-yellow-500 shadow-lg shadow-yellow-500/50"
                      : "bg-red-500 shadow-lg shadow-red-500/50"
                } animate-pulse`}
              />
            </div>
            <div>
              <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors duration-500 font-bold">
                {server.name}
              </CardTitle>
              <CardDescription className="text-white/70 flex items-center gap-2 text-sm">
                <span className="font-medium">{server.version}</span>
                <span className="text-white/40">•</span>
                <span>{formatLastSeen(server.lastSeen)}</span>
              </CardDescription>
            </div>
          </div>
          <Badge
            className={`${getServerStatusBadge(server.status)} border-2 backdrop-blur-sm shadow-lg px-3 py-1 font-semibold`}
          >
            <StatusIcon className="w-4 h-4 mr-2" />
            {server.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {server.status === "online" && (
          <div className="grid grid-cols-2 gap-6">
            {/* CPU Usage */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span>CPU: {server.cpu}%</span>
              </div>
              <div className="relative w-full bg-white/10 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${server.cpu}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Memory Usage */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
                <Activity className="w-5 h-5 text-green-400" />
                <span>Memory: {server.memory}%</span>
              </div>
              <div className="relative w-full bg-white/10 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${server.memory}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-400/30 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Storage Usage */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
                <HardDrive className="w-5 h-5 text-yellow-400" />
                <span>Storage: {server.storage}%</span>
              </div>
              <div className="relative w-full bg-white/10 rounded-full h-4 overflow-hidden backdrop-blur-sm">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${server.storage}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Active Streams */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/90 font-medium">
                <Play className="w-5 h-5 text-purple-400" />
                <span>Streams: {server.activeStreams}</span>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-10 rounded-lg transition-all duration-500 ${
                      i < (server.activeStreams || 0)
                        ? "bg-gradient-to-t from-purple-500 via-pink-500 to-purple-400 shadow-lg shadow-purple-500/50"
                        : "bg-white/10 backdrop-blur-sm"
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Server Stats */}
        <div className="flex justify-between items-center text-sm text-white/70 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-2 backdrop-blur-sm">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-white">{server.users}</span>
            <span>users</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-2 backdrop-blur-sm">
            <Database className="w-4 h-4 text-green-400" />
            <span className="font-semibold text-white">{server.libraries}</span>
            <span>libraries</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 rounded-xl backdrop-blur-sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-blue-500/50 transition-all duration-300 rounded-xl backdrop-blur-sm px-4"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Enhanced Stats Card with better animations
function StatsCard({
  icon: Icon,
  value,
  label,
  color,
  trend,
  subtitle,
}: {
  icon: any
  value: number
  label: string
  color: string
  trend?: number
  subtitle?: string
}) {
  return (
    <Card className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:bg-white/10">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
      />
      <CardContent className="relative p-8 text-center">
        <div
          className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110`}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>
        <div className="text-4xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-500">
          {value.toLocaleString()}
        </div>
        <div className="text-lg font-semibold text-white/80 mb-2">{label}</div>
        {subtitle && <div className="text-sm text-white/60 mb-3">{subtitle}</div>}
        {trend && (
          <div className="flex items-center justify-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-semibold">+{trend}%</span>
            <span className="text-white/60">this month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MainApp() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("home")
  const [servers, setServers] = useState<JellyfinServer[]>(DEMO_SERVERS)
  const [searchQuery, setSearchQuery] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.url.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const updateRealServerStatus = async () => {
    try {
      const serverInfo = await jellyfinAPI.checkServerInfo()
      const quickConnectSupported = await jellyfinAPI.checkQuickConnectSupport()

      setServers((prevServers) =>
        prevServers.map((server) =>
          server.id === "real-server-1"
            ? {
                ...server,
                name: serverInfo.name || "XQI1EDA Jellyfin Server",
                version: serverInfo.version || "Unknown",
                status: "online" as const,
                lastSeen: new Date(),
              }
            : server,
        ),
      )
    } catch (error) {
      console.error("Failed to connect to real server:", error)
      setServers((prevServers) =>
        prevServers.map((server) =>
          server.id === "real-server-1" ? { ...server, status: "offline" as const } : server,
        ),
      )
    }
  }

  useEffect(() => {
    updateRealServerStatus()

    const interval = setInterval(() => {
      setServers((prevServers) =>
        prevServers.map((server) => ({
          ...server,
          cpu: server.status === "online" ? Math.floor(Math.random() * 60) + 20 : 0,
          memory: server.status === "online" ? Math.floor(Math.random() * 50) + 30 : 0,
          activeStreams: server.status === "online" ? Math.floor(Math.random() * 6) : 0,
        })),
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-10 py-16">
              <div className="space-y-6">
                <div className="relative">
                  <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
                    OG JELLYFIN
                  </h1>
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-3xl -z-10" />
                </div>
                <div className="w-32 h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 mx-auto rounded-full shadow-lg" />
              </div>
              <p className="text-2xl md:text-3xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
                The ultimate media server management platform with{" "}
                <span className="font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  advanced monitoring
                </span>
                ,{" "}
                <span className="font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  premium features
                </span>
                , and{" "}
                <span className="font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  seamless integration
                </span>
              </p>
              <ThreeDHeroSlider />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <StatsCard
                icon={CheckCircle}
                value={servers.filter((s) => s.status === "online").length}
                label="Online Servers"
                subtitle="Active & Monitoring"
                color="from-green-500 to-emerald-600"
                trend={12}
              />
              <StatsCard
                icon={Users}
                value={servers.reduce((acc, s) => acc + (s.users || 0), 0)}
                label="Total Users"
                subtitle="Across All Servers"
                color="from-blue-500 to-cyan-600"
                trend={8}
              />
              <StatsCard
                icon={Database}
                value={servers.reduce((acc, s) => acc + (s.libraries || 0), 0)}
                label="Media Libraries"
                subtitle="Movies, TV & Music"
                color="from-purple-500 to-violet-600"
                trend={15}
              />
              <StatsCard
                icon={Play}
                value={servers.reduce((acc, s) => acc + (s.activeStreams || 0), 0)}
                label="Active Streams"
                subtitle="Currently Playing"
                color="from-pink-500 to-rose-600"
                trend={25}
              />
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-10">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 rounded-3xl transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <CardContent className="relative p-10 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors duration-500">
                    Enterprise Security
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Advanced security features with real-time monitoring, threat detection, and encrypted connections.
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 rounded-3xl transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <CardContent className="relative p-10 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors duration-500">
                    Global Access
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Access your media from anywhere in the world with our secure cloud infrastructure and CDN.
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-green-600/20 via-green-500/10 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-3xl transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <CardContent className="relative p-10 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl group-hover:shadow-green-500/50 transition-all duration-500 group-hover:scale-110">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors duration-500">
                    Lightning Fast
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Optimized performance with edge caching, intelligent content delivery, and real-time streaming.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "servers":
        return (
          <div className="space-y-10">
            <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Server Management
                </h2>
                <p className="text-white/70 text-lg">
                  Monitor and manage your Jellyfin servers with real-time analytics
                </p>
              </div>
              <div className="w-full lg:w-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-6 w-6 text-purple-400" />
                  </div>
                  <Input
                    placeholder="Search servers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-2xl focus:ring-2 focus:ring-purple-500/50 transition-all duration-300 backdrop-blur-sm text-lg w-full lg:w-80"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredServers.map((server) => (
                <ServerStatusCard key={server.id} server={server} />
              ))}
            </div>

            {filteredServers.length === 0 && (
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
                <CardContent className="text-center py-20">
                  <Server className="w-20 h-20 text-white/40 mx-auto mb-8" />
                  <h3 className="text-2xl font-bold text-white mb-4">No Servers Found</h3>
                  <p className="text-white/60 text-lg">No servers match your current search criteria.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case "live-map":
        return <LiveMap3D />

      case "admin":
        return <AdminDashboard />

      case "premium":
        return <PremiumSection />

      case "profile":
        return <UserProfile />

      case "forum":
        return <ForumSystem />

      case "messages":
        return <MessagingSystem />

      case "tickets":
        return <TicketSystem />

      default:
        return (
          <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
            <CardContent className="text-center py-20">
              <div className="w-24 h-24 text-white/40 mx-auto mb-8">
                <BarChart3 className="w-full h-full" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-6">Coming Soon</h3>
              <p className="text-white/60 text-xl">This feature is under development</p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <FloatingParticles />

      {/* Header */}
      <header className="relative z-20 bg-black/20 backdrop-blur-2xl border-b border-white/10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Server className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  OG JELLYFIN
                </h1>
                <p className="text-sm text-white/60 font-medium">Media Server Platform</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/10 border-white/20 rounded-2xl p-2 backdrop-blur-sm">
                  <TabsTrigger
                    value="home"
                    className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                  >
                    Home
                  </TabsTrigger>
                  <TabsTrigger
                    value="servers"
                    className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                  >
                    Servers
                  </TabsTrigger>
                  <TabsTrigger
                    value="live-map"
                    className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                  >
                    Live Map
                  </TabsTrigger>
                  {user && user.role === "admin" && (
                    <TabsTrigger
                      value="admin"
                      className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                    >
                      Admin
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="premium"
                    className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                  >
                    Premium
                  </TabsTrigger>
                  {user && (
                    <>
                      <TabsTrigger
                        value="profile"
                        className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                      >
                        Profile
                      </TabsTrigger>
                      <TabsTrigger
                        value="forum"
                        className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                      >
                        Forum
                      </TabsTrigger>
                      <TabsTrigger
                        value="messages"
                        className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                      >
                        Messages
                      </TabsTrigger>
                      <TabsTrigger
                        value="tickets"
                        className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 px-6 py-3 font-semibold"
                      >
                        Support
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </Tabs>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm"
                  >
                    <Bell className="w-4 h-4" />
                  </Button>
                  <span className="text-white/80 hidden sm:inline font-medium">Welcome, {user.username}</span>
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 px-6 py-3 font-semibold"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="outline"
                size="sm"
                className="lg:hidden bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-8 p-6 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    setActiveTab("home")
                    setIsMobileMenuOpen(false)
                  }}
                  variant={activeTab === "home" ? "default" : "ghost"}
                  className="justify-start text-white rounded-2xl py-4 font-semibold"
                >
                  <Server className="w-5 h-5 mr-3" />
                  Home
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("servers")
                    setIsMobileMenuOpen(false)
                  }}
                  variant={activeTab === "servers" ? "default" : "ghost"}
                  className="justify-start text-white rounded-2xl py-4 font-semibold"
                >
                  <Monitor className="w-5 h-5 mr-3" />
                  Servers
                </Button>
                <Button
                  onClick={() => {
                    setActiveTab("live-map")
                    setIsMobileMenuOpen(false)
                  }}
                  variant={activeTab === "live-map" ? "default" : "ghost"}
                  className="justify-start text-white rounded-2xl py-4 font-semibold"
                >
                  <MapPin className="w-5 h-5 mr-3" />
                  Live Map
                </Button>
                {user && user.role === "admin" && (
                  <Button
                    onClick={() => {
                      setActiveTab("admin")
                      setIsMobileMenuOpen(false)
                    }}
                    variant={activeTab === "admin" ? "default" : "ghost"}
                    className="justify-start text-white rounded-2xl py-4 font-semibold"
                  >
                    <UserCog className="w-5 h-5 mr-3" />
                    Admin
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setActiveTab("premium")
                    setIsMobileMenuOpen(false)
                  }}
                  variant={activeTab === "premium" ? "default" : "ghost"}
                  className="justify-start text-white rounded-2xl py-4 font-semibold"
                >
                  <Crown className="w-5 h-5 mr-3" />
                  Premium
                </Button>
                {user && (
                  <>
                    <Button
                      onClick={() => {
                        setActiveTab("profile")
                        setIsMobileMenuOpen(false)
                      }}
                      variant={activeTab === "profile" ? "default" : "ghost"}
                      className="justify-start text-white rounded-2xl py-4 font-semibold"
                    >
                      <User className="w-5 h-5 mr-3" />
                      Profile
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveTab("forum")
                        setIsMobileMenuOpen(false)
                      }}
                      variant={activeTab === "forum" ? "default" : "ghost"}
                      className="justify-start text-white rounded-2xl py-4 font-semibold"
                    >
                      <MessageSquare className="w-5 h-5 mr-3" />
                      Forum
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveTab("messages")
                        setIsMobileMenuOpen(false)
                      }}
                      variant={activeTab === "messages" ? "default" : "ghost"}
                      className="justify-start text-white rounded-2xl py-4 font-semibold"
                    >
                      <Mail className="w-5 h-5 mr-3" />
                      Messages
                    </Button>
                    <Button
                      onClick={() => {
                        setActiveTab("tickets")
                        setIsMobileMenuOpen(false)
                      }}
                      variant={activeTab === "tickets" ? "default" : "ghost"}
                      className="justify-start text-white rounded-2xl py-4 font-semibold"
                    >
                      <Ticket className="w-5 h-5 mr-3" />
                      Support
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">{renderContent()}</main>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}
