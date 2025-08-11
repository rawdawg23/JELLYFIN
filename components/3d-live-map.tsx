"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Sphere, Html } from "@react-three/drei"
import { TextureLoader, Vector3 } from "three"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Play, Globe, MapPin, Activity, Pause, Clock, Server, Monitor } from "lucide-react"

interface LiveUser {
  id: string
  username: string
  displayName: string
  country: string
  city: string
  coordinates: [number, number] // [lat, lng]
  status: "streaming" | "browsing" | "idle" | "offline"
  lastActive: Date
  connectedServer?: string
  currentActivity?: string
  avatar: string
  joinedAt: Date
  deviceType: "desktop" | "mobile" | "tablet" | "tv"
}

// Mock live users data
const LIVE_USERS: LiveUser[] = [
  {
    id: "user-1",
    username: "moviebuff_uk",
    displayName: "Alex Thompson",
    country: "United Kingdom",
    city: "London",
    coordinates: [51.5074, -0.1278],
    status: "streaming",
    lastActive: new Date(),
    connectedServer: "XQI1EDA Server",
    currentActivity: "Watching: The Matrix",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    joinedAt: new Date(Date.now() - 86400000 * 30),
    deviceType: "desktop",
  },
  {
    id: "user-2",
    username: "anime_lover_jp",
    displayName: "Yuki Tanaka",
    country: "Japan",
    city: "Tokyo",
    coordinates: [35.6762, 139.6503],
    status: "browsing",
    lastActive: new Date(Date.now() - 300000),
    connectedServer: "XQI1EDA Server",
    currentActivity: "Browsing Anime Collection",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki",
    joinedAt: new Date(Date.now() - 86400000 * 15),
    deviceType: "mobile",
  },
  {
    id: "user-3",
    username: "series_addict_us",
    displayName: "Sarah Johnson",
    country: "United States",
    city: "New York",
    coordinates: [40.7128, -74.006],
    status: "streaming",
    lastActive: new Date(Date.now() - 120000),
    connectedServer: "Home Server",
    currentActivity: "Watching: Breaking Bad S3E7",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    joinedAt: new Date(Date.now() - 86400000 * 45),
    deviceType: "tv",
  },
  {
    id: "user-4",
    username: "music_master_de",
    displayName: "Hans Mueller",
    country: "Germany",
    city: "Berlin",
    coordinates: [52.52, 13.405],
    status: "idle",
    lastActive: new Date(Date.now() - 900000),
    connectedServer: "XQI1EDA Server",
    currentActivity: "Last played: Classical Playlist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hans",
    joinedAt: new Date(Date.now() - 86400000 * 60),
    deviceType: "desktop",
  },
  {
    id: "user-5",
    username: "documentary_fan_ca",
    displayName: "Emma Wilson",
    country: "Canada",
    city: "Toronto",
    coordinates: [43.6532, -79.3832],
    status: "streaming",
    lastActive: new Date(Date.now() - 60000),
    connectedServer: "XQI1EDA Server",
    currentActivity: "Watching: Planet Earth II",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    joinedAt: new Date(Date.now() - 86400000 * 20),
    deviceType: "tablet",
  },
  {
    id: "user-6",
    username: "aussie_streamer",
    displayName: "Jake Mitchell",
    country: "Australia",
    city: "Sydney",
    coordinates: [-33.8688, 151.2093],
    status: "browsing",
    lastActive: new Date(Date.now() - 180000),
    connectedServer: "Remote Server",
    currentActivity: "Browsing Movies",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jake",
    joinedAt: new Date(Date.now() - 86400000 * 10),
    deviceType: "mobile",
  },
  {
    id: "user-7",
    username: "french_cinema_fr",
    displayName: "Marie Dubois",
    country: "France",
    city: "Paris",
    coordinates: [48.8566, 2.3522],
    status: "offline",
    lastActive: new Date(Date.now() - 3600000),
    connectedServer: "XQI1EDA Server",
    currentActivity: "Last watched: Amélie",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie",
    joinedAt: new Date(Date.now() - 86400000 * 35),
    deviceType: "desktop",
  },
  {
    id: "user-8",
    username: "brazilian_beats",
    displayName: "Carlos Silva",
    country: "Brazil",
    city: "São Paulo",
    coordinates: [-23.5505, -46.6333],
    status: "streaming",
    lastActive: new Date(Date.now() - 30000),
    connectedServer: "XQI1EDA Server",
    currentActivity: "Listening: Bossa Nova Mix",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    joinedAt: new Date(Date.now() - 86400000 * 25),
    deviceType: "mobile",
  },
]

// Convert lat/lng to 3D coordinates on sphere
function latLngToVector3(lat: number, lng: number, radius = 2): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)

  return new Vector3(x, y, z)
}

// 3D Earth Component
function Earth({ autoRotate }: { autoRotate: boolean }) {
  const meshRef = useRef<any>()
  const earthTexture = useLoader(TextureLoader, "/dark-blue-earth-map.png")

  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  return (
    <group>
      {/* Earth Sphere */}
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshPhongMaterial map={earthTexture} />
      </Sphere>

      {/* Atmosphere Glow */}
      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial color="#4FC3F7" transparent opacity={0.1} />
      </Sphere>
    </group>
  )
}

// User Marker Component
function UserMarker({
  user,
  onClick,
  isSelected,
}: {
  user: LiveUser
  onClick: () => void
  isSelected: boolean
}) {
  const position = latLngToVector3(user.coordinates[0], user.coordinates[1], 2.1)
  const ringRef = useRef<any>()

  useFrame((state) => {
    if (ringRef.current && user.status === "streaming") {
      ringRef.current.rotation.z = state.clock.elapsedTime * 2
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1)
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "streaming":
        return "#00ff88"
      case "browsing":
        return "#00aaff"
      case "idle":
        return "#ffaa00"
      case "offline":
        return "#ff4444"
      default:
        return "#ffffff"
    }
  }

  return (
    <group position={position}>
      {/* Pulsing Ring for Active Users */}
      {user.status === "streaming" && (
        <mesh ref={ringRef}>
          <ringGeometry args={[0.08, 0.12, 16]} />
          <meshBasicMaterial color={getStatusColor(user.status)} transparent opacity={0.6} />
        </mesh>
      )}

      {/* User Marker */}
      <mesh onClick={onClick}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial
          color={getStatusColor(user.status)}
          emissive={getStatusColor(user.status)}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
        />
      </mesh>

      {/* Connection Line to Earth */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, -position.x * 0.1, -position.y * 0.1, -position.z * 0.1])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={getStatusColor(user.status)} transparent opacity={0.3} />
      </line>

      {/* User Info Popup */}
      {isSelected && (
        <Html distanceFactor={10} position={[0, 0.2, 0]}>
          <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white min-w-[200px] pointer-events-none">
            <div className="flex items-center gap-3 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>{user.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-sm">{user.displayName}</h4>
                <p className="text-xs text-white/60">@{user.username}</p>
              </div>
            </div>
            <div className="space-y-1 text-xs">
              <p>
                <MapPin className="w-3 h-3 inline mr-1" />
                {user.city}, {user.country}
              </p>
              <p>
                <Activity className="w-3 h-3 inline mr-1" />
                {user.currentActivity}
              </p>
              <Badge
                className={`text-xs ${
                  user.status === "streaming"
                    ? "bg-green-500/20 text-green-400"
                    : user.status === "browsing"
                      ? "bg-blue-500/20 text-blue-400"
                      : user.status === "idle"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-red-500/20 text-red-400"
                }`}
              >
                {user.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// Main Live Map Component
export function LiveMap3D() {
  const [users, setUsers] = useState<LiveUser[]>(LIVE_USERS)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const [viewMode, setViewMode] = useState<"globe" | "list">("globe")

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          // Randomly update user status and activity
          const shouldUpdate = Math.random() < 0.3
          if (!shouldUpdate) return user

          const statuses: LiveUser["status"][] = ["streaming", "browsing", "idle", "offline"]
          const activities = [
            "Watching: The Mandalorian",
            "Listening: Jazz Collection",
            "Browsing Movies",
            "Watching: Stranger Things",
            "Listening: Rock Classics",
            "Browsing TV Shows",
            "Watching: Avatar",
            "Idle",
          ]

          return {
            ...user,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            currentActivity: activities[Math.floor(Math.random() * activities.length)],
            lastActive: user.status !== "offline" ? new Date() : user.lastActive,
          }
        }),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const onlineUsers = users.filter((u) => u.status !== "offline")
  const streamingUsers = users.filter((u) => u.status === "streaming")

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

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "desktop":
        return Monitor
      case "mobile":
        return "📱"
      case "tablet":
        return "📱"
      case "tv":
        return "📺"
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
            Live User Activity Map
          </h2>
          <p className="text-white/70 text-lg">Real-time visualization of global user activity and streaming</p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => setViewMode(viewMode === "globe" ? "list" : "globe")}
            className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm"
          >
            {viewMode === "globe" ? <Users className="w-4 h-4 mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
            {viewMode === "globe" ? "List View" : "Globe View"}
          </Button>
          <Button
            onClick={() => setAutoRotate(!autoRotate)}
            className="bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm"
          >
            {autoRotate ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {autoRotate ? "Pause" : "Rotate"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{onlineUsers.length}</div>
            <div className="text-sm text-white/60">Online Users</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{streamingUsers.length}</div>
            <div className="text-sm text-white/60">Streaming Now</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{new Set(users.map((u) => u.country)).size}</div>
            <div className="text-sm text-white/60">Countries</div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Server className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{users.length}</div>
            <div className="text-sm text-white/60">Total Users</div>
          </CardContent>
        </Card>
      </div>

      {viewMode === "globe" ? (
        /* 3D Globe View */
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[600px] relative">
              <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Earth autoRotate={autoRotate} />

                {users.map((user) => (
                  <UserMarker
                    key={user.id}
                    user={user}
                    onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                    isSelected={selectedUser === user.id}
                  />
                ))}

                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={3}
                  maxDistance={10}
                  autoRotate={autoRotate}
                  autoRotateSpeed={0.5}
                />
              </Canvas>

              {/* Legend */}
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
                <h4 className="text-white font-semibold mb-3">User Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-white/80">Streaming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-white/80">Browsing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-white/80">Idle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <span className="text-white/80">Offline</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Active Users</CardTitle>
            <CardDescription className="text-white/60">
              Real-time list of all users and their current activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{user.displayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{user.displayName}</h4>
                      <p className="text-white/60 text-xs">@{user.username}</p>
                    </div>
                    <Badge
                      className={`text-xs ${
                        user.status === "streaming"
                          ? "bg-green-500/20 text-green-400 border-green-500/30"
                          : user.status === "browsing"
                            ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            : user.status === "idle"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                      }`}
                    >
                      {user.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {user.city}, {user.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      <span className="truncate">{user.currentActivity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{formatLastActive(user.lastActive)}</span>
                    </div>
                    {user.connectedServer && (
                      <div className="flex items-center gap-2">
                        <Server className="w-3 h-3" />
                        <span className="truncate">{user.connectedServer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
