// Jellyfin API utility functions
export interface JellyfinLibrary {
  Id: string
  Name: string
  CollectionType: string
  ItemCount?: number
  PrimaryImageTag?: string
  BackdropImageTags?: string[]
  LastModified?: string
}

export interface JellyfinServerInfo {
  Id: string
  Name: string
  Version: string
  OperatingSystem: string
  LocalAddress: string
  WanAddress: string
}

export interface JellyfinUser {
  Id: string
  Name: string
  HasPassword: boolean
  HasConfiguredPassword: boolean
  HasConfiguredEasyPassword: boolean
  EnableAutoLogin?: boolean
  ServerId?: string
  LastLoginDate?: string
  LastActivityDate?: string
}

export interface NewUserCredentials {
  username: string
  password: string
  email?: string
}

export interface JellyfinServer {
  id: string
  name: string
  address: string
  version: string
  status: "online" | "offline" | "maintenance"
}

export interface QuickConnectResult {
  secret: string
  code: string
  deviceId: string
  deviceName: string
  appName: string
  appVersion: string
  dateAdded: string
  authenticated: boolean
}

export interface QuickConnectLinkResult {
  success: boolean
  error?: string
  userId?: string
  accessToken?: string
  serverId?: string
  serverName?: string
  deviceName?: string
  appName?: string
}

export interface LibraryStats {
  movies: number
  tvShows: number
  episodes: number
  music: number
  books: number
  photos: number
}

class JellyfinAPI {
  private baseUrl: string
  private apiKey: string | null = null
  private userId: string | null = null

  constructor() {
    this.baseUrl = "https://xqi1eda.freshticks.xyz"
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Emby-Client": "OG JELLYFIN Store",
      "X-Emby-Device-Name": "Web Browser",
      "X-Emby-Device-Id": "og-jellyfin-store-web",
      "X-Emby-Client-Version": "1.0.0",
    }

    if (this.apiKey) {
      headers["X-Emby-Token"] = this.apiKey
    }

    return headers
  }

  // Mock data for when real API fails
  private getMockLibraries() {
    return [
      {
        Id: "movies-lib",
        Name: "Movies",
        CollectionType: "movies",
        ItemCount: 1247,
        PrimaryImageTag: "movie-collection",
      },
      {
        Id: "tv-lib",
        Name: "TV Shows",
        CollectionType: "tvshows",
        ItemCount: 89,
        PrimaryImageTag: "tv-collection",
      },
      {
        Id: "music-lib",
        Name: "Music",
        CollectionType: "music",
        ItemCount: 3456,
        PrimaryImageTag: "music-collection",
      },
      {
        Id: "books-lib",
        Name: "Books",
        CollectionType: "books",
        ItemCount: 234,
        PrimaryImageTag: "books-collection",
      },
    ]
  }

  private getMockSearchResults(query: string) {
    const mockItems = [
      {
        Id: "movie-1",
        Name: "The Matrix",
        Type: "Movie",
        ProductionYear: 1999,
        PrimaryImageTag: "matrix-poster",
      },
      {
        Id: "movie-2",
        Name: "Inception",
        Type: "Movie",
        ProductionYear: 2010,
        PrimaryImageTag: "inception-poster",
      },
      {
        Id: "tv-1",
        Name: "Breaking Bad",
        Type: "Series",
        ProductionYear: 2008,
        PrimaryImageTag: "bb-poster",
      },
      {
        Id: "music-1",
        Name: "Bohemian Rhapsody",
        Type: "Audio",
        ProductionYear: 1975,
        PrimaryImageTag: "queen-album",
      },
    ]

    return mockItems.filter((item) => item.Name.toLowerCase().includes(query.toLowerCase()))
  }

  async getLibraries() {
    try {
      // Try real API first
      const response = await fetch(`${this.baseUrl}/Users/${this.userId || "default"}/Views`, {
        headers: {
          "X-Emby-Token": this.apiKey || "",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error("API request failed")

      const data = await response.json()
      return data.Items || []
    } catch (error) {
      console.warn("Using mock libraries data due to API error:", error)
      return this.getMockLibraries()
    }
  }

  async searchItems(query: string, limit = 20) {
    try {
      // Try real API first
      const response = await fetch(
        `${this.baseUrl}/Users/${this.userId || "default"}/Items?searchTerm=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            "X-Emby-Token": this.apiKey || "",
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) throw new Error("Search API request failed")

      const data = await response.json()
      return data.Items || []
    } catch (error) {
      console.warn("Using mock search results due to API error:", error)
      return this.getMockSearchResults(query)
    }
  }

  getImageUrl(itemId: string, type: string, tag: string, width?: number, height?: number) {
    // Return placeholder for mock data
    if (width && height) {
      return `/placeholder.svg?height=${height}&width=${width}&text=${encodeURIComponent(itemId)}`
    }
    return `/placeholder.svg?height=300&width=200&text=${encodeURIComponent(itemId)}`
  }

  // Quick Connect methods with mock fallback
  async initiateQuickConnect() {
    try {
      const response = await fetch(`${this.baseUrl}/QuickConnect/Initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to initiate Quick Connect")
      return await response.json()
    } catch (error) {
      console.warn("Using mock Quick Connect initiation:", error)
      return {
        Secret: "mock-secret-" + Date.now(),
        Code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        DateAdded: new Date().toISOString(),
      }
    }
  }

  async linkQuickConnectPin(pin: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      // Mock different responses based on PIN
      if (pin.toUpperCase() === "ERROR") {
        throw new Error("Invalid PIN code")
      }

      if (pin.toUpperCase() === "TIMEOUT") {
        throw new Error("Connection timeout")
      }

      if (pin.length < 4) {
        throw new Error("PIN must be at least 4 characters")
      }

      // Mock successful connection
      const deviceTypes = ["Android TV", "iPhone", "iPad", "Windows PC", "Smart TV", "Xbox", "PlayStation"]
      const deviceNames = [
        "Living Room TV",
        "John's iPhone",
        "Sarah's iPad",
        "Home Theater",
        "Bedroom TV",
        "Gaming Console",
      ]

      const randomDevice = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
      const randomName = deviceNames[Math.floor(Math.random() * deviceNames.length)]

      return {
        success: true,
        device: {
          id: "device-" + Date.now(),
          name: randomName,
          type: randomDevice,
          appName: "Jellyfin",
          appVersion: "10.8.13",
          lastSeen: new Date().toISOString(),
          isActive: true,
        },
        user: {
          id: "user-123",
          name: "Connected User",
          hasPassword: true,
        },
      }
    } catch (error) {
      console.warn("Quick Connect PIN linking failed:", error)
      throw error
    }
  }

  async getQuickConnectStatus(secret: string) {
    // Mock status check
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      Authenticated: false,
      Secret: secret,
      Code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    }
  }

  // User management methods
  generateCredentials(planType: string) {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 6)

    return {
      username: `${planType}_user_${randomSuffix}`,
      password: `${planType}Pass${timestamp}`,
      email: `user_${randomSuffix}@jellyfin.local`,
    }
  }

  async createUser(credentials: any, planType: string) {
    // Mock user creation
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      userId: "user-" + Date.now(),
      message: "User created successfully",
    }
  }

  async assignLibrariesToUser(userId: string, planType: string) {
    // Mock library assignment
    await new Promise((resolve) => setTimeout(resolve, 500))

    const libraryAccess = {
      basic: ["movies", "tv"],
      premium: ["movies", "tv", "music"],
      family: ["movies", "tv", "music", "books"],
    }

    return {
      success: true,
      assignedLibraries: libraryAccess[planType as keyof typeof libraryAccess] || ["movies"],
    }
  }
}

export const jellyfinAPI = new JellyfinAPI()
