"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Zap,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Info,
  Loader2,
  Smartphone,
  Tv,
  Monitor,
  Shield,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatUKDateTime } from "@/lib/date-utils"

export function JellyfinQuickConnectSection() {
  const { user, initiateQuickConnect, checkQuickConnectStatus, disconnectJellyfin } = useAuth()
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [quickConnectCode, setQuickConnectCode] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const jellyfinConnect = user?.jellyfinQuickConnect

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  const handleInitiateQuickConnect = async () => {
    setConnectionError("")
    const result = await initiateQuickConnect()

    if (result.success && result.code) {
      setQuickConnectCode(result.code)
      setIsConnecting(true)

      // Start polling for connection status
      const interval = setInterval(async () => {
        const connected = await checkQuickConnectStatus(result.code!)
        if (connected) {
          setIsConnecting(false)
          setShowConnectDialog(false)
          clearInterval(interval)
        }
      }, 3000)

      setPollingInterval(interval)

      // Stop polling after 5 minutes
      setTimeout(() => {
        if (interval) {
          clearInterval(interval)
          setIsConnecting(false)
          setConnectionError("Connection timeout. Please try again.")
        }
      }, 300000)
    } else {
      setConnectionError(result.error || "Failed to initiate Quick Connect")
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(quickConnectCode)
  }

  const handleDisconnect = () => {
    disconnectJellyfin()
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    setIsConnecting(false)
    setQuickConnectCode("")
  }

  const handleCancelConnection = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    setIsConnecting(false)
    setQuickConnectCode("")
    setShowConnectDialog(false)
  }

  return (
    <Card className="ios-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          Jellyfin Quick Connect
        </CardTitle>
        <CardDescription>Connect your devices to the Jellyfin server quickly and securely</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {jellyfinConnect?.connected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Connected to Jellyfin</p>
                  <p className="text-sm text-green-700">{jellyfinConnect.serverName}</p>
                </div>
              </div>
              <Badge className="ios-badge bg-green-500 text-white border-0">Active</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Username</Label>
                <p className="font-medium">{jellyfinConnect.username}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">User ID</Label>
                <p className="font-mono text-xs bg-purple-50 px-2 py-1 rounded">{jellyfinConnect.userId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Server ID</Label>
                <p className="font-mono text-xs bg-purple-50 px-2 py-1 rounded">{jellyfinConnect.serverId}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Connected</Label>
                <p className="text-sm">{formatUKDateTime(jellyfinConnect.connectedAt!)}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="ios-button bg-transparent text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
              <Button
                variant="outline"
                className="ios-button bg-transparent"
                onClick={() => window.open("https://jellyfin.org/downloads/", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get Jellyfin Apps
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert className="border-purple-200 bg-purple-50">
              <Info className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Quick Connect allows you to easily connect your devices to the Jellyfin server without entering server
                details manually.
              </AlertDescription>
            </Alert>

            <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
              <DialogTrigger asChild>
                <Button className="w-full ios-button text-white border-0">
                  <Zap className="h-4 w-4 mr-2" />
                  Connect with Quick Connect
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-purple-500" />
                    Jellyfin Quick Connect
                  </DialogTitle>
                  <DialogDescription>Use this code to connect your device to the Jellyfin server</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {!quickConnectCode ? (
                    <div className="text-center space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Click the button below to generate a Quick Connect code
                      </p>
                      <Button
                        onClick={handleInitiateQuickConnect}
                        className="ios-button text-white border-0"
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Generate Code
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <Label className="text-sm font-medium">Your Quick Connect Code</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={quickConnectCode}
                            readOnly
                            className="text-center text-2xl font-mono font-bold ios-search border-0"
                          />
                          <Button
                            onClick={handleCopyCode}
                            size="sm"
                            variant="outline"
                            className="ios-button bg-transparent"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {isConnecting && (
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                            <span className="text-sm font-medium">Waiting for connection...</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            This will automatically complete when you enter the code in your Jellyfin app
                          </p>
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">How to connect:</Label>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-purple-600">1.</span>
                            <span>Open your Jellyfin app on any device</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-purple-600">2.</span>
                            <span>Look for "Quick Connect" or "Connect with code"</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-purple-600">3.</span>
                            <span>Enter the code above</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-purple-600">4.</span>
                            <span>Your device will connect automatically</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-3 w-3" />
                        <span>This code expires in 5 minutes for security</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleCancelConnection}
                          variant="outline"
                          className="flex-1 ios-button bg-transparent"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => window.open("https://jellyfin.org/downloads/", "_blank")}
                          variant="outline"
                          className="flex-1 ios-button bg-transparent"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Get Apps
                        </Button>
                      </div>
                    </div>
                  )}

                  {connectionError && (
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{connectionError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Smartphone className="h-6 w-6 text-purple-500 mx-auto" />
                </div>
                <p className="text-xs text-muted-foreground">Mobile Apps</p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Tv className="h-6 w-6 text-purple-500 mx-auto" />
                </div>
                <p className="text-xs text-muted-foreground">Smart TVs</p>
              </div>
              <div className="space-y-2">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Monitor className="h-6 w-6 text-purple-500 mx-auto" />
                </div>
                <p className="text-xs text-muted-foreground">Desktop Apps</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
