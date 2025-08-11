"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { pollJellyfinQuickConnectStatus } from "@/lib/jellyfin-api"
import { Loader2 } from "lucide-react"

export function QuickConnectTester() {
  const [connectCode, setConnectCode] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckStatus = async () => {
    if (!connectCode) {
      setStatus("Please enter a Quick Connect code.")
      return
    }

    setIsLoading(true)
    setStatus("Checking status...")
    try {
      const result = await pollJellyfinQuickConnectStatus(connectCode)
      if (result.success) {
        setStatus(`Status: ${result.status}. User ID: ${result.userId}`)
      } else {
        setStatus(`Error: ${result.error}`)
      }
    } catch (error) {
      setStatus("An unexpected error occurred.")
      console.error("Error checking Jellyfin Quick Connect status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Quick Connect Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">Test Jellyfin Quick Connect codes here.</p>
        <div className="space-y-2">
          <Label htmlFor="test-quick-connect-code">Quick Connect Code</Label>
          <Input
            id="test-quick-connect-code"
            placeholder="e.g., ABCD12"
            value={connectCode}
            onChange={(e) => setConnectCode(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <Button onClick={handleCheckStatus} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Quick Connect"
          )}
        </Button>
        {status && (
          <div className={`text-sm ${status.startsWith("Error") ? "text-red-500" : "text-green-500"}`}>{status}</div>
        )}
      </CardContent>
    </Card>
  )
}
