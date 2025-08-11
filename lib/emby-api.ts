// Emby API integration for OG Jellyfin platform
const EMBY_SERVER_URL = "https://i5ioea5.freshticks.xyz"

interface EmbyUser {
  Id: string
  Name: string
  ServerId: string
  HasPassword: boolean
  HasConfiguredPassword: boolean
  HasConfiguredEasyPassword: boolean
  EnableAutoLogin: boolean
  LastLoginDate: string
  LastActivityDate: string
  Configuration: {
    PlayDefaultAudioTrack: boolean
    SubtitleLanguagePreference: string
    DisplayMissingEpisodes: boolean
    GroupedFolders: string[]
    SubtitleMode: string
    DisplayCollectionsView: boolean
    EnableLocalPassword: boolean
    OrderedViews: string[]
    LatestItemsExcludes: string[]
    MyMediaExcludes: string[]
    HidePlayedInLatest: boolean
    RememberAudioSelections: boolean
    RememberSubtitleSelections: boolean
    EnableNextEpisodeAutoPlay: boolean
  }
  Policy: {
    IsAdministrator: boolean
    IsHidden: boolean
    IsDisabled: boolean
    MaxParentalRating: number
    BlockedTags: string[]
    EnableUserPreferenceAccess: boolean
    AccessSchedules: any[]
    BlockUnratedItems: string[]
    EnableRemoteControlOfOtherUsers: boolean
    EnableSharedDeviceControl: boolean
    EnableRemoteAccess: boolean
    EnableLiveTvManagement: boolean
    EnableLiveTvAccess: boolean
    EnableMediaPlayback: boolean
    EnableAudioPlaybackTranscoding: boolean
    EnableVideoPlaybackTranscoding: boolean
    EnablePlaybackRemuxing: boolean
    ForceRemoteSourceTranscoding: boolean
    EnableContentDeletion: boolean
    EnableContentDeletionFromFolders: string[]
    EnableContentDownloading: boolean
    EnableSyncTranscoding: boolean
    EnableMediaConversion: boolean
    EnabledDevices: string[]
    EnableAllDevices: boolean
    EnabledChannels: string[]
    EnableAllChannels: boolean
    EnabledFolders: string[]
    EnableAllFolders: boolean
    InvalidLoginAttemptCount: number
    LoginAttemptsBeforeLockout: number
    MaxActiveSessions: number
    EnablePublicSharing: boolean
    BlockedMediaFolders: string[]
    BlockedChannels: string[]
    RemoteClientBitrateLimit: number
    AuthenticationProviderId: string
    PasswordResetProviderId: string
    SyncPlayAccess: string
  }
}

interface AuthenticationResult {
  User: EmbyUser
  SessionInfo: {
    PlayState: any
    AdditionalUsers: any[]
    Capabilities: any
    RemoteEndPoint: string
    Id: string
    UserId: string
    UserName: string
    Client: string
    LastActivityDate: string
    LastPlaybackCheckIn: string
    DeviceName: string
    DeviceId: string
    ApplicationVersion: string
    IsActive: boolean
    SupportsMediaControl: boolean
    SupportsRemoteControl: boolean
    NowPlayingItem: any
    NowPlayingQueueFullItems: any[]
    HasCustomDeviceName: boolean
    PlaylistItemId: string
    ServerId: string
    UserPrimaryImageTag: string
    SupportedCommands: string[]
    TranscodingInfo: any
  }
  AccessToken: string
  ServerId: string
}

class EmbyAPI {
  private baseUrl: string
  private accessToken: string | null = null
  private userId: string | null = null

  constructor(serverUrl: string = EMBY_SERVER_URL) {
    this.baseUrl = serverUrl
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Emby-Authorization": `MediaBrowser Client="OG Jellyfin Web", Device="Web Browser", DeviceId="${this.generateDeviceId()}", Version="1.0.0"`,
      ...((options.headers as Record<string, string>) || {}),
    }

    if (this.accessToken) {
      headers["X-Emby-Token"] = this.accessToken
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }

      return await response.text()
    } catch (error) {
      console.error(`Emby API Error (${endpoint}):`, error)
      throw error
    }
  }

  private generateDeviceId(): string {
    // Generate a consistent device ID for this browser session
    let deviceId = localStorage.getItem("emby-device-id")
    if (!deviceId) {
      deviceId = "web-" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("emby-device-id", deviceId)
    }
    return deviceId
  }

  async getServerInfo(): Promise<any> {
    try {
      return await this.makeRequest("/System/Info/Public")
    } catch (error) {
      console.error("Failed to get Emby server info:", error)
      return null
    }
  }

  async authenticateUser(
    username: string,
    password: string,
  ): Promise<{ success: boolean; user?: EmbyUser; accessToken?: string; error?: string }> {
    try {
      const result: AuthenticationResult = await this.makeRequest("/Users/AuthenticateByName", {
        method: "POST",
        body: JSON.stringify({
          Username: username,
          Pw: password,
        }),
      })

      this.accessToken = result.AccessToken
      this.userId = result.User.Id

      // Store authentication info
      localStorage.setItem("emby-access-token", result.AccessToken)
      localStorage.setItem("emby-user-id", result.User.Id)

      return {
        success: true,
        user: result.User,
        accessToken: result.AccessToken,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      }
    }
  }

  async getLibraries(userId?: string): Promise<any[]> {
    try {
      // Return mock data if not authenticated
      if (!this.accessToken || !this.userId) {
        return [
          {
            Id: "emby-movies",
            Name: "Movies",
            Type: "movies",
            ItemCount: 890,
            PrimaryImageTag: null,
          },
          {
            Id: "emby-tv",
            Name: "TV Shows",
            Type: "tvshows",
            ItemCount: 220,
            PrimaryImageTag: null,
          },
          {
            Id: "emby-music",
            Name: "Music",
            Type: "music",
            ItemCount: 3400,
            PrimaryImageTag: null,
          },
        ]
      }

      const targetUserId = userId || this.userId
      const result = await this.makeRequest(`/Users/${targetUserId}/Views`)
      return result.Items || []
    } catch (error) {
      console.error("Failed to get Emby libraries:", error)
      // Return mock data on error
      return [
        {
          Id: "emby-movies",
          Name: "Movies",
          Type: "movies",
          ItemCount: 890,
          PrimaryImageTag: null,
        },
        {
          Id: "emby-tv",
          Name: "TV Shows",
          Type: "tvshows",
          ItemCount: 220,
          PrimaryImageTag: null,
        },
      ]
    }
  }

  async searchItems(query: string, limit = 20): Promise<any[]> {
    try {
      // Return mock search results if not authenticated
      if (!this.accessToken || !this.userId) {
        const mockResults = [
          {
            Id: "emby-mock-1",
            Name: "Avengers: Endgame",
            Type: "Movie",
            ProductionYear: 2019,
            PrimaryImageTag: null,
          },
          {
            Id: "emby-mock-2",
            Name: "Stranger Things",
            Type: "Series",
            ProductionYear: 2016,
            PrimaryImageTag: null,
          },
          {
            Id: "emby-mock-3",
            Name: "The Dark Knight",
            Type: "Movie",
            ProductionYear: 2008,
            PrimaryImageTag: null,
          },
        ].filter((item) => item.Name.toLowerCase().includes(query.toLowerCase()))

        return mockResults.slice(0, limit)
      }

      const result = await this.makeRequest(
        `/Users/${this.userId}/Items?searchTerm=${encodeURIComponent(query)}&Limit=${limit}&Fields=BasicSyncInfo,PrimaryImageAspectRatio,ProductionYear&IncludeItemTypes=Movie,Series,Episode,Audio,Book`,
      )
      return result.Items || []
    } catch (error) {
      console.error("Failed to search Emby items:", error)
      return []
    }
  }

  async getLibraryItems(libraryId: string, limit = 50): Promise<any[]> {
    try {
      if (!this.accessToken || !this.userId) {
        // Return mock items for demo
        return Array.from({ length: Math.min(limit, 15) }, (_, i) => ({
          Id: `emby-mock-item-${i}`,
          Name: `Emby Demo Item ${i + 1}`,
          Type: "Movie",
          ProductionYear: 2018 + (i % 6),
          PrimaryImageTag: null,
        }))
      }

      const result = await this.makeRequest(
        `/Users/${this.userId}/Items?ParentId=${libraryId}&Limit=${limit}&Fields=BasicSyncInfo,CanDelete,PrimaryImageAspectRatio,ProductionYear,Status,EndDate`,
      )
      return result.Items || []
    } catch (error) {
      console.error("Failed to get Emby library items:", error)
      return []
    }
  }

  getImageUrl(itemId: string, imageType = "Primary", tag?: string): string | null {
    if (!itemId || itemId.startsWith("emby-mock-")) {
      return null
    }

    if (!tag) {
      return null
    }

    return `${this.baseUrl}/Items/${itemId}/Images/${imageType}?tag=${tag}`
  }

  isAuthenticated(): boolean {
    return !!(this.accessToken && this.userId)
  }

  logout(): void {
    this.accessToken = null
    this.userId = null
    localStorage.removeItem("emby-access-token")
    localStorage.removeItem("emby-user-id")
  }

  // Initialize from stored credentials
  init(): void {
    const storedToken = localStorage.getItem("emby-access-token")
    const storedUserId = localStorage.getItem("emby-user-id")

    if (storedToken && storedUserId) {
      this.accessToken = storedToken
      this.userId = storedUserId
    }
  }
}

export const embyAPI = new EmbyAPI()

// Initialize on import
embyAPI.init()
