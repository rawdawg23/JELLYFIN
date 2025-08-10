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
}

export interface NewUserCredentials {
  username: string
  password: string
  email?: string
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
      "X-Emby-Client": "Jellyfin Store",
      "X-Emby-Device-Name": "Web Browser",
      "X-Emby-Device-Id": "jellyfin-store-web",
      "X-Emby-Client-Version": "1.0.0",
    }

    if (this.accessToken) {
      headers["X-Emby-Token"] = this.accessToken
    } else if (this.apiKey) {
      headers["X-Emby-Token"] = this.apiKey
    }

    return headers
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
          EnableAllChannels: true,
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
      return []
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
      return []
    }
  }

  getImageUrl(itemId: string, imageType = "Primary", tag?: string, width?: number, height?: number): string {
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
      return []
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
      return []
    }
  }
}

export const jellyfinAPI = new JellyfinAPI("https://xqi1eda.freshticks.xyz", "728294b52a3847b384573b5b931d91e6")
