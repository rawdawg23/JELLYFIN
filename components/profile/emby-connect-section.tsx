"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Star,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Link,
  Unlink,
  AlertCircle,
  Sparkles,
  Shield,
  Clock,
  Server,
} from "lucide-react"

interface EmbyConnection {
  id: string
  serverName: string
  serverUrl: string
  username: string
  connectedAt: string
  lastSync: string
  status: "connected" | "disconnected" | "syncing"
}

export function EmbyConnectSection() {
  const [serverUrl, setServerUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connection, setConnection] = useState<EmbyConnection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testCredentials, setTestCredentials] = useState({ url: "", username: "", password: "" })

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serverUrl.trim() || !username.trim()) {
      setError("Please enter both server URL and username")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Simulate API call to Emby server
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful connection
      const mockConnection: EmbyConnection = {
        id: "emby-" + Date.now(),
        serverName: "Personal Emby Server",
        serverUrl: serverUrl,
        username: username,
        connectedAt: new Date().toISOString(),
        lastSync: new Date().toISOString(),
        status: "connected",
      }

      setConnection(mockConnection)
      setServerUrl("")
      setUsername("")
      setPassword("")
    } catch (error) {
      setError("Failed to connect to Emby server. Please check your credentials.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setConnection(null)
    setError(null)
  }

  const generateTestCredentials = () => {
    setTestCredentials({
      url: "https://emby.example.com:8096",
      username: "testuser",
      password: "testpass123",
    })
  }

  const copyTestCredential = (field: string, value: string) => {
    navigator.clipboard.writeText(value)
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Emby Server Status */}
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/10 rounded-full blur-md animate-pulse delay-500"></div>
          </div>
        </div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Emby Connect</CardTitle>
                <CardDescription className="text-green-100">Connect to your personal Emby media server</CardDescription>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Premium Feature
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Connected Server Card */}
      {connection && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Connected to Emby
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Your Emby server is successfully connected
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              >
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">Server Name</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-green-700 font-medium">{connection.serverName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">Username</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-green-700">{connection.username}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">Server URL</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm break-all">{connection.serverUrl}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">Status</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 text-sm font-medium capitalize">{connection.status}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">Connected At</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">{formatTime(connection.connectedAt)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">Last Sync</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">{formatTime(connection.lastSync)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Form */}
      {!connection && (
        <Card className="border-0 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700"></div>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Link className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">Connect to Emby Server</CardTitle>
                <CardDescription className="text-emerald-100">
                  Enter your Emby server details to establish connection
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Server URL</label>
                <Input
                  type="url"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="https://your-emby-server.com:8096"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Username</label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Emby username"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your Emby password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-12"
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert className="bg-red-500/10 border-red-400/30 text-red-100">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isConnecting || !serverUrl.trim() || !username.trim()}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting to Server...
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" />
                    Connect to Emby
                  </>
                )}
              </Button>
            </form>

            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Connection Requirements:
              </h4>
              <ul className="space-y-2 text-sm text-emerald-100">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Your Emby server must be accessible from the internet
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    2
                  </span>
                  Use HTTPS for secure connections (recommended)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    3
                  </span>
                  Ensure your Emby user has appropriate permissions
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    4
                  </span>
                  Check firewall settings if connection fails
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Test Emby Connection
          </CardTitle>
          <CardDescription className="text-blue-600">
            Generate test credentials to simulate the connection process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={generateTestCredentials}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100 bg-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Test Credentials
          </Button>

          {testCredentials.url && (
            <div className="space-y-3">
              <div className="p-4 bg-white/60 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Server URL:</p>
                      <p className="text-blue-900 font-mono text-sm">{testCredentials.url}</p>
                    </div>
                    <Button
                      onClick={() => copyTestCredential("url", testCredentials.url)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Username:</p>
                      <p className="text-blue-900 font-mono text-sm">{testCredentials.username}</p>
                    </div>
                    <Button
                      onClick={() => copyTestCredential("username", testCredentials.username)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Password:</p>
                      <p className="text-blue-900 font-mono text-sm">{testCredentials.password}</p>
                    </div>
                    <Button
                      onClick={() => copyTestCredential("password", testCredentials.password)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <Badge className="bg-blue-200 text-blue-800">Test Mode</Badge>
                  <p className="text-xs text-blue-600 mt-1">
                    Use these credentials in the form above to test the connection process
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
