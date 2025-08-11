"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Download, Mail, Server, Copy } from "lucide-react"

interface SubscriptionDetails {
  plan: string
  price: string
  duration: string
  features: string[]
  serverCredentials?: {
    serverUrl: string
    username: string
    password: string
  }
}

interface SubscriptionSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptionDetails?: SubscriptionDetails | null
}

export function SubscriptionSuccessModal({ isOpen, onClose, subscriptionDetails }: SubscriptionSuccessModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const defaultDetails: SubscriptionDetails = {
    plan: "Premium Plan",
    price: "$9.99",
    duration: "monthly",
    features: ["4K Streaming", "Unlimited Downloads", "Premium Support", "Multiple Devices"],
    serverCredentials: {
      serverUrl: "https://demo.jellyfin.store",
      username: "premium_user",
      password: "temp_password_123",
    },
  }

  const details = subscriptionDetails || defaultDetails
  const safeFeatures = Array.isArray(details.features) ? details.features : []

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleDownloadCredentials = () => {
    const credentialsText = `
Jellyfin Server Credentials
==========================
Plan: ${details.plan}
Price: ${details.price}/${details.duration}
Server URL: ${details.serverCredentials?.serverUrl || "N/A"}
Username: ${details.serverCredentials?.username || "N/A"}
Password: ${details.serverCredentials?.password || "N/A"}

Features Included:
${safeFeatures.map((feature) => `- ${feature}`).join("\n")}

Thank you for your subscription!
    `

    const blob = new Blob([credentialsText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "jellyfin-credentials.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-6 w-6" />
            Subscription Successful!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {details.plan}
                </Badge>
                <p className="text-2xl font-bold">
                  {details.price}/{details.duration}
                </p>
              </div>
            </CardContent>
          </Card>

          {details.serverCredentials && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Server className="h-4 w-4" />
                    Server Access Details
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Server URL:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-blue-600 break-all flex-1">{details.serverCredentials.serverUrl}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(details.serverCredentials?.serverUrl || "", "url")}
                        >
                          {copiedField === "url" ? "Copied!" : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Username:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono flex-1">{details.serverCredentials.username}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(details.serverCredentials?.username || "", "username")}
                        >
                          {copiedField === "username" ? "Copied!" : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Password:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono flex-1">{details.serverCredentials.password}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(details.serverCredentials?.password || "", "password")}
                        >
                          {copiedField === "password" ? "Copied!" : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <p className="font-medium text-sm">Features Included:</p>
                <ul className="text-sm space-y-1">
                  {safeFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={handleDownloadCredentials} variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={onClose} className="flex-1">
              <Mail className="h-4 w-4 mr-2" />
              Continue
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">Credentials have been sent to your email address</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
