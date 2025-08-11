"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Sphere, Html } from "@react-three/drei"
import { TextureLoader } from "three"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

// Mock data for user locations
const userLocations = [
  { id: 1, lat: 34.0522, lon: -118.2437, city: "Los Angeles", country: "USA" },
  { id: 2, lat: 51.5074, lon: 0.1278, city: "London", country: "UK" },
  { id: 3, lat: 35.6895, lon: 139.6917, city: "Tokyo", country: "Japan" },
  { id: 4, lat: -33.8688, lon: 151.2093, city: "Sydney", country: "Australia" },
  { id: 5, lat: 40.7128, lon: -74.006, city: "New York", country: "USA" },
  { id: 6, lat: 48.8566, lon: 2.3522, city: "Paris", country: "France" },
  { id: 7, lat: -23.5505, lon: -46.6333, city: "São Paulo", country: "Brazil" },
  { id: 8, lat: 19.076, lon: 72.8777, city: "Mumbai", country: "India" },
]

interface GlobeProps {
  rotationSpeed: number
  onUserClick: (location: (typeof userLocations)[0]) => void
}

const Globe: React.FC<GlobeProps> = ({ rotationSpeed, onUserClick }) => {
  const meshRef = useRef<any>()
  const texture = new TextureLoader().load("/dark-blue-earth-map.png")

  useFrame(() => {
    if (meshRef.current) {
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
    <Sphere args={[1, 64, 64]} ref={meshRef}>
      <meshStandardMaterial map={texture} />
      {userLocations.map((loc) => {
        const [x, y, z] = latLonToCartesian(loc.lat, loc.lon, 1.01) // Slightly outside the globe
        return (
          <Html key={loc.id} position={[x, y, z]} center>
            <div
              className="w-2 h-2 bg-red-500 rounded-full animate-pulse cursor-pointer"
              onClick={() => onUserClick(loc)}
              title={`${loc.city}, ${loc.country}`}
            />
          </Html>
        )
      })}
    </Sphere>
  )
}

export function ThreeDLiveMap() {
  const [rotationSpeed, setRotationSpeed] = useState(0.002)
  const [selectedUser, setSelectedUser] = useState<(typeof userLocations)[0] | null>(null)

  const handleUserClick = (location: (typeof userLocations)[0]) => {
    setSelectedUser(location)
  }

  return (
    <Card className="w-full h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Live User Map</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        <Canvas camera={{ position: [0, 0, 2.5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Globe rotationSpeed={rotationSpeed} onUserClick={handleUserClick} />
          <OrbitControls enableZoom enablePan enableRotate />
        </Canvas>
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Button onClick={() => setRotationSpeed(rotationSpeed === 0 ? 0.002 : 0)}>
            {rotationSpeed === 0 ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            <span className="sr-only">{rotationSpeed === 0 ? "Start Rotation" : "Pause Rotation"}</span>
          </Button>
        </div>
        {selectedUser && (
          <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg text-sm">
            <h4 className="font-bold">
              {selectedUser.city}, {selectedUser.country}
            </h4>
            <p>User ID: {selectedUser.id}</p>
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="mt-2">
              Close
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
