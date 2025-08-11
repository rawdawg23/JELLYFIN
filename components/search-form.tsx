"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Loader2 } from "lucide-react"
import { jellyfinAPI, type JellyfinMediaItem } from "@/lib/jellyfin-api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SearchForm() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<JellyfinMediaItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setIsSearching(true)
    setShowResults(true)

    try {
      const results = await jellyfinAPI.searchItems(searchTerm, 10)
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    if (!value.trim()) {
      setShowResults(false)
      setSearchResults([])
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults([])
    setShowResults(false)
    setIsSearchOpen(false)
  }

  return (
    <div className="relative">
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search your Jellyfin library..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsSearchOpen(true)}
          />
          {isSearching && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {searchTerm && (
          <Button type="button" variant="ghost" size="icon" className="ml-2" onClick={clearSearch}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Searching your library...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Search Results</h3>
                  <Badge variant="secondary">{searchResults.length} found</Badge>
                </div>
                <div className="space-y-2">
                  {searchResults.map((item) => (
                    <div
                      key={item.Id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        console.log("Selected item:", item)
                        clearSearch()
                      }}
                    >
                      <div className="w-12 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center">
                        {item.ImageTags?.Primary ? (
                          <img
                            src={`${jellyfinAPI.getItemImageUrl(item.Id)}`}
                            alt={item.Name}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                            }}
                          />
                        ) : (
                          <Search className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.Name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {item.Type}
                          </Badge>
                          {item.productionYear && (
                            <span className="text-xs text-muted-foreground">{item.productionYear}</span>
                          )}
                          {item.CommunityRating && (
                            <span className="text-xs text-muted-foreground">⭐ {item.CommunityRating.toFixed(1)}</span>
                          )}
                        </div>
                        {item.Overview && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.Overview}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchTerm ? (
              <div className="text-center py-4">
                <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No results found for "{searchTerm}"</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching for movies, TV shows, or other content in your library
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Backdrop to close search results */}
      {showResults && <div className="fixed inset-0 z-40" onClick={() => setShowResults(false)} />}
    </div>
  )
}
