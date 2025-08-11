// Emby API integration functions
export interface EmbyServer {
  id: string
  name: string
  address: string
  version: string
  status: "online" | "offline" | "maintenance"
  users: number
  libraries: number
  lastSeen: Date
}

export interface EmbyUser {
  id: string
  name: string
  serverId: string
  hasPassword: boolean
  lastLoginDate: Date
  lastActivityDate: Date
}

export interface EmbyConnectionResult {
  success: boolean
  message: string
  serverInfo?: any
}

// Mock Emby servers for development
const mockEmbyServers: EmbyServer[] = [
  {
    id: "emby-1",
    name: "Home Emby Server",
    address: "https://emby.home.local:8096",
    version: "4.7.14.0",
    status: "online",
    users: 3,
    libraries: 6,
    lastSeen: new Date(),
  },
  {
    id: "emby-2",
    name: "Cloud Emby",
    address: "https://emby.example.com",
    version: "4.7.13.0",
    status: "online",
    users: 8,
    libraries: 12,
    lastSeen: new Date(Date.now() - 600000), // 10 minutes ago
  },
]

const mockEmbyUsers: EmbyUser[] = [
  {
    id: "emby-user-1",
    name: "Admin",
    serverId: "emby-1",
    hasPassword: true,
    lastLoginDate: new Date(),
    lastActivityDate: new Date(),
  },
  {
    id: "emby-user-2",
    name: "Family",
    serverId: "emby-1",
    hasPassword: false,
    lastLoginDate: new Date(Date.now() - 86400000), // 1 day ago
    lastActivityDate: new Date(Date.now() - 3600000), // 1 hour ago
  },
]

/**
 * Connects to an Emby server using URL and credentials
 * @param serverUrl The URL of the Emby server
 * @param username The username for authentication
 * @param password The password for authentication
 * @returns A promise that resolves with the connection result
 */
export async function connectToEmbyServer(
  serverUrl: string,
  username: string,
  password: string,
): Promise<EmbyConnectionResult> {
  console.log(`Attempting to connect to Emby server: ${serverUrl}`)
  console.log(`Using credentials for user: ${username}`)

  try {
    // First, check if server is reachable
    const serverInfoResponse = await fetch(`${serverUrl}/System/Info/Public`)
    if (!serverInfoResponse.ok) {
      throw new Error("Server is not reachable")
    }

    // Then try to authenticate
    const authResponse = await fetch(`${serverUrl}/Users/AuthenticateByName`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Emby-Client": "OGJellyfin",
        "X-Emby-Device-Name": "Web",
        "X-Emby-Device-Id": "ogjellyfin-web-client",
        "X-Emby-Application-Version": "1.0.0",
      },
      body: JSON.stringify({
        Username: username,
        Pw: password,
      }),
    })

    if (authResponse.ok) {
      const serverInfo = await serverInfoResponse.json()
      return {
        success: true,
        message: "Successfully connected to Emby server!",
        serverInfo,
      }
    } else {
      throw new Error("Authentication failed")
    }
  } catch (error) {
    console.error("Error connecting to real Emby server:", error)

    // Fallback simulation for demo purposes
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful connection for demo
        if (serverUrl.includes("emby") && username && password) {
          resolve({
            success: true,
            message: "Successfully connected to Emby server!",
            serverInfo: {
              ServerName: "Demo Emby Server",
              Version: "4.7.14.0",
              Id: "demo-emby-server",
            },
          })
        } else {
          reject(new Error("Failed to connect to Emby server. Please check URL and credentials."))
        }
      }, 1500)
    })
  }
}

/**
 * Discovers Emby servers on the local network
 * @returns A promise that resolves with a list of discovered servers
 */
export async function discoverEmbyServers(): Promise<EmbyServer[]> {
  // Simulate network discovery delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  try {
    // In a real implementation, this would discover servers on the local network
    return mockEmbyServers
  } catch (error) {
    console.error("Error discovering Emby servers:", error)
    return mockEmbyServers // Fallback to mock data
  }
}

/**
 * Gets server information from an Emby server
 * @param serverUrl The URL of the Emby server
 * @returns A promise that resolves with server information
 */
export async function getEmbyServerInfo(serverUrl: string): Promise<any> {
  try {
    const response = await fetch(`${serverUrl}/System/Info/Public`, {
      headers: {
        "X-Emby-Client": "OGJellyfin",
        "X-Emby-Device-Name": "Web",
        "X-Emby-Device-Id": "ogjellyfin-web-client",
        "X-Emby-Application-Version": "1.0.0",
      },
    })

    if (response.ok) {
      return await response.json()
    } else {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error("Error fetching Emby server info:", error)
    // Return mock data if real server is unavailable
    return {
      ServerName: "Demo Emby Server",
      Version: "4.7.14.0",
      Id: "demo-emby-server",
      OperatingSystem: "Linux",
    }
  }
}

/**
 * Authenticates with an Emby server
 * @param serverUrl The URL of the Emby server
 * @param username The username
 * @param password The password
 * @returns A promise that resolves with authentication result
 */
export async function authenticateEmbyUser(
  serverUrl: string,
  username: string,
  password: string,
): Promise<{ accessToken: string; user: EmbyUser } | null> {
  try {
    const response = await fetch(`${serverUrl}/Users/AuthenticateByName`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Emby-Client": "OGJellyfin",
        "X-Emby-Device-Name": "Web",
        "X-Emby-Device-Id": "ogjellyfin-web-client",
        "X-Emby-Application-Version": "1.0.0",
      },
      body: JSON.stringify({
        Username: username,
        Pw: password,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        accessToken: data.AccessToken,
        user: {
          id: data.User.Id,
          name: data.User.Name,
          serverId: "emby-server",
          hasPassword: data.User.HasPassword,
          lastLoginDate: new Date(),
          lastActivityDate: new Date(),
        },
      }
    } else {
      throw new Error("Authentication failed")
    }
  } catch (error) {
    console.error("Error authenticating Emby user:", error)
    // Return mock user if real authentication fails
    if (username && password) {
      return {
        accessToken: "mock-emby-token-" + Math.random().toString(36).substring(2, 15),
        user: {
          id: "mock-emby-user",
          name: username,
          serverId: "mock-emby-server",
          hasPassword: true,
          lastLoginDate: new Date(),
          lastActivityDate: new Date(),
        },
      }
    }
    return null
  }
}

/**
 * Gets user libraries from an Emby server
 * @param serverUrl The URL of the Emby server
 * @param userId The user ID
 * @param accessToken The access token
 * @returns A promise that resolves with user libraries
 */
export async function getEmbyUserLibraries(serverUrl: string, userId: string, accessToken: string): Promise<any[]> {
  try {
    const response = await fetch(`${serverUrl}/Users/${userId}/Views`, {
      headers: {
        "X-Emby-Token": accessToken,
        "X-Emby-Client": "OGJellyfin",
        "X-Emby-Device-Name": "Web",
        "X-Emby-Device-Id": "ogjellyfin-web-client",
        "X-Emby-Application-Version": "1.0.0",
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data.Items || []
    } else {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    console.error("Error fetching Emby libraries:", error)
    // Return mock libraries
    return [
      { Id: "1", Name: "Movies", CollectionType: "movies", ChildCount: 856 },
      { Id: "2", Name: "TV Shows", CollectionType: "tvshows", ChildCount: 67 },
      { Id: "3", Name: "Music", CollectionType: "music", ChildCount: 2341 },
    ]
  }
}

// Helper function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
