"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Crown,
  Check,
  Star,
  Users,
  Server,
  Award,
  Rocket,
  Diamond,
  Target,
  Briefcase,
  Building,
  Percent,
  CreditCard,
  Loader2,
} from "lucide-react"
import { SubscriptionSuccessModal } from "@/components/subscription-success-modal"

// Floating particles for premium cards
function PremiumParticles() {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      delay: number
      color: string
      speed: number
    }>
  >([])

  useEffect(() => {
    const colors = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 20 + 10,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-30 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.speed}s`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  )
}

// PayPal Button Component
function PayPalButton({
  amount,
  planName,
  onSuccess,
  onError,
}: {
  amount: number
  planName: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)
    try {
      // Simulate PayPal payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock successful payment response
      const mockPaymentDetails = {
        id: `PAYPAL_${Date.now()}`,
        status: "COMPLETED",
        payer: {
          email_address: "customer@example.com",
          name: { given_name: "John", surname: "Doe" },
        },
        purchase_units: [
          {
            amount: { value: amount.toString(), currency_code: "GBP" },
            description: `${planName} Subscription`,
          },
        ],
        create_time: new Date().toISOString(),
      }

      onSuccess(mockPaymentDetails)
    } catch (error) {
      onError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading}
      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5 mr-2" />
          Pay £{amount} with PayPal
        </>
      )}
    </Button>
  )
}

// Subscription Plan Card
function SubscriptionPlanCard({
  title,
  price,
  period,
  description,
  features,
  isPopular,
  gradient,
  icon: Icon,
  onSubscribe,
}: {
  title: string
  price: number
  period: string
  description: string
  features: string[]
  isPopular?: boolean
  gradient: string
  icon: any
  onSubscribe: () => void
}) {
  return (
    <Card
      className={`relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-700 hover:scale-105 hover:shadow-2xl group ${
        isPopular ? "ring-2 ring-purple-500/50 shadow-purple-500/20" : ""
      }`}
    >
      <PremiumParticles />

      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full shadow-lg">
            <Star className="w-4 h-4 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
      />

      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {isPopular && (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors duration-500">
          {title}
        </CardTitle>
        <CardDescription className="text-white/70 text-sm">{description}</CardDescription>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-3xl font-bold text-white">£{price}</span>
          <span className="text-white/60 text-sm">/{period}</span>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-white/80">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4">
          <PayPalButton
            amount={price}
            planName={title}
            onSuccess={(details) => {
              console.log("Payment successful:", details)
              onSubscribe()
            }}
            onError={(error) => {
              console.error("Payment failed:", error)
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

// Reseller Plan Card
function ResellerPlanCard({
  title,
  minOrder,
  discount,
  description,
  features,
  gradient,
  icon: Icon,
  onContact,
}: {
  title: string
  minOrder: number
  discount: number
  description: string
  features: string[]
  gradient: string
  icon: any
  onContact: () => void
}) {
  return (
    <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-700 hover:scale-105 hover:shadow-2xl group">
      <PremiumParticles />

      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-700`}
      />

      <CardHeader className="relative pb-4">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            <Percent className="w-3 h-3 mr-1" />
            {discount}% OFF
          </Badge>
        </div>
        <CardTitle className="text-xl text-white group-hover:text-blue-300 transition-colors duration-500">
          {title}
        </CardTitle>
        <CardDescription className="text-white/70 text-sm">{description}</CardDescription>
        <div className="flex items-baseline gap-2 mt-4">
          <span className="text-2xl font-bold text-white">£{minOrder}+</span>
          <span className="text-white/60 text-sm">minimum order</span>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3 text-sm text-white/80">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-blue-400" />
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4">
          <Button
            onClick={onContact}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Building className="w-5 h-5 mr-2" />
            Contact Sales
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function PremiumSection() {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const handleSubscribe = (planName: string) => {
    setSelectedPlan(planName)
    setShowSuccessModal(true)
  }

  const handleContactSales = () => {
    // Open contact form or redirect to sales
    window.open("mailto:sales@ogjellyfin.com?subject=Reseller Inquiry", "_blank")
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            Premium Plans
          </h2>
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 blur-3xl -z-10" />
        </div>
        <p className="text-white/70 text-lg max-w-3xl mx-auto">
          Unlock the full potential of your Jellyfin experience with our premium subscription plans and reseller options
        </p>
      </div>

      <Tabs defaultValue="subscriptions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20 rounded-2xl p-2 backdrop-blur-sm max-w-md mx-auto">
          <TabsTrigger
            value="subscriptions"
            className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 py-3 font-semibold"
          >
            <Users className="w-4 h-4 mr-2" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger
            value="reseller"
            className="text-white data-[state=active]:bg-white/20 rounded-xl transition-all duration-300 py-3 font-semibold"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Reseller
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SubscriptionPlanCard
              title="Basic Plan"
              price={5}
              period="month"
              description="Perfect for personal use"
              features={[
                "1 Jellyfin server access",
                "HD streaming quality",
                "5 simultaneous streams",
                "Basic support",
                "Mobile app access",
                "Web interface",
              ]}
              gradient="from-blue-500 to-cyan-600"
              icon={Server}
              onSubscribe={() => handleSubscribe("Basic Plan")}
            />

            <SubscriptionPlanCard
              title="Premium Plan"
              price={12}
              period="month"
              description="Most popular choice"
              features={[
                "3 Jellyfin servers access",
                "4K streaming quality",
                "15 simultaneous streams",
                "Priority support",
                "All apps included",
                "Advanced features",
                "Custom branding",
                "Analytics dashboard",
              ]}
              isPopular
              gradient="from-purple-500 to-pink-600"
              icon={Crown}
              onSubscribe={() => handleSubscribe("Premium Plan")}
            />

            <SubscriptionPlanCard
              title="Enterprise Plan"
              price={25}
              period="month"
              description="For power users"
              features={[
                "Unlimited servers",
                "8K streaming quality",
                "Unlimited streams",
                "24/7 dedicated support",
                "White-label solution",
                "API access",
                "Custom integrations",
                "SLA guarantee",
                "Advanced security",
              ]}
              gradient="from-yellow-500 to-orange-600"
              icon={Diamond}
              onSubscribe={() => handleSubscribe("Enterprise Plan")}
            />
          </div>
        </TabsContent>

        <TabsContent value="reseller" className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ResellerPlanCard
              title="Bronze Partner"
              minOrder={100}
              discount={15}
              description="Start your reseller journey"
              features={[
                "15% discount on all plans",
                "Minimum £100 monthly order",
                "Basic partner support",
                "Marketing materials",
                "Monthly billing",
                "Partner portal access",
              ]}
              gradient="from-orange-500 to-red-600"
              icon={Award}
              onContact={handleContactSales}
            />

            <ResellerPlanCard
              title="Silver Partner"
              minOrder={500}
              discount={25}
              description="Growing business solution"
              features={[
                "25% discount on all plans",
                "Minimum £500 monthly order",
                "Priority partner support",
                "Co-branded materials",
                "Flexible billing terms",
                "Dedicated account manager",
                "Training resources",
                "API integration support",
              ]}
              gradient="from-gray-400 to-gray-600"
              icon={Target}
              onContact={handleContactSales}
            />

            <ResellerPlanCard
              title="Gold Partner"
              minOrder={1000}
              discount={35}
              description="Enterprise reseller program"
              features={[
                "35% discount on all plans",
                "Minimum £1000 monthly order",
                "24/7 dedicated support",
                "White-label solutions",
                "Custom billing terms",
                "Technical integration",
                "Marketing fund allocation",
                "Exclusive partner events",
                "Revenue sharing program",
              ]}
              gradient="from-yellow-400 to-yellow-600"
              icon={Rocket}
              onContact={handleContactSales}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Success Modal */}
      <SubscriptionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        planName={selectedPlan}
      />
    </div>
  )
}
