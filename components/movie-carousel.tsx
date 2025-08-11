"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Star, Clock } from "lucide-react"

interface Movie {
  id: string
  title: string
  year: number
  rating: number
  duration: string
  genre: string
  poster: string
  backdrop: string
  description: string
}

const movies: Movie[] = [
  {
    id: "1",
    title: "The Matrix",
    year: 1999,
    rating: 8.7,
    duration: "2h 16m",
    genre: "Sci-Fi",
    poster: "/placeholder.svg?height=400&width=300&text=The+Matrix",
    backdrop: "/placeholder.svg?height=600&width=1200&text=The+Matrix+Backdrop",
    description: "A computer programmer discovers reality as he knows it is a simulation.",
  },
  {
    id: "2",
    title: "Inception",
    year: 2010,
    rating: 8.8,
    duration: "2h 28m",
    genre: "Thriller",
    poster: "/placeholder.svg?height=400&width=300&text=Inception",
    backdrop: "/placeholder.svg?height=600&width=1200&text=Inception+Backdrop",
    description: "A thief who steals corporate secrets through dream-sharing technology.",
  },
  {
    id: "3",
    title: "Interstellar",
    year: 2014,
    rating: 8.6,
    duration: "2h 49m",
    genre: "Sci-Fi",
    poster: "/placeholder.svg?height=400&width=300&text=Interstellar",
    backdrop: "/placeholder.svg?height=600&width=1200&text=Interstellar+Backdrop",
    description: "A team of explorers travel through a wormhole in space.",
  },
  {
    id: "4",
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    duration: "2h 32m",
    genre: "Action",
    poster: "/placeholder.svg?height=400&width=300&text=The+Dark+Knight",
    backdrop: "/placeholder.svg?height=600&width=1200&text=The+Dark+Knight+Backdrop",
    description: "Batman faces the Joker in this epic superhero thriller.",
  },
  {
    id: "5",
    title: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    duration: "2h 34m",
    genre: "Crime",
    poster: "/placeholder.svg?height=400&width=300&text=Pulp+Fiction",
    backdrop: "/placeholder.svg?height=600&width=1200&text=Pulp+Fiction+Backdrop",
    description: "The lives of two mob hitmen, a boxer, and others intertwine.",
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

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + movies.length) % movies.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const currentMovie = movies[currentIndex]

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-purple-900">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${currentMovie.backdrop})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                {currentMovie.genre}
              </span>
              <div className="flex items-center gap-2 text-white/80">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{currentMovie.rating}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-4 h-4" />
                <span>{currentMovie.duration}</span>
              </div>
              <span className="text-white/60">{currentMovie.year}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{currentMovie.title}</h1>

            <p className="text-lg text-white/90 mb-8 leading-relaxed">{currentMovie.description}</p>

            <div className="flex items-center gap-4">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-semibold px-8 py-3 rounded-xl">
                <Play className="w-5 h-5 mr-2 fill-current" />
                Play Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-xl bg-transparent"
              >
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
        onClick={goToPrevious}
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm"
        onClick={goToNext}
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Movie Thumbnails */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
        {movies.slice(0, 3).map((movie, index) => (
          <Card
            key={movie.id}
            className={`w-16 h-24 overflow-hidden cursor-pointer transition-all duration-300 ${
              index === currentIndex % 3 ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-80"
            }`}
            onClick={() => goToSlide(index)}
          >
            <CardContent className="p-0 h-full">
              <img src={movie.poster || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
