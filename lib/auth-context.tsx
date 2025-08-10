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
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<boolean>
  updateProfile: (updates: Partial<User>) => void
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
      // Mock authentication - in real app, this would call your API
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        logout,
        register,
        updateProfile,
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
