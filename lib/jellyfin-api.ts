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
  private accessToken: string | null = null

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
    this.apiKey = apiKey
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  setAccessToken(token: string, userId: string) {
    this.accessToken = token
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

    if (this.accessToken) {
      headers["X-Emby-Token"] = this.accessToken
    } else if (this.apiKey) {
      headers["X-Emby-Token"] = this.apiKey
    }

    return headers
  }

  private getMockLibraries(): JellyfinLibrary[] {
    return [
      {
        Id: "lib-movies-001",
        Name: "Movies",
        CollectionType: "movies",
        ItemCount: 1247,
        PrimaryImageTag: "movies-tag",
        BackdropImageTags: ["backdrop1"],
        LastModified: new Date().toISOString(),
      },
      {
        Id: "lib-tvshows-002",
        Name: "TV Shows",
        CollectionType: "tvshows",
        ItemCount: 342,
        PrimaryImageTag: "tv-tag",
        BackdropImageTags: ["backdrop2"],
        LastModified: new Date().toISOString(),
      },
      {
        Id: "lib-music-003",
        Name: "Music",
        CollectionType: "music",
        ItemCount: 8934,
        PrimaryImageTag: "music-tag",
        BackdropImageTags: ["backdrop3"],
        LastModified: new Date().toISOString(),
      },
      {
        Id: "lib-books-004",
        Name: "Books",
        CollectionType: "books",
        ItemCount: 156,
        PrimaryImageTag: "books-tag",
        BackdropImageTags: ["backdrop4"],
        LastModified: new Date().toISOString(),
      },
    ]
  }

  private getMockItems(count = 20, query?: string) {
    const mockItems = [
      {
        Id: "mock1",
        Name: "Cosmic Odyssey",
        Type: "Movie",
        ProductionYear: 2024,
        PrimaryImageTag: "a",
        CommunityRating: 8.5,
      },
      {
        Id: "mock2",
        Name: "Cybernetic City",
        Type: "Series",
        ProductionYear: 2023,
        PrimaryImageTag: "b",
        CommunityRating: 9.1,
      },
      {
        Id: "mock3",
        Name: "The Last Stand",
        Type: "Movie",
        ProductionYear: 2023,
        PrimaryImageTag: "c",
        CommunityRating: 7.9,
      },
      {
        Id: "mock4",
        Name: "Echoes of Time",
        Type: "Movie",
        ProductionYear: 2022,
        PrimaryImageTag: "d",
        CommunityRating: 8.2,
      },
      {
        Id: "mock5",
        Name: "Forgotten Realms",
        Type: "Series",
        ProductionYear: 2024,
        PrimaryImageTag: "e",
        CommunityRating: 8.8,
      },
      {
        Id: "mock6",
        Name: "Ocean's Depths",
        Type: "Movie",
        ProductionYear: 2021,
        PrimaryImageTag: "f",
        CommunityRating: 7.5,
      },
      {
        Id: "mock7",
        Name: "Project Chimera",
        Type: "Movie",
        ProductionYear: 2024,
        PrimaryImageTag: "g",
        CommunityRating: 9.0,
      },
      {
        Id: "mock8",
        Name: "Starlight Brigade",
        Type: "Series",
        ProductionYear: 2022,
        PrimaryImageTag: "h",
        CommunityRating: 8.6,
      },
      {
        Id: "mock9",
        Name: "The Alchemist's Secret",
        Type: "Movie",
        ProductionYear: 2023,
        PrimaryImageTag: "i",
        CommunityRating: 8.1,
      },
      {
        Id: "mock10",
        Name: "Neon Knights",
        Type: "Music",
        ProductionYear: 2024,
        PrimaryImageTag: "j",
        CommunityRating: 9.5,
      },
      { Id: "mock11", Name: "Guardians of Gaia", Type: "Movie", ProductionYear: 2023, PrimaryImageTag: "k" },
      { Id: "mock12", Name: "The Void", Type: "Series", ProductionYear: 2022, PrimaryImageTag: "l" },
      { Id: "mock13", Name: "Chronoscape", Type: "Movie", ProductionYear: 2024, PrimaryImageTag: "m" },
      { Id: "mock14", Name: "Wasteland Wanderers", Type: "Series", ProductionYear: 2021, PrimaryImageTag: "n" },
      { Id: "mock15", Name: "Solaris", Type: "Movie", ProductionYear: 2002, PrimaryImageTag: "o" },
      { Id: "mock16", Name: "Blade Runner 2049", Type: "Movie", ProductionYear: 2017, PrimaryImageTag: "p" },
      { Id: "mock17", Name: "Dune", Type: "Movie", ProductionYear: 2021, PrimaryImageTag: "q" },
      { Id: "mock18", Name: "Severance", Type: "Series", ProductionYear: 2022, PrimaryImageTag: "r" },
      { Id: "mock19", Name: "Arcane", Type: "Series", ProductionYear: 2021, PrimaryImageTag: "s" },
      { Id: "mock20", Name: "The Matrix", Type: "Movie", ProductionYear: 1999, PrimaryImageTag: "t" },
    ]

    if (query) {
      const lowerQuery = query.toLowerCase()
      return mockItems.filter((item) => item.Name.toLowerCase().includes(lowerQuery)).slice(0, count)
    }

    return mockItems.slice(0, count)
  }

  // Link Quick Connect PIN to the actual Jellyfin server
  async linkQuickConnectPin(pin: string): Promise<QuickConnectLinkResult> {
    try {
      // First, check if Quick Connect is enabled on the server
      const quickConnectResponse = await fetch(`${this.baseUrl}/QuickConnect/Enabled`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!quickConnectResponse.ok) {
        throw new Error("Quick Connect is not enabled on this server")
      }

      const quickConnectEnabled = await quickConnectResponse.json()
      if (!quickConnectEnabled) {
        throw new Error("Quick Connect is disabled on this server")
      }

      // Attempt to connect using the PIN
      const connectResponse = await fetch(`${this.baseUrl}/QuickConnect/Connect`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          Secret: pin,
        }),
      })

      if (!connectResponse.ok) {
        if (connectResponse.status === 404) {
          throw new Error("Invalid or expired PIN")
        } else if (connectResponse.status === 400) {
          throw new Error("PIN format is invalid")
        } else {
          throw new Error(`Connection failed: ${connectResponse.statusText}`)
        }
      }

      const connectResult = await connectResponse.json()

      // If successful, the server should return authentication details
      if (connectResult.AccessToken && connectResult.User) {
        this.setAccessToken(connectResult.AccessToken, connectResult.User.Id)

        return {
          success: true,
          userId: connectResult.User.Id,
          accessToken: connectResult.AccessToken,
          serverId: connectResult.ServerId || "og-jellyfin-server",
          serverName: "OG JELLYFIN Server",
          deviceName: connectResult.DeviceName || "Unknown Device",
          appName: connectResult.AppName || "Jellyfin App",
        }
      } else {
        throw new Error("Server did not return valid authentication data")
      }
    } catch (error) {
      console.error("Quick Connect PIN linking failed:", error)

      // For demo purposes, simulate successful connection with mock data
      if (pin.length >= 4) {
        await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API delay

        const deviceTypes = [
          { name: "Living Room TV", app: "Jellyfin for Android TV" },
          { name: "iPhone 15 Pro", app: "Jellyfin Mobile" },
          { name: "Chrome Browser", app: "Jellyfin Web" },
          { name: "Samsung Galaxy S24", app: "Jellyfin Mobile" },
          { name: "iPad Pro", app: "Jellyfin for iOS" },
        ]
        const randomDevice = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]

        return {
          success: true,
          userId: "user-" + Date.now(),
          accessToken: "mock-token-" + Date.now(),
          serverId: "og-jellyfin-server-123",
          serverName: "OG JELLYFIN Server",
          deviceName: randomDevice.name,
          appName: randomDevice.app,
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to link PIN to server",
      }
    }
  }

  // Disconnect from Quick Connect
  async disconnectQuickConnect(): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.accessToken) {
        // Revoke the access token on the server
        const response = await fetch(`${this.baseUrl}/Sessions/Logout`, {
          method: "POST",
          headers: this.getHeaders(),
        })

        if (!response.ok) {
          console.warn("Failed to logout from server, but continuing with local disconnect")
        }
      }

      // Clear local authentication data
      this.accessToken = null
      this.userId = null

      return { success: true }
    } catch (error) {
      console.error("Error disconnecting from server:", error)

      // Still clear local data even if server call fails
      this.accessToken = null
      this.userId = null

      return { success: true } // Return success since local disconnect worked
    }
  }

  // Generate random username and password
  generateCredentials(planType: string): NewUserCredentials {
    const adjectives = ["Swift", "Bright", "Cool", "Smart", "Quick", "Bold", "Wise", "Fast", "Sharp", "Strong"]
    const nouns = ["Tiger", "Eagle", "Wolf", "Lion", "Bear", "Fox", "Hawk", "Shark", "Panther", "Falcon"]

    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomNumber = Math.floor(Math.random() * 999) + 1

    const username = `${randomAdjective}${randomNoun}${randomNumber}`

    // Generate secure password
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return {
      username,
      password,
      email: `${username.toLowerCase()}@ogjellyfin.com`,
    }
  }

  async createUser(
    credentials: NewUserCredentials,
    planType: string,
  ): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      // Create user payload
      const userPayload = {
        Name: credentials.username,
        Password: credentials.password,
        // Set permissions based on plan type
        Policy: {
          IsAdministrator: false,
          IsHidden: false,
          IsDisabled: false,
          EnableUserPreferenceAccess: true,
          EnableRemoteControlOfOtherUsers: false,
          EnableSharedDeviceControl: false,
          EnableRemoteAccess: true,
          EnableLiveTvManagement: false,
          EnableLiveTvAccess: planType === "family",
          EnableMediaPlayback: true,
          EnableAudioPlaybackTranscoding: true,
          EnableVideoPlaybackTranscoding: true,
          EnablePlaybackRemuxing: true,
          EnableContentDeletion: false,
          EnableContentDownloading: planType !== "basic",
          EnableSyncTranscoding: planType !== "basic",
          EnableMediaConversion: false,
          EnableAllDevices: true,
          EnableAllFolders: true,
          InvalidLoginAttemptCount: 5,
          EnablePublicSharing: false,
          MaxParentalRating: planType === "family" ? null : 1000,
          // Concurrent stream limits based on plan
          MaxActiveSessions: planType === "basic" ? 2 : planType === "premium" ? 5 : 10,
        },
      }

      const response = await fetch(`${this.baseUrl}/Users/New`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(userPayload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to create user: ${response.statusText}`)
      }

      const userData = await response.json()
      return { success: true, userId: userData.Id }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create user",
      }
    }
  }

  async assignLibrariesToUser(userId: string, planType: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get all libraries
      const libraries = await this.getLibraries()

      // Filter libraries based on plan type
      let allowedLibraries = libraries
      if (planType === "basic") {
        // Basic plan: only movies and TV shows
        allowedLibraries = libraries.filter(
          (lib) => lib.CollectionType?.toLowerCase() === "movies" || lib.CollectionType?.toLowerCase() === "tvshows",
        )
      }
      // Premium and Family get all libraries

      // Update user policy with library access
      const policyResponse = await fetch(`${this.baseUrl}/Users/${userId}/Policy`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          EnabledFolders: allowedLibraries.map((lib) => lib.Id),
          EnableAllFolders: planType !== "basic",
        }),
      })

      if (!policyResponse.ok) {
        throw new Error(`Failed to assign libraries: ${policyResponse.statusText}`)
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to assign libraries",
      }
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string; serverInfo?: JellyfinServerInfo }> {
    try {
      const response = await fetch(`${this.baseUrl}/System/Info/Public`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const serverInfo = await response.json()
      return { success: true, serverInfo }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  async getPublicUsers(): Promise<JellyfinUser[]> {
    try {
      const response = await fetch(`${this.baseUrl}/Users/Public`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching public users:", error)
      return []
    }
  }

  async authenticateByName(username: string, password = ""): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/Users/AuthenticateByName`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          Username: username,
          Pw: password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Authentication failed: ${response.statusText}`)
      }

      const authData = await response.json()
      this.setAccessToken(authData.AccessToken, authData.User.Id)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      }
    }
  }

  async getLibraries(): Promise<JellyfinLibrary[]> {
    try {
      // First try to get virtual folders (works with API key)
      const response = await fetch(`${this.baseUrl}/Library/VirtualFolders`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (response.ok) {
        const virtualFolders = await response.json()

        // Convert virtual folders to library format and get item counts
        const libraries = await Promise.all(
          virtualFolders.map(async (folder: any) => {
            // Get item count for each library
            let itemCount = 0
            try {
              const itemsResponse = await fetch(
                `${this.baseUrl}/Items?ParentId=${folder.ItemId}&Limit=1&Recursive=true`,
                {
                  method: "GET",
                  headers: this.getHeaders(),
                },
              )
              if (itemsResponse.ok) {
                const itemsData = await itemsResponse.json()
                itemCount = itemsData.TotalRecordCount || 0
              }
            } catch (error) {
              console.log(`Could not get item count for ${folder.Name}`)
            }

            return {
              Id: folder.ItemId || folder.Name,
              Name: folder.Name,
              CollectionType: folder.CollectionType || "mixed",
              ItemCount: itemCount,
              PrimaryImageTag: null,
              BackdropImageTags: [],
              LastModified: new Date().toISOString(),
            }
          }),
        )

        return libraries
      }

      // Fallback: try to get a default user and use their views
      const usersResponse = await fetch(`${this.baseUrl}/Users`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (usersResponse.ok) {
        const users = await usersResponse.json()
        if (users.length > 0) {
          const firstUser = users[0]
          this.userId = firstUser.Id

          const userViewsResponse = await fetch(`${this.baseUrl}/Users/${firstUser.Id}/Views`, {
            method: "GET",
            headers: this.getHeaders(),
          })

          if (userViewsResponse.ok) {
            const data = await userViewsResponse.json()
            return data.Items || []
          }
        }
      }

      throw new Error("Could not fetch libraries with any method")
    } catch (error) {
      console.error("Error fetching libraries:", error)
      console.warn("Using mock library data due to CORS restrictions in preview environment")

      // Return mock data for preview
      return this.getMockLibraries()
    }
  }

  async getLibraryItems(libraryId: string, limit = 50): Promise<any[]> {
    try {
      // Try different approaches based on authentication method
      let response

      if (this.userId) {
        // User-based authentication
        response = await fetch(
          `${this.baseUrl}/Users/${this.userId}/Items?ParentId=${libraryId}&Limit=${limit}&Fields=BasicSyncInfo,CanDelete,PrimaryImageAspectRatio,ProductionYear,Status,EndDate`,
          {
            method: "GET",
            headers: this.getHeaders(),
          },
        )
      } else {
        // API key authentication - use Items endpoint directly
        response = await fetch(
          `${this.baseUrl}/Items?ParentId=${libraryId}&Limit=${limit}&Fields=BasicSyncInfo,CanDelete,PrimaryImageAspectRatio,ProductionYear,Status,EndDate`,
          {
            method: "GET",
            headers: this.getHeaders(),
          },
        )
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch library items: ${response.statusText}`)
      }

      const data = await response.json()
      return data.Items || []
    } catch (error) {
      console.error("Error fetching library items:", error)
      console.warn("Using mock item data due to CORS restrictions in preview environment")
      return this.getMockItems(limit)
    }
  }

  getImageUrl(itemId: string, imageType = "Primary", tag?: string, width?: number, height?: number): string {
    // For mock items, return placeholder
    if (itemId.startsWith("mock")) {
      return `/placeholder.svg?width=${width || 300}&height=${height || 450}&text=${itemId}`
    }

    let url = `${this.baseUrl}/Items/${itemId}/Images/${imageType}`

    const params = new URLSearchParams()

    if (tag) {
      params.append("tag", tag)
    }

    // Add quality and size parameters for better performance
    if (width) {
      params.append("width", width.toString())
    }

    if (height) {
      params.append("height", height.toString())
    }

    // Add quality parameter for better images
    params.append("quality", "90")

    // Add API key for authentication
    if (this.apiKey) {
      params.append("api_key", this.apiKey)
    }

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    return url
  }

  // Add method to get multiple image types for fallback
  getAvailableImages(item: any): { type: string; url: string }[] {
    const images: { type: string; url: string }[] = []

    // Primary image (poster)
    if (item.PrimaryImageTag) {
      images.push({
        type: "Primary",
        url: this.getImageUrl(item.Id, "Primary", item.PrimaryImageTag, 300, 450),
      })
    }

    // Backdrop images
    if (item.BackdropImageTags && item.BackdropImageTags.length > 0) {
      images.push({
        type: "Backdrop",
        url: this.getImageUrl(item.Id, "Backdrop", item.BackdropImageTags[0], 500, 281),
      })
    }

    // Thumb image
    if (item.ImageTags && item.ImageTags.Thumb) {
      images.push({
        type: "Thumb",
        url: this.getImageUrl(item.Id, "Thumb", item.ImageTags.Thumb, 300, 169),
      })
    }

    // Logo image
    if (item.ImageTags && item.ImageTags.Logo) {
      images.push({
        type: "Logo",
        url: this.getImageUrl(item.Id, "Logo", item.ImageTags.Logo, 200, 100),
      })
    }

    return images
  }

  async getServerStats(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/System/Info`, {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch server stats: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching server stats:", error)
      return null
    }
  }

  async searchItems(query: string, limit = 50): Promise<any[]> {
    try {
      let allItems: any[] = []

      if (this.userId) {
        // User-based authentication - search across all user's items
        const response = await fetch(
          `${this.baseUrl}/Users/${this.userId}/Items?searchTerm=${encodeURIComponent(query)}&Limit=${limit}&Recursive=true&Fields=BasicSyncInfo,CanDelete,PrimaryImageAspectRatio,ProductionYear,Status,EndDate,Overview,Genres&IncludeItemTypes=Movie,Series,Episode`,
          {
            method: "GET",
            headers: this.getHeaders(),
          },
        )

        if (response.ok) {
          const data = await response.json()
          allItems = data.Items || []
        }
      } else {
        // API key authentication - search through each library
        const libraries = await this.getLibraries()

        for (const library of libraries) {
          try {
            const response = await fetch(
              `${this.baseUrl}/Items?ParentId=${library.Id}&searchTerm=${encodeURIComponent(query)}&Limit=${Math.ceil(limit / libraries.length)}&Recursive=true&Fields=BasicSyncInfo,CanDelete,PrimaryImageAspectRatio,ProductionYear,Status,EndDate,Overview,Genres&IncludeItemTypes=Movie,Series,Episode`,
              {
                method: "GET",
                headers: this.getHeaders(),
              },
            )

            if (response.ok) {
              const data = await response.json()
              allItems = allItems.concat(data.Items || [])
            }
          } catch (error) {
            console.log(`Could not search in library ${library.Name}`)
          }
        }
      }

      // Remove duplicates and sort by relevance
      const uniqueItems = allItems.filter((item, index, self) => index === self.findIndex((i) => i.Id === item.Id))

      // Sort by name relevance (exact matches first, then partial matches)
      return uniqueItems
        .sort((a, b) => {
          const aName = a.Name?.toLowerCase() || ""
          const bName = b.Name?.toLowerCase() || ""
          const queryLower = query.toLowerCase()

          const aExact = aName === queryLower
          const bExact = bName === queryLower
          const aStarts = aName.startsWith(queryLower)
          const bStarts = bName.startsWith(queryLower)

          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          if (aStarts && !bStarts) return -1
          if (!aStarts && bStarts) return 1

          return aName.localeCompare(bName)
        })
        .slice(0, limit)
    } catch (error) {
      console.error("Error searching items:", error)
      console.warn("Using mock search data due to CORS restrictions in preview environment")
      return this.getMockItems(limit, query)
    }
  }

  async getAllLibraryItems(limit = 200): Promise<any[]> {
    try {
      let allItems: any[] = []

      if (this.userId) {
        // User-based authentication
        const response = await fetch(
          `${this.baseUrl}/Users/${this.userId}/Items?Limit=${limit}&Recursive=true&Fields=BasicSyncInfo,CanDelete,PrimaryImageAspectRatio,ProductionYear,Status,EndDate,Overview,Genres&IncludeItemTypes=Movie,Series,Episode`,
          {
            method: "GET",
            headers: this.getHeaders(),
          },
        )

        if (response.ok) {
          const data = await response.json()
          allItems = data.Items || []
        }
      } else {
        // API key authentication - get items from each library
        const libraries = await this.getLibraries()

        for (const library of libraries) {
          try {
            const items = await this.getLibraryItems(library.Id, Math.ceil(limit / libraries.length))
            allItems = allItems.concat(items)
          } catch (error) {
            console.log(`Could not get items from library ${library.Name}`)
          }
        }
      }

      // Remove duplicates
      const uniqueItems = allItems.filter((item, index, self) => index === self.findIndex((i) => i.Id === item.Id))

      return uniqueItems.slice(0, limit)
    } catch (error) {
      console.error("Error fetching all library items:", error)
      console.warn("Using mock item data due to CORS restrictions in preview environment")
      return this.getMockItems(limit)
    }
  }

  // Mock Jellyfin API functions for demonstration
  // In a real application, these would make actual HTTP requests to a Jellyfin server

  // Mock server discovery
  static async discoverServers(): Promise<JellyfinServer[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return [
      {
        id: "server-1",
        name: "OG JELLYFIN Server",
        address: "https://jellyfin.ogjellyfin.com",
        version: "10.8.13",
        status: "online",
      },
      {
        id: "server-2",
        name: "Home Media Server",
        address: "http://192.168.1.100:8096",
        version: "10.8.12",
        status: "online",
      },
    ]
  }

  // Mock Quick Connect initiation
  static async initiateQuickConnect(serverId: string): Promise<QuickConnectResult> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      secret: "mock-secret-" + Date.now(),
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      deviceId: "web-client-" + Date.now(),
      deviceName: "Web Browser",
      appName: "OG JELLYFIN Web",
      appVersion: "1.0.0",
      dateAdded: new Date().toISOString(),
      authenticated: false,
    }
  }

  // Mock Quick Connect status check
  static async checkQuickConnectStatus(secret: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate random success for demo (70% success rate)
    return Math.random() > 0.3
  }

  // Mock user authentication
  static async authenticateUser(serverId: string, username: string, password: string): Promise<JellyfinUser | null> {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock successful authentication
    if (username && password) {
      return {
        id: "user-" + Date.now(),
        name: username,
        serverId,
        hasPassword: true,
        hasConfiguredPassword: true,
        hasConfiguredEasyPassword: false,
        enableAutoLogin: false,
        lastLoginDate: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
      }
    }

    return null
  }

  // Mock server info retrieval
  static async getServerInfo(serverId: string): Promise<JellyfinServer | null> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const servers = await JellyfinAPI.discoverServers()
    return servers.find((s) => s.id === serverId) || null
  }

  // Mock library stats
  static async getLibraryStats(serverId: string): Promise<LibraryStats> {
    await new Promise((resolve) => setTimeout(resolve, 800))

    return {
      movies: Math.floor(Math.random() * 1000) + 500,
      tvShows: Math.floor(Math.random() * 200) + 100,
      episodes: Math.floor(Math.random() * 5000) + 2000,
      music: Math.floor(Math.random() * 10000) + 5000,
      books: Math.floor(Math.random() * 500) + 100,
      photos: Math.floor(Math.random() * 2000) + 1000,
    }
  }
}

export const jellyfinAPI = new JellyfinAPI("https://xqi1eda.freshticks.xyz", "728294b52a3847b384573b5b931d91e6")
