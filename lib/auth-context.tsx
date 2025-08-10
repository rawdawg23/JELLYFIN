"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => void
  initiateQuickConnect: () => Promise<{ success: boolean; code?: string; error?: string }>
  checkQuickConnectStatus: (code: string) => Promise<boolean>
  disconnectJellyfin: () => void
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

  const initiateQuickConnect = async (): Promise<{ success: boolean; code?: string; error?: string }> => {
    try {
      // Mock Jellyfin Quick Connect initiation - in real app, this would call Jellyfin API
      const quickConnectCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      if (user) {
        const updatedUser = {
          ...user,
          jellyfinQuickConnect: {
            ...user.jellyfinQuickConnect,
            quickConnectCode,
            connected: false,
          },
        }
        setUser(updatedUser)
        localStorage.setItem("jellyfin-user", JSON.stringify(updatedUser))
      }

      return { success: true, code: quickConnectCode }
    } catch (error) {
      return { success: false, error: "Failed to initiate Quick Connect" }
    }
  }

  const checkQuickConnectStatus = async (code: string): Promise<boolean> => {
    try {
      // Mock Quick Connect status check - in real app, this would poll Jellyfin API
      // Simulate successful connection after a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const jellyfinQuickConnectData = {
        connected: true,
        username: user?.username || "JellyfinUser",
        userId: "jellyfin-" + Date.now(),
        serverId: "server-123",
        serverName: "OG JELLYFIN Server",
        connectedAt: new Date().toISOString(),
        quickConnectCode: code,
      }

      if (user) {
        const updatedUser = { ...user, jellyfinQuickConnect: jellyfinQuickConnectData }
        setUser(updatedUser)
        localStorage.setItem("jellyfin-user", JSON.stringify(updatedUser))
      }
      return true
    } catch (error) {
      return false
    }
  }

  const disconnectJellyfin = () => {
    if (user) {
      const updatedUser = { ...user, jellyfinQuickConnect: { connected: false } }
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
        initiateQuickConnect,
        checkQuickConnectStatus,
        disconnectJellyfin,
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
