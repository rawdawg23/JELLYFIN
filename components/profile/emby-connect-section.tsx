"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Link,
  Unlink,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Shield,
  Info,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatUKDateTime } from "@/lib/date-utils"

export function EmbyConnectSection() {
  const { user, connectEmby, disconnectEmby } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [connectForm, setConnectForm] = useState({
    username: "",
    password: "",
  })
  const [showConnectDialog, setShowConnectDialog] = useState(false)

  if (!user) return null

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)
    setError(null)
    setSuccess(null)

    try {
      const success = await connectEmby(connectForm.username, connectForm.password)
      if (success) {
        setSuccess("Successfully connected to Emby Connect!")
        setShowConnectDialog(false)
        setConnectForm({ username: "", password: "" })
      } else {
        setError("Failed to connect to Emby Connect. Please check your credentials.")
      }
    } catch (error) {
      setError("Connection failed. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      disconnectEmby()
      setSuccess("Successfully disconnected from Emby Connect.")
    } catch (error) {
      setError("Failed to disconnect. Please try again.")
    } finally {
      setIsDisconnecting(false)
    }
  }

  const isConnected = user.embyConnect?.connected || false

  return (
    <Card className="ios-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Link className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Emby Connect
                {isConnected ? (
                  <Badge className="ios-badge bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge className="ios-badge bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isConnected
                  ? "Your Emby Connect account is linked and ready to use"
                  : "Connect your Emby Connect account for seamless access"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>What is Emby Connect?</strong>
                <br />
                Emby Connect allows you to access your Emby server from anywhere without remembering server addresses.
                Connect your account to enjoy seamless streaming across all your devices.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
                <DialogTrigger asChild>
                  <Button className="ios-button text-white border-0 flex-1">
                    <Link className="h-4 w-4 mr-2" />
                    Connect Emby Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Link className="h-5 w-5 text-purple-600" />
                      Connect to Emby
                    </DialogTitle>
                    <DialogDescription>Enter your Emby Connect credentials to link your account</DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleConnect} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emby-username">Emby Connect Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                        <Input
                          id="emby-username"
                          type="text"
                          placeholder="Your Emby Connect username"
                          value={connectForm.username}
                          onChange={(e) => setConnectForm({ ...connectForm, username: e.target.value })}
                          className="pl-10 ios-search border-0"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emby-password">Password</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                        <Input
                          id="emby-password"
                          type="password"
                          placeholder="Your Emby Connect password"
                          value={connectForm.password}
                          onChange={(e) => setConnectForm({ ...connectForm, password: e.target.value })}
                          className="pl-10 ios-search border-0"
                          required
                        />
                      </div>
                    </div>

                    <Alert className="border-yellow-200 bg-yellow-50">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700 text-sm">
                        Your credentials are encrypted and stored securely. We never share your login information.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                      <Button type="submit" className="ios-button text-white border-0 flex-1" disabled={isConnecting}>
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link className="h-4 w-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowConnectDialog(false)}
                        disabled={isConnecting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                className="ios-button flex-1 bg-transparent"
                onClick={() => window.open("https://emby.media/connect", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Create Emby Account
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Connected Username</Label>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                  <User className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">{user.embyConnect.username}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Connected Email</Label>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                  <Mail className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">{user.embyConnect.email}</span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Connected Since</Label>
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    {user.embyConnect.connectedAt && formatUKDateTime(user.embyConnect.connectedAt)}
                  </span>
                </div>
              </div>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Connection Active!</strong>
                <br />
                You can now access your Emby server from anywhere using your Emby Connect credentials. Your account is
                synced and ready for seamless streaming.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="ios-button flex-1 bg-transparent"
                onClick={() => window.open("https://app.emby.media", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Emby Web App
              </Button>

              <Button variant="destructive" onClick={handleDisconnect} disabled={isDisconnecting} className="flex-1">
                {isDisconnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="h-4 w-4 mr-2" />
                    Disconnect Account
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-purple-100">
          <h4 className="font-semibold text-foreground mb-2">Benefits of Emby Connect:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              Access your server from anywhere without remembering IP addresses
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              Automatic server discovery and connection
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              Seamless experience across all Emby apps and devices
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
              Secure encrypted connection to your media
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
