"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Home,
  Store,
  MessageSquare,
  HelpCircle,
  Server,
  Crown,
  Users,
} from "lucide-react"

interface NavbarProps {
  currentTab: string
  onTabChange: (tab: string) => void
  user: any
  onLogin: () => void
  onLogout: () => void
}

export function EnhancedNavbar({ currentTab, onTabChange, user, onLogin, onLogout }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "marketplace", label: "Marketplace", icon: Store },
    { id: "premium", label: "Premium", icon: Crown },
    { id: "forum", label: "Forum", icon: Users },
    { id: "messaging", label: "Messages", icon: MessageSquare },
    { id: "support", label: "Support", icon: HelpCircle },
  ]

  const adminItems = [
    { id: "admin", label: "Admin", icon: Settings },
    { id: "servers", label: "Servers", icon: Server },
  ]

  const MobileNav = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 p-4 border-b">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OG</span>
            </div>
            <span className="font-bold text-lg">OG JELLYFIN</span>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentTab === item.id ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {item.id === "messaging" && (
                      <Badge variant="secondary" className="ml-auto">
                        3
                      </Badge>
                    )}
                  </Button>
                )
              })}

              {user?.isAdmin && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Admin</p>
                    {adminItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Button
                          key={item.id}
                          variant={currentTab === item.id ? "default" : "ghost"}
                          className="w-full justify-start gap-3"
                          onClick={() => onTabChange(item.id)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Button>
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          </nav>

          <div className="p-4 border-t">
            {user ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || "/placeholder-user.png"} />
                  <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={onLogin} className="w-full">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            <MobileNav />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">OG</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">OG JELLYFIN</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <div className="flex items-center bg-muted rounded-lg p-1">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={currentTab === item.id ? "default" : "ghost"}
                    size="sm"
                    className="gap-2"
                    onClick={() => onTabChange(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                    {item.id === "messaging" && (
                      <Badge variant="secondary" className="ml-1">
                        3
                      </Badge>
                    )}
                  </Button>
                )
              })}
            </div>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                2
              </Badge>
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder-user.png"} />
                      <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onTabChange("profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTabChange("messaging")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                    <Badge variant="secondary" className="ml-auto">
                      3
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onTabChange("support")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Support
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onTabChange("admin")}>
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={onLogin}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
