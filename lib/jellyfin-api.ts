// Jellyfin API Integration with Real Server Support
export interface JellyfinServer {
  id: string
  name: string
  url: string
  version: string
  status: "online" | "offline" | "maintenance"
  lastSeen: Date
  users?: number
  libraries?: number
  cpu?: number
  memory?: number
  storage?: number
  activeStreams?: number
}

export interface JellyfinUser {
  id: string
  name: string
  serverId: string
  hasPassword: boolean
  hasConfiguredPassword: boolean
  hasConfiguredEasyPassword: boolean
  enableAutoLogin: boolean
  lastLoginDate?: string
  lastActivityDate?: string
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

export interface ServerInfo {
  name: string
  version: string
  id: string
  operatingSystem: string
  serverName: string
  localAddress: string
  startupWizardCompleted: boolean
}

class JellyfinAPI {
  private baseUrl: string
  private apiKey: string
  private demoMode: boolean

  constructor(baseUrl: string, apiKey: string, demoMode = false) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
    this.apiKey = apiKey
    this.demoMode = demoMode
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (this.demoMode) {
      return this.getDemoResponse(endpoint)
    }

    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      "X-Emby-Token": this.apiKey,
      "Content-Type": "application/json",
      ...options.headers,
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
      console.error(`Jellyfin API Error (${endpoint}):`, error)
      throw error
    }
  }

  private getDemoResponse(endpoint: string): any {
    // Demo responses for testing
    if (endpoint.includes("/System/Info")) {
      return {
        name: "Demo Jellyfin Server",
        version: "10.8.13",
        id: "demo-server-id",
        operatingSystem: "Linux",
        serverName: "Demo Server",
        localAddress: "http://localhost:8096",
        startupWizardCompleted: true,
      }
    }

    if (endpoint.includes("/QuickConnect/Enabled")) {
      return true
    }

    if (endpoint.includes("/QuickConnect/Initiate")) {
      return {
        secret: "demo-secret-123",
        code: "123456",
        deviceId: "demo-device",
        deviceName: "Demo Device",
        appName: "OG Jellyfin",
        appVersion: "1.0.0",
        dateAdded: new Date().toISOString(),
        authenticated: false,
      }
    }

    if (endpoint.includes("/Users")) {
      return [
        {
          id: "demo-user-1",
          name: "Demo User",
          serverId: "demo-server",
          hasPassword: true,
          hasConfiguredPassword: true,
          hasConfiguredEasyPassword: false,
          enableAutoLogin: false,
          lastLoginDate: new Date().toISOString(),
          lastActivityDate: new Date().toISOString(),
        },
      ]
    }

    return {}
  }

  async checkServerInfo(): Promise<ServerInfo> {
    return await this.makeRequest("/System/Info")
  }

  async checkQuickConnectSupport(): Promise<boolean> {
    try {
      const result = await this.makeRequest("/QuickConnect/Enabled")
      return result === true || result === "true"
    } catch (error) {
      return false
    }
  }

  async initiateQuickConnect(): Promise<QuickConnectResult> {
    return await this.makeRequest("/QuickConnect/Initiate", {
      method: "POST",
    })
  }

  async checkQuickConnectStatus(secret: string): Promise<QuickConnectResult> {
    return await this.makeRequest(`/QuickConnect/Connect?secret=${secret}`)
  }

  async getUsers(): Promise<JellyfinUser[]> {
    return await this.makeRequest("/Users")
  }

  async getLibraries(): Promise<any[]> {
    return await this.makeRequest("/Library/VirtualFolders")
  }

  async getSystemStatus(): Promise<any> {
    return await this.makeRequest("/System/Info")
  }
}

// Real server instance with your credentials
export const jellyfinAPI = new JellyfinAPI("https://xqi1eda.freshticks.xyz:443", "728294b52a3847b384573b5b931d91e6")

// Alternative export name for compatibility
export const realJellyfinAPI = jellyfinAPI

// Demo server instance for testing
export const demoJellyfinAPI = new JellyfinAPI("http://localhost:8096", "demo-key", true)

// Demo servers data with your real server included
export const DEMO_SERVERS: JellyfinServer[] = [
  {
    id: "real-server-1",
    name: "XQI1EDA Jellyfin Server",
    url: "https://xqi1eda.freshticks.xyz:443",
    version: "10.8.13",
    status: "online",
    lastSeen: new Date(),
    users: 5,
    libraries: 8,
    cpu: 25,
    memory: 45,
    storage: 67,
    activeStreams: 2,
  },
  {
    id: "demo-server-1",
    name: "Home Media Server",
    url: "http://192.168.1.100:8096",
    version: "10.8.13",
    status: "online",
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    users: 4,
    libraries: 6,
    cpu: 15,
    memory: 32,
    storage: 45,
    activeStreams: 1,
  },
  {
    id: "demo-server-2",
    name: "Office Jellyfin",
    url: "http://office.local:8096",
    version: "10.8.12",
    status: "maintenance",
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    users: 8,
    libraries: 12,
    cpu: 0,
    memory: 0,
    storage: 78,
    activeStreams: 0,
  },
  {
    id: "demo-server-3",
    name: "Remote Server",
    url: "https://jellyfin.example.com",
    version: "10.8.11",
    status: "offline",
    lastSeen: new Date(Date.now() - 24 * 60 * 60 * 1000),
    users: 2,
    libraries: 4,
    cpu: 0,
    memory: 0,
    storage: 23,
    activeStreams: 0,
  },
]

// Factory function for creating new API instances
export function createJellyfinAPI(baseUrl: string, apiKey: string, demoMode = false): JellyfinAPI {
  return new JellyfinAPI(baseUrl, apiKey, demoMode)
}

// Default export for the main API class
export default JellyfinAPI

// Utility functions
export function getServerStatusBadge(status: string): string {
  switch (status) {
    case "online":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    case "maintenance":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    case "offline":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }
}

export function formatLastSeen(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function getServerHealthColor(cpu: number, memory: number): string {
  const avgUsage = (cpu + memory) / 2
  if (avgUsage < 30) return "text-green-400"
  if (avgUsage < 70) return "text-yellow-400"
  return "text-red-400"
}
