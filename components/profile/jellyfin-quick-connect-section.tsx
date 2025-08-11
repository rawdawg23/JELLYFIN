"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  QrCode,
  Link,
  Unlink,
  Eye,
  EyeOff,
} from "lucide-react"
import { jellyfinAPI } from "@/lib/jellyfin-api"

interface QuickConnectState {
  isEnabled: boolean
  code: string
  secret: string
  isConnecting: boolean
  isConnected: boolean
  error: string | null
  connectionStatus: "idle" | "generating" | "waiting" | "connected" | "failed"
}

export function JellyfinQuickConnectSection() {
  const [quickConnect, setQuickConnect] = useState<QuickConnectState>({
    isEnabled: false,
    code: "",
    secret: "",
    isConnecting: false,
    isConnected: false,
    error: null,
    connectionStatus: "idle",
  })

  const [testPin, setTestPin] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking")

  useEffect(() => {
    checkServerStatus()
  }, [])

  const checkServerStatus = async () => {
    setServerStatus("checking")
    try {
      await jellyfinAPI.checkServerInfo()
      const quickConnectSupported = await jellyfinAPI.checkQuickConnectSupport()
      setQuickConnect((prev) => ({ ...prev, isEnabled: quickConnectSupported }))
      setServerStatus("online")
    } catch (error) {
      setServerStatus("offline")
      setQuickConnect((prev) => ({ ...prev, error: "Server is not accessible" }))
    }
  }

  const initiateQuickConnect = async () => {
    setQuickConnect((prev) => ({
      ...prev,
      isConnecting: true,
      connectionStatus: "generating",
      error: null,
    }))

    try {
      const result = await jellyfinAPI.initiateQuickConnect()
      setQuickConnect((prev) => ({
        ...prev,
        code: result.code,
        secret: result.secret,
        connectionStatus: "waiting",
        isConnecting: false,
      }))

      // Start polling for connection status
      pollConnectionStatus(result.secret)
    } catch (error) {
      setQuickConnect((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to initiate Quick Connect",
        connectionStatus: "failed",
        isConnecting: false,
      }))
    }
  }

  const pollConnectionStatus = async (secret: string) => {
    const maxAttempts = 30 // 5 minutes with 10-second intervals
    let attempts = 0

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setQuickConnect((prev) => ({
          ...prev,
          error: "Connection timeout. Please try again.",
          connectionStatus: "failed",
        }))
        return
      }

      try {
        const result = await jellyfinAPI.checkQuickConnectStatus(secret)
        if (result.authenticated) {
          setQuickConnect((prev) => ({
            ...prev,
            isConnected: true,
            connectionStatus: "connected",
            error: null,
          }))
        } else {
          attempts++
          setTimeout(poll, 10000) // Poll every 10 seconds
        }
      } catch (error) {
        attempts++
        setTimeout(poll, 10000)
      }
    }

    poll()
  }

  const testPinConnection = async () => {
    if (!testPin.trim()) return

    setQuickConnect((prev) => ({ ...prev, isConnecting: true, error: null }))

    try {
      const result = await jellyfinAPI.testConnection(testPin)
      if (result.success) {
        setQuickConnect((prev) => ({
          ...prev,
          isConnected: true,
          connectionStatus: "connected",
          error: null,
          isConnecting: false,
        }))
      } else {
        setQuickConnect((prev) => ({
          ...prev,
          error: result.message,
          connectionStatus: "failed",
          isConnecting: false,
        }))
      }
    } catch (error) {
      setQuickConnect((prev) => ({
        ...prev,
        error: "Connection test failed",
        connectionStatus: "failed",
        isConnecting: false,
      }))
    }
  }

  const disconnect = async () => {
    try {
      await jellyfinAPI.disconnectQuickConnect()
      setQuickConnect({
        isEnabled: quickConnect.isEnabled,
        code: "",
        secret: "",
        isConnecting: false,
        isConnected: false,
        error: null,
        connectionStatus: "idle",
      })
      setTestPin("")
    } catch (error) {
      console.error("Disconnect failed:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = () => {
    switch (serverStatus) {
      case "online":
        return <Wifi className="w-5 h-5 text-green-400" />
      case "offline":
        return <WifiOff className="w-5 h-5 text-red-400" />
      default:
        return <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
    }
  }

  const getStatusBadge = () => {
    switch (quickConnect.connectionStatus) {
      case "connected":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )
      case "waiting":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Waiting for Authorization
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            <Server className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        )
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 opacity-50" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Jellyfin Quick Connect</CardTitle>
              <CardDescription className="text-white/60">
                Connect to your Jellyfin server using Quick Connect
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Server Status */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Server className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-medium">XQI1EDA Jellyfin Server</p>
              <p className="text-white/60 text-sm">https://xqi1eda.freshticks.xyz:443</p>
            </div>
          </div>
          <Button
            onClick={checkServerStatus}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
            disabled={serverStatus === "checking"}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${serverStatus === "checking" ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {quickConnect.error && (
          <Alert className="bg-red-500/20 border-red-500/30">
            <XCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{quickConnect.error}</AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        {serverStatus === "online" && (
          <div className="space-y-6">
            {!quickConnect.isConnected ? (
              <div className="space-y-6">
                {/* Quick Connect Method */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Quick Connect</h4>
                  {quickConnect.connectionStatus === "idle" && (
                    <div className="space-y-4">
                      <p className="text-white/70">
                        Generate a Quick Connect code to link your device to the Jellyfin server.
                      </p>
                      <Button
                        onClick={initiateQuickConnect}
                        disabled={!quickConnect.isEnabled || quickConnect.isConnecting}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
                      >
                        {quickConnect.isConnecting ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Link className="w-4 h-4 mr-2" />
                        )}
                        {quickConnect.isConnecting ? "Generating..." : "Generate Quick Connect Code"}
                      </Button>
                    </div>
                  )}

                  {quickConnect.connectionStatus === "waiting" && quickConnect.code && (
                    <div className="space-y-4">
                      <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30">
                        <div className="text-center space-y-4">
                          <div className="text-4xl font-bold text-white tracking-wider">{quickConnect.code}</div>
                          <p className="text-white/80">Enter this code in your Jellyfin app</p>
                          <div className="flex gap-2 justify-center">
                            <Button
                              onClick={() => copyToClipboard(quickConnect.code)}
                              variant="outline"
                              size="sm"
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Code
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              Show QR
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-white/60 text-sm mb-4">
                          Open your Jellyfin app and go to Settings → Quick Connect, then enter the code above.
                        </p>
                        <Button
                          onClick={() => setQuickConnect((prev) => ({ ...prev, connectionStatus: "idle" }))}
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Testing */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-semibold text-white">Advanced Testing</h4>
                    <Button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white"
                    >
                      {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-white/70 text-sm">
                        Test connection with a specific PIN code for development purposes.
                      </p>
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label htmlFor="testPin" className="text-white text-sm">
                            Test PIN Code
                          </Label>
                          <Input
                            id="testPin"
                            value={testPin}
                            onChange={(e) => setTestPin(e.target.value)}
                            placeholder="Enter test PIN (e.g., 123456)"
                            className="bg-white/10 border-white/20 text-white rounded-xl mt-1"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            onClick={testPinConnection}
                            disabled={!testPin.trim() || quickConnect.isConnecting}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                          >
                            {quickConnect.isConnecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Test"}
                          </Button>
                        </div>
                      </div>
                      <p className="text-white/50 text-xs">
                        Use PIN "123456" for successful test, or "ERROR123" to test error handling.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Connected State */
              <div className="space-y-4">
                <Alert className="bg-green-500/20 border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    Successfully connected to Jellyfin server! You can now access your media library.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Connected Device</p>
                      <p className="text-white/60 text-sm">Web Browser • Connected just now</p>
                    </div>
                  </div>
                  <Button
                    onClick={disconnect}
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl"
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {serverStatus === "offline" && (
          <Alert className="bg-red-500/20 border-red-500/30">
            <WifiOff className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">
              Unable to connect to the Jellyfin server. Please check your connection and try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
