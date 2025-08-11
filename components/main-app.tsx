"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SearchForm } from "@/components/search-form"
import { MovieCarousel } from "@/components/movie-carousel"
import { JellyfinLibraryBrowser } from "@/components/jellyfin-library-browser"
import { Enhanced3DHero } from "@/components/enhanced-3d-hero"
import { ThreeDHeroSlider } from "@/components/3d-hero-slider"
import { MobileOptimized3DMap } from "@/components/mobile-optimized-3d-map"
import { TicketSystem } from "@/components/tickets/ticket-system"
import { ForumSystem } from "@/components/forum/forum-system"
import { UserProfile } from "@/components/profile/user-profile"
import { ResponsiveMarketplace } from "@/components/responsive-marketplace"
import { MessagingSystem } from "@/components/messaging/messaging-system"
import { SellerDashboard } from "@/components/seller/seller-dashboard"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { LiveChatWidget } from "@/components/chat/live-chat-widget"
import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Home, Server, ShoppingCart, Film, Search, Library } from "lucide-react"

export function MainApp() {
  const [activeSection, setActiveSection] = useState("home")
  const { user } = useAuth()

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Welcome to Jellyfin Store
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">Your personal media server marketplace and community</p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Connected to {user?.username || "Guest"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Featured Content Carousel */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Film className="w-6 h-6" />
                Featured from Your Library
              </h2>
              <MovieCarousel />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setActiveSection("library")}
              >
                <CardContent className="p-6 text-center">
                  <Library className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold mb-2">Browse Library</h3>
                  <p className="text-sm text-muted-foreground">Explore your complete Jellyfin media collection</p>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setActiveSection("marketplace")}
              >
                <CardContent className="p-6 text-center">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Marketplace</h3>
                  <p className="text-sm text-muted-foreground">Buy and sell Jellyfin servers and content</p>
                </CardContent>
              </Card>

              <Card
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setActiveSection("3d-map")}
              >
                <CardContent className="p-6 text-center">
                  <Server className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Server Map</h3>
                  <p className="text-sm text-muted-foreground">View global Jellyfin servers in 3D</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "library":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Library className="w-8 h-8" />
                Your Jellyfin Library
              </h1>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <Search className="w-4 h-4 mr-2" />
                Refresh Library
              </Button>
            </div>
            <JellyfinLibraryBrowser />
          </div>
        )

      case "3d-hero":
        return <Enhanced3DHero />

      case "3d-slider":
        return <ThreeDHeroSlider />

      case "3d-map":
        return <MobileOptimized3DMap />

      case "tickets":
        return <TicketSystem />

      case "forum":
        return <ForumSystem />

      case "profile":
        return <UserProfile />

      case "marketplace":
        return <ResponsiveMarketplace />

      case "messages":
        return <MessagingSystem />

      case "seller":
        return <SellerDashboard />

      case "admin":
        return user?.role === "admin" ? (
          <AdminDashboard />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
            </CardContent>
          </Card>
        )

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2">Section Not Found</h2>
              <p className="text-muted-foreground">The requested section could not be found.</p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar onSectionChange={setActiveSection} activeSection={activeSection} />
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center gap-4 px-4">
              <SidebarTrigger />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold">
                    {activeSection === "home" && "Dashboard"}
                    {activeSection === "library" && "Library"}
                    {activeSection === "3d-hero" && "3D Hero"}
                    {activeSection === "3d-slider" && "3D Slider"}
                    {activeSection === "3d-map" && "Server Map"}
                    {activeSection === "tickets" && "Support"}
                    {activeSection === "forum" && "Community"}
                    {activeSection === "profile" && "Profile"}
                    {activeSection === "marketplace" && "Marketplace"}
                    {activeSection === "messages" && "Messages"}
                    {activeSection === "seller" && "Seller Dashboard"}
                    {activeSection === "admin" && "Admin Dashboard"}
                  </h1>
                </div>
                <SearchForm />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 container py-6 px-4">{renderContent()}</div>
        </main>

        <LiveChatWidget />
      </div>
    </SidebarProvider>
  )
}
