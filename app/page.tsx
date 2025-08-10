"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Server,
  Play,
  Users,
  CreditCard,
  Settings,
  Search,
  Film,
  Music,
  Tv,
  BookOpen,
  Star,
  Eye,
  DollarSign,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
  Calendar,
  User,
  MessageSquare,
  HelpCircle,
  LogIn,
  LogOut,
} from "lucide-react"
import { jellyfinAPI, type JellyfinLibrary, type JellyfinUser } from "@/lib/jellyfin-api"
import { SubscriptionSuccessModal } from "@/components/subscription-success-modal"
import { MovieCarousel } from "@/components/movie-carousel"
import { UKTimeDisplay } from "@/components/uk-time-display"
import { formatUKDate, formatUKDateTime, getRelativeTime, isNewRelease } from "@/lib/date-utils"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginModal } from "@/components/auth/login-modal"
import { UserProfile } from "@/components/profile/user-profile"
import { TicketSystem } from "@/components/tickets/ticket-system"
import { MessagingSystem } from "@/components/messaging/messaging-system"
import { ForumSystem } from "@/components/forum/forum-system"

const mockSubscriptions = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 9.99,
    features: ["Access to Movies & TV", "HD Streaming", "2 Concurrent Streams"],
    popular: false,
    gradient: "from-purple-400 to-purple-600",
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 19.99,
    features: ["All Content Access", "4K Streaming", "5 Concurrent Streams", "Offline Downloads"],
    popular: true,
    gradient: "from-purple-500 to-indigo-600",
  },
  {
    id: "family",
    name: "Family Plan",
    price: 29.99,
    features: ["All Premium Features", "10 User Profiles", "Unlimited Streams", "Parental Controls"],
    popular: false,
    gradient: "from-indigo-500 to-purple-700",
  },
]

const getLibraryIcon = (collectionType: string) => {
  switch (collectionType?.toLowerCase()) {
    case "movies":
      return Film
    case "tvshows":
      return Tv
    case "music":
      return Music
    case "books":
      return BookOpen
    default:
      return Play
  }
}

function JellyfinStoreContent() {
  const { user, isAuthenticated, logout } = useAuth()
  const [serverUrl] = useState("https://xqi1eda.freshticks.xyz")
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [libraries, setLibraries] = useState<JellyfinLibrary[]>([])
  const [users, setUsers] = useState<JellyfinUser[]>([])
  const [isJellyfinAuthenticated, setIsJellyfinAuthenticated] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [password, setPassword] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [serverInfo, setServerInfo] = useState<any>(null)
  const [libraryStats, setLibraryStats] = useState({
    totalLibraries: 0,
    totalItems: 0,
    activeUsers: 0,
    serverVersion: "",
  })

  // Auth modal state
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Subscription modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [newUserCredentials, setNewUserCredentials] = useState<any>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [isProcessingSubscription, setIsProcessingSubscription] = useState(false)

  // Add new state for search results and loading
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [allItems, setAllItems] = useState<any[]>([])

  const filteredLibraries = libraries.filter((library) =>
    library.Name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const testConnection = async () => {
    setIsConnecting(true)
    setConnectionError(null)

    try {
      // Set API key before testing connection
      jellyfinAPI.setApiKey("728294b52a3847b384573b5b931d91e6")

      const result = await jellyfinAPI.testConnection()
      if (result.success) {
        setIsConnected(true)
        setServerInfo(result.serverInfo)

        // With API key, we can skip user authentication and load libraries directly
        setIsJellyfinAuthenticated(true)

        // Load libraries using API key
        const serverLibraries = await jellyfinAPI.getLibraries()
        setLibraries(serverLibraries)

        // Load public users for display
        const publicUsers = await jellyfinAPI.getPublicUsers()
        setUsers(publicUsers)

        // Calculate stats - simplified to avoid the user authentication error
        setLibraryStats({
          totalLibraries: serverLibraries.length,
          totalItems: serverLibraries.reduce((total, lib) => total + (lib.ItemCount || 0), 0),
          activeUsers: publicUsers.length,
          serverVersion: result.serverInfo?.Version || "Unknown",
        })
      } else {
        setIsConnected(false)
        setConnectionError(result.error || "Failed to connect to server")
      }
    } catch (error) {
      setIsConnected(false)
      setConnectionError(error instanceof Error ? error.message : "Unknown error")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSubscription = async (planId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    setIsProcessingSubscription(true)
    setSelectedPlan(planId)

    try {
      // Generate credentials
      const credentials = jellyfinAPI.generateCredentials(planId)

      // Create user on Jellyfin server
      const createResult = await jellyfinAPI.createUser(credentials, planId)

      if (createResult.success && createResult.userId) {
        // Assign libraries based on plan
        await jellyfinAPI.assignLibrariesToUser(createResult.userId, planId)

        // Update user count
        const updatedUsers = await jellyfinAPI.getPublicUsers()
        setUsers(updatedUsers)
        setLibraryStats((prev) => ({ ...prev, activeUsers: updatedUsers.length }))

        // Show success modal
        setNewUserCredentials(credentials)
        setShowSuccessModal(true)
      } else {
        throw new Error(createResult.error || "Failed to create user account")
      }
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : "Failed to process subscription")
    } finally {
      setIsProcessingSubscription(false)
    }
  }

  const handleAuthentication = async () => {
    if (!selectedUser) return

    setIsAuthenticating(true)
    try {
      const result = await jellyfinAPI.authenticateByName(selectedUser, password)
      if (result.success) {
        setIsJellyfinAuthenticated(true)
        // Load libraries after authentication
        const userLibraries = await jellyfinAPI.getLibraries()
        setLibraries(userLibraries)

        // Calculate stats
        let totalItems = 0
        for (const library of userLibraries) {
          const items = await jellyfinAPI.getLibraryItems(library.Id, 1)
          totalItems += items.length
        }

        setLibraryStats({
          totalLibraries: userLibraries.length,
          totalItems,
          activeUsers: users.length,
          serverVersion: serverInfo?.Version || "Unknown",
        })
      } else {
        setConnectionError(result.error || "Authentication failed")
      }
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : "Authentication failed")
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Update the search function
  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await jellyfinAPI.searchItems(query, 50)
      setSearchResults(results)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Load all items when authenticated
  useEffect(() => {
    if (isJellyfinAuthenticated) {
      const loadAllItems = async () => {
        const items = await jellyfinAPI.getAllLibraryItems(200)
        setAllItems(items)
      }
      loadAllItems()
    }
  }, [isJellyfinAuthenticated])

  useEffect(() => {
    testConnection()
  }, [])

  const mockResellerStats = [
    { label: "Active Customers", value: libraryStats.activeUsers, icon: Users, color: "from-purple-400 to-purple-600" },
    { label: "Monthly Revenue", value: "£24,890", icon: DollarSign, color: "from-indigo-400 to-indigo-600" },
    {
      label: "Total Libraries",
      value: libraryStats.totalLibraries,
      icon: Server,
      color: "from-violet-400 to-violet-600",
    },
    { label: "Content Items", value: libraryStats.totalItems, icon: Play, color: "from-purple-500 to-indigo-600" },
  ]

  return (
    <div className="min-h-screen">
      {/* iOS-style Header with blur effect */}
      <header className="ios-blur border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg animate-float">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  OG JELLYFIN
                </h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Connected to: {serverUrl}</span>
                  <Badge className={`ios-badge text-white ${isConnected ? "bg-green-500" : "bg-red-500"}`}>
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Connecting...
                      </>
                    ) : isConnected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Offline
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UKTimeDisplay />
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Welcome, {user?.username}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="ios-button bg-white/80 backdrop-blur-md border-purple-200 hover:bg-purple-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setShowLoginModal(true)} className="ios-button text-white border-0" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
              <Button
                className="ios-button text-white border-0"
                size="sm"
                onClick={testConnection}
                disabled={isConnecting}
              >
                <Settings className="h-4 w-4 mr-2" />
                {isConnecting ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {connectionError && (
          <Alert className="mb-6 ios-alert border-red-200">
            <XCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-700">{connectionError}</AlertDescription>
          </Alert>
        )}

        {isJellyfinAuthenticated && (
          <Tabs defaultValue="libraries" className="space-y-6">
            <TabsList className="ios-tabs grid w-full grid-cols-7 h-12">
              <TabsTrigger value="libraries" className="rounded-xl font-medium">
                <Film className="h-4 w-4 mr-2" />
                Libraries
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="rounded-xl font-medium">
                <Star className="h-4 w-4 mr-2" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="profile" className="rounded-xl font-medium" disabled={!isAuthenticated}>
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="tickets" className="rounded-xl font-medium" disabled={!isAuthenticated}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="messages" className="rounded-xl font-medium" disabled={!isAuthenticated}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="forum" className="rounded-xl font-medium" disabled={!isAuthenticated}>
                <Users className="h-4 w-4 mr-2" />
                Forum
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-xl font-medium">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Libraries Tab */}
            <TabsContent value="libraries" className="space-y-8">
              {/* Latest Movies Carousel */}
              {!searchQuery && <MovieCarousel title="🎬 Latest Movies" subtitle="Recently added to your collection" />}

              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    placeholder="Search movies, TV shows, episodes..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="ios-search pl-10 border-0 text-foreground placeholder:text-purple-400"
                  />
                </div>
                <Button onClick={() => window.location.reload()} className="ios-button text-white border-0">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {searchQuery ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-foreground">Search Results for "{searchQuery}"</h3>
                    {isSearching && <Loader2 className="h-5 w-5 animate-spin text-purple-500" />}
                  </div>

                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {searchResults.map((item, index) => {
                        // Enhanced image URL generation for search results
                        const getItemImage = (item: any) => {
                          // Try Primary image first (movie poster)
                          if (item.PrimaryImageTag) {
                            return jellyfinAPI.getImageUrl(item.Id, "Primary", item.PrimaryImageTag, 300, 450)
                          }

                          // Try Backdrop image as fallback
                          if (item.BackdropImageTags && item.BackdropImageTags.length > 0) {
                            return jellyfinAPI.getImageUrl(item.Id, "Backdrop", item.BackdropImageTags[0], 300, 169)
                          }

                          // Try Thumb image as fallback
                          if (item.ImageTags && item.ImageTags.Thumb) {
                            return jellyfinAPI.getImageUrl(item.Id, "Thumb", item.ImageTags.Thumb, 300, 169)
                          }

                          // Use placeholder as final fallback
                          return (
                            "/placeholder.svg?height=450&width=300&text=" + encodeURIComponent(item.Name || "Content")
                          )
                        }

                        const imageUrl = getItemImage(item)
                        const releaseDate = item.PremiereDate || item.DateCreated
                        const isNew = isNewRelease(releaseDate)

                        return (
                          <Card
                            key={item.Id}
                            className="library-card group hover:shadow-2xl transition-all duration-1000 cursor-pointer transform hover:scale-105 animate-in slide-in-from-bottom-4 fade-in-0 border-0"
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animationDuration: "1000ms",
                            }}
                          >
                            <div className="aspect-[2/3] relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-purple-100 to-indigo-100">
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={item.Name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  // Try backdrop image as fallback
                                  if (
                                    item.BackdropImageTags &&
                                    item.BackdropImageTags.length > 0 &&
                                    !target.src.includes("Backdrop")
                                  ) {
                                    target.src = jellyfinAPI.getImageUrl(
                                      item.Id,
                                      "Backdrop",
                                      item.BackdropImageTags[0],
                                      300,
                                      169,
                                    )
                                  } else if (item.ImageTags && item.ImageTags.Thumb && !target.src.includes("Thumb")) {
                                    target.src = jellyfinAPI.getImageUrl(
                                      item.Id,
                                      "Thumb",
                                      item.ImageTags.Thumb,
                                      300,
                                      169,
                                    )
                                  } else {
                                    // Final fallback to placeholder with item name
                                    target.src =
                                      "/placeholder.svg?height=450&width=300&text=" +
                                      encodeURIComponent(item.Name || "Content")
                                  }
                                }}
                              />

                              {/* Loading state */}
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center opacity-0">
                                <div className="text-center p-4">
                                  <Film className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                                  <p className="text-sm text-purple-600 font-medium line-clamp-2">{item.Name}</p>
                                </div>
                              </div>

                              {/* Rest of the overlay and badge code remains the same */}
                              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 flex items-end justify-center pb-4">
                                <Button
                                  size="sm"
                                  className="ios-button text-white border-0 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-1000"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Play
                                </Button>
                              </div>

                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                                <Badge className="ios-badge text-white bg-white/20 backdrop-blur-md border-0">
                                  {item.Type}
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
                            </div>

                            {/* Card content remains the same */}
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg group-hover:text-purple-600 transition-colors duration-1000 line-clamp-2">
                                {item.Name}
                              </CardTitle>
                              <CardDescription className="text-purple-600 space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formatUKDate(releaseDate)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {getRelativeTime(releaseDate)} •{" "}
                                  {item.Type === "Movie" ? "Movie" : item.Type === "Series" ? "TV Series" : "Episode"}
                                  {item.RunTimeTicks && ` • ${Math.round(item.RunTimeTicks / 600000000)} min`}
                                </div>
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {item.Overview && (
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{item.Overview}</p>
                              )}
                              {item.Genres && item.Genres.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {item.Genres.slice(0, 3).map((genre: string, genreIndex: number) => (
                                    <Badge
                                      key={genreIndex}
                                      className="ios-badge text-xs bg-purple-100 text-purple-700 border-0"
                                    >
                                      {genre}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {item.DateCreated && (
                                <div className="text-xs text-purple-500 border-t border-purple-100 pt-2">
                                  <span className="font-medium">Added: </span>
                                  {formatUKDateTime(item.DateCreated)}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : !isSearching ? (
                    <div className="text-center py-12">
                      <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                        <Search className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                        <p className="text-muted-foreground">No movies or TV shows found matching "{searchQuery}".</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                // Original library grid code here
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">📚 Your Libraries</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredLibraries.map((library, index) => {
                      const IconComponent = getLibraryIcon(library.CollectionType)
                      const imageUrl = library.PrimaryImageTag
                        ? jellyfinAPI.getImageUrl(library.Id, "Primary", library.PrimaryImageTag)
                        : "/grand-library.png"

                      return (
                        <Card
                          key={library.Id}
                          className="library-card group hover:shadow-2xl transition-all duration-1000 cursor-pointer transform hover:scale-105 animate-in slide-in-from-bottom-4 fade-in-0 border-0"
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animationDuration: "1000ms",
                          }}
                        >
                          <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                            <img
                              src={imageUrl || "/placeholder.svg"}
                              alt={library.Name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/grand-library.png"
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-1000 flex items-end justify-center pb-4">
                              <Button
                                size="sm"
                                className="ios-button text-white border-0 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-1000"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Browse
                              </Button>
                            </div>
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-1000 transform translate-x-2 group-hover:translate-x-0">
                              <Badge className="ios-badge text-white bg-white/20 backdrop-blur-md border-0">
                                {library.CollectionType || "media"}
                              </Badge>
                            </div>
                          </div>
                          <CardHeader className="pb-3 transform group-hover:translate-y-0 transition-transform duration-1000">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl">
                                <IconComponent className="h-4 w-4 text-white transform group-hover:rotate-12 transition-transform duration-1000" />
                              </div>
                              <CardTitle className="text-lg group-hover:text-purple-600 transition-colors duration-1000">
                                {library.Name}
                              </CardTitle>
                            </div>
                            <CardDescription className="transform group-hover:scale-105 transition-transform duration-1000 text-purple-600">
                              {library.ItemCount ? `${library.ItemCount.toLocaleString()} items` : "Loading..."}
                              {library.LastModified && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Updated: {formatUKDate(library.LastModified)}
                                </div>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                              <span className="transform group-hover:translate-x-1 transition-transform duration-1000">
                                {library.LastModified ? getRelativeTime(library.LastModified) : "Recently updated"}
                              </span>
                              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-pulse group-hover:animate-bounce transition-all duration-1000"></div>
                            </div>
                            <div className="h-1 bg-purple-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-out"></div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {filteredLibraries.length === 0 && libraries.length > 0 && !searchQuery && (
                <div className="text-center py-12">
                  <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                    <Search className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No libraries found matching your search.</p>
                  </div>
                </div>
              )}

              {libraries.length === 0 && isJellyfinAuthenticated && !searchQuery && (
                <div className="text-center py-12">
                  <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                    <Server className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No libraries found. Make sure you have access to libraries on this server.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Subscriptions Tab */}
            <TabsContent value="subscriptions" className="space-y-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Choose Your Plan
                  </h2>
                  <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
                </div>
                <p className="text-lg text-muted-foreground">
                  Select the perfect subscription for your streaming needs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {mockSubscriptions.map((plan, index) => (
                  <Card
                    key={plan.id}
                    className={`ios-card relative border-0 overflow-hidden transform hover:scale-105 transition-all duration-500 ${
                      plan.popular ? "ring-2 ring-purple-400 shadow-2xl" : ""
                    }`}
                    style={{
                      animationDelay: `${index * 200}ms`,
                    }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="ios-badge bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 px-4 py-2 text-sm font-semibold">
                          <Star className="h-4 w-4 mr-1 animate-pulse" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-5`}></div>
                    <CardHeader className="text-center relative z-10 pt-8">
                      <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                      <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        £{plan.price}
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        className={`w-full ios-button text-white border-0 h-12 text-base font-semibold ${
                          plan.popular ? "bg-gradient-to-r from-purple-500 to-indigo-600" : ""
                        }`}
                        onClick={() => handleSubscription(plan.id)}
                        disabled={isProcessingSubscription}
                      >
                        {isProcessingSubscription && selectedPlan === plan.id ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5 mr-2" />
                            Subscribe Now
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-8">
              <UserProfile />
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets" className="space-y-8">
              <TicketSystem />
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages" className="space-y-8">
              <MessagingSystem />
            </TabsContent>

            {/* Forum Tab */}
            <TabsContent value="forum" className="space-y-8">
              <ForumSystem />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-8">
              <Card className="ios-card border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    Server Configuration
                  </CardTitle>
                  <CardDescription>Your Jellyfin server connection details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="server-url" className="text-sm font-semibold text-foreground">
                        Server URL
                      </Label>
                      <Input
                        id="server-url"
                        value={serverUrl}
                        disabled
                        placeholder="https://xqi1eda.freshticks.xyz"
                        className="ios-search border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="server-status" className="text-sm font-semibold text-foreground">
                        Connection Status
                      </Label>
                      <div className="flex items-center gap-3 h-10 px-4 py-2 ios-search rounded-xl">
                        {isConnected ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600">Connected</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-red-600">Disconnected</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={testConnection} disabled={isConnecting} className="ios-button text-white border-0">
                      <Server className="h-4 w-4 mr-2" />
                      {isConnecting ? "Testing..." : "Test Connection"}
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      className="ios-button bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="ios-card border-0">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Store Settings
                  </CardTitle>
                  <CardDescription>Configure your store preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="store-name" className="text-sm font-semibold text-foreground">
                        Store Name
                      </Label>
                      <Input
                        id="store-name"
                        defaultValue="OG JELLYFIN"
                        placeholder="Enter store name"
                        className="ios-search border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-semibold text-foreground">
                        Currency
                      </Label>
                      <Input
                        id="currency"
                        defaultValue="GBP"
                        placeholder="USD, EUR, GBP..."
                        className="ios-search border-0"
                      />
                    </div>
                  </div>
                  <Button className="ios-button text-white border-0">
                    <Settings className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Success Modal */}
      {showSuccessModal && newUserCredentials && (
        <SubscriptionSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          credentials={newUserCredentials}
          planName={mockSubscriptions.find((p) => p.id === selectedPlan)?.name || ""}
          serverUrl={serverUrl}
        />
      )}
    </div>
  )
}

export default function JellyfinStore() {
  return (
    <AuthProvider>
      <JellyfinStoreContent />
    </AuthProvider>
  )
}
