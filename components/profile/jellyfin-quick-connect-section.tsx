"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Server,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Settings,
  Users,
  Play,
  Database,
  Shield,
  Clock,
} from "lucide-react"
import { jellyfinAPI } from "@/lib/jellyfin-api"

interface ServerInfo {
  name: string
  version: string
  id: string
  operatingSystem: string
  architecture: string
}

interface ConnectionStatus {
  connected: boolean
  authenticated: boolean
  serverInfo?: ServerInfo
  error?: string
  lastChecked?: Date
}

export function JellyfinQuickConnectSection() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    authenticated: false,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [serverUrl, setServerUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showCredentials, setShowCredentials] = useState(true)

  useEffect(() => {
    // Check connection status on component mount
    checkConnection()
  }, [])

  const checkConnection = async () => {
    if (!serverUrl.trim()) {
      setConnectionStatus({
        connected: false,
        authenticated: false,
        error: "Please enter a server URL first",
        lastChecked: new Date(),
      })
      return
    }

    setIsConnecting(true)
    try {
      const result = await jellyfinAPI.testConnection(serverUrl.trim())

      // Safely extract server info
      let serverInfo: ServerInfo | undefined = undefined
      if (result.serverInfo) {
        serverInfo = {
          name: result.serverInfo.ServerName || result.serverInfo.name || "Unknown Server",
          version: result.serverInfo.Version || result.serverInfo.version || "Unknown",
          id: result.serverInfo.Id || result.serverInfo.id || "unknown-id",
          operatingSystem: result.serverInfo.OperatingSystem || result.serverInfo.operatingSystem || "Unknown",
          architecture: result.serverInfo.Architecture || result.serverInfo.architecture || "Unknown",
        }
      }

      setConnectionStatus({
        connected: result.success,
        authenticated: jellyfinAPI.isAuthenticated(),
        serverInfo,
        error: result.success ? undefined : result.message,
        lastChecked: new Date(),
      })
    } catch (error) {
      setConnectionStatus({
        connected: false,
        authenticated: false,
        error: error instanceof Error ? error.message : "Unknown error",
        lastChecked: new Date(),
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleQuickConnect = async () => {
    if (!serverUrl.trim() || !username.trim() || !password.trim()) {
      setConnectionStatus({
        connected: false,
        authenticated: false,
        error: "Please fill in all connection details (Server URL, Username, and Password)",
        lastChecked: new Date(),
      })
      return
    }

    setIsConnecting(true)
    try {
      const result = await jellyfinAPI.quickConnect(serverUrl.trim(), username.trim(), password.trim())

      if (result.success && result.authData) {
        const serverInfo: ServerInfo = {
          name: result.authData.User?.Name || username || "Jellyfin Server",
          version: "10.8.13",
          id: result.authData.ServerId || "unknown-server-id",
          operatingSystem: "Linux",
          architecture: "X64",
        }

        setConnectionStatus({
          connected: true,
          authenticated: true,
          serverInfo,
          lastChecked: new Date(),
        })

        console.log(`Successfully connected to ${serverUrl} as ${username}`)
      } else {
        setConnectionStatus({
          connected: false,
          authenticated: false,
          error: result.message || "Failed to connect with provided credentials",
          lastChecked: new Date(),
        })
      }
    } catch (error) {
      setConnectionStatus({
        connected: false,
        authenticated: false,
        error: error instanceof Error ? error.message : "Connection failed with provided server details",
        lastChecked: new Date(),
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    jellyfinAPI.logout()
    setConnectionStatus({
      connected: false,
      authenticated: false,
      lastChecked: new Date(),
    })
  }

  const getStatusIcon = () => {
    if (isConnecting) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
    }
    if (connectionStatus.connected && connectionStatus.authenticated) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (connectionStatus.connected) {
      return <Wifi className="h-5 w-5 text-yellow-500" />
    }
    return <WifiOff className="h-5 w-5 text-red-500" />
  }

  const getStatusText = () => {
    if (isConnecting) return "Connecting..."
    if (connectionStatus.connected && connectionStatus.authenticated) return "Connected & Authenticated"
    if (connectionStatus.connected) return "Connected (Not Authenticated)"
    return "Disconnected"
  }

  const getStatusColor = () => {
    if (connectionStatus.connected && connectionStatus.authenticated) return "text-green-600"
    if (connectionStatus.connected) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="border-purple-500/20 bg-gradient-to-br from-card via-card to-purple-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-6 w-6 text-purple-500" />
              <div>
                <CardTitle>Jellyfin Server Connection</CardTitle>
                <CardDescription>Connect to your Jellyfin media server</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Server URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Server URL</label>
            <div className="flex gap-2">
              <Input
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://your-jellyfin-server.com"
                disabled={connectionStatus.authenticated}
                className="bg-background/50 border-purple-500/20"
              />
              <Button
                variant="outline"
                onClick={checkConnection}
                disabled={isConnecting}
                className="border-purple-500/20 hover:bg-purple-500/10 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${isConnecting ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          {/* Credentials Section */}
          {!connectionStatus.authenticated && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Authentication Required</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="text-xs"
                >
                  {showCredentials ? "Hide" : "Show"} Credentials
                </Button>
              </div>

              {showCredentials && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background/30 rounded-lg border border-purple-500/20">
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your Jellyfin username"
                      className="bg-background/50 border-purple-500/20"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Jellyfin password"
                      className="bg-background/50 border-purple-500/20"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connection Actions */}
          <div className="flex gap-2">
            {!connectionStatus.authenticated ? (
              <Button
                onClick={handleQuickConnect}
                disabled={isConnecting || !serverUrl.trim() || !username.trim() || !password.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting to {serverUrl}...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Connect to Server
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="border-red-500/20 hover:bg-red-500/10 text-red-600 bg-transparent"
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Disconnect from {serverUrl}
              </Button>
            )}
          </div>

          {/* Error Display */}
          {connectionStatus.error && (
            <Alert className="border-red-500/20 bg-red-500/5">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-red-600">{connectionStatus.error}</AlertDescription>
            </Alert>
          )}

          {/* Server Information */}
          {connectionStatus.serverInfo && connectionStatus.authenticated && (
            <div className="space-y-4">
              <Separator className="bg-purple-500/20" />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Server Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Server Name:</span>
                      <span className="font-medium">{connectionStatus.serverInfo.name || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Version:</span>
                      <Badge variant="secondary">{connectionStatus.serverInfo.version || "Unknown"}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">OS:</span>
                      <span className="font-medium">{connectionStatus.serverInfo.operatingSystem || "Unknown"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Architecture:</span>
                      <span className="font-medium">{connectionStatus.serverInfo.architecture || "Unknown"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Server ID:</span>
                      <span className="text-xs flex items-center gap-1">
                        {connectionStatus.serverInfo.id && connectionStatus.serverInfo.id.length > 8
                          ? `${connectionStatus.serverInfo.id.slice(0, 8)}...`
                          : connectionStatus.serverInfo.id || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Checked:</span>
                      <span className="text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {connectionStatus.lastChecked?.toLocaleTimeString() || "Never"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {connectionStatus.authenticated && (
            <div className="space-y-4">
              <Separator className="bg-purple-500/20" />
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/20 hover:bg-purple-500/10 bg-transparent"
                  >
                    <Database className="h-4 w-4 mr-1" />
                    Libraries
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/20 hover:bg-purple-500/10 bg-transparent"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Users
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/20 hover:bg-purple-500/10 bg-transparent"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-500/20 hover:bg-purple-500/10 bg-transparent"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Security
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Connection Tips */}
      <Card className="border-blue-500/20 bg-gradient-to-br from-card via-card to-blue-500/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Connection Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Make sure your Jellyfin server is running and accessible</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Use HTTPS URLs for secure connections</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Check firewall settings if connection fails</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Ensure your credentials are correct</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Server must be accessible from your network</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
