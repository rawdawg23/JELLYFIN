"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMarketplaceStore } from "@/lib/marketplace-store"
import { useAuth } from "@/providers/auth-provider"
import { Search, Filter, Grid, List, Heart, Eye, MapPin, Truck, Flag, Star, ShoppingCart } from "lucide-react"

export function ResponsiveMarketplace() {
  const { user } = useAuth()
  const { getFilteredItems, filters, setFilters, viewMode, setViewMode, sortBy, setSortBy, reportItem } =
    useMarketplaceStore()

  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const filteredItems = getFilteredItems()
  const selectedItemData = filteredItems.find((item) => item.id === selectedItem)

  const handleSearch = (value: string) => {
    setFilters({ search: value })
  }

  const handleCategoryFilter = (category: string) => {
    setFilters({ category })
  }

  const handlePriceFilter = (min: number, max: number) => {
    setFilters({ minPrice: min, maxPrice: max })
  }

  const handleConditionFilter = (conditions: string[]) => {
    setFilters({ condition: conditions })
  }

  const handleReportItem = (itemId: string, reason: string) => {
    if (!user) return
    reportItem(itemId, reason, user.id)
    setReportReason("")
    setSelectedItem(null)
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "new":
        return "bg-green-500"
      case "like-new":
        return "bg-blue-500"
      case "good":
        return "bg-yellow-500"
      case "fair":
        return "bg-orange-500"
      case "poor":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">Discover amazing Jellyfin content and services</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            <Grid className="w-4 h-4" />
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filters.category} onValueChange={handleCategoryFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="servers">Servers</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="themes">Themes</SelectItem>
              <SelectItem value="plugins">Plugins</SelectItem>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="services">Services</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Price Range</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ minPrice: Number.parseFloat(e.target.value) || 0 })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ maxPrice: Number.parseFloat(e.target.value) || 1000 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Condition</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {["new", "like-new", "good", "fair", "poor"].map((condition) => (
                    <Button
                      key={condition}
                      variant={filters.condition.includes(condition) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newConditions = filters.condition.includes(condition)
                          ? filters.condition.filter((c) => c !== condition)
                          : [...filters.condition, condition]
                        handleConditionFilter(newConditions)
                      }}
                    >
                      {condition}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => setFilters({ location: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      category: "all",
                      minPrice: 0,
                      maxPrice: 1000,
                      condition: [],
                      location: "",
                      search: "",
                      status: ["active"],
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{filteredItems.length} items found</p>
      </div>

      {/* Items Grid/List */}
      <div
        className={
          viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"
        }
      >
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No items found matching your criteria</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className={viewMode === "list" ? "flex flex-row" : ""}>
              <div className={viewMode === "list" ? "w-48 flex-shrink-0" : ""}>
                <img
                  src={item.images[0] || "/placeholder.png"}
                  alt={item.title}
                  className={`w-full object-cover rounded-t-lg ${
                    viewMode === "list" ? "h-32 rounded-l-lg rounded-t-none" : "h-48"
                  }`}
                />
              </div>
              <div className={viewMode === "list" ? "flex-1" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{item.title}</CardTitle>
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getConditionColor(item.condition)}>{item.condition}</Badge>
                    {item.sellerVerified && (
                      <Badge variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-bold text-green-600 mb-2">£{item.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {item.views}
                      </span>
                      <span className="flex items-center">
                        <Heart className="w-3 h-3 mr-1" />
                        {item.favorites}
                      </span>
                      {item.location && (
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.location}
                        </span>
                      )}
                    </div>
                    {item.shipping?.available && (
                      <span className="flex items-center">
                        <Truck className="w-3 h-3 mr-1" />
                        Shipping
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="flex-1" onClick={() => setSelectedItem(item.id)}>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        {selectedItemData && (
                          <>
                            <DialogHeader>
                              <DialogTitle>{selectedItemData.title}</DialogTitle>
                              <DialogDescription>
                                Listed by {selectedItemData.sellerName}
                                {selectedItemData.sellerVerified && (
                                  <Badge variant="outline" className="ml-2">
                                    <Star className="w-3 h-3 mr-1" />
                                    Verified Seller
                                  </Badge>
                                )}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <img
                                  src={selectedItemData.images[0] || "/placeholder.png"}
                                  alt={selectedItemData.title}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                              </div>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-3xl font-bold text-green-600">
                                    £{selectedItemData.price.toFixed(2)}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <Badge className={getConditionColor(selectedItemData.condition)}>
                                      {selectedItemData.condition}
                                    </Badge>
                                    <Badge variant="outline">{selectedItemData.category}</Badge>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Eye className="w-4 h-4 mr-2" />
                                    {selectedItemData.views} views
                                  </div>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Heart className="w-4 h-4 mr-2" />
                                    {selectedItemData.favorites} favorites
                                  </div>
                                  {selectedItemData.location && (
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <MapPin className="w-4 h-4 mr-2" />
                                      {selectedItemData.location}
                                    </div>
                                  )}
                                </div>
                                {selectedItemData.shipping?.available && (
                                  <div className="p-3 bg-muted rounded-lg">
                                    <div className="flex items-center text-sm font-medium mb-1">
                                      <Truck className="w-4 h-4 mr-2" />
                                      Shipping Available
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      £{selectedItemData.shipping.cost.toFixed(2)} •{" "}
                                      {selectedItemData.shipping.methods.join(", ")}
                                    </p>
                                  </div>
                                )}
                                <div className="flex space-x-2">
                                  <Button className="flex-1">
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Buy Now
                                  </Button>
                                  <Button variant="outline">
                                    <Heart className="w-4 h-4" />
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline">
                                        <Flag className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Report Item</DialogTitle>
                                        <DialogDescription>Why are you reporting this item?</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <Select value={reportReason} onValueChange={setReportReason}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select a reason" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                                            <SelectItem value="spam">Spam or misleading</SelectItem>
                                            <SelectItem value="copyright">Copyright violation</SelectItem>
                                            <SelectItem value="fraud">Fraudulent listing</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          onClick={() => handleReportItem(selectedItemData.id, reportReason)}
                                          disabled={!reportReason}
                                          className="w-full"
                                        >
                                          Submit Report
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                            <div className="mt-6">
                              <h3 className="font-semibold mb-2">Description</h3>
                              <p className="text-sm">{selectedItemData.description}</p>
                            </div>
                            <div className="mt-4">
                              <h3 className="font-semibold mb-2">Tags</h3>
                              <div className="flex flex-wrap gap-1">
                                {selectedItemData.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
