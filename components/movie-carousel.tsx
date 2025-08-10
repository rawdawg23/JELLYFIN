"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Play, Star, Calendar, Clock, Sparkles, Film } from "lucide-react"
import { jellyfinAPI } from "@/lib/jellyfin-api"
import { formatUKDate, formatUKDateTime, getRelativeTime, isNewRelease } from "@/lib/date-utils"

interface MovieCarouselProps {
  title: string
  subtitle?: string
}

export function MovieCarousel({ title, subtitle }: MovieCarouselProps) {
  const [movies, setMovies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadLatestMovies = async () => {
      setIsLoading(true)
      try {
        // Get all items and filter for movies, then sort by date added
        const allItems = await jellyfinAPI.getAllLibraryItems(100)
        const latestMovies = allItems
          .filter((item) => item.Type === "Movie")
          .sort((a, b) => {
            const dateA = new Date(a.DateCreated || a.PremiereDate || 0)
            const dateB = new Date(b.DateCreated || b.PremiereDate || 0)
            return dateB.getTime() - dateA.getTime()
          })
          .slice(0, 20) // Get top 20 latest movies

        setMovies(latestMovies)
      } catch (error) {
        console.error("Error loading latest movies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLatestMovies()
  }, [])

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = 280 // Width of each card including gap
      const scrollPosition = index * cardWidth
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      })
      setCurrentIndex(index)
    }
  }

  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1)
    scrollToIndex(newIndex)
  }

  const scrollRight = () => {
    const maxIndex = Math.max(0, movies.length - 4) // Show 4 cards at a time
    const newIndex = Math.min(maxIndex, currentIndex + 1)
    scrollToIndex(newIndex)
  }

  const formatRuntime = (ticks: number) => {
    if (!ticks) return ""
    const minutes = Math.round(ticks / 600000000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-purple-200 rounded-lg animate-pulse"></div>
            {subtitle && <div className="h-4 w-32 bg-purple-100 rounded mt-2 animate-pulse"></div>}
          </div>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <div className="aspect-[2/3] bg-purple-200 rounded-2xl animate-pulse"></div>
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-purple-200 rounded animate-pulse"></div>
                <div className="h-3 bg-purple-100 rounded animate-pulse w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (movies.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </h2>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className="ios-button bg-white/80 backdrop-blur-md border-purple-200 hover:bg-purple-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollRight}
            disabled={currentIndex >= movies.length - 4}
            className="ios-button bg-white/80 backdrop-blur-md border-purple-200 hover:bg-purple-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie, index) => {
            // Enhanced image URL generation with fallbacks
            const getMovieImage = (movie: any) => {
              // Try Primary image first (movie poster)
              if (movie.PrimaryImageTag) {
                return jellyfinAPI.getImageUrl(movie.Id, "Primary", movie.PrimaryImageTag)
              }

              // Try Backdrop image as fallback
              if (movie.BackdropImageTags && movie.BackdropImageTags.length > 0) {
                return jellyfinAPI.getImageUrl(movie.Id, "Backdrop", movie.BackdropImageTags[0])
              }

              // Try Thumb image as fallback
              if (movie.ImageTags && movie.ImageTags.Thumb) {
                return jellyfinAPI.getImageUrl(movie.Id, "Thumb", movie.ImageTags.Thumb)
              }

              // Use placeholder as final fallback
              return "/placeholder.svg?height=400&width=300&text=" + encodeURIComponent(movie.Name || "Movie")
            }

            const imageUrl = getMovieImage(movie)
            const releaseDate = movie.PremiereDate || movie.DateCreated
            const isNew = isNewRelease(releaseDate)

            return (
              <Card
                key={movie.Id}
                className="flex-shrink-0 w-64 ios-card border-0 group hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="aspect-[2/3] relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-purple-100 to-indigo-100">
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={movie.Name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      // Try backdrop image as fallback
                      if (
                        movie.BackdropImageTags &&
                        movie.BackdropImageTags.length > 0 &&
                        !target.src.includes("Backdrop")
                      ) {
                        target.src = jellyfinAPI.getImageUrl(movie.Id, "Backdrop", movie.BackdropImageTags[0])
                      } else {
                        // Final fallback to placeholder with movie name
                        target.src =
                          "/placeholder.svg?height=400&width=300&text=" + encodeURIComponent(movie.Name || "Movie")
                      }
                    }}
                  />

                  {/* Loading placeholder while image loads */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center opacity-0 group-hover:opacity-0 transition-opacity duration-300">
                    <div className="text-center p-4">
                      <Film className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-sm text-purple-600 font-medium">{movie.Name}</p>
                    </div>
                  </div>

                  {/* Rest of the overlay content remains the same */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-4 left-4 right-4">
                      <Button
                        size="sm"
                        className="ios-button text-white border-0 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play Now
                      </Button>
                    </div>
                  </div>

                  {/* Badges remain the same */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <Badge className="ios-badge text-white bg-black/50 backdrop-blur-md border-0">
                      {movie.ProductionYear}
                    </Badge>
                  </div>

                  {isNew && (
                    <div className="absolute top-3 left-3">
                      <Badge className="ios-badge text-white bg-gradient-to-r from-green-500 to-emerald-600 border-0 flex items-center gap-1 animate-pulse">
                        <Sparkles className="h-3 w-3 fill-current" />
                        NEW
                      </Badge>
                    </div>
                  )}

                  {movie.CommunityRating && (
                    <div className="absolute top-12 left-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <Badge className="ios-badge text-white bg-yellow-500/90 backdrop-blur-md border-0 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {movie.CommunityRating.toFixed(1)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Card content remains the same */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-purple-600 transition-colors duration-500 line-clamp-2 mb-2">
                    {movie.Name}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 text-purple-400" />
                      <div className="flex flex-col">
                        <span className="font-medium text-purple-600">{formatUKDate(releaseDate)}</span>
                        <span className="text-xs">{getRelativeTime(releaseDate)}</span>
                      </div>
                    </div>

                    {movie.RunTimeTicks && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3 text-purple-400" />
                        <span>{formatRuntime(movie.RunTimeTicks)}</span>
                      </div>
                    )}

                    {movie.Genres && movie.Genres.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {movie.Genres.slice(0, 2).map((genre: string, genreIndex: number) => (
                          <Badge key={genreIndex} className="ios-badge text-xs bg-purple-100 text-purple-700 border-0">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {movie.Overview && (
                      <p className="text-xs text-muted-foreground line-clamp-3 mt-2">{movie.Overview}</p>
                    )}

                    {movie.DateCreated && (
                      <div className="text-xs text-purple-500 mt-2 border-t border-purple-100 pt-2">
                        <span className="font-medium">Added: </span>
                        {formatUKDateTime(movie.DateCreated)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Scroll indicators */}
        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: Math.ceil(movies.length / 4) }).map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index * 4)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / 4) === index
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 w-6"
                  : "bg-purple-200 hover:bg-purple-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
