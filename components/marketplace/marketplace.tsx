"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, MessageCircle, ShoppingCart, Heart, MapPin, Shield, Sparkles, Eye, Plus } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"
import { MarketplaceMessaging } from "./marketplace-messaging"

interface MarketplaceItem {
  id: string
  title: string
  description: string
  price: number
  category: string
  seller: {
    id: string
    name: string
    avatar: string
    rating: number
    verified: boolean
    location: string
  }
  images: string[]
  tags: string[]
  condition: "new" | "like-new" | "good" | "fair"
  createdAt: Date
  views: number
  likes: number
  isLiked: boolean
  inStock: boolean
  featured: boolean
}

const mockItems: MarketplaceItem[] = [
  {
    id: "1",
    title: "Premium Jellyfin Server Access - 4K Streaming",
    description:
      "High-performance Jellyfin server with 4K streaming, 99.9% uptime, and 24/7 support. Perfect for families and media enthusiasts.",
    price: 29.99,
    category: "Server Access",
    seller: {
      id: "seller1",
      name: "MediaPro Solutions",
      avatar: "/placeholder-user.jpg",
      rating: 4.9,
      verified: true,
      location: "New York, USA",
    },
    images: ["/server-screenshot.png", "/placeholder.png"],
    tags: ["4K", "Premium", "24/7 Support", "High Uptime"],
    condition: "new",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    views: 1247,
    likes: 89,
    isLiked: false,
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    title: "Custom Jellyfin Setup & Configuration",
    description:
      "Professional Jellyfin server setup and configuration service. Includes media organization, user management, and optimization.",
    price: 149.99,
    category: "Services",
    seller: {
      id: "seller2",
      name: "TechWizard",
      avatar: "/placeholder-user.jpg",
      rating: 4.8,
      verified: true,
      location: "London, UK",
    },
    images: ["/placeholder.png"],
    tags: ["Setup", "Configuration", "Professional", "Custom"],
    condition: "new",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    views: 892,
    likes: 67,
    isLiked: true,
    inStock: true,
    featured: false,
  },
  {
    id: "3",
    title: "Jellyfin Media Collection - Movies & TV Shows",
    description:
      "Curated collection of popular movies and TV shows, properly organized and tagged for Jellyfin. Regular updates included.",
    price: 79.99,
    category: "Content",
    seller: {
      id: "seller3",
      name: "ContentCurator",
      avatar: "/placeholder-user.jpg",
      rating: 4.7,
      verified: false,
      location: "Toronto, Canada",
    },
    images: ["/diverse-movie-collection.png", "/tv-shows-collection.png"],
    tags: ["Movies", "TV Shows", "Curated", "Updated"],
    condition: "new",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    views: 634,
    likes: 45,
    isLiked: false,
    inStock: true,
    featured: true,
  },
  {
    id: "4",
    title: "Jellyfin Mobile App Premium Features",
    description:
      "Unlock premium features for Jellyfin mobile apps including offline downloads, advanced playback controls, and ad-free experience.",
    price: 19.99,
    category: "Apps",
    seller: {
      id: "seller4",
      name: "MobileDevPro",
      avatar: "/placeholder-user.jpg",
      rating: 4.6,
      verified: true,
      location: "San Francisco, USA",
    },
    images: ["/placeholder.png"],
    tags: ["Mobile", "Premium", "Offline", "Ad-free"],
    condition: "new",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    views: 456,
    likes: 32,
    isLiked: false,
    inStock: true,
    featured: false,
  },
]

export function Marketplace() {
  const { user } = useAuth()
  const [items, setItems] = useState<MarketplaceItem[]>(mockItems)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null)
  const [showMessaging, setShowMessaging] = useState(false)
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null)
  const [showSellForm, setShowSellForm] = useState(false)

  const categories = ["All", "Server Access", "Services", "Content", "Apps", "Hardware"]

  const filteredItems = items
    .filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "popular":
          return b.views - a.views
        case "rating":
          return b.seller.rating - a.seller.rating
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

  const handleLike = (itemId: string) => {
    if (!user) {
      alert("Please sign in to like items")
      return
    }

    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, likes: item.isLiked ? item.likes - 1 : item.likes + 1, isLiked: !item.isLiked }
          : item,
      ),
    )
  }

  const handleMessageSeller = (sellerId: string, sellerName: string) => {
    if (!user) {
      alert("Please sign in to message sellers")
      return
    }

    setSelectedSeller(sellerId)
    setShowMessaging(true)
  }

  const handleBuyNow = (item: MarketplaceItem) => {
    if (!user) {
      alert("Please sign in to make purchases")
      return
    }

    // Simulate purchase process
    alert(`Redirecting to payment for ${item.title} - £${item.price.toFixed(2)}`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(price)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "like-new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "good":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "fair":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-8 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl border border-purple-500/20 px-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Jellyfin Marketplace
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover premium servers, services, and content from verified sellers worldwide
          </p>
        </div>
        {user && (
          <Button
            onClick={() => setShowSellForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Sell Item
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm p-4 rounded-xl border">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search marketplace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-purple-500/20 focus:border-purple-400"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-purple-500/20">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-purple-500/20">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Featured Items */}
      {filteredItems.some((item) => item.featured) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Featured Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems
              .filter((item) => item.featured)
              .map((item) => (
                <Card
                  key={item.id}
                  className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-card via-card to-purple-500/5 border-purple-500/20 overflow-hidden"
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <div className="relative overflow-hidden">
                    <img
                      src={item.images[0] || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-white hover:bg-white/20"
                      onClick={() => handleLike(item.id)}
                    >
                      <Heart className={`h-4 w-4 ${item.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-400 transition-colors">
                        {item.title}
                      </CardTitle>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-green-600">{formatPrice(item.price)}</div>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={item.seller.avatar || "/placeholder.svg"} alt={item.seller.name} />
                        <AvatarFallback>{item.seller.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium truncate">{item.seller.name}</span>
                          {item.seller.verified && <Shield className="h-3 w-3 text-blue-500" />}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{item.seller.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {item.views}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.seller.location}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => handleMessageSeller(item.seller.id, item.seller.name)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message Seller
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBuyNow(item)}
                        className="border-green-500/20 hover:bg-green-500/10"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* All Items */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">All Items ({filteredItems.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-card/50 backdrop-blur-sm border-purple-500/10 hover:border-purple-500/30 overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={item.images[0] || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-white hover:bg-white/20"
                  onClick={() => handleLike(item.id)}
                >
                  <Heart className={`h-4 w-4 ${item.isLiked ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="destructive">Out of Stock</Badge>
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base line-clamp-2 group-hover:text-purple-400 transition-colors">
                  {item.title}
                </CardTitle>
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-green-600">{formatPrice(item.price)}</div>
                  <Badge className={getConditionColor(item.condition)}>{item.condition}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.seller.avatar || "/placeholder.svg"} alt={item.seller.name} />
                    <AvatarFallback className="text-xs">{item.seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium truncate">{item.seller.name}</span>
                      {item.seller.verified && <Shield className="h-3 w-3 text-blue-500" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{item.seller.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {item.views}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {item.likes}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs"
                    onClick={() => handleMessageSeller(item.seller.id, item.seller.name)}
                    disabled={!item.inStock}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBuyNow(item)}
                    className="border-green-500/20 hover:bg-green-500/10"
                    disabled={!item.inStock}
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Messaging Modal */}
      {showMessaging && selectedSeller && (
        <MarketplaceMessaging
          isOpen={showMessaging}
          onClose={() => {
            setShowMessaging(false)
            setSelectedSeller(null)
          }}
          sellerId={selectedSeller}
          sellerName={items.find((item) => item.seller.id === selectedSeller)?.seller.name || "Seller"}
        />
      )}

      {/* Sell Item Form */}
      {showSellForm && (
        <Dialog open={showSellForm} onOpenChange={setShowSellForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>List New Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input placeholder="Enter item title" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea className="w-full p-2 border rounded-md" rows={3} placeholder="Describe your item" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (£)</label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat !== "All")
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma separated)</label>
                <Input placeholder="e.g. 4K, Premium, Support" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">List Item</Button>
                <Button variant="outline" onClick={() => setShowSellForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
