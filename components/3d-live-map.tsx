"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Sphere, Environment, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  GlobeIcon,
  UsersIcon,
  MapPinIcon,
  ActivityIcon,
  ZapIcon,
  EyeIcon,
  ClockIcon,
  WifiIcon,
  PlayIcon,
  PauseIcon,
} from "lucide-react"

// Mock user data with locations
interface LiveUser {
  id: string
  username: string
  country: string
  city: string
  lat: number
  lng: number
  isActive: boolean
  lastSeen: Date
  activity: "streaming" | "browsing" | "idle" | "offline"
  serverConnected?: string
  avatar: string
}

const LIVE_USERS: LiveUser[] = [
  {
    id: "1",
    username: "MovieFan_UK",
    country: "United Kingdom",
    city: "London",
    lat: 51.5074,
    lng: -0.1278,
    isActive: true,
    lastSeen: new Date(),
    activity: "streaming",
    serverConnected: "XQI1EDA Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MovieFan_UK",
  },
  {
    id: "2",
    username: "TechGuru_US",
    country: "United States",
    city: "New York",
    lat: 40.7128,
    lng: -74.006,
    isActive: true,
    lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    activity: "browsing",
    serverConnected: "Home Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechGuru_US",
  },
  {
    id: "3",
    username: "AnimeLover_JP",
    country: "Japan",
    city: "Tokyo",
    lat: 35.6762,
    lng: 139.6503,
    isActive: false,
    lastSeen: new Date(Date.now() - 15 * 60 * 1000),
    activity: "idle",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=AnimeLover_JP",
  },
  {
    id: "4",
    username: "MusicMaster_DE",
    country: "Germany",
    city: "Berlin",
    lat: 52.52,
    lng: 13.405,
    isActive: true,
    lastSeen: new Date(Date.now() - 1 * 60 * 1000),
    activity: "streaming",
    serverConnected: "Office Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MusicMaster_DE",
  },
  {
    id: "5",
    username: "SeriesBinger_CA",
    country: "Canada",
    city: "Toronto",
    lat: 43.6532,
    lng: -79.3832,
    isActive: true,
    lastSeen: new Date(),
    activity: "streaming",
    serverConnected: "XQI1EDA Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SeriesBinger_CA",
  },
  {
    id: "6",
    username: "DocuFan_AU",
    country: "Australia",
    city: "Sydney",
    lat: -33.8688,
    lng: 151.2093,
    isActive: false,
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    activity: "offline",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DocuFan_AU",
  },
  {
    id: "7",
    username: "RetroGamer_FR",
    country: "France",
    city: "Paris",
    lat: 48.8566,
    lng: 2.3522,
    isActive: true,
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    activity: "browsing",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=RetroGamer_FR",
  },
  {
    id: "8",
    username: "SportsFan_BR",
    country: "Brazil",
    city: "São Paulo",
    lat: -23.5505,
    lng: -46.6333,
    isActive: true,
    lastSeen: new Date(),
    activity: "streaming",
    serverConnected: "Remote Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SportsFan_BR",
  },
]

// Convert lat/lng to 3D sphere coordinates
function latLngToVector3(lat: number, lng: number, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

// User marker component
function UserMarker({ user, onClick }: { user: LiveUser; onClick: (user: LiveUser) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const position = latLngToVector3(user.lat, user.lng, 2.05)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.lookAt(state.camera.position)
      // Floating animation
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime * 2) * 0.02
    }
  })

  const getActivityColor = () => {
    switch (user.activity) {
      case "streaming":
        return "#10b981" // Green
      case "browsing":
        return "#3b82f6" // Blue
      case "idle":
        return "#f59e0b" // Yellow
      case "offline":
        return "#ef4444" // Red
      default:
        return "#6b7280" // Gray
    }
  }

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      onClick={() => onClick(user)}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = "pointer"
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto"
      }}
    >
      <sphereGeometry args={[0.03, 16, 16]} />
      <meshStandardMaterial
        color={getActivityColor()}
        emissive={getActivityColor()}
        emissiveIntensity={user.isActive ? 0.3 : 0.1}
        transparent
        opacity={user.isActive ? 1 : 0.6}
      />

      {/* Pulsing ring for active users */}
      {user.isActive && (
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[0.05, 0.08, 32]} />
          <meshBasicMaterial color={getActivityColor()} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
    </mesh>
  )
}

// Connection lines between users and servers
function ConnectionLines({ users }: { users: LiveUser[] }) {
  const linesRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1
    }
  })

  const activeUsers = users.filter((user) => user.isActive && user.serverConnected)

  return (
    <group ref={linesRef}>
      {activeUsers.map((user) => {
        const userPos = latLngToVector3(user.lat, user.lng, 2.05)
        const serverPos = new THREE.Vector3(0, 2.5, 0) // Server at top

        const points = [userPos, serverPos]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <line key={user.id}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial attach="material" color="#8b5cf6" transparent opacity={0.3} linewidth={2} />
          </line>
        )
      })}
    </group>
  )
}

// 3D Globe component
function GlobeComponent({ users, onUserClick }: { users: LiveUser[]; onUserClick: (user: LiveUser) => void }) {
  const globeRef = useRef<THREE.Mesh>(null)
  const [texture] = useLoader(THREE.TextureLoader, ["/dark-blue-earth-map.png"])

  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002
    }
  })

  return (
    <group>
      {/* Main Globe */}
      <Sphere ref={globeRef} args={[2, 64, 64]}>
        <meshStandardMaterial map={texture} transparent opacity={0.8} emissive="#1e293b" emissiveIntensity={0.1} />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[2.1, 64, 64]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>

      {/* User markers */}
      {users.map((user) => (
        <UserMarker key={user.id} user={user} onClick={onUserClick} />
      ))}

      {/* Connection lines */}
      <ConnectionLines users={users} />

      {/* Server indicator at top */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// User info panel
function UserInfoPanel({ user, onClose }: { user: LiveUser | null; onClose: () => void }) {
  if (!user) return null

  const getActivityIcon = () => {
    switch (user.activity) {
      case "streaming":
        return <PlayIcon className="w-4 h-4" />
      case "browsing":
        return <EyeIcon className="w-4 h-4" />
      case "idle":
        return <PauseIcon className="w-4 h-4" />
      case "offline":
        return <WifiIcon className="w-4 h-4" />
      default:
        return <ActivityIcon className="w-4 h-4" />
    }
  }

  const getActivityColor = () => {
    switch (user.activity) {
      case "streaming":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "browsing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "idle":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "offline":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <Card className="absolute top-4 right-4 w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || "/placeholder.svg"}
              alt={user.username}
              className="w-10 h-10 rounded-full border-2 border-purple-500/50"
            />
            <div>
              <CardTitle className="text-white text-lg">{user.username}</CardTitle>
              <p className="text-white/60 text-sm">
                {user.city}, {user.country}
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
          >
            ×
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={`${getActivityColor()} border flex items-center gap-2`}>
            {getActivityIcon()}
            {user.activity.toUpperCase()}
          </Badge>
          {user.isActive && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
              ONLINE
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-white/80">
            <ClockIcon className="w-4 h-4 text-purple-400" />
            <span>Last seen: {user.lastSeen.toLocaleTimeString()}</span>
          </div>

          {user.serverConnected && (
            <div className="flex items-center gap-2 text-white/80">
              <ZapIcon className="w-4 h-4 text-blue-400" />
              <span>Connected to: {user.serverConnected}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-white/80">
            <MapPinIcon className="w-4 h-4 text-green-400" />
            <span>
              Location: {user.lat.toFixed(2)}, {user.lng.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Stats panel
function LiveStatsPanel({ users }: { users: LiveUser[] }) {
  const activeUsers = users.filter((user) => user.isActive).length
  const streamingUsers = users.filter((user) => user.activity === "streaming").length
  const totalUsers = users.length

  return (
    <Card className="absolute top-4 left-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <GlobeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Live Activity</h3>
            <p className="text-white/60 text-sm">Real-time user locations</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{activeUsers}</div>
            <div className="text-xs text-white/60">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{streamingUsers}</div>
            <div className="text-xs text-white/60">Streaming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{totalUsers}</div>
            <div className="text-xs text-white/60">Total</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main 3D Live Map component
export function LiveMap3D() {
  const [users, setUsers] = useState<LiveUser[]>(LIVE_USERS)
  const [selectedUser, setSelectedUser] = useState<LiveUser | null>(null)
  const [isAutoRotate, setIsAutoRotate] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          ...user,
          lastSeen: user.isActive ? new Date() : user.lastSeen,
          // Randomly change activity for active users
          activity:
            user.isActive && Math.random() > 0.8 ? (Math.random() > 0.5 ? "streaming" : "browsing") : user.activity,
        })),
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
          Live User Activity Map
        </h2>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          Real-time visualization of user locations and activity across our global Jellyfin network
        </p>
      </div>

      {/* 3D Map Container */}
      <div className="relative w-full h-[600px] md:h-[700px] lg:h-[800px] bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden">
        {/* Stats Panel */}
        <LiveStatsPanel users={users} />

        {/* User Info Panel */}
        <UserInfoPanel user={selectedUser} onClose={() => setSelectedUser(null)} />

        {/* Controls */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl backdrop-blur-sm"
          >
            {isAutoRotate ? <PauseIcon className="w-4 h-4 mr-2" /> : <PlayIcon className="w-4 h-4 mr-2" />}
            {isAutoRotate ? "Pause" : "Rotate"}
          </Button>
        </div>

        {/* 3D Canvas */}
        <Canvas className="w-full h-full">
          <PerspectiveCamera makeDefault position={[0, 0, 6]} />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />

          {/* Environment */}
          <Environment preset="night" />

          {/* Globe */}
          <GlobeComponent users={users} onUserClick={setSelectedUser} />

          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            autoRotate={isAutoRotate}
            autoRotateSpeed={0.5}
            minDistance={4}
            maxDistance={10}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
          />
        </Canvas>

        {/* Floating particles overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* User List */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <UsersIcon className="w-6 h-6 text-purple-400" />
            Active Users ({users.filter((u) => u.isActive).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users
              .filter((user) => user.isActive)
              .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedUser(user)}
                >
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.username}
                    className="w-10 h-10 rounded-full border-2 border-purple-500/50"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{user.username}</div>
                    <div className="text-white/60 text-sm truncate">
                      {user.city}, {user.country}
                    </div>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      user.activity === "streaming"
                        ? "bg-green-400"
                        : user.activity === "browsing"
                          ? "bg-blue-400"
                          : "bg-yellow-400"
                    } animate-pulse`}
                  />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
