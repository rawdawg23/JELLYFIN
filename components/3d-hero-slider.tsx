"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Star, Users, Database, Server, Zap } from "lucide-react"

interface SlideData {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  stats: {
    label: string
    value: string
    icon: any
  }[]
  color: string
}

const slides: SlideData[] = [
  {
    id: "1",
    title: "Ultimate Media Experience",
    subtitle: "Stream Anywhere, Anytime",
    description:
      "Access your entire media library from any device with our advanced streaming technology and beautiful interface.",
    image: "/diverse-movie-collection.png",
    stats: [
      { label: "Movies", value: "10K+", icon: Play },
      { label: "TV Shows", value: "5K+", icon: Star },
      { label: "Users", value: "50K+", icon: Users },
    ],
    color: "from-purple-600 to-blue-600",
  },
  {
    id: "2",
    title: "Powerful Server Management",
    subtitle: "Enterprise-Grade Infrastructure",
    description:
      "Monitor and manage multiple Jellyfin servers with real-time analytics, performance metrics, and automated scaling.",
    image: "/grand-library.png",
    stats: [
      { label: "Servers", value: "100+", icon: Server },
      { label: "Libraries", value: "500+", icon: Database },
      { label: "Uptime", value: "99.9%", icon: Zap },
    ],
    color: "from-green-600 to-teal-600",
  },
  {
    id: "3",
    title: "Smart Content Discovery",
    subtitle: "AI-Powered Recommendations",
    description:
      "Discover new content with our intelligent recommendation engine that learns your preferences and suggests perfect matches.",
    image: "/tv-shows-collection.png",
    stats: [
      { label: "Genres", value: "50+", icon: Star },
      { label: "Languages", value: "25+", icon: Users },
      { label: "Quality", value: "4K HDR", icon: Play },
    ],
    color: "from-orange-600 to-red-600",
  },
]

export function ThreeDHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentSlide(index)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Main Slide */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl min-h-[600px]">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.color} opacity-10`} />

        <CardContent className="relative p-0 h-full">
          <div className="grid lg:grid-cols-2 gap-8 items-center h-full min-h-[600px]">
            {/* Content Side */}
            <div className="p-8 lg:p-12 space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <span
                    className={`px-4 py-2 bg-gradient-to-r ${currentSlideData.color} text-white text-sm font-semibold rounded-full shadow-lg`}
                  >
                    {currentSlideData.subtitle}
                  </span>
                </div>

                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">{currentSlideData.title}</h2>

                <p className="text-lg text-white/80 leading-relaxed max-w-lg">{currentSlideData.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {currentSlideData.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div
                      className={`w-12 h-12 mx-auto mb-2 rounded-xl bg-gradient-to-br ${currentSlideData.color} flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className={`bg-gradient-to-r ${currentSlideData.color} hover:opacity-90 text-white font-semibold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300`}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl backdrop-blur-sm bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative p-8 lg:p-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl backdrop-blur-sm" />
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.color} opacity-20 rounded-3xl`}
                />

                <img
                  src={currentSlideData.image || "/placeholder.svg"}
                  alt={currentSlideData.title}
                  className="relative z-10 w-full h-auto rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl opacity-80 animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl opacity-60 animate-bounce" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Slide Indicators */}
      <div className="flex justify-center mt-8 space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? `bg-gradient-to-r ${currentSlideData.color} scale-125 shadow-lg`
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Slide Thumbnails */}
      <div className="flex justify-center mt-6 space-x-4">
        {slides.map((slide, index) => (
          <Card
            key={slide.id}
            className={`cursor-pointer transition-all duration-300 overflow-hidden ${
              index === currentSlide
                ? "ring-2 ring-white/50 scale-105 shadow-xl"
                : "opacity-60 hover:opacity-80 hover:scale-105"
            }`}
            onClick={() => goToSlide(index)}
          >
            <CardContent className="p-0 w-20 h-12">
              <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
