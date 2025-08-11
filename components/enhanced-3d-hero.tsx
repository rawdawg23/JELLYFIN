"use client"

import type React from "react"
import { useRef, useState, useEffect, Suspense } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Html, Environment, Float, MeshDistortMaterial, Sphere, useTexture } from "@react-three/drei"
import type { Mesh } from "three"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, Sparkles, Maximize2 } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "Premium Jellyfin Servers",
    description: "Experience ultra-fast 4K streaming with 99.9% uptime",
    image: "/fantasy-forest-movie.png",
    color: "#3B82F6",
    accent: "#8B5CF6",
  },
  {
    id: 2,
    title: "Global Marketplace",
    description: "Connect with verified sellers worldwide",
    image: "/noir-detective-movie.png",
    color: "#8B5CF6",
    accent: "#EC4899",
  },
  {
    id: 3,
    title: "Mobile Optimized",
    description: "Perfect experience on any device",
    image: "/action-war-movie.png",
    color: "#EC4899",
    accent: "#F59E0B",
  },
  {
    id: 4,
    title: "24/7 Support",
    description: "Premium support whenever you need it",
    image: "/space-exploration-movie.png",
    color: "#F59E0B",
    accent: "#10B981",
  },
]

interface FloatingElementProps {
  position: [number, number, number]
  color: string
  scale?: number
  isMobile?: boolean
}

const FloatingElement: React.FC<FloatingElementProps> = ({ position, color, scale = 1, isMobile = false }) => {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (meshRef.current && !isMobile) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3
    }
  })

  if (isMobile) {
    return (
      <mesh ref={meshRef} position={position} scale={scale * 0.7}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    )
  }

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[0.3, 0]} />
        <MeshDistortMaterial color={color} attach="material" distort={0.4} speed={2} roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  )
}

interface SlideMeshProps {
  position: [number, number, number]
  rotationY: number
  textureUrl: string
  title: string
  description: string
  isActive: boolean
  onClick: () => void
  color: string
  accent: string
  isMobile?: boolean
}

const SlideMesh: React.FC<SlideMeshProps> = ({
  position,
  rotationY,
  textureUrl,
  title,
  description,
  isActive,
  onClick,
  color,
  accent,
  isMobile = false,
}) => {
  const meshRef = useRef<Mesh>(null)
  const texture = useTexture(textureUrl)
  const { viewport } = useThree()

  useFrame((state) => {
    if (meshRef.current) {
      const targetScale = isActive ? (isMobile ? 1.05 : 1.1) : isMobile ? 0.95 : 0.9
      meshRef.current.scale.setScalar(targetScale)
      if (!isMobile) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      }
    }
  })

  const planeSize = isMobile ? [2, 1.2] : viewport.width < 6 ? [2.5, 1.5] : [3.5, 2]

  return (
    <group position={position} rotation-y={rotationY}>
      <mesh ref={meshRef} onClick={onClick}>
        <planeGeometry args={planeSize} />
        <meshStandardMaterial
          map={texture}
          transparent
          opacity={isActive ? 1 : 0.7}
          emissive={color}
          emissiveIntensity={isActive ? 0.2 : 0.1}
        />
      </mesh>
      {isActive && (
        <Html position={[0, isMobile ? -0.8 : -1.2, 0.01]} center>
          <div className="w-[250px] sm:w-[280px] md:w-[320px] p-3 sm:p-4 bg-gradient-to-br from-black/80 via-purple-900/80 to-black/80 backdrop-blur-md rounded-xl border border-purple-500/30 text-white text-center transform transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-xl animate-pulse" />
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 line-clamp-2">{description}</p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 transform hover:scale-105 transition-all duration-300 text-xs sm:text-sm px-3 py-2"
              >
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Explore Now
              </Button>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

const Scene: React.FC<{
  currentSlide: number
  setCurrentSlide: (index: number) => void
  isPlaying: boolean
  isMobile: boolean
}> = ({ currentSlide, setCurrentSlide, isPlaying, isMobile }) => {
  return (
    <>
      <Environment preset="night" />
      <ambientLight intensity={isMobile ? 0.4 : 0.3} />
      <pointLight position={[10, 10, 10]} intensity={isMobile ? 0.8 : 1} color="#8B5CF6" />
      <pointLight position={[-10, -10, -10]} intensity={isMobile ? 0.3 : 0.5} color="#3B82F6" />

      {/* Floating background elements - reduced on mobile */}
      {!isMobile && (
        <>
          <FloatingElement position={[-4, 2, -2]} color="#3B82F6" scale={0.5} isMobile={isMobile} />
          <FloatingElement position={[4, -2, -3]} color="#8B5CF6" scale={0.7} isMobile={isMobile} />
          <FloatingElement position={[-3, -3, -1]} color="#EC4899" scale={0.4} isMobile={isMobile} />
          <FloatingElement position={[3, 3, -4]} color="#F59E0B" scale={0.6} isMobile={isMobile} />
        </>
      )}

      {isMobile && (
        <>
          <FloatingElement position={[-2, 1, -1]} color="#3B82F6" scale={0.3} isMobile={isMobile} />
          <FloatingElement position={[2, -1, -2]} color="#8B5CF6" scale={0.4} isMobile={isMobile} />
        </>
      )}

      {/* Background sphere - simplified on mobile */}
      <Sphere args={[20, isMobile ? 16 : 32, isMobile ? 16 : 32]} position={[0, 0, -10]}>
        {isMobile ? (
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.3} />
        ) : (
          <MeshDistortMaterial
            color="#1a1a2e"
            attach="material"
            distort={0.1}
            speed={1}
            roughness={0.8}
            metalness={0.2}
          />
        )}
      </Sphere>

      {slides.map((slide, index) => {
        const angle = (index - currentSlide) * (Math.PI / (isMobile ? 4 : 3))
        const radius = isMobile ? 2.5 : 3
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius - radius
        const rotationY = -angle

        return (
          <SlideMesh
            key={slide.id}
            position={[x, 0, z]}
            rotationY={rotationY}
            textureUrl={slide.image}
            title={slide.title}
            description={slide.description}
            isActive={index === currentSlide}
            onClick={() => setCurrentSlide(index)}
            color={slide.color}
            accent={slide.accent}
            isMobile={isMobile}
          />
        )
      })}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={!isMobile} // Disable rotation on mobile for better performance
        autoRotate={isPlaying && !isMobile}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
        touches={{
          ONE: isMobile ? 0 : 1, // Disable touch rotation on mobile
          TWO: 0,
        }}
      />
    </>
  )
}

const LoadingFallback: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
      <p className="text-white/70">Loading 3D Experience...</p>
    </div>
  </div>
)

export function Enhanced3DHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
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

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(goToNext, isMobile ? 6000 : 5000) // Slower on mobile
    return () => clearInterval(interval)
  }, [isPlaying, isMobile])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const cardHeight = isFullscreen
    ? "h-screen"
    : isMobile
      ? "h-[300px] sm:h-[400px]"
      : "h-[400px] sm:h-[500px] lg:h-[600px]"

  return (
    <Card
      className={`w-full ${cardHeight} flex flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/20 ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`}
    >
      <CardHeader className="pb-2 px-3 sm:px-6">
        <CardTitle className="flex items-center justify-between">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-lg sm:text-xl">
            3D Experience Hub
          </span>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 p-0">
              <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10 h-8 w-8 sm:h-10 sm:w-10 p-0"
            >
              <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative canvas-container">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            camera={{
              position: [0, 0, isMobile ? 4 : 5],
              fov: isMobile ? 70 : 60,
            }}
            dpr={isMobile ? [1, 1.5] : [1, 2]} // Lower DPR on mobile for performance
            performance={{ min: isMobile ? 0.5 : 0.75 }} // Lower performance threshold on mobile
          >
            <Scene
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
              isPlaying={isPlaying}
              isMobile={isMobile}
            />
          </Canvas>
        </Suspense>

        {/* Mobile-friendly controls */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 sm:space-x-4 bg-black/50 backdrop-blur-md rounded-full px-3 py-2 sm:px-4 border border-purple-500/30">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full h-6 w-6 sm:h-8 sm:w-8 p-0"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <div className="flex space-x-1 sm:space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 w-4 sm:w-6"
                    : "bg-gray-400 hover:bg-gray-300"
                }`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 rounded-full h-6 w-6 sm:h-8 sm:w-8 p-0"
            onClick={goToNext}
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white/70 text-xs sm:text-sm bg-black/30 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 border border-purple-500/20">
          {currentSlide + 1} / {slides.length}
        </div>

        {/* Mobile swipe hint */}
        {isMobile && (
          <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 flex justify-between pointer-events-none">
            <div className="text-white/50 text-xs bg-black/20 rounded-full px-2 py-1">← Swipe</div>
            <div className="text-white/50 text-xs bg-black/20 rounded-full px-2 py-1">Swipe →</div>
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
