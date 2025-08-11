"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Film,
  Tv,
  Music,
  Book,
  ImageIcon,
  Play,
  Star,
  Calendar,
  Clock,
  Loader2,
  Server,
  RefreshCw,
} from "lucide-react"
import { jellyfinAPI, type JellyfinMediaItem, type JellyfinLibrary } from "@/lib/jellyfin-api"

export function JellyfinLibraryBrowser() {
  const [libraries, setLibraries] = useState<JellyfinLibrary[]>([])
  const [items, setItems] = useState<JellyfinMediaItem[]>([])
  const [searchResults, setSearchResults] = useState<JellyfinMediaItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean
    serverName: string
    itemCount: number
  }>({
    connected: false,
    serverName: "Unknown",
    itemCount: 0,
  })

  useEffect(() => {
    loadLibraries()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadLibraries = async () => {
    try {
      setLoading(true)
      setError(null)

      // Test connection first
      const connectionTest = await jellyfinAPI.testConnection()

      setConnectionStatus({
        connected: connectionTest.success,
        serverName: connectionTest.serverInfo?.ServerName || "Jellyfin Server",
        itemCount: 0,
      })

      if (!connectionTest.success) {
        throw new Error(connectionTest.message)
      }

      // Load libraries
      const libraryData = await jellyfinAPI.getLibraries()
      setLibraries(libraryData)

      // Load recent items
      const recentItems = await jellyfinAPI.getLibraryItems(undefined, 50)
      if (recentItems && recentItems.Items) {
        setItems(recentItems.Items)
        setConnectionStatus((prev) => ({
          ...prev,
          itemCount: recentItems.TotalRecordCount || recentItems.Items.length,
        }))
      }
    } catch (err) {
      console.error("Error loading libraries:", err)
      setError(err instanceof Error ? err.message : "Failed to load libraries")
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setSearching(true)
      const results = await jellyfinAPI.searchItems(searchQuery, 30)
      setSearchResults(results)
    } catch (err) {
      console.error("Search error:", err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const getLibraryIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "movies":
        return <Film className="w-5 h-5" />
      case "tvshows":
        return <Tv className="w-5 h-5" />
      case "music":
        return <Music className="w-5 h-5" />
      case "books":
        return <Book className="w-5 h-5" />
      case "photos":
        return <ImageIcon className="w-5 h-5" />
      default:
        return <Server className="w-5 h-5" />
    }
  }

  const formatDuration = (ticks?: number) => {
    if (!ticks) return "Unknown"
    const minutes = Math.floor(ticks / 600000000)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`
  }

  const MediaItemCard = ({ item }: { item: JellyfinMediaItem }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-4">
        <div className="aspect-[2/3] bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg mb-3 relative overflow-hidden">
          {item.ImageTags?.Primary ? (
            <img
              src={`${jellyfinAPI.getItemImageUrl(item.Id)}`}
              alt={item.Name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=300&width=200&text=" + encodeURIComponent(item.Name)
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              {item.Type === "Movie" ? <Film className="w-12 h-12" /> : <Tv className="w-12 h-12" />}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
            <Button
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-purple-600 hover:bg-purple-700"
            >
              <Play className="w-4 h-4 mr-1" />
              Play
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{item.Name}</h3>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {item.Type}
            </Badge>
            {item.productionYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {item.productionYear}
              </span>
            )}
          </div>

          {item.CommunityRating && (
            <div className="flex items-center gap-1 text-xs">
              <Star className="w-3 h-3 text-yellow-400" />
              <span>{item.CommunityRating.toFixed(1)}</span>
            </div>
          )}

          {item.runTimeTicks && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(item.runTimeTicks)}</span>
            </div>
          )}

          {item.Overview && <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{item.Overview}</p>}
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your Jellyfin library...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardContent className="p-8">
          <div className="text-center">
            <Server className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connection Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadLibraries} className="bg-purple-600 hover:bg-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Jellyfin Library
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={connectionStatus.connected ? "default" : "destructive"}
                className={connectionStatus.connected ? "bg-green-600" : ""}
              >
                {connectionStatus.connected ? "Connected" : "Disconnected"}
              </Badge>
              <Button variant="outline" size="sm" onClick={loadLibraries} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {connectionStatus.serverName} • {connectionStatus.itemCount} items
          </p>
        </CardHeader>
      </Card>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Your Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search movies, TV shows, music..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results {searchResults.length > 0 && `(${searchResults.length})`}</CardTitle>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map((item) => (
                  <MediaItemCard key={item.Id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">{searching ? "Searching..." : "No results found"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Libraries and Content */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Items</TabsTrigger>
          <TabsTrigger value="libraries">Libraries</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Items</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {items.slice(0, 24).map((item) => (
                    <MediaItemCard key={item.Id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No items found in your library</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="libraries" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {libraries.map((library) => (
              <Card key={library.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getLibraryIcon(library.type)}
                    {library.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Items</span>
                      <Badge variant="secondary">{library.itemCount}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Type</span>
                      <Badge variant="outline">{library.type}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Updated</span>
                      <span className="text-sm">{library.lastUpdated.toLocaleDateString()}</span>
                    </div>
                    <Button
                      className="w-full mt-4 bg-transparent"
                      variant="outline"
                      onClick={() => setSelectedLibrary(library.id)}
                    >
                      Browse Library
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
