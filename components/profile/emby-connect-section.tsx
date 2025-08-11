"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Zap,
  User,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Database,
  Play,
  Users,
} from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export function EmbyConnectSection() {
  const { user, connectEmby, disconnectEmby } = useAuth()
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const success = await connectEmby(credentials.username, credentials.password)
      if (success) {
        setCredentials({ username: "", password: "" })
      } else {
        setError("Failed to connect to Emby server. Please check your credentials.")
      }
    } catch (error) {
      setError("Connection failed. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnectEmby()
    setCredentials({ username: "", password: "" })
    setError(null)
  }

  const isConnected = user?.embyConnect?.connected || false

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-blue-600/10 opacity-50" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Emby Connect</CardTitle>
              <CardDescription className="text-white/60">
                Connect to your Emby server for additional media access
              </CardDescription>
            </div>
          </div>
          <Badge
            className={
              isConnected
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-gray-500/20 text-gray-400 border-gray-500/30"
            }
          >
            {isConnected ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Disconnected
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {error && (
          <Alert className="bg-red-500/20 border-red-500/30">
            <XCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Connect to Emby Server</h4>
              <p className="text-white/70">
                Enter your Emby server credentials to connect and access your media library.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emby-username" className="text-white">
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      id="emby-username"
                      type="text"
                      placeholder="Enter your Emby username"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emby-password" className="text-white">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      id="emby-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your Emby password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white/50 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleConnect}
                disabled={isConnecting || !credentials.username || !credentials.password}
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl h-12"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Connect to Emby
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
              <h5 className="text-white font-medium mb-2">What is Emby?</h5>
              <p className="text-white/70 text-sm">
                Emby is a media server that organizes your personal media collection and streams it to your devices.
                Connect your Emby account to access additional content alongside your Jellyfin library.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Alert className="bg-green-500/20 border-green-500/30">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Successfully connected to Emby server! You can now access your Emby media library.
              </AlertDescription>
            </Alert>

            {/* Connection Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Connection Details</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Username</span>
                  </div>
                  <p className="text-white/80">{user?.embyConnect?.username}</p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Server className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Server</span>
                  </div>
                  <p className="text-white/80">{user?.embyConnect?.serverName}</p>
                </div>
              </div>

              {/* Library Stats */}
              {user?.embyConnect?.libraries && user.embyConnect.libraries.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-white font-medium">Available Libraries</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {user.embyConnect.libraries.slice(0, 4).map((library: any, index: number) => (
                      <div key={index} className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                        <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                          {library.CollectionType === "movies" ? (
                            <Play className="w-4 h-4 text-white" />
                          ) : library.CollectionType === "tvshows" ? (
                            <Database className="w-4 h-4 text-white" />
                          ) : (
                            <Users className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="text-sm font-medium text-white">{library.Name}</div>
                        <div className="text-xs text-white/60">{library.CollectionType || "Mixed"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => window.open("https://emby.media/", "_blank")}
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
              >
                <Server className="w-4 h-4 mr-2" />
                Emby Dashboard
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-xl"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
