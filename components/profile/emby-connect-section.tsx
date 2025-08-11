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
  Gamepad2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Shield,
  Link,
  Server,
} from "lucide-react"

interface EmbyDevice {
  id: string
  name: string
  type: string
  appName: string
  appVersion: string
  lastSeen: string
  isActive: boolean
}

export function EmbyConnectSection() {
  const [connectCode, setConnectCode] = useState("")
  const [showCode, setShowCode] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [connectedDevice, setConnectedDevice] = useState<EmbyDevice | null>(null)
  const [serverStatus, setServerStatus] = useState<"online" | "offline" | "checking">("checking")
  const [testCode, setTestCode] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkServerStatus()
    generateTestCode()
  }, [])

  const checkServerStatus = async () => {
    setServerStatus("checking")
    try {
      // Mock server status check for Emby
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setServerStatus("online")
    } catch (error) {
      setServerStatus("offline")
    }
  }

  const generateTestCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    setTestCode(code)
  }

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!connectCode.trim()) return

    setIsConnecting(true)
    setConnectionStatus("connecting")
    setErrorMessage("")

    try {
      // Mock Emby Connect API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (connectCode.toUpperCase() === "ERROR") {
        throw new Error("Invalid connect code")
      }

      if (connectCode.toUpperCase() === "TIMEOUT") {
        throw new Error("Connection timeout")
      }

      if (connectCode.length < 6) {
        throw new Error("Connect code must be at least 6 characters")
      }

      // Mock successful connection
      const deviceTypes = ["Android TV", "iPhone", "iPad", "Windows PC", "Smart TV", "Roku", "Fire TV"]
      const deviceNames = [
        "Living Room TV",
        "John's iPhone",
        "Sarah's iPad",
        "Home Theater",
        "Bedroom TV",
        "Gaming Room",
      ]

      const randomDevice = deviceTypes[Math.floor(Math.random() * deviceTypes.length)]
      const randomName = deviceNames[Math.floor(Math.random() * deviceNames.length)]

      const mockDevice: EmbyDevice = {
        id: "emby-device-" + Date.now(),
        name: randomName,
        type: randomDevice,
        appName: "Emby",
        appVersion: "4.7.14",
        lastSeen: new Date().toISOString(),
        isActive: true,
      }

      setConnectedDevice(mockDevice)
      setConnectionStatus("success")
      setConnectCode("")
    } catch (error: any) {
      setConnectionStatus("error")
      setErrorMessage(error.message || "Failed to connect to Emby")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setConnectedDevice(null)
    setConnectionStatus("idle")
    setConnectCode("")
  }

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase()
    if (type.includes("tv") || type.includes("roku") || type.includes("fire")) return Tv
    if (type.includes("phone") || type.includes("iphone")) return Smartphone
    if (type.includes("tablet") || type.includes("ipad")) return Tablet
    if (type.includes("xbox") || type.includes("playstation") || type.includes("gaming")) return Gamepad2
    return Monitor
  }

  const copyTestCode = async () => {
    try {
      await navigator.clipboard.writeText(testCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      setConnectCode(testCode)
    }
  }

  const useTestCode = () => {
    setConnectCode(testCode)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Server className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Emby Connect
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect your devices to Emby using your Emby Connect code
        </p>
      </div>

      {/* Server Status */}
      <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  serverStatus === "online"
                    ? "bg-green-500 animate-pulse"
                    : serverStatus === "offline"
                      ? "bg-red-500"
                      : "bg-yellow-500 animate-pulse"
                }`}
              />
              <span className="font-medium">
                Emby Server:{" "}
                {serverStatus === "online" ? "Connected" : serverStatus === "offline" ? "Offline" : "Checking..."}
              </span>
            </div>
            <Button
              onClick={checkServerStatus}
              variant="outline"
              size="sm"
              disabled={serverStatus === "checking"}
              className="gap-2 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${serverStatus === "checking" ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          <div className="mt-2 text-sm text-muted-foreground">Emby Connect Service</div>
        </CardContent>
      </Card>

      {/* Connected Device Display */}
      {connectedDevice && (
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-800 dark:text-green-200">Device Connected</CardTitle>
                <CardDescription className="text-green-600 dark:text-green-400">
                  Your device is now linked to Emby
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                {(() => {
                  const DeviceIcon = getDeviceIcon(connectedDevice.type)
                  return <DeviceIcon className="h-6 w-6 text-white" />
                })()}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{connectedDevice.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{connectedDevice.type}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-500">
                  <span>
                    {connectedDevice.appName} {connectedDevice.appVersion}
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Active
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
            >
              Disconnect Device
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connect Code Input Form */}
      {!connectedDevice && (
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Enter Connect Code
            </CardTitle>
            <CardDescription>
              Get your Emby Connect code from your device settings or Emby Connect website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showCode ? "text" : "password"}
                    placeholder="Enter Emby Connect code"
                    value={connectCode}
                    onChange={(e) => setConnectCode(e.target.value.toUpperCase())}
                    className="pr-12 h-12 text-lg font-mono tracking-wider bg-white/70 dark:bg-black/20 border-green-200 dark:border-green-800 focus:border-green-500 dark:focus:border-green-400"
                    disabled={isConnecting}
                    maxLength={12}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCode(!showCode)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                  >
                    {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!connectCode.trim() || isConnecting || serverStatus !== "online"}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="h-5 w-5 mr-2" />
                    Connect to Emby
                  </>
                )}
              </Button>
            </form>

            {/* Error Display */}
            {connectionStatus === "error" && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">{errorMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Testing Panel */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Shield className="h-5 w-5" />
            Emby Connect Testing
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Use these tools to test the Emby Connect functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-white/50 dark:bg-black/20 rounded-xl">
            <div className="flex-1">
              <div className="font-mono text-lg font-bold text-blue-800 dark:text-blue-200">Test Code: {testCode}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Generated test code for development</div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyTestCode}
                variant="outline"
                size="sm"
                className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 bg-transparent"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button
                onClick={useTestCode}
                variant="outline"
                size="sm"
                className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 bg-transparent"
              >
                Use Code
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={generateTestCode}
              variant="outline"
              size="sm"
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate New Code
            </Button>
          </div>

          <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <p>• Use "ERROR" as code to test error handling</p>
            <p>• Use "TIMEOUT" as code to test timeout scenarios</p>
            <p>• Any other 6+ character code will simulate successful connection</p>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-0 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900 dark:to-slate-900 shadow-xl">
        <CardHeader>
          <CardTitle>How to Connect with Emby</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold">Create Emby Connect Account</h4>
                <p className="text-sm text-muted-foreground">
                  Visit emby.media and create an Emby Connect account if you don't have one
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold">Get Connect Code</h4>
                <p className="text-sm text-muted-foreground">
                  Open your Emby app and go to Settings → Emby Connect to get your connect code
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold">Enter the Code</h4>
                <p className="text-sm text-muted-foreground">Copy the connect code and enter it in the form above</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-semibold">Start Streaming</h4>
                <p className="text-sm text-muted-foreground">
                  Your device is now connected and ready to access Emby content!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
