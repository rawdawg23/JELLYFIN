"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Edit, Trash2, Eye, Heart, Package, DollarSign, Star } from "lucide-react"

export function SellerDashboard() {
  const { user } = useAuth()
  const { items, addItem, updateItem, deleteItem, getUserItems } = useMarketplaceStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)

  const userItems = getUserItems(user?.id || "")
  const totalEarnings = userItems.filter((item) => item.status === "sold").reduce((sum, item) => sum + item.price, 0)
  const activeListings = userItems.filter((item) => item.status === "active").length
  const pendingReviews = userItems.filter((item) => item.status === "pending").length
  const totalViews = userItems.reduce((sum, item) => sum + item.views, 0)

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    condition: "new" as const,
    images: [""],
    tags: "",
    location: "",
    shippingAvailable: false,
    shippingCost: 0,
    shippingMethods: "",
  })

  const handleAddItem = () => {
    if (!user) return

    addItem({
      title: newItem.title,
      description: newItem.description,
      price: newItem.price,
      currency: "GBP",
      category: newItem.category,
      condition: newItem.condition,
      images: newItem.images.filter((img) => img.trim() !== ""),
      sellerId: user.id,
      sellerName: user.username,
      sellerVerified: user.isAdmin,
      status: "pending",
      tags: newItem.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      location: newItem.location,
      shipping: {
        available: newItem.shippingAvailable,
        cost: newItem.shippingCost,
        methods: newItem.shippingMethods
          .split(",")
          .map((method) => method.trim())
          .filter((method) => method !== ""),
      },
    })

    // Reset form
    setNewItem({
      title: "",
      description: "",
      price: 0,
      category: "",
      condition: "new",
      images: [""],
      tags: "",
      location: "",
      shippingAvailable: false,
      shippingCost: 0,
      shippingMethods: "",
    })
    setIsAddDialogOpen(false)
  }

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(itemId)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "sold":
        return "bg-blue-500"
      case "rejected":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Please log in to access the seller dashboard.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your marketplace listings</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>Create a new marketplace listing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="Enter item title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe your item"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (£)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servers">Servers</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="themes">Themes</SelectItem>
                      <SelectItem value="plugins">Plugins</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={newItem.condition}
                  onValueChange={(value: any) => setNewItem({ ...newItem, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="images">Image URL</Label>
                <Input
                  id="images"
                  value={newItem.images[0]}
                  onChange={(e) => setNewItem({ ...newItem, images: [e.target.value] })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={newItem.tags}
                  onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="shipping"
                    checked={newItem.shippingAvailable}
                    onChange={(e) => setNewItem({ ...newItem, shippingAvailable: e.target.checked })}
                  />
                  <Label htmlFor="shipping">Shipping Available</Label>
                </div>
                {newItem.shippingAvailable && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingCost">Shipping Cost (£)</Label>
                      <Input
                        id="shippingCost"
                        type="number"
                        value={newItem.shippingCost}
                        onChange={(e) =>
                          setNewItem({ ...newItem, shippingCost: Number.parseFloat(e.target.value) || 0 })
                        }
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingMethods">Shipping Methods</Label>
                      <Input
                        id="shippingMethods"
                        value={newItem.shippingMethods}
                        onChange={(e) => setNewItem({ ...newItem, shippingMethods: e.target.value })}
                        placeholder="Standard, Express"
                      />
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={handleAddItem} className="w-full">
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>Manage your marketplace items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No items listed yet. Click "Add New Item" to get started!
              </p>
            ) : (
              userItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.images[0] || "/placeholder.png"}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">£{item.price.toFixed(2)}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Eye className="w-3 h-3 mr-1" />
                          {item.views}
                          <Heart className="w-3 h-3 ml-2 mr-1" />
                          {item.favorites}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
