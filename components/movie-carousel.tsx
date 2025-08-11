"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Star, Clock, Calendar, Search } from "lucide-react"
import { jellyfinAPI, type JellyfinMediaItem } from "@/lib/jellyfin-api"

interface Movie {
  id: string
  title: string
  description: string
  image: string
  rating: number
  duration: string
  year: number
  genre: string[]
  featured: boolean
}

export function MovieCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadJellyfinMovies()
  }, [])

  const loadJellyfinMovies = async () => {
    try {
      setLoading(true)
      setError(null)

      // First test connection
      const connectionTest = await jellyfinAPI.testConnection()
      if (!connectionTest.success) {
        throw new Error(connectionTest.message)
      }

      // Get library items
      const libraryData = await jellyfinAPI.getLibraryItems(undefined, 20)

      if (libraryData && libraryData.Items) {
        const jellyfinMovies = libraryData.Items.filter(
          (item) => item.Type === "Movie" || item.Type === "Series",
        ).slice(0, 10)

        const formattedMovies: Movie[] = await Promise.all(
          jellyfinMovies.map(async (item: JellyfinMediaItem, index: number) => {
            const imageUrl = await jellyfinAPI.getItemImageUrl(item.Id)
            const duration = item.runTimeTicks
              ? `${Math.floor(item.runTimeTicks / 600000000)}h ${Math.floor((item.runTimeTicks % 600000000) / 10000000)}m`
              : "Unknown"

            return {
              id: item.Id,
              title: item.Name || "Unknown Title",
              description: item.Overview || "No description available",
              image: imageUrl,
              rating: item.CommunityRating || 0,
              duration: duration,
              year: item.productionYear || new Date().getFullYear(),
              genre: item.genres || [],
              featured: index < 5, // First 5 items are featured
            }
          }),
        )

        setMovies(formattedMovies)
      } else {
        // Fallback to mock data if no items found
        setMovies(getMockMovies())
      }
    } catch (err) {
      console.error("Error loading Jellyfin movies:", err)
      setError(err instanceof Error ? err.message : "Failed to load movies")
      // Use mock data as fallback
      setMovies(getMockMovies())
    } finally {
      setLoading(false)
    }
  }

  const getMockMovies = (): Movie[] => [
    {
      id: "1",
      title: "Your Jellyfin Library",
      description: "Connect to your Jellyfin server to see your actual movie and TV show collection here.",
      image: "/fantasy-forest-movie.png",
      rating: 8.5,
      duration: "2h 15m",
      year: 2024,
      genre: ["Your Content"],
      featured: true,
    },
    {
      id: "2",
      title: "Server Connection",
      description: "Your personal media server content will appear here once connected.",
      image: "/noir-detective-movie.png",
      rating: 7.8,
      duration: "1h 45m",
      year: 2023,
      genre: ["Personal Library"],
      featured: true,
    },
    {
      id: "3",
      title: "Media Collection",
      description: "Browse your complete movie and TV show collection from your Jellyfin server.",
      image: "/action-war-movie.png",
      rating: 8.2,
      duration: "2h 30m",
      year: 2024,
      genre: ["Your Movies"],
      featured: true,
    },
  ]

  const featuredMovies = movies.filter((movie) => movie.featured)

  useEffect(() => {
    if (!isAutoPlaying || featuredMovies.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, featuredMovies.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + featuredMovies.length) % featuredMovies.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % featuredMovies.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  if (loading) {
    return (
      <Card className="w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/20">
        <CardContent className="p-0 relative">
          <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
              <p className="text-lg">Loading your Jellyfin library...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full overflow-hidden bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 border-red-500/20">
        <CardContent className="p-0 relative">
          <div className="relative h-[400px] md:h-[500px] flex items-center justify-center">
            <div className="text-white text-center max-w-2xl px-6">
              <div className="text-red-400 mb-4">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Connection Issue</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <Button onClick={loadJellyfinMovies} className="bg-purple-600 hover:bg-purple-700">
                Retry Connection
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentMovie = featuredMovies[currentIndex]

  if (!currentMovie) return null

  return (
    <Card className="w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/20">
      <CardContent className="p-0 relative">
        <div className="relative h-[400px] md:h-[500px] overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out"
            style={{
              backgroundImage: `url(${currentMovie.image})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 md:px-12">
              <div className="max-w-2xl text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-purple-600 text-white">
                    {movies.length > 3 ? "From Your Library" : "Demo Content"}
                  </Badge>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {currentMovie.year}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentMovie.duration}
                    </span>
                    {currentMovie.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        {currentMovie.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  {currentMovie.title}
                </h2>

                <p className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed line-clamp-3">
                  {currentMovie.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {currentMovie.genre.map((genre) => (
                    <Badge key={genre} variant="outline" className="border-purple-400 text-purple-200">
                      {genre}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Play className="w-5 h-5 mr-2" />
                    {movies.length > 3 ? "Play on Jellyfin" : "Connect Server"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-purple-400 text-purple-200 hover:bg-purple-600 bg-transparent"
                  >
                    More Info
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          {featuredMovies.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}
        </div>

        {/* Slide Indicators */}
        {featuredMovies.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index ? "w-8 bg-purple-400" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Auto-play indicator */}
        {featuredMovies.length > 1 && (
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/20"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            >
              {isAutoPlaying ? "Pause" : "Play"}
            </Button>
          </div>
        )}

        {/* Library Status */}
        <div className="absolute top-4 left-4">
          <Badge
            variant="outline"
            className={`${
              movies.length > 3
                ? "border-green-400 text-green-200 bg-green-900/20"
                : "border-yellow-400 text-yellow-200 bg-yellow-900/20"
            }`}
          >
            {movies.length > 3 ? `${movies.length} Items Found` : "Demo Mode"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
