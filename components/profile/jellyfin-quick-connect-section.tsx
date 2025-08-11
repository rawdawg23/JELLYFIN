"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Smartphone,
  Tv,
  Monitor,
  Tablet,
  Wifi,
  WifiOff,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Link,
  Unlink,
  AlertCircle,
  Zap,
  Shield,
  Clock,
} from "lucide-react"
import { jellyfinAPI, type QuickConnectLinkResult } from "@/lib/jellyfin-api"

interface ConnectedDevice {
  id: string
  name: string
  appName: string
  connectedAt: string
  lastActive: string
  deviceType: "tv" | "mobile" | "tablet" | "desktop"
}

export function JellyfinQuickConnectSection() {
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking")
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<QuickConnectLinkResult | null>(null)
  const [connectedDevice, setConnectedDevice] = useState<ConnectedDevice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [testPin, setTestPin] = useState("")

  useEffect(() => {
    checkServerStatus()
  }, [])

  const checkServerStatus = async () => {
    setServerStatus("checking")
    try {
      const result = await jellyfinAPI.testConnection()
      setServerStatus(result.success ? "online" : "offline")
    } catch (error) {
      setServerStatus("offline")
    }
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pin.trim() || pin.length < 4) {
      setError("Please enter a valid PIN (at least 4 characters)")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const result = await jellyfinAPI.linkQuickConnectPin(pin)
      setConnectionResult(result)

      if (result.success) {
        // Create connected device object
        const device: ConnectedDevice = {
          id: result.userId || "unknown",
          name: result.deviceName || "Unknown Device",
          appName: result.appName || "Jellyfin App",
          connectedAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          deviceType: getDeviceType(result.deviceName || ""),
        }
        setConnectedDevice(device)
        setPin("")
      } else {
        setError(result.error || "Failed to connect to server")
      }
    } catch (error) {
      setError("Connection failed. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await jellyfinAPI.disconnectQuickConnect()
      setConnectedDevice(null)
      setConnectionResult(null)
      setError(null)
    } catch (error) {
      console.error("Disconnect failed:", error)
    }
  }

  const generateTestPin = () => {
    const pin = Math.random().toString(36).substring(2, 8).toUpperCase()
    setTestPin(pin)
  }

  const copyTestPin = () => {
    navigator.clipboard.writeText(testPin)
  }

  const getDeviceType = (deviceName: string): "tv" | "mobile" | "tablet" | "desktop" => {
    const name = deviceName.toLowerCase()
    if (name.includes("tv") || name.includes("android tv") || name.includes("roku") || name.includes("fire")) {
      return "tv"
    }
    if (name.includes("iphone") || name.includes("android") || name.includes("mobile")) {
      return "mobile"
    }
    if (name.includes("ipad") || name.includes("tablet")) {
      return "tablet"
    }
    return "desktop"
  }

  const getDeviceIcon = (type: "tv" | "mobile" | "tablet" | "desktop") => {
    switch (type) {
      case "tv":
        return Tv
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      case "desktop":
        return Monitor
      default:
        return Monitor
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Server Status Card */}
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-4 left-4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full blur-md animate-pulse delay-500"></div>
          </div>
        </div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl">OG JELLYFIN Server</CardTitle>
                <CardDescription className="text-purple-100">https://xqi1eda.freshticks.xyz</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {serverStatus === "checking" ? (
                <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-400/30">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Checking
                </Badge>
              ) : serverStatus === "online" ? (
                <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-100 border-red-400/30">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
              <Button onClick={checkServerStatus} variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Connected Device Card */}
      {connectedDevice && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  {(() => {
                    const DeviceIcon = getDeviceIcon(connectedDevice.deviceType)
                    return <DeviceIcon className="h-6 w-6 text-white" />
                  })()}
                </div>
                <div>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Pinned Device Connected
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Your device is successfully linked to the server
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
                <label className="text-sm font-medium text-green-800">Device Name</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-green-700 font-medium">{connectedDevice.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">App</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-green-700">{connectedDevice.appName}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">Connected At</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <p className="text-green-700 text-sm">{formatTime(connectedDevice.connectedAt)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">Status</label>
                <div className="p-3 bg-white/60 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 text-sm font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Connect Card */}
      {!connectedDevice && (
        <Card className="border-0 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700"></div>
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
                <CardTitle className="text-white text-xl">Pin Your Jellyfin Client</CardTitle>
                <CardDescription className="text-indigo-100">
                  Enter the PIN from your Jellyfin app to connect your device
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 space-y-6">
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Quick Connect PIN</label>
                <div className="relative">
                  <Input
                    type={showPin ? "text" : "password"}
                    value={pin}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                      setPin(value)
                    }}
                    placeholder="Enter PIN from your Jellyfin app"
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-12"
                    maxLength={10}
                  />
                  <Button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                disabled={isConnecting || !pin.trim() || pin.length < 4}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting to Server...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Connect Device
                  </>
                )}
              </Button>
            </form>

            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                How to Connect:
              </h4>
              <ol className="space-y-2 text-sm text-indigo-100">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    1
                  </span>
                  Open your Jellyfin app on any device (phone, tablet, TV, etc.)
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    2
                  </span>
                  Go to Settings → Quick Connect or look for "Connect to Server"
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    3
                  </span>
                  Generate a PIN code in your app
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                    4
                  </span>
                  Enter that PIN code above to link your device
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Test Quick Connect
          </CardTitle>
          <CardDescription className="text-amber-600">
            Generate a test PIN to simulate the connection process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={generateTestPin}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Test PIN
            </Button>
            {testPin && (
              <Button
                onClick={copyTestPin}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy PIN
              </Button>
            )}
          </div>
          {testPin && (
            <div className="p-4 bg-white/60 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-800">Test PIN Generated:</p>
                  <p className="text-2xl font-bold text-amber-900 font-mono tracking-wider">{testPin}</p>
                </div>
                <Badge className="bg-amber-200 text-amber-800">Test Mode</Badge>
              </div>
              <p className="text-xs text-amber-600 mt-2">
                Use this PIN in the form above to test the connection process
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
