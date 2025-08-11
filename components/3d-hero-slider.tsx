"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Star, Clock, Calendar, ChevronLeft, ChevronRight, Volume2 } from "lucide-react"

interface SlideContent {
  id: string
  title: string
  subtitle: string
  description: string
  year: number
  rating: number
  duration: string
  genre: string[]
  image: string
  video?: string
  color: string
  accent: string
}

const slides: SlideContent[] = [
  {
    id: "1",
    title: "Cinematic Universe",
    subtitle: "Explore Infinite Stories",
    description:
      "Dive into a world of endless entertainment with our premium collection of movies, TV shows, and exclusive content.",
    year: 2024,
    rating: 9.2,
    duration: "Unlimited",
    genre: ["Action", "Drama", "Sci-Fi"],
    image: "/diverse-movie-collection.png",
    color: "from-purple-900 via-blue-900 to-indigo-900",
    accent: "from-purple-500 to-blue-500",
  },
  {
    id: "2",
    title: "Music Paradise",
    subtitle: "Feel Every Beat",
    description: "Experience crystal-clear audio quality with our vast music library spanning every genre and era.",
    year: 2024,
    rating: 8.9,
    duration: "24/7",
    genre: ["Pop", "Rock", "Classical"],
    image: "/diverse-music-collection.png",
    color: "from-emerald-900 via-teal-900 to-cyan-900",
    accent: "from-emerald-500 to-teal-500",
  },
  {
    id: "3",
    title: "TV Excellence",
    subtitle: "Binge-Worthy Series",
    description: "From award-winning dramas to laugh-out-loud comedies, discover your next favorite series.",
    year: 2024,
    rating: 9.1,
    duration: "Episodes",
    genre: ["Drama", "Comedy", "Thriller"],
    image: "/tv-shows-collection.png",
    color: "from-rose-900 via-pink-900 to-purple-900",
    accent: "from-rose-500 to-pink-500",
  },
  {
    id: "4",
    title: "Digital Library",
    subtitle: "Knowledge Awaits",
    description: "Expand your mind with our comprehensive collection of audiobooks, ebooks, and educational content.",
    year: 2024,
    rating: 8.7,
    duration: "Pages",
    genre: ["Education", "Fiction", "Biography"],
    image: "/books-collection.png",
    color: "from-amber-900 via-orange-900 to-red-900",
    accent: "from-amber-500 to-orange-500",
  },
]

export function ThreeDHeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(
      () => {
        nextSlide()
      },
      isMobile ? 4000 : 6000,
    ) // Faster on mobile

    return () => clearInterval(interval)
  }, [isAutoPlaying, currentIndex, isMobile])

  const nextSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % slides.length)
    setTimeout(() => setIsTransitioning(false), isMobile ? 600 : 800)
  }

  const prevSlide = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    setTimeout(() => setIsTransitioning(false), isMobile ? 600 : 800)
  }

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsTransitioning(false), isMobile ? 600 : 800)
  }

  const currentSlide = slides[currentIndex]

  return (
    <div className="relative w-full h-[100vh] min-h-[600px] max-h-[900px] overflow-hidden bg-black">
      {/* 3D Background Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 transition-all duration-700 md:duration-1000 ease-out"
        style={{
          background: `linear-gradient(135deg, ${currentSlide.color})`,
          transform: isMobile ? "none" : `perspective(1000px) rotateY(${currentIndex * 2}deg)`,
        }}
      >
        {/* Animated Background Particles - Reduced on mobile */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isMobile ? 20 : 50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content Slides */}
        <div className="relative h-full flex items-center">
          {slides.map((slide, index) => {
            const offset = index - currentIndex
            const isActive = index === currentIndex

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-700 md:duration-1000 ease-out ${
                  isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                style={{
                  transform: isMobile
                    ? `translateX(${offset * 100}%)`
                    : `
                        perspective(1200px) 
                        translateX(${offset * 100}%) 
                        rotateY(${offset * 15}deg) 
                        translateZ(${isActive ? 0 : -200}px)
                        scale(${isActive ? 1 : 0.8})
                      `,
                }}
              >
                {/* Background Image with Parallax */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 md:duration-1000"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    transform: `scale(${isActive ? (isMobile ? 1.05 : 1.1) : 1}) translateZ(0)`,
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-80`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-20 h-full flex items-center">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                      {/* Text Content */}
                      <div
                        className={`space-y-4 sm:space-y-6 lg:space-y-8 transform transition-all duration-700 md:duration-1000 delay-200 md:delay-300 text-center lg:text-left ${
                          isActive
                            ? "translate-x-0 opacity-100"
                            : "translate-x-[-30px] md:translate-x-[-50px] opacity-0"
                        }`}
                      >
                        {/* Genre Tags */}
                        <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                          {slide.genre.map((g, i) => (
                            <Badge
                              key={g}
                              className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-gradient-to-r ${slide.accent} text-white border-0 shadow-lg backdrop-blur-sm transform transition-all duration-500`}
                              style={{ animationDelay: `${i * 100}ms` }}
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>

                        {/* Title */}
                        <div className="space-y-2 sm:space-y-4">
                          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black text-white leading-none tracking-tight">
                            {slide.title.split(" ").map((word, i) => (
                              <span
                                key={i}
                                className="inline-block transform transition-all duration-700"
                                style={{
                                  animationDelay: `${i * 200}ms`,
                                  textShadow: "0 0 30px rgba(255,255,255,0.3)",
                                }}
                              >
                                {word}{" "}
                              </span>
                            ))}
                          </h1>
                          <h2
                            className={`text-lg sm:text-xl lg:text-2xl xl:text-3xl font-light bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}
                          >
                            {slide.subtitle}
                          </h2>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-6 lg:gap-8 text-white/90 text-sm sm:text-base lg:text-lg">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="font-medium">{slide.year}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="font-medium">{slide.duration}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{slide.rating}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm sm:text-base lg:text-xl xl:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                          {slide.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                          <Button
                            size={isMobile ? "default" : "lg"}
                            className={`px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-gradient-to-r ${slide.accent} hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 text-white w-full sm:w-auto`}
                          >
                            <Play className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" />
                            Start Exploring
                          </Button>
                          <Button
                            size={isMobile ? "default" : "lg"}
                            variant="outline"
                            className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                          >
                            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-2 sm:mr-3" />
                            Learn More
                          </Button>
                        </div>
                      </div>

                      {/* 3D Visual Element - Hidden on mobile */}
                      <div
                        className={`hidden lg:block transform transition-all duration-1000 delay-500 ${
                          isActive ? "translate-x-0 opacity-100 rotate-0" : "translate-x-[50px] opacity-0 rotate-12"
                        }`}
                      >
                        <div
                          className="relative w-full h-96 transform-gpu"
                          style={{
                            perspective: "1000px",
                            transform: `rotateY(${Math.sin(Date.now() * 0.001) * 5}deg) rotateX(${Math.cos(Date.now() * 0.001) * 3}deg)`,
                          }}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${slide.accent} rounded-3xl shadow-2xl transform rotate-6 opacity-60`}
                          />
                          <div
                            className={`absolute inset-0 bg-gradient-to-tl ${slide.accent} rounded-3xl shadow-2xl transform -rotate-3 opacity-40`}
                          />
                          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex items-center justify-center">
                            <div className="text-center text-white p-8">
                              <div
                                className={`w-24 h-24 mx-auto mb-6 bg-gradient-to-br ${slide.accent} rounded-2xl flex items-center justify-center shadow-xl`}
                              >
                                <Play className="h-12 w-12 text-white" />
                              </div>
                              <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
                              <p className="text-white/80">Premium Experience</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 bg-black/20 backdrop-blur-xl rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 border border-white/10">
          {/* Previous Button */}
          <Button
            onClick={prevSlide}
            disabled={isTransitioning}
            variant="ghost"
            size="icon"
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 transform hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </Button>

          {/* Slide Indicators */}
          <div className="flex gap-2 sm:gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 transform hover:scale-125 ${
                  index === currentIndex
                    ? `bg-gradient-to-r ${currentSlide.accent} shadow-lg scale-125`
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <Button
            onClick={nextSlide}
            disabled={isTransitioning}
            variant="ghost"
            size="icon"
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white border-0 transform hover:scale-110 transition-all duration-300"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
        <div
          className={`h-full bg-gradient-to-r ${currentSlide.accent} transition-all duration-300`}
          style={{
            width: `${((currentIndex + 1) / slides.length) * 100}%`,
            boxShadow: `0 0 20px ${currentSlide.accent.includes("purple") ? "#8b5cf6" : currentSlide.accent.includes("emerald") ? "#10b981" : currentSlide.accent.includes("rose") ? "#f43f5e" : "#f59e0b"}`,
          }}
        />
      </div>

      {/* Floating Elements - Hidden on mobile */}
      <div className="absolute top-20 right-20 z-20 hidden xl:block">
        <div className={`w-32 h-32 bg-gradient-to-br ${currentSlide.accent} rounded-full opacity-20 animate-pulse`} />
      </div>
      <div className="absolute bottom-32 left-20 z-20 hidden xl:block">
        <div
          className={`w-24 h-24 bg-gradient-to-br ${currentSlide.accent} rounded-full opacity-30 animate-bounce`}
          style={{ animationDuration: "3s" }}
        />
      </div>
    </div>
  )
}
