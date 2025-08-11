"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  CheckCircle,
  XCircle,
  Eye,
  Flag,
  User,
  Package,
  AlertTriangle,
  Shield,
  Ban,
  UserCheck,
  Clock,
  Search,
  MoreHorizontal,
} from "lucide-react"
import { useMarketplaceStore } from "@/lib/marketplace-store"

export function MarketplaceModerationPanel() {
  const { items, updateItem, deleteItem, sellers, updateSeller } = useMarketplaceStore()
  const [selectedTab, setSelectedTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // Filter items based on status and search
  const filteredItems = items.filter((item) => {
    const matchesStatus = selectedTab === "all" || item.status === selectedTab
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Get priority items (reported items first)
  const priorityItems = filteredItems.sort((a, b) => {
    if (a.reports > 0 && b.reports === 0) return -1
    if (a.reports === 0 && b.reports > 0) return 1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })

  const handleApproveItem = (itemId: string) => {
    updateItem(itemId, { status: "active" })
  }

  const handleRejectItem = (itemId: string, reason: string) => {
    updateItem(itemId, {
      status: "rejected",
      rejectionReason: reason,
    })
    setSelectedItem(null)
    setRejectionReason("")
  }

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId)
  }

  const handleVerifySeller = (sellerId: string) => {
    updateSeller(sellerId, { verified: true })
  }

  const handleSuspendSeller = (sellerId: string) => {
    updateSeller(sellerId, { status: "suspended" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "sold":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSellerStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "suspended":
        return "bg-red-100 text-red-800"
      case "banned":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Statistics
  const stats = {
    totalItems: items.length,
    pendingItems: items.filter((item) => item.status === "pending").length,
    reportedItems: items.filter((item) => item.reports > 0).length,
    activeSellers: sellers.filter((seller) => seller.status === "active").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Marketplace Moderation</h1>
          <p className="text-muted-foreground">Review and moderate marketplace content</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Items</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.reportedItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSellers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">Pending ({stats.pendingItems})</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="sellers">Sellers</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items or sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-64"
              />
            </div>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Items Pending Review</CardTitle>
              <CardDescription>
                Review and approve or reject marketplace items. Reported items appear first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityItems
                  .filter((item) => item.status === "pending")
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        item.reports > 0 ? "border-red-200 bg-red-50" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {item.sellerName} • £{item.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                            {item.reports > 0 && (
                              <Badge variant="destructive">
                                <Flag className="h-3 w-3 mr-1" />
                                {item.reports} reports
                              </Badge>
                            )}
                            {item.sellerVerified && (
                              <Badge variant="secondary">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified Seller
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{item.title}</DialogTitle>
                              <DialogDescription>Review this item for approval or rejection</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <img
                                    src={item.images[0] || "/placeholder.svg"}
                                    alt={item.title}
                                    className="w-full h-48 object-cover rounded"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <Label>Price</Label>
                                    <p className="text-2xl font-bold text-green-600">£{item.price.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <Label>Category</Label>
                                    <p className="capitalize">{item.category}</p>
                                  </div>
                                  <div>
                                    <Label>Condition</Label>
                                    <p className="capitalize">{item.condition}</p>
                                  </div>
                                  <div>
                                    <Label>Seller</Label>
                                    <div className="flex items-center gap-2">
                                      <span>{item.sellerName}</span>
                                      {item.sellerVerified && <Shield className="h-4 w-4 text-blue-500" />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <p className="text-sm">{item.description}</p>
                              </div>
                              <div>
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-1">
                                  {item.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {item.reports > 0 && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded">
                                  <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <span className="font-medium text-red-800">
                                      This item has been reported {item.reports} time(s)
                                    </span>
                                  </div>
                                  <p className="text-sm text-red-700">Please review carefully before approving.</p>
                                </div>
                              )}
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => handleApproveItem(item.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject Item</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Please provide a reason for rejecting this item.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="space-y-2">
                                      <Label htmlFor="rejection-reason">Reason</Label>
                                      <Textarea
                                        id="rejection-reason"
                                        placeholder="Enter rejection reason..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                      />
                                    </div>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleRejectItem(item.id, rejectionReason)}>
                                        Reject Item
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => handleApproveItem(item.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject this item?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRejectItem(item.id, "Rejected by moderator")}>
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seller Management</CardTitle>
              <CardDescription>Manage seller accounts and verification status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Total Sales</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{seller.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{seller.name}</div>
                            <div className="text-sm text-muted-foreground">{seller.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSellerStatusColor(seller.status)}>{seller.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {seller.verified ? (
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">Unverified</Badge>
                        )}
                      </TableCell>
                      <TableCell>{seller.totalSales}</TableCell>
                      <TableCell>{seller.rating.toFixed(1)}</TableCell>
                      <TableCell>{seller.joinedAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!seller.verified && (
                            <Button variant="outline" size="sm" onClick={() => handleVerifySeller(seller.id)}>
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          {seller.status === "active" && (
                            <Button variant="outline" size="sm" onClick={() => handleSuspendSeller(seller.id)}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs content */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Items</CardTitle>
              <CardDescription>Currently active marketplace items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems
                  .filter((item) => item.status === "active")
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {item.sellerName} • £{item.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                            {item.reports > 0 && (
                              <Badge variant="destructive">
                                <Flag className="h-3 w-3 mr-1" />
                                {item.reports} reports
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this item from the marketplace?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Items</CardTitle>
              <CardDescription>Items that have been rejected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems
                  .filter((item) => item.status === "rejected")
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded opacity-50"
                        />
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {item.sellerName} • £{item.price.toFixed(2)}
                          </p>
                          <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          {item.rejectionReason && (
                            <p className="text-sm text-red-600 mt-1">Reason: {item.rejectionReason}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleApproveItem(item.id)}>
                          Reconsider
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete this item?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Items</CardTitle>
              <CardDescription>Complete list of marketplace items</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reports</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={item.images[0] || "/placeholder.svg"}
                            alt={item.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-sm text-muted-foreground capitalize">{item.category}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.sellerName}</TableCell>
                      <TableCell>£{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.reports > 0 ? (
                          <Badge variant="destructive">{item.reports}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>{item.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
