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
  CreditCard,
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

// PayPal configuration
const PAYPAL_CLIENT_ID = "sb" // You'll need to replace this with your actual PayPal client ID
const PAYPAL_MERCHANT_EMAIL = "ogstorage25@gmail.com"

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
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)

  useEffect(() => {
    loadLibraries()
    loadPayPalScript()
  }, [])

  // Load PayPal SDK
  const loadPayPalScript = () => {
    if (document.getElementById("paypal-sdk")) return

    const script = document.createElement("script")
    script.id = "paypal-sdk"
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=GBP&intent=capture`
    script.async = true
    document.head.appendChild(script)
  }

  // Close mobile menu when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (mobileMenuOpen && !target.closest(".mobile-menu") && !target.closest(".mobile-menu-button")) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.addEventListener("click", handleClickOutside)

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [mobileMenuOpen])

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

  const handlePayPalPayment = async (planType: string, price: number) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    setProcessingPayment(planType)

    // Check if PayPal SDK is loaded
    if (typeof window.paypal === "undefined") {
      alert("PayPal is loading, please try again in a moment.")
      setProcessingPayment(null)
      return
    }

    try {
      // Create PayPal payment
      const paypalButtonContainer = document.createElement("div")
      paypalButtonContainer.id = `paypal-button-${planType}`
      document.body.appendChild(paypalButtonContainer)

      window.paypal
        .Buttons({
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: price.toString(),
                    currency_code: "GBP",
                  },
                  description: `OG JELLYFIN ${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan`,
                  payee: {
                    email_address: PAYPAL_MERCHANT_EMAIL,
                  },
                },
              ],
              application_context: {
                brand_name: "OG JELLYFIN",
                landing_page: "BILLING",
                user_action: "PAY_NOW",
              },
            })
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const order = await actions.order.capture()

              if (order.status === "COMPLETED") {
                // Payment successful, create Jellyfin account
                await createJellyfinAccount(planType, price, order)
              } else {
                throw new Error("Payment not completed")
              }
            } catch (error) {
              console.error("Payment capture failed:", error)
              alert("Payment processing failed. Please try again.")
            } finally {
              setProcessingPayment(null)
              document.body.removeChild(paypalButtonContainer)
            }
          },
          onError: (err: any) => {
            console.error("PayPal error:", err)
            alert("Payment failed. Please try again.")
            setProcessingPayment(null)
            document.body.removeChild(paypalButtonContainer)
          },
          onCancel: () => {
            setProcessingPayment(null)
            document.body.removeChild(paypalButtonContainer)
          },
        })
        .render(`#paypal-button-${planType}`)

      // Trigger the PayPal button click
      setTimeout(() => {
        const paypalButton = paypalButtonContainer.querySelector('div[role="button"]') as HTMLElement
        if (paypalButton) {
          paypalButton.click()
        }
      }, 100)
    } catch (error) {
      console.error("PayPal initialization failed:", error)
      alert("Payment system unavailable. Please try again later.")
      setProcessingPayment(null)
    }
  }

  const createJellyfinAccount = async (planType: string, price: number, paymentOrder: any) => {
    try {
      // Generate user credentials
      const credentials = jellyfinAPI.generateCredentials(planType)

      // Create user account
      const userResult = await jellyfinAPI.createUser(credentials, planType)

      if (userResult.success && userResult.userId) {
        // Assign libraries based on plan
        await jellyfinAPI.assignLibrariesToUser(userResult.userId, planType)

        // Store payment information
        const purchaseData = {
          planType,
          price,
          credentials,
          userId: userResult.userId,
          paymentId: paymentOrder.id,
          paymentStatus: paymentOrder.status,
          paymentDate: new Date().toISOString(),
          payerEmail: paymentOrder.payer?.email_address,
        }

        setPurchaseData(purchaseData)
        setShowSuccessModal(true)

        // Log successful purchase
        console.log("Account created successfully:", {
          planType,
          userId: userResult.userId,
          paymentId: paymentOrder.id,
          username: credentials.username,
        })
      } else {
        throw new Error(userResult.error || "Failed to create account")
      }
    } catch (error) {
      console.error("Account creation failed:", error)
      alert("Account creation failed after payment. Please contact support with your payment ID: " + paymentOrder.id)
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

  const navigationItems = [
    { id: "libraries", label: "Libraries", icon: Play, shortLabel: "Media" },
    { id: "plans", label: "Plans", icon: Crown, shortLabel: "Plans" },
    { id: "profile", label: "Profile", icon: User, shortLabel: "Profile", requiresAuth: true },
    { id: "tickets", label: "Tickets", icon: TicketIcon, shortLabel: "Help", requiresAuth: true },
    { id: "messages", label: "Messages", icon: Mail, shortLabel: "Mail", requiresAuth: true },
    { id: "forum", label: "Forum", icon: MessageSquare, shortLabel: "Forum", requiresAuth: true },
    { id: "settings", label: "Settings", icon: Settings, shortLabel: "Settings" },
  ]

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
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
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
                <div className="sm:hidden">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    OG JELLYFIN
                  </h1>
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
                <div className="hidden sm:block">
                  <UKTimeDisplay />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="mobile-menu-button p-2 hover:bg-purple-100"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" style={{ top: "80px" }}>
              <div className="mobile-menu bg-white/95 backdrop-blur-md border-b border-purple-100 shadow-xl">
                <div className="container mx-auto px-4 py-6 space-y-6">
                  {/* Mobile Time Display */}
                  <div className="sm:hidden flex justify-center">
                    <UKTimeDisplay />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => {
                      const isDisabled = item.requiresAuth && !isAuthenticated
                      const Icon = item.icon

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleTabChange(item.id)}
                          disabled={isDisabled}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                            activeTab === item.id
                              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
                              : isDisabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                          {isDisabled && (
                            <Badge className="ml-auto bg-gray-300 text-gray-600 text-xs">Sign In Required</Badge>
                          )}
                        </button>
                      )
                    })}
                  </nav>

                  {/* Mobile Auth Section */}
                  <div className="border-t border-purple-200 pt-6">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="text-center p-4 bg-purple-50 rounded-xl">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-medium text-purple-700">{user?.username}</span>
                          </div>
                          <p className="text-sm text-purple-600">{user?.email}</p>
                        </div>
                        <Button
                          onClick={() => {
                            logout()
                            setMobileMenuOpen(false)
                          }}
                          variant="outline"
                          className="w-full ios-button bg-transparent border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setShowLoginModal(true)
                          setMobileMenuOpen(false)
                        }}
                        className="w-full ios-button text-white border-0"
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In to Access All Features
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="container mx-auto px-4 py-4 sm:py-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 sm:space-y-8">
            {/* Desktop Tab Navigation */}
            <div className="hidden lg:block">
              <TabsList className="ios-tabs grid w-full grid-cols-7">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isDisabled = item.requiresAuth && !isAuthenticated

                  return (
                    <TabsTrigger key={item.id} value={item.id} disabled={isDisabled} className="flex-shrink-0">
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </div>

            {/* Mobile Tab Navigation - Horizontal Scroll */}
            <div className="lg:hidden">
              <div className="ios-tabs overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 p-2 min-w-max">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isDisabled = item.requiresAuth && !isAuthenticated

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        disabled={isDisabled}
                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                          activeTab === item.id
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg"
                            : isDisabled
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-white/80 text-purple-700 hover:bg-purple-50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm font-medium whitespace-nowrap">
                          <span className="hidden sm:inline">{item.label}</span>
                          <span className="sm:hidden">{item.shortLabel}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

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
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure PayPal payment processing</span>
                </div>
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
                        onClick={() => handlePayPalPayment(plan.name.toLowerCase(), plan.price)}
                        disabled={processingPayment === plan.name.toLowerCase()}
                        className={`w-full ios-button text-white border-0 ${plan.popular ? "shadow-lg" : ""} ${
                          processingPayment === plan.name.toLowerCase() ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {processingPayment === plan.name.toLowerCase() ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay with PayPal - £{plan.price}
                          </>
                        )}
                      </Button>
                      <div className="text-center text-xs text-muted-foreground">
                        Account created instantly after payment
                      </div>
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

              <div className="text-center space-y-2 max-w-md mx-auto px-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Secure Payment</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    All payments are processed securely through PayPal. Your Jellyfin account will be created
                    automatically after successful payment.
                  </p>
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
