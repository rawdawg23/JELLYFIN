"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  Play,
  Users,
  Star,
  Crown,
  Shield,
  MessageSquare,
  Mail,
  TicketIcon,
  User,
  LogIn,
  LogOut,
  CreditCard,
  Sparkles,
  Zap,
  Globe,
  ArrowUp,
} from "lucide-react"
import { jellyfinAPI } from "@/lib/jellyfin-api"
import { ThreeDHeroSlider } from "@/components/3d-hero-slider"
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
  const [activeTab, setActiveTab] = useState("home")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [purchaseData, setPurchaseData] = useState<any>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    loadLibraries()
    loadPayPalScript()

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const navigationItems = [
    { id: "home", label: "Home", icon: Sparkles, shortLabel: "Home" },
    { id: "libraries", label: "Libraries", icon: Play, shortLabel: "Media" },
    { id: "plans", label: "Plans", icon: Crown, shortLabel: "Plans" },
    { id: "profile", label: "Profile", icon: User, shortLabel: "Profile", requiresAuth: true },
    { id: "tickets", label: "Support", icon: TicketIcon, shortLabel: "Help", requiresAuth: true },
    { id: "messages", label: "Messages", icon: Mail, shortLabel: "Mail", requiresAuth: true },
    { id: "forum", label: "Community", icon: MessageSquare, shortLabel: "Forum", requiresAuth: true },
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
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20",
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
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
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
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 dark:from-slate-900 dark:via-gray-900 dark:to-purple-900">
      <div className="main-content">
        {/* Header - Simplified for mobile */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-purple-100 dark:border-purple-800 sticky top-0 z-50 shadow-lg">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                  <Play className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    OG JELLYFIN
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium hidden sm:block">
                    Premium Media Experience
                  </p>
                </div>
              </div>

              {/* Right side - Auth and Time */}
              <div className="flex items-center gap-2 sm:gap-4">
                {!isMobile && <UKTimeDisplay />}
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 sm:gap-4">
                    {!isMobile && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Welcome, <span className="text-purple-600 dark:text-purple-400">{user?.username}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    )}
                    <Button
                      onClick={logout}
                      variant="outline"
                      size="sm"
                      className="gap-1 sm:gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                      {!isMobile && "Sign Out"}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowLoginModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg text-xs sm:text-sm px-3 sm:px-4 py-2"
                  >
                    <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-4 sm:py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6 sm:space-y-8">
            {/* Navigation - Only show on desktop */}
            {!isMobile && (
              <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-2 border border-purple-100 dark:border-purple-800 shadow-xl">
                <div className="grid grid-cols-7 gap-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isDisabled = item.requiresAuth && !isAuthenticated

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        disabled={isDisabled}
                        className={`flex items-center justify-center gap-2 p-4 rounded-xl transition-all duration-300 ${
                          activeTab === item.id
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-105"
                            : isDisabled
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/20 hover:scale-105"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Mobile Quick Actions - Floating buttons */}
            {isMobile && (
              <div className="fixed bottom-4 left-4 right-4 z-40">
                <div className="flex justify-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-3 border border-purple-100 dark:border-purple-800 shadow-2xl">
                  {navigationItems.slice(0, 4).map((item) => {
                    const Icon = item.icon
                    const isDisabled = item.requiresAuth && !isAuthenticated

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        disabled={isDisabled}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[60px] ${
                          activeTab === item.id
                            ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-105"
                            : isDisabled
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{item.shortLabel}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <TabsContent value="home" className="space-y-0">
              <ThreeDHeroSlider />

              {/* Features Section */}
              <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-white via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
                <div className="container mx-auto px-4">
                  <div className="text-center space-y-4 sm:space-y-6 mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      Why Choose OG JELLYFIN?
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
                      Experience the ultimate media streaming platform with cutting-edge features and premium quality
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {[
                      {
                        icon: Shield,
                        title: "Secure & Private",
                        description: "Your data stays private with our secure servers and end-to-end encryption",
                        gradient: "from-green-500 to-emerald-600",
                        bgGradient: "from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
                      },
                      {
                        icon: Users,
                        title: "Family Friendly",
                        description: "Perfect for families with advanced parental controls and multiple user profiles",
                        gradient: "from-blue-500 to-cyan-600",
                        bgGradient: "from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20",
                      },
                      {
                        icon: Star,
                        title: "Premium Quality",
                        description: "4K Ultra HD streaming with Dolby Atmos audio and premium features",
                        gradient: "from-yellow-500 to-orange-600",
                        bgGradient: "from-yellow-50 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20",
                      },
                      {
                        icon: Zap,
                        title: "Lightning Fast",
                        description: "Optimized servers ensure instant loading and seamless streaming experience",
                        gradient: "from-purple-500 to-pink-600",
                        bgGradient: "from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
                      },
                      {
                        icon: Globe,
                        title: "Global Access",
                        description: "Stream anywhere in the world with our global CDN and mobile apps",
                        gradient: "from-indigo-500 to-purple-600",
                        bgGradient: "from-indigo-50 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20",
                      },
                      {
                        icon: Crown,
                        title: "Premium Support",
                        description: "24/7 dedicated support team ready to help with any questions or issues",
                        gradient: "from-rose-500 to-pink-600",
                        bgGradient: "from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20",
                      },
                    ].map((feature, index) => (
                      <Card
                        key={index}
                        className={`border-0 bg-gradient-to-br ${feature.bgGradient} shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group`}
                      >
                        <CardContent className="p-4 sm:p-6 lg:p-8 text-center space-y-3 sm:space-y-4">
                          <div
                            className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto bg-gradient-to-br ${feature.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                          >
                            <feature.icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                            {feature.title}
                          </h3>
                          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="libraries" className="space-y-6 sm:space-y-8 pb-20 sm:pb-8">
              <div className="text-center space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Discover Amazing Content
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Stream thousands of movies, TV shows, music, and more with our premium Jellyfin experience
                </p>
              </div>

              <div className="relative max-w-3xl mx-auto">
                <Search className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                <Input
                  placeholder="Search for movies, TV shows, music..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 sm:pl-14 h-12 sm:h-16 text-base sm:text-lg bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-purple-200 dark:border-purple-800 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl sm:rounded-2xl shadow-xl"
                />
              </div>

              {searchQuery && (
                <div className="space-y-4 sm:space-y-6">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                    Search Results {searchResults.length > 0 && `(${searchResults.length})`}
                  </h3>
                  {isSearching ? (
                    <div className="text-center py-12 sm:py-16">
                      <div className="animate-spin w-8 h-8 sm:w-12 sm:h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
                      <p className="text-muted-foreground text-base sm:text-lg">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                      {searchResults.map((item) => (
                        <Card
                          key={item.Id}
                          className="border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden"
                        >
                          <div className="aspect-[2/3] relative overflow-hidden">
                            <img
                              src={
                                jellyfinAPI.getImageUrl(item.Id, "Primary", item.PrimaryImageTag, 300, 450) ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={item.Name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = "none"
                                const placeholder = target.nextElementSibling
                                if (placeholder) placeholder.classList.remove("hidden")
                              }}
                            />
                            <div className="hidden w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                              <div className="text-center text-white p-2 sm:p-4">
                                <Play className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                                <p className="text-xs sm:text-sm font-medium line-clamp-2">{item.Name}</p>
                              </div>
                            </div>
                            {item.ProductionYear && (
                              <Badge className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/70 text-white border-0 text-xs backdrop-blur-sm">
                                {item.ProductionYear}
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-2 sm:p-4">
                            <h4 className="font-semibold text-xs sm:text-sm line-clamp-2 text-foreground mb-1">
                              {item.Name}
                            </h4>
                            <p className="text-xs text-muted-foreground capitalize">{item.Type}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 sm:py-16">
                      <Search className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-base sm:text-lg">No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {!searchQuery && (
                <div className="space-y-6 sm:space-y-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Browse Libraries</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {libraries.map((library) => (
                      <Card
                        key={library.Id}
                        className="border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden"
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                            <div className="text-center text-white">
                              <Play className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300" />
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">{library.Name}</h3>
                              <p className="text-purple-100 capitalize text-sm sm:text-base lg:text-lg">
                                {library.CollectionType || "Mixed Content"}
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        </div>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-base sm:text-lg text-foreground">{library.Name}</h4>
                              <p className="text-sm sm:text-base text-muted-foreground capitalize">
                                {library.CollectionType || "Mixed Content"}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl sm:text-3xl font-black text-purple-600">
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

            <TabsContent value="plans" className="space-y-6 sm:space-y-8 pb-20 sm:pb-8">
              <div className="text-center space-y-4 sm:space-y-6">
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Choose Your Plan
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                  Select the perfect plan for your streaming needs. All plans include access to our premium Jellyfin
                  server.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure PayPal payment processing</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
                {subscriptionPlans.map((plan) => (
                  <Card
                    key={plan.name}
                    className={`border-0 bg-gradient-to-br ${plan.bgGradient} shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 relative overflow-hidden ${
                      plan.popular ? "ring-2 ring-purple-500 lg:scale-105" : ""
                    }`}
                  >
                    {plan.popular && (
                      <div
                        className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${plan.gradient} text-white text-center py-2 sm:py-3 text-xs sm:text-sm font-bold shadow-lg`}
                      >
                        ⭐ MOST POPULAR ⭐
                      </div>
                    )}
                    <CardHeader className={`text-center ${plan.popular ? "pt-12 sm:pt-16" : "pt-6 sm:pt-8"} pb-4`}>
                      <div
                        className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br ${plan.gradient} rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-xl mb-4 sm:mb-6`}
                      >
                        <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                      <CardTitle className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100">
                        {plan.name}
                      </CardTitle>
                      <div className="space-y-1 sm:space-y-2">
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black text-purple-600">
                          £{plan.price}
                          <span className="text-base sm:text-lg text-muted-foreground">/month</span>
                        </div>
                        <CardDescription className="text-sm sm:text-base">
                          Billed monthly in {plan.currency}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
                      <ul className="space-y-3 sm:space-y-4">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3 sm:gap-4">
                            <div
                              className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r ${plan.gradient} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}
                            >
                              <svg
                                className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <span className="text-foreground font-medium text-sm sm:text-base">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handlePayPalPayment(plan.name.toLowerCase(), plan.price)}
                        disabled={processingPayment === plan.name.toLowerCase()}
                        className={`w-full h-12 sm:h-14 bg-gradient-to-r ${plan.gradient} hover:shadow-2xl text-white border-0 font-bold text-sm sm:text-lg transition-all duration-300 hover:scale-105 ${
                          processingPayment === plan.name.toLowerCase() ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {processingPayment === plan.name.toLowerCase() ? (
                          <>
                            <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full mr-2 sm:mr-3" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
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

              <div className="text-center space-y-4 sm:space-y-6 max-w-3xl mx-auto">
                <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl sm:rounded-3xl border border-blue-200 dark:border-blue-800 shadow-xl">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    <span className="font-bold text-lg sm:text-xl text-blue-800 dark:text-blue-200">
                      Secure Payment
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 leading-relaxed">
                    All payments are processed securely through PayPal. Your Jellyfin account will be created
                    automatically after successful payment with instant access to your chosen plan.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="pb-20 sm:pb-8">
              <UserProfile />
            </TabsContent>

            <TabsContent value="tickets" className="pb-20 sm:pb-8">
              <TicketSystem />
            </TabsContent>

            <TabsContent value="messages" className="pb-20 sm:pb-8">
              <MessagingSystem />
            </TabsContent>

            <TabsContent value="forum" className="pb-20 sm:pb-8">
              <ForumSystem />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

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
