// Jellyfin API utility functions
export interface JellyfinLibrary {
  Id: string
  Name: string
  CollectionType: string
  ItemCount: number
  PrimaryImageTag?: string
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
  ServerId: string
  HasPassword: boolean
  HasConfiguredPassword: boolean
  HasConfiguredEasyPassword: boolean
  EnableAutoLogin: boolean
  LastLoginDate: string
  LastActivityDate: string
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
  Secret: string
  Code: string
  DeviceId: string
  DeviceName: string
  AppName: string
  AppVersion: string
  DateAdded: string
  Authenticated: boolean
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

export interface JellyfinItem {
  Id: string
  Name: string
  Type: string
  ProductionYear?: number
  PrimaryImageTag?: string
  BackdropImageTags?: string[]
  Overview?: string
  CommunityRating?: number
  RunTimeTicks?: number
}

class JellyfinAPI {
  private baseUrl = "https://xqi1eda.freshticks.xyz"
  private apiKey = ""
  private userId = ""

  // Mock delay to simulate network requests
  private async mockDelay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getLibraries(): Promise<JellyfinLibrary[]> {
    await this.mockDelay(300)
    return [
      {
        Id: "lib1",
        Name: "Movies",
        CollectionType: "movies",
        ItemCount: 1247,
        PrimaryImageTag: "movies-thumb",
      },
      {
        Id: "lib2",
        Name: "TV Shows",
        CollectionType: "tvshows",
        ItemCount: 89,
        PrimaryImageTag: "tv-thumb",
      },
      {
        Id: "lib3",
        Name: "Music",
        CollectionType: "music",
        ItemCount: 3456,
        PrimaryImageTag: "music-thumb",
      },
      {
        Id: "lib4",
        Name: "Books",
        CollectionType: "books",
        ItemCount: 234,
        PrimaryImageTag: "books-thumb",
      },
    ]
  }

  async searchItems(query: string, limit = 20): Promise<JellyfinItem[]> {
    await this.mockDelay(800)

    if (!query.trim()) return []

    // Filter mock results based on query
    const filtered = [
      {
        Id: "item1",
        Name: "The Matrix",
        Type: "Movie",
        ProductionYear: 1999,
        PrimaryImageTag: "matrix-thumb",
        Overview: "A computer programmer discovers reality is a simulation.",
        CommunityRating: 8.7,
      },
      {
        Id: "item2",
        Name: "Breaking Bad",
        Type: "Series",
        ProductionYear: 2008,
        PrimaryImageTag: "bb-thumb",
        Overview: "A chemistry teacher turns to cooking meth.",
        CommunityRating: 9.5,
      },
      {
        Id: "item3",
        Name: "Bohemian Rhapsody",
        Type: "Audio",
        ProductionYear: 1975,
        PrimaryImageTag: "queen-thumb",
        Overview: "Classic rock anthem by Queen.",
      },
    ].filter(
      (item) =>
        item.Name.toLowerCase().includes(query.toLowerCase()) || item.Type.toLowerCase().includes(query.toLowerCase()),
    )

    // Add some dynamic results based on query
    const dynamicResults: JellyfinItem[] = []
    const queryLower = query.toLowerCase()

    if (queryLower.includes("movie") || queryLower.includes("film")) {
      dynamicResults.push({
        Id: `movie-${Date.now()}`,
        Name: `${query} Movie Collection`,
        Type: "Movie",
        ProductionYear: 2023,
        Overview: `Movies matching "${query}"`,
      })
    }

    if (queryLower.includes("music") || queryLower.includes("song")) {
      dynamicResults.push({
        Id: `music-${Date.now()}`,
        Name: `${query} Playlist`,
        Type: "Audio",
        ProductionYear: 2023,
        Overview: `Music matching "${query}"`,
      })
    }

    return [...filtered, ...dynamicResults].slice(0, limit)
  }

  getImageUrl(itemId: string, imageType: string, tag?: string, width?: number, height?: number): string {
    // Return placeholder images for consistent UI
    const imageMap: { [key: string]: string } = {
      lib1: "/diverse-movie-collection.png",
      lib2: "/tv-shows-collection.png",
      lib3: "/diverse-music-collection.png",
      lib4: "/books-collection.png",
      item1: "/diverse-movie-collection.png",
      item2: "/tv-shows-collection.png",
      item3: "/diverse-music-collection.png",
    }

    return imageMap[itemId] || "/placeholder.svg"
  }

  // Quick Connect functionality
  async initiateQuickConnect(): Promise<QuickConnectResult> {
    await this.mockDelay(1000)

    const code = Math.random().toString().substr(2, 6)

    return {
      Secret: `secret-${Date.now()}`,
      Code: code,
      DeviceId: `device-${Date.now()}`,
      DeviceName: "Web Browser",
      AppName: "OG Jellyfin Store",
      AppVersion: "1.0.0",
      DateAdded: new Date().toISOString(),
      Authenticated: false,
    }
  }

  async checkQuickConnect(secret: string): Promise<{ Authenticated: boolean; AccessToken?: string }> {
    await this.mockDelay(2000)

    // Simulate different outcomes based on secret
    const random = Math.random()

    if (random > 0.7) {
      return {
        Authenticated: true,
        AccessToken: `token-${Date.now()}`,
      }
    }

    return { Authenticated: false }
  }

  // User management
  generateCredentials(planType: string): { username: string; password: string; email: string } {
    const timestamp = Date.now()
    const planPrefix = planType.substring(0, 3).toLowerCase()

    return {
      username: `${planPrefix}user${timestamp}`,
      password: this.generateSecurePassword(),
      email: `${planPrefix}user${timestamp}@ogjellyfin.com`,
    }
  }

  private generateSecurePassword(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  async createUser(
    credentials: { username: string; password: string; email: string },
    planType: string,
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    await this.mockDelay(2000)

    // Simulate occasional failures for realistic testing
    if (Math.random() > 0.9) {
      return {
        success: false,
        error: "Username already exists",
      }
    }

    return {
      success: true,
      userId: `user-${Date.now()}`,
    }
  }

  async assignLibrariesToUser(userId: string, planType: string): Promise<boolean> {
    await this.mockDelay(1000)

    // Different plans get different library access
    const libraryAccess = {
      basic: ["Movies", "TV Shows"],
      premium: ["Movies", "TV Shows", "Music"],
      family: ["Movies", "TV Shows", "Music", "Books"],
    }

    console.log(`Assigned libraries to ${userId}:`, libraryAccess[planType as keyof typeof libraryAccess])
    return true
  }

  // Server info
  async getServerInfo(): Promise<{ ServerName: string; Version: string; Id: string }> {
    await this.mockDelay(500)

    return {
      ServerName: "OG Jellyfin Server",
      Version: "10.8.13",
      Id: "server-og-jellyfin",
    }
  }

  // Authentication
  async authenticateUser(
    username: string,
    password: string,
  ): Promise<{ AccessToken?: string; User?: JellyfinUser; error?: string }> {
    await this.mockDelay(1500)

    // Mock authentication - accept any non-empty credentials
    if (!username.trim() || !password.trim()) {
      return { error: "Username and password are required" }
    }

    // Simulate occasional auth failures
    if (Math.random() > 0.8) {
      return { error: "Invalid username or password" }
    }

    const user: JellyfinUser = {
      Id: `user-${Date.now()}`,
      Name: username,
      ServerId: "server-og-jellyfin",
      HasPassword: true,
      HasConfiguredPassword: true,
      HasConfiguredEasyPassword: false,
      EnableAutoLogin: false,
      LastLoginDate: new Date().toISOString(),
      LastActivityDate: new Date().toISOString(),
    }

    return {
      AccessToken: `token-${Date.now()}`,
      User: user,
    }
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now()
    await this.mockDelay(Math.random() * 1000 + 500)
    const latency = Date.now() - startTime

    // Simulate occasional connection issues
    if (Math.random() > 0.85) {
      return {
        success: false,
        message: "Connection timeout - server may be busy",
      }
    }

    return {
      success: true,
      message: "Connected successfully to OG Jellyfin Server",
      latency,
    }
  }
}

export const jellyfinAPI = new JellyfinAPI()
