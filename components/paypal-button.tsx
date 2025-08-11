"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard, Shield, Zap } from "lucide-react"

interface PayPalButtonProps {
  amount: number
  currency?: string
  description: string
  onSuccess?: (details: any) => void
  onError?: (error: any) => void
  planType?: "basic" | "premium" | "enterprise"
}

export function PayPalButton({
  amount,
  currency = "GBP",
  description,
  onSuccess,
  onError,
  planType = "basic",
}: PayPalButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      // Simulate PayPal payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockPaymentDetails = {
        id: `PAY-${Date.now()}`,
        status: "COMPLETED",
        amount: {
          total: amount.toString(),
          currency: currency,
        },
        payer: {
          email: "ogstorage25@gmail.com",
        },
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString(),
      }

      setPaymentComplete(true)
      onSuccess?.(mockPaymentDetails)

      // Reset after 3 seconds
      setTimeout(() => {
        setPaymentComplete(false)
        setIsProcessing(false)
      }, 3000)
    } catch (error) {
      console.error("Payment failed:", error)
      onError?.(error)
      setIsProcessing(false)
    }
  }

  const planFeatures = {
    basic: ["1 Jellyfin Server Connection", "Basic Support", "Community Access", "Mobile App Access"],
    premium: [
      "5 Jellyfin Server Connections",
      "Priority Support",
      "Advanced Features",
      "Mobile & Desktop Apps",
      "Custom Themes",
      "Analytics Dashboard",
    ],
    enterprise: [
      "Unlimited Server Connections",
      "24/7 Premium Support",
      "White-label Solution",
      "API Access",
      "Custom Integrations",
      "Dedicated Account Manager",
      "SLA Guarantee",
    ],
  }

  const planIcons = {
    basic: <Zap className="h-5 w-5" />,
    premium: <Shield className="h-5 w-5" />,
    enterprise: <CreditCard className="h-5 w-5" />,
  }

  const planColors = {
    basic: "bg-blue-500",
    premium: "bg-purple-500",
    enterprise: "bg-gold-500",
  }

  if (paymentComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground">Your {planType} subscription has been activated.</p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              £{amount.toFixed(2)} {currency} - Paid to ogstorage25@gmail.com
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className={`w-12 h-12 ${planColors[planType]} rounded-lg flex items-center justify-center mx-auto mb-2`}>
          <div className="text-white">{planIcons[planType]}</div>
        </div>
        <CardTitle className="capitalize">{planType} Plan</CardTitle>
        <CardDescription>{description}</CardDescription>
        <div className="text-3xl font-bold">
          £{amount.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/{currency}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {planFeatures[planType].map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white"
          size="lg"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing Payment...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pay with PayPal
            </div>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">Secure payment processed by PayPal</p>
          <p className="text-xs text-muted-foreground">Payment to: ogstorage25@gmail.com</p>
        </div>
      </CardContent>
    </Card>
  )
}
