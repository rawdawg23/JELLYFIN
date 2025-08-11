"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { jellyfinAPI } from "./jellyfin-api"

interface User {
  id: string
  username: string
  email: string
  avatar?: string
  role: "user" | "admin" | "moderator"
  joinDate: string
  lastActive: string
  plan?: string
  jellyfinQuickConnect?: {
    connected: boolean
    username?: string
    userId?: string
    serverId?: string
    serverName?: string
    connectedAt?: string
    quickConnectCode?: string
  }
  embyConnect?: {
    connected: boolean
    username?: string
    email?: string
    connectedAt?: string
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => void
  validateQuickConnectCode: (code: string) => Promise<{ success: boolean; error?: string }>
  disconnectJellyfin: () => void
  connectEmby: (username: string, password: string) => Promise<boolean>
  disconnectEmby: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("jellyfin-user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Check for admin credentials
      if (username === "ogadmin" && password === "Ebony2025") {
        const adminUser: User = {
          id: "admin-001",
          username: "ogadmin",
          email: "admin@ogjellyfin.com",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`,
          role: "admin",
          joinDate: "2024-01-01T00:00:00Z",
          lastActive: new Date().toISOString(),
          plan: "admin",
        }

        setUser(adminUser)
        setIsAuthenticated(true)
        localStorage.setItem("jellyfin-user", JSON.stringify(adminUser))
        return true
      }

      // Mock authentication for regular users
      const mockUser: User = {
        id: "user-" + Date.now(),
        username,
        email: `${username.toLowerCase()}@example.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        role: "user",
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        plan: "premium",
      }

      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem("jellyfin-user", JSON.stringify(mockUser))
      return true
    } catch (error) {
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Mock registration
      const mockUser: User = {
        id: "user-" + Date.now(),
        username,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        role: "user",
        joinDate: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        plan: "basic",
      }

      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem("jellyfin-user", JSON.stringify(mockUser))
      return true
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("jellyfin-user")
  }

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("jellyfin-user", JSON.stringify(updatedUser))
    }
  }

  const validateQuickConnectCode = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use the actual Jellyfin API to link the PIN
      const linkResult = await jellyfinAPI.linkQuickConnectPin(code)

      if (linkResult.success) {
        const jellyfinQuickConnectData = {
          connected: true,
          username: user?.username || "JellyfinUser",
          userId: linkResult.userId || "jellyfin-" + Date.now(),
          serverId: linkResult.serverId || "og-jellyfin-server",
          serverName: linkResult.serverName || "OG JELLYFIN Server",
          connectedAt: new Date().toISOString(),
          quickConnectCode: code,
        }

        if (user) {
          const updatedUser = { ...user, jellyfinQuickConnect: jellyfinQuickConnectData }
          setUser(updatedUser)
          localStorage.setItem("jellyfin-user", JSON.stringify(updatedUser))
        }

        return { success: true }
      } else {
        return { success: false, error: linkResult.error || "Failed to link PIN to server" }
      }
    } catch (error) {
      return { success: false, error: "Connection failed. Please try again." }
    }
  }

  const disconnectJellyfin = () => {
    if (user) {
      // Disconnect from the actual server
      jellyfinAPI.disconnectQuickConnect().catch(console.error)

      const updatedUser = {
        ...user,
        jellyfinQuickConnect: {
          connected: false,
          quickConnectCode: undefined,
          username: undefined,
          userId: undefined,
          serverId: undefined,
          serverName: undefined,
          connectedAt: undefined,
        },
      }
      setUser(updatedUser)
      localStorage.setItem("jellyfin-user", JSON.stringify(updatedUser))
    }
  }

  const connectEmby = async (username: string, password: string): Promise<boolean> => {
    try {
      // Mock Emby Connect authentication
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const embyConnectData = {
        connected: true,
        username,
        email: `${username}@emby.media`,
        connectedAt: new Date().toISOString(),
      }

      if (user) {
        const updatedUser = { ...user, embyConnect: embyConnectData }
        setUser(updatedUser)
        localStorage.setItem("jellyfin-user", JSON.stringify(updatedUser))
      }

      return true
    } catch (error) {
      return false
    }
  }

  const disconnectEmby = () => {
    if (user) {
      const updatedUser = { ...user, embyConnect: { connected: false } }
      setUser(updatedUser)
      localStorage.setItem("jellyfin-user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        updateProfile,
        validateQuickConnectCode,
        disconnectJellyfin,
        connectEmby,
        disconnectEmby,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
