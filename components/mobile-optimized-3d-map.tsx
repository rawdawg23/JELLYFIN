"use client"

import type React from "react"
import { useRef, useState, useEffect, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Sphere } from "@react-three/drei"
import type { Mesh } from "three"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from "lucide-react"

// Mock data for user locations
const userLocations = [
  { id: 1, lat: 51.5074, lon: -0.1278, city: "London", country: "UK", users: 234 },
  { id: 2, lat: 40.7128, lon: -74.006, city: "New York", country: "USA", users: 189 },
  { id: 3, lat: 35.6762, lon: 139.6503, city: "Tokyo", country: "Japan", users: 156 },
  { id: 4, lat: -33.8688, lon: 151.2093, city: "Sydney", country: "Australia", users: 98 },
  { id: 5, lat: 48.8566, lon: 2.3522, city: "Paris", country: "France", users: 145 },
  { id: 6, lat: 55.7558, lon: 37.6176, city: "Moscow", country: "Russia", users: 87 },
  { id: 7, lat: -23.5505, lon: -46.6333, city: "São Paulo", country: "Brazil", users: 76 },
  { id: 8, lat: 19.076, lon: 72.8777, city: "Mumbai", country: "India", users: 134 },
]

interface GlobeProps {
  rotationSpeed: number
  onUserClick: (location: (typeof userLocations)[0]) => void
  isMobile: boolean
}

const Globe: React.FC<GlobeProps> = ({ rotationSpeed, onUserClick, isMobile }) => {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && rotationSpeed > 0) {
      meshRef.current.rotation.y += rotationSpeed
    }
  })

  const latLonToCartesian = (lat: number, lon: number, radius: number) => {
    const phi = (lat * Math.PI) / 180
    const theta = ((lon - 180) * Math.PI) / 180
    const x = -radius * Math.cos(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi)
    const z = radius * Math.cos(phi) * Math.sin(theta)
    return [x, y, z]
  }

  return (
    <group>
      {/* Earth Sphere */}
      <Sphere args={[1, isMobile ? 32 : 64, isMobile ? 32 : 64]} ref={meshRef}>
        <meshStandardMaterial color="#1e40af" roughness={0.8} metalness={0.2} transparent opacity={0.8} />
      </Sphere>

      {/* User Location Markers */}
      {userLocations.map((location) => {
        const [x, y, z] = latLonToCartesian(location.lat, location.lon, 1.02)
        return (
          <Html key={location.id} position={[x, y, z]} center>
            <div className="relative cursor-pointer group" onClick={() => onUserClick(location)}>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg border-2 border-white" />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {location.city}: {location.users} users
              </div>
            </div>
          </Html>
        )
      })}
    </group>
  )
}

const LoadingFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      <p className="text-white/70">Loading 3D Map...</p>
    </div>
  </div>
)

export function MobileOptimized3DMap() {
  const [rotationSpeed, setRotationSpeed] = useState(0.005)
  const [selectedLocation, setSelectedLocation] = useState<(typeof userLocations)[0] | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleLocationClick = (location: (typeof userLocations)[0]) => {
    setSelectedLocation(location)
  }

  const toggleRotation = () => {
    setRotationSpeed(rotationSpeed === 0 ? 0.005 : 0)
  }

  const resetView = () => {
    setSelectedLocation(null)
    setRotationSpeed(0.005)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const cardHeight = isFullscreen ? "h-screen" : isMobile ? "h-[300px]" : "h-[400px]"

  return (
    <Card
      className={`w-full ${cardHeight} flex flex-col overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 border-purple-500/20 ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
    >
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="flex items-center justify-between">
          <span className="text-white text-lg sm:text-xl">Live User Map</span>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRotation}
              className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              {rotationSpeed === 0 ? (
                <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Pause className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            camera={{
              position: [0, 0, isMobile ? 3 : 2.5],
              fov: isMobile ? 75 : 60,
            }}
            dpr={isMobile ? [1, 1.5] : [1, 2]}
            performance={{ min: isMobile ? 0.5 : 0.75 }}
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#8B5CF6" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3B82F6" />

            <Globe rotationSpeed={rotationSpeed} onUserClick={handleLocationClick} isMobile={isMobile} />

            <OrbitControls
              enableZoom={!isMobile}
              enablePan={false}
              enableRotate={!isMobile}
              autoRotate={false}
              maxPolarAngle={Math.PI}
              minPolarAngle={0}
            />
          </Canvas>
        </Suspense>

        {/* Location Info Panel */}
        {selectedLocation && (
          <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white p-4 rounded-lg border border-purple-500/30 max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{selectedLocation.city}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLocation(null)}
                className="text-white hover:bg-white/20 h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
            <p className="text-sm text-gray-300 mb-2">{selectedLocation.country}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">{selectedLocation.users} active users</span>
            </div>
          </div>
        )}

        {/* Stats Panel */}
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white p-3 rounded-lg border border-purple-500/30">
          <div className="text-sm space-y-1">
            <div>Total Users: {userLocations.reduce((sum, loc) => sum + loc.users, 0)}</div>
            <div>Active Locations: {userLocations.length}</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Live Updates</span>
            </div>
          </div>
        </div>

        {/* Mobile Instructions */}
        {isMobile && (
          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-white/50 text-xs bg-black/20 rounded-full px-2 py-1">Tap markers to view details</div>
          </div>
        )}

        {/* Close fullscreen button */}
        {isFullscreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 text-white hover:bg-white/10 z-10"
          >
            ✕
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
