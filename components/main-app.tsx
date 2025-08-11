"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SearchForm } from "@/components/search-form"
import { MovieCarousel } from "@/components/movie-carousel"
import { JellyfinLibraryBrowser } from "@/components/jellyfin-library-browser"
import {
  DynamicEnhanced3DHero,
  Dynamic3DHeroSlider,
  DynamicMobileOptimized3DMap,
} from "@/components/dynamic-3d-components"
import { TicketSystem } from "@/components/tickets/ticket-system"
import { ForumSystem } from "@/components/forum/forum-system"
import { UserProfile } from "@/components/profile/user-profile"
import { ResponsiveMarketplace } from "@/components/responsive-marketplace"
import { MessagingSystem } from "@/components/messaging/messaging-system"
import { SellerDashboard } from "@/components/seller/seller-dashboard"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, ShoppingCart, Film, Search, Library, Sparkles, Users, MessageCircle } from "lucide-react"

export function MainApp() {
  const [activeSection, setActiveSection] = useState("home")
  const { user } = useAuth()

  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-6 pb-20 md:pb-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-2">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />
                      Welcome Back!
                    </h1>
                    <p className="text-purple-100 text-sm sm:text-base">
                      Your personal media server marketplace and community
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 w-fit">
                    {user?.username || "Guest"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                  <Film className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  Featured Content
                </h2>
                <Button variant="ghost" size="sm" className="text-purple-600">
                  View All
                </Button>
              </div>
              <MovieCarousel />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card
                  className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100"
                  onClick={() => setActiveSection("library")}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <Library className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-purple-600" />
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Library</h4>
                    <p className="text-xs text-muted-foreground hidden sm:block">Browse media</p>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100"
                  onClick={() => setActiveSection("marketplace")}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-green-600" />
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Store</h4>
                    <p className="text-xs text-muted-foreground hidden sm:block">Buy & sell</p>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100"
                  onClick={() => setActiveSection("3d-map")}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <Server className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-blue-600" />
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Servers</h4>
                    <p className="text-xs text-muted-foreground hidden sm:block">3D map</p>
                  </CardContent>
                </Card>

                <Card
                  className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100"
                  onClick={() => setActiveSection("forum")}
                >
                  <CardContent className="p-4 sm:p-6 text-center">
                    <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-orange-600" />
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Community</h4>
                    <p className="text-xs text-muted-foreground hidden sm:block">Join forum</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New server connected</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Library updated</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "library":
        return (
          <div className="space-y-4 sm:space-y-6 pb-20 md:pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Library className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                Your Library
              </h1>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
            <JellyfinLibraryBrowser />
          </div>
        )

      case "3d-hero":
        return <DynamicEnhanced3DHero />

      case "3d-slider":
        return <Dynamic3DHeroSlider />

      case "3d-map":
        return <DynamicMobileOptimized3DMap />

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
          <div className="pb-20 md:pb-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Section Not Found</h2>
                <p className="text-muted-foreground mb-4">The requested section could not be found.</p>
                <Button onClick={() => setActiveSection("home")} className="bg-purple-600 hover:bg-purple-700">
                  Go Home
                </Button>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar onSectionChange={setActiveSection} activeSection={activeSection} />
        <main className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
            <div className="flex h-14 sm:h-16 items-center gap-4 px-4 sm:px-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-sm sm:text-base text-gray-900">
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
                <div className="hidden sm:block">
                  <SearchForm />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6">{renderContent()}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
