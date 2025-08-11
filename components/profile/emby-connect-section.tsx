"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { connectToEmbyServer } from "@/lib/emby-api"
import { Loader2, Server, CheckCircle, AlertCircle } from "lucide-react"

export function EmbyConnectSection() {
  const [serverUrl, setServerUrl] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")

  const handleConnect = async () => {
    if (!serverUrl || !username || !password) {
      setStatus("Please fill in all fields.")
      setConnectionStatus("error")
      return
    }

    setIsLoading(true)
    setStatus("Connecting to Emby server...")
    setConnectionStatus("idle")

    try {
      const result = await connectToEmbyServer(serverUrl, username, password)
      if (result.success) {
        setStatus(`Successfully connected to Emby server!`)
        setConnectionStatus("success")
      } else {
        setStatus(`Connection failed: ${result.message}`)
        setConnectionStatus("error")
      }
    } catch (error) {
      setStatus("An unexpected error occurred.")
      setConnectionStatus("error")
      console.error("Error connecting to Emby server:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Server className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Emby Server Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Connect to your Emby server to access your media library and sync your preferences.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emby-server-url">Server URL</Label>
            <Input
              id="emby-server-url"
              placeholder="https://your-emby-server.com:8096"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emby-username">Username</Label>
            <Input
              id="emby-username"
              placeholder="Your Emby username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="emby-password">Password</Label>
          <Input
            id="emby-password"
            type="password"
            placeholder="Your Emby password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <Button onClick={handleConnect} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Server className="mr-2 h-4 w-4" />
              Connect to Emby
            </>
          )}
        </Button>

        {status && (
          <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
            {getStatusIcon()}
            {status}
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Connection Status</h4>
          <div className="flex items-center gap-2">
            <Badge variant={connectionStatus === "success" ? "default" : "secondary"}>
              {connectionStatus === "success" ? "Connected" : "Not Connected"}
            </Badge>
            {connectionStatus === "success" && (
              <span className="text-sm text-muted-foreground">Last connected: {new Date().toLocaleString()}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
