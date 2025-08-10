"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Server,
  Play,
  Users,
  CreditCard,
  Settings,
  Search,
  Film,
  Music,
  Tv,
  BookOpen,
  Star,
  Eye,
  DollarSign,
} from "lucide-react"

// Mock data - replace with actual Jellyfin API calls
const mockLibraries = [
  {
    id: "1",
    name: "Movies",
    type: "movies",
    itemCount: 1247,
    icon: Film,
    thumbnail: "/diverse-movie-collection.png",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    name: "TV Shows",
    type: "tvshows",
    itemCount: 89,
    icon: Tv,
    thumbnail: "/tv-shows-collection.png",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    name: "Music",
    type: "music",
    itemCount: 3421,
    icon: Music,
    thumbnail: "/diverse-music-collection.png",
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    name: "Books",
    type: "books",
    itemCount: 156,
    icon: BookOpen,
    thumbnail: "/books-collection.png",
    lastUpdated: "2024-01-12",
  },
]

const mockSubscriptions = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 9.99,
    features: ["Access to Movies & TV", "HD Streaming", "2 Concurrent Streams"],
    popular: false,
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 19.99,
    features: ["All Content Access", "4K Streaming", "5 Concurrent Streams", "Offline Downloads"],
    popular: true,
  },
  {
    id: "family",
    name: "Family Plan",
    price: 29.99,
    features: ["All Premium Features", "10 User Profiles", "Unlimited Streams", "Parental Controls"],
    popular: false,
  },
]

const mockResellerStats = [
  { label: "Active Customers", value: 1247, icon: Users },
  { label: "Monthly Revenue", value: "$24,890", icon: DollarSign },
  { label: "Total Libraries", value: 4, icon: Server },
  { label: "Content Items", value: 4913, icon: Play },
]

export default function JellyfinStore() {
  const [serverUrl, setServerUrl] = useState("http://localhost:8096")
  const [isConnected, setIsConnected] = useState(true) // Mock connection status
  const [searchQuery, setSearchQuery] = useState("")

  const filteredLibraries = mockLibraries.filter((library) =>
    library.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Jellyfin Store</h1>
                <p className="text-sm text-muted-foreground">
                  Connected to: {serverUrl}
                  <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
                    {isConnected ? "Online" : "Offline"}
                  </Badge>
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Server Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="libraries" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="libraries">Libraries</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="reseller">Reseller</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Libraries Tab */}
          <TabsContent value="libraries" className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search libraries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Scan Libraries
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLibraries.map((library) => {
                const IconComponent = library.icon
                return (
                  <Card key={library.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={library.thumbnail || "/placeholder.svg"}
                        alt={library.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="sm" variant="secondary">
                          <Eye className="h-4 w-4 mr-2" />
                          Browse
                        </Button>
                      </div>
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{library.name}</CardTitle>
                      </div>
                      <CardDescription>{library.itemCount.toLocaleString()} items</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Updated {library.lastUpdated}</span>
                        <Badge variant="outline">{library.type}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Choose Your Plan</h2>
              <p className="text-muted-foreground">Select the perfect subscription for your needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockSubscriptions.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-primary">
                      ${plan.price}
                      <span className="text-lg font-normal text-muted-foreground">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscribe Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reseller Tab */}
          <TabsContent value="reseller" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Reseller Dashboard</h2>
                <p className="text-muted-foreground">Manage your customers and revenue</p>
              </div>
              <Button>
                <Users className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockResellerStats.map((stat, index) => {
                const IconComponent = stat.icon
                return (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Customers</CardTitle>
                  <CardDescription>Latest customer subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "John Doe", plan: "Premium", date: "2024-01-15", status: "Active" },
                      { name: "Jane Smith", plan: "Basic", date: "2024-01-14", status: "Active" },
                      { name: "Mike Johnson", plan: "Family", date: "2024-01-13", status: "Pending" },
                    ].map((customer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.plan} Plan</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={customer.status === "Active" ? "default" : "secondary"}>
                            {customer.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{customer.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { month: "January 2024", amount: "$24,890", growth: "+12%" },
                      { month: "December 2023", amount: "$22,150", growth: "+8%" },
                      { month: "November 2023", amount: "$20,480", growth: "+15%" },
                    ].map((revenue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{revenue.month}</p>
                          <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{revenue.amount}</p>
                          <p className="text-sm text-green-600">{revenue.growth}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Server Configuration</CardTitle>
                <CardDescription>Configure your Jellyfin server connection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="server-url">Server URL</Label>
                    <Input
                      id="server-url"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="http://localhost:8096"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input id="api-key" type="password" placeholder="Enter your Jellyfin API key" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>
                    <Server className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                  <Button variant="outline">Save Configuration</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>Configure your store preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input id="store-name" defaultValue="Jellyfin Store" placeholder="Enter store name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input id="currency" defaultValue="USD" placeholder="USD, EUR, GBP..." />
                  </div>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
