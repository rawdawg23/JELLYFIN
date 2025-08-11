"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Play,
  Users,
  Star,
  Crown,
  Shield,
  Settings,
  MessageSquare,
  Mail,
  TicketIcon,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { jellyfinAPI } from "@/lib/jellyfin-api"
import { MovieCarousel } from "@/components/movie-carousel"
import { SubscriptionSuccessModal } from "@/components/subscription-success-modal"
import { UKTimeDisplay } from "@/components/uk-time-display"
import { UserProfile } from "@/components/profile/user-profile"
import { TicketSystem } from "@/components/tickets/ticket-system"
import { MessagingSystem } from "@/components/messaging/messaging-system"
import { ForumSystem } from "@/components/forum/forum-system"
import { LoginModal } from "@/components/auth/login-modal"
import { useAuth } from "@/lib/auth-context"
import { AuthProvider } from "@/lib/auth-context"

function JellyfinStoreContent() {
  const { user, isAuthenticated, logout } = useAuth()
  const [libraries, setLibraries] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("libraries")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadLibraries()
  }, [])

  const loadLibraries = async () => {
    try {
      const libraryData = await jellyfinAPI.getLibraries()
      setLibraries(libraryData)
    } catch (error) {
      console.error("Failed to load libraries:", error)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await jellyfinAPI.searchItems(query, 20)
      setSearchResults(results)
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handlePurchase = async (planType: string, price: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    // Generate user credentials
    const credentials = jellyfinAPI.generateCredentials(planType)

    // Create user account
    const userResult = await jellyfinAPI.createUser(credentials, planType)

    if (userResult.success && userResult.userId) {
      // Assign libraries based on plan
      await jellyfinAPI.assignLibrariesToUser(userResult.userId, planType)

      setPurchaseData({
        planType,
        price,
        credentials,
        userId: userResult.userId,
      })
      setShowSuccessModal(true)
    } else {
      alert("Failed to create user account: " + userResult.error)
    }
  }

  const handleTabChange = (tab: string) => {
    if ((tab === "profile" || tab === "tickets" || tab === "messages" || tab === "forum") && !isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    setActiveTab(tab)
    setMobileMenuOpen(false)
  }

  const subscriptionPlans = [
    {
      name: "Basic",
      price: 4.99,
      currency: "GBP",
      features: [
        "Access to Movies & TV Shows",
        "2 concurrent streams",
        "Standard definition quality",
        "Mobile & tablet access",
        "Basic support",
      ],
      popular: false,
    },
    {
      name: "Premium",
      price: 9.99,
      currency: "GBP",
      features: [
        "Access to all content libraries",
        "5 concurrent streams",
        "4K Ultra HD quality",
        "All device access",
        "Download for offline viewing",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Family",
      price: 14.99,
      currency: "GBP",
      features: [
        "Everything in Premium",
        "10 concurrent streams",
        "Family profiles & parental controls",
        "Live TV access",
        "Premium support",
        "Early access to new features",
      ],
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen relative">
      {/* John Wick Animated Background */}
      <div className="john-wick-particles"></div>

      <div className="main-content">
        <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    OG JELLYFIN
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your Premium Media Experience</p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center gap-4">
                <UKTimeDisplay />
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Welcome, <span className="font-medium text-purple-600">{user?.username}</span>
                    </span>
                    <Button onClick={logout} variant="outline" size="sm" className="ios-button bg-transparent">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowLoginModal(true)} className="ios-button text-white border-0">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center gap-2">
                <UKTimeDisplay />
                <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="lg:hidden mt-4 p-4 bg-white/90 backdrop-blur-md rounded-xl border border-purple-100">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">
                        Welcome, <span className="font-medium text-purple-600">{user?.username}</span>
                      </span>
                    </div>
                    <Button onClick={logout} variant="outline" size="sm" className="w-full ios-button bg-transparent">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowLoginModal(true)} className="w-full ios-button text-white border-0">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-4 sm:py-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 sm:space-y-8">
            <TabsList className="ios-tabs grid w-full grid-cols-7 overflow-x-auto">
              <TabsTrigger value="libraries" className="flex-shrink-0">
                <Play className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Libraries</span>
                <span className="sm:hidden">Media</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="flex-shrink-0">
                <Crown className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Plans</span>
                <span className="sm:hidden">Plans</span>
              </TabsTrigger>
              <TabsTrigger
                value="profile"
                disabled={!isAuthenticated}
                className={`flex-shrink-0 ${!isAuthenticated ? "opacity-50" : ""}`}
              >
                <User className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                disabled={!isAuthenticated}
                className={`flex-shrink-0 ${!isAuthenticated ? "opacity-50" : ""}`}
              >
                <TicketIcon className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Tickets</span>
                <span className="sm:hidden">Help</span>
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                disabled={!isAuthenticated}
                className={`flex-shrink-0 ${!isAuthenticated ? "opacity-50" : ""}`}
              >
                <Mail className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Messages</span>
                <span className="sm:hidden">Mail</span>
              </TabsTrigger>
              <TabsTrigger
                value="forum"
                disabled={!isAuthenticated}
                className={`flex-shrink-0 ${!isAuthenticated ? "opacity-50" : ""}`}
              >
                <MessageSquare className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Forum</span>
                <span className="sm:hidden">Forum</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-shrink-0">
                <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="libraries" className="space-y-6 sm:space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Discover Amazing Content
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                  Stream thousands of movies, TV shows, music, and more with our premium Jellyfin experience
                </p>
              </div>

              <div className="relative max-w-2xl mx-auto px-4">
                <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  placeholder="Search for movies, TV shows, music..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 h-12 sm:h-14 text-base sm:text-lg ios-search border-0 shadow-lg"
                />
              </div>

              {searchQuery && (
                <div className="space-y-4 px-4">
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                    Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                  </h3>
                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                      {searchResults.map((item) => (
                        <Card key={item.Id} className="ios-card border-0 overflow-hidden group cursor-pointer">
                          <div className="aspect-[2/3] relative overflow-hidden">
                            {item.PrimaryImageTag ? (
                              <img
                                src={
                                  jellyfinAPI.getImageUrl(item.Id, "Primary", item.PrimaryImageTag, 300, 450) ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={item.Name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = "none"
                                  target.nextElementSibling?.classList.remove("hidden")
                                }}
                              />
                            ) : null}
                            <div className="hidden w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                              <div className="text-center text-white p-2 sm:p-4">
                                <Play className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm font-medium line-clamp-2">{item.Name}</p>
                              </div>
                            </div>
                            {item.ProductionYear && (
                              <Badge className="absolute top-2 right-2 ios-badge bg-black/70 text-white border-0 text-xs">
                                {item.ProductionYear}
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-2 sm:p-3">
                            <h4 className="font-medium text-xs sm:text-sm line-clamp-2 text-foreground">{item.Name}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{item.Type}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {!searchQuery && <MovieCarousel title="Latest Movies" subtitle="Recently added to our collection" />}

              {!searchQuery && (
                <div className="space-y-6 px-4">
                  <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Browse Libraries</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {libraries.map((library) => (
                      <Card key={library.Id} className="ios-card border-0 overflow-hidden group cursor-pointer">
                        <div className="aspect-video relative overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Play className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3" />
                              <h3 className="text-lg sm:text-xl font-bold">{library.Name}</h3>
                              <p className="text-purple-100 capitalize text-sm sm:text-base">
                                {library.CollectionType || "Mixed Content"}
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-base sm:text-lg text-foreground">{library.Name}</h4>
                              <p className="text-muted-foreground capitalize text-sm">
                                {library.CollectionType || "Mixed Content"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                                {library.ItemCount || 0}
                              </div>
                              <div className="text-xs sm:text-sm text-muted-foreground">items</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="plans" className="space-y-6 sm:space-y-8">
              <div className="text-center space-y-4 px-4">
                <h2 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Choose Your Plan
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Select the perfect plan for your streaming needs. All plans include access to our premium Jellyfin
                  server.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
                {subscriptionPlans.map((plan) => (
                  <Card
                    key={plan.name}
                    className={`ios-card border-0 relative overflow-hidden ${
                      plan.popular ? "ring-2 ring-purple-500 shadow-xl scale-105" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center py-2 text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <CardHeader className={plan.popular ? "pt-12" : ""}>
                      <div className="text-center space-y-2">
                        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">{plan.name}</CardTitle>
                        <div className="space-y-1">
                          <div className="text-3xl sm:text-4xl font-bold text-purple-600">
                            £{plan.price}
                            <span className="text-base sm:text-lg text-muted-foreground">/month</span>
                          </div>
                          <CardDescription>Billed monthly in {plan.currency}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span className="text-foreground text-sm sm:text-base">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handlePurchase(plan.name.toLowerCase(), plan.price)}
                        className={`w-full ios-button text-white border-0 ${plan.popular ? "shadow-lg" : ""}`}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Choose {plan.name}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center space-y-4 max-w-2xl mx-auto px-4">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Why Choose OG JELLYFIN?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground">Secure & Private</h4>
                    <p className="text-sm text-muted-foreground">Your data stays private with our secure servers</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground">Family Friendly</h4>
                    <p className="text-sm text-muted-foreground">Perfect for families with parental controls</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-foreground">Premium Quality</h4>
                    <p className="text-sm text-muted-foreground">4K streaming with premium features</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>

            <TabsContent value="tickets">
              <TicketSystem />
            </TabsContent>

            <TabsContent value="messages">
              <MessagingSystem />
            </TabsContent>

            <TabsContent value="forum">
              <ForumSystem />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="ios-card border-0">
                <CardHeader>
                  <CardTitle>Server Settings</CardTitle>
                  <CardDescription>Configure your Jellyfin server connection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Server URL</label>
                      <div className="p-3 bg-purple-50 rounded-xl">
                        <code className="text-sm text-purple-700 break-all">https://xqi1eda.freshticks.xyz</code>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Connection Status</label>
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-green-700">Connected</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <SubscriptionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        purchaseData={purchaseData}
      />

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <JellyfinStoreContent />
    </AuthProvider>
  )
}
