"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import { type Mesh, TextureLoader } from "three"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const slides = [
  {
    id: 1,
    title: "Fantasy Forest Adventure",
    description: "Embark on an epic journey through mystical lands.",
    image: "/fantasy-forest-movie.png",
  },
  {
    id: 2,
    title: "Noir Detective Story",
    description: "Unravel a thrilling mystery in the shadows of the city.",
    image: "/noir-detective-movie.png",
  },
  {
    id: 3,
    title: "Action War Epic",
    description: "Experience intense battles and heroic sacrifices.",
    image: "/action-war-movie.png",
  },
  {
    id: 4,
    title: "Space Exploration Saga",
    description: "Journey to the stars and discover new galaxies.",
    image: "/space-exploration-movie.png",
  },
]

interface SlideMeshProps {
  position: [number, number, number]
  rotationY: number
  textureUrl: string
  title: string
  description: string
  isActive: boolean
  onClick: () => void
}

const SlideMesh: React.FC<SlideMeshProps> = ({
  position,
  rotationY,
  textureUrl,
  title,
  description,
  isActive,
  onClick,
}) => {
  const meshRef = useRef<Mesh>(null)
  const texture = new TextureLoader().load(textureUrl)

  useFrame(() => {
    if (meshRef.current) {
      // Optional: Add subtle animation if active
      meshRef.current.scale.setScalar(isActive ? 1.05 : 1)
    }
  })

  return (
    <mesh position={position} rotation-y={rotationY} ref={meshRef} onClick={onClick}>
      <planeGeometry args={[3, 1.8]} /> {/* Aspect ratio for 16:9 images */}
      <meshBasicMaterial map={texture} transparent opacity={isActive ? 1 : 0.5} />
      {isActive && (
        <Html position={[0, 0, 0.01]} center>
          <div className="w-[280px] p-4 bg-black/60 rounded-lg text-white text-center">
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm mt-1">{description}</p>
            <Button size="sm" className="mt-3">
              View Details
            </Button>
          </div>
        </Html>
      )}
    </mesh>
  )
}

export function ThreeDHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    const interval = setInterval(goToNext, 7000) // Auto-advance every 7 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="w-full h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>3D Hero Slider</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} />
          {slides.map((slide, index) => {
            const angle = (index - currentSlide) * (Math.PI / 4) // Angle between slides
            const radius = 2.5 // Distance from center
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius - radius // Offset to keep active slide centered
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
              />
            )
          })}
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
            <span className="sr-only">Previous slide</span>
          </Button>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${currentSlide === index ? "bg-white" : "bg-gray-400"}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
            <span className="sr-only">Next slide</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
