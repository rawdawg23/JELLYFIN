"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  username: string
  email: string
  role: "admin" | "user" | "seller"
  subscriptionTier: "free" | "premium" | "enterprise"
  isVerified: boolean
  createdAt: string
  lastLogin: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  socialLinks?: {
    twitter?: string
    discord?: string
    github?: string
  }
  preferences?: {
    theme: "light" | "dark" | "system"
    notifications: boolean
    emailUpdates: boolean
  }
  stats?: {
    totalPurchases: number
    totalSpent: number
    memberSince: string
  }
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (userData: Partial<User> & { username: string; email: string; password: string }) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    username: "ogadmin",
    email: "ogadmin@jellyfin.store",
    password: "Ebony2025",
    role: "admin",
    subscriptionTier: "enterprise",
    isVerified: true,
    createdAt: "2023-01-01T00:00:00Z",
    lastLogin: new Date().toISOString(),
    avatar: "/placeholder-user.png",
    bio: "System Administrator",
    location: "United Kingdom",
    preferences: {
      theme: "dark",
      notifications: true,
      emailUpdates: true,
    },
    stats: {
      totalPurchases: 0,
      totalSpent: 0,
      memberSince: "2023-01-01",
    },
  },
  {
    id: "2",
    username: "johndoe",
    email: "john@example.com",
    password: "password123",
    role: "user",
    subscriptionTier: "premium",
    isVerified: true,
    createdAt: "2023-06-15T00:00:00Z",
    lastLogin: new Date().toISOString(),
    avatar: "/placeholder-user.png",
    bio: "Movie enthusiast and Jellyfin power user",
    location: "London, UK",
    website: "https://johndoe.com",
    socialLinks: {
      twitter: "@johndoe",
      discord: "johndoe#1234",
    },
    preferences: {
      theme: "system",
      notifications: true,
      emailUpdates: false,
    },
    stats: {
      totalPurchases: 15,
      totalSpent: 299.99,
      memberSince: "2023-06-15",
    },
  },
  {
    id: "3",
    username: "seller123",
    email: "seller@example.com",
    password: "seller123",
    role: "seller",
    subscriptionTier: "premium",
    isVerified: true,
    createdAt: "2023-03-10T00:00:00Z",
    lastLogin: new Date().toISOString(),
    avatar: "/placeholder-user.png",
    bio: "Professional Jellyfin server provider",
    location: "Manchester, UK",
    preferences: {
      theme: "light",
      notifications: true,
      emailUpdates: true,
    },
    stats: {
      totalPurchases: 5,
      totalSpent: 149.99,
      memberSince: "2023-03-10",
    },
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage && localStorage.getItem) {
      try {
        const storedUser = localStorage.getItem("jellyfin-store-user")
        if (storedUser && typeof storedUser === "string") {
          const userData = JSON.parse(storedUser)
          if (userData && typeof userData === "object") {
            setUser(userData)
          }
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        if (typeof localStorage !== "undefined" && localStorage && localStorage.removeItem) {
          try {
            localStorage.removeItem("jellyfin-store-user")
          } catch (e) {
            console.error("Error removing invalid user data:", e)
          }
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.username === username && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      const userWithUpdatedLogin = {
        ...userWithoutPassword,
        lastLogin: new Date().toISOString(),
      }

      setUser(userWithUpdatedLogin)
      if (
        typeof window !== "undefined" &&
        typeof localStorage !== "undefined" &&
        localStorage &&
        localStorage.setItem
      ) {
        try {
          localStorage.setItem("jellyfin-store-user", JSON.stringify(userWithUpdatedLogin))
        } catch (error) {
          console.error("Error storing user data:", error)
        }
      }
      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    if (
      typeof window !== "undefined" &&
      typeof localStorage !== "undefined" &&
      localStorage &&
      localStorage.removeItem
    ) {
      try {
        localStorage.removeItem("jellyfin-store-user")
      } catch (error) {
        console.error("Error removing user data:", error)
      }
    }
  }

  const register = async (
    userData: Partial<User> & { username: string; email: string; password: string },
  ): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Check if username or email already exists
    const existingUser = mockUsers.find((u) => u.username === userData.username || u.email === userData.email)
    if (existingUser) {
      setIsLoading(false)
      return false
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      role: "user",
      subscriptionTier: "free",
      isVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        theme: "system",
        notifications: true,
        emailUpdates: true,
      },
      stats: {
        totalPurchases: 0,
        totalSpent: 0,
        memberSince: new Date().toISOString().split("T")[0],
      },
      ...userData,
    }

    // Add to mock users (in real app, this would be an API call)
    mockUsers.push({ ...newUser, password: userData.password })

    setUser(newUser)
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage && localStorage.setItem) {
      try {
        localStorage.setItem("jellyfin-store-user", JSON.stringify(newUser))
      } catch (error) {
        console.error("Error storing new user data:", error)
      }
    }
    setIsLoading(false)
    return true
  }

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false

    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && localStorage && localStorage.setItem) {
      try {
        localStorage.setItem("jellyfin-store-user", JSON.stringify(updatedUser))
      } catch (error) {
        console.error("Error updating user data:", error)
      }
    }

    // Update in mock users array
    const userIndex = mockUsers.findIndex((u) => u.id === user.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates }
    }

    setIsLoading(false)
    return true
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    updateProfile,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Export alias for backward compatibility
export const useAuthStore = useAuth
