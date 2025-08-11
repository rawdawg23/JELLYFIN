"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Star, Clock, Calendar } from "lucide-react"

interface Movie {
  id: string
  title: string
  year: number
  genre: string[]
  rating: number
  duration: string
  poster: string
  backdrop: string
  description: string
}

const movies: Movie[] = [
  {
    id: "1",
    title: "The Grand Adventure",
    year: 2023,
    genre: ["Action", "Adventure"],
    rating: 8.5,
    duration: "2h 15m",
    poster: "/placeholder.png?height=400&width=300&text=Movie+Poster+1",
    backdrop: "/placeholder.png?height=600&width=1200&text=Movie+Backdrop+1",
    description: "An epic journey through uncharted territories filled with danger and wonder.",
  },
  {
    id: "2",
    title: "Mystery of the Lost City",
    year: 2023,
    genre: ["Mystery", "Thriller"],
    rating: 7.8,
    duration: "1h 58m",
    poster: "/placeholder.png?height=400&width=300&text=Movie+Poster+2",
    backdrop: "/placeholder.png?height=600&width=1200&text=Movie+Backdrop+2",
    description: "A detective uncovers ancient secrets in a forgotten civilization.",
  },
  {
    id: "3",
    title: "Space Odyssey 2024",
    year: 2024,
    genre: ["Sci-Fi", "Drama"],
    rating: 9.1,
    duration: "2h 42m",
    poster: "/placeholder.png?height=400&width=300&text=Movie+Poster+3",
    backdrop: "/placeholder.png?height=600&width=1200&text=Movie+Backdrop+3",
    description: "Humanity's greatest journey to the stars and the challenges that await.",
  },
  {
    id: "4",
    title: "The Comedy Club",
    year: 2023,
    genre: ["Comedy", "Romance"],
    rating: 7.2,
    duration: "1h 35m",
    poster: "/placeholder.png?height=400&width=300&text=Movie+Poster+4",
    backdrop: "/placeholder.png?height=600&width=1200&text=Movie+Backdrop+4",
    description: "Love and laughter collide in this heartwarming romantic comedy.",
  },
  {
    id: "5",
    title: "Horror Nights",
    year: 2023,
    genre: ["Horror", "Thriller"],
    rating: 6.9,
    duration: "1h 47m",
    poster: "/placeholder.png?height=400&width=300&text=Movie+Poster+5",
    backdrop: "/placeholder.png?height=600&width=1200&text=Movie+Backdrop+5",
    description: "A spine-chilling tale that will keep you on the edge of your seat.",
  },
]

export function MovieCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextMovie = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length)
    setIsAutoPlaying(false)
  }

  const prevMovie = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + movies.length) % movies.length)
    setIsAutoPlaying(false)
  }

  const currentMovie = movies[currentIndex]

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${currentMovie.backdrop})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              {currentMovie.genre.map((g) => (
                <Badge key={g} className="ios-badge bg-white/20 text-white border-0 backdrop-blur-sm">
                  {g}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{currentMovie.title}</h1>

            <div className="flex items-center gap-6 text-white/80 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{currentMovie.year}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{currentMovie.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{currentMovie.rating}</span>
              </div>
            </div>

            <p className="text-lg text-white/90 mb-8 leading-relaxed">{currentMovie.description}</p>

            <div className="flex items-center gap-4">
              <Button className="ios-button text-white border-0 px-8 py-3 text-lg">
                <Play className="h-5 w-5 mr-2" />
                Watch Now
              </Button>
              <Button
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm px-8 py-3 text-lg"
              >
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        onClick={prevMovie}
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        onClick={nextMovie}
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index)
              setIsAutoPlaying(false)
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
