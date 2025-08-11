"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Copy, User, Key, Mail, Download, ExternalLink } from "lucide-react"

interface PurchaseData {
  planType: string
  price: number
  credentials: {
    username: string
    password: string
    email?: string
  }
  userId: string
}

interface SubscriptionSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  purchaseData: PurchaseData | null
}

export function SubscriptionSuccessModal({ isOpen, onClose, purchaseData }: SubscriptionSuccessModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Return early if no purchase data
  if (!purchaseData || !purchaseData.credentials) {
    return null
  }

  const { credentials, planType } = purchaseData
  const serverUrl = "https://xqi1eda.freshticks.xyz"

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const downloadCredentials = () => {
    const credentialsText = `
OG JELLYFIN - Account Details
=============================

Plan: ${planType}
Server: ${serverUrl}

Username: ${credentials.username}
Password: ${credentials.password}
Email: ${credentials.email || "Not provided"}

Login URL: ${serverUrl}

Important: Please save these credentials securely. You will need them to access your account.

Welcome to OG JELLYFIN!
    `.trim()

    const blob = new Blob([credentialsText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `OG-JELLYFIN-${credentials.username}-credentials.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Welcome to OG JELLYFIN!
          </DialogTitle>
          <DialogDescription>
            Your {planType} subscription is now active. Here are your login credentials:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your account has been created successfully! Please save these credentials securely.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Account Details</CardTitle>
              <CardDescription>Use these credentials to log into your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm text-muted-foreground">{credentials.username}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(credentials.username, "username")}>
                  {copiedField === "username" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Password</p>
                    <p className="text-sm text-muted-foreground font-mono">{credentials.password}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(credentials.password, "password")}>
                  {copiedField === "password" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {credentials.email && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{credentials.email}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(credentials.email!, "email")}>
                    {copiedField === "email" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={downloadCredentials} variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button asChild className="flex-1">
              <a href={serverUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Login Now
              </a>
            </Button>
          </div>

          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Plan: {planType}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
