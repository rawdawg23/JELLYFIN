"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  Crown,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Tag,
} from "lucide-react"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"
import { useTicketStore } from "@/lib/ticket-store"
import { useAuth } from "@/providers/auth-provider"

export function TicketSystem() {
  const { user } = useAuth()
  const { tickets, createTicket, updateTicketStatus, addTicketReply } = useTicketStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  })

  const categories = [
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Payments" },
    { value: "account", label: "Account Issues" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Bug Report" },
    { value: "other", label: "Other" },
  ]

  const priorities = [
    { value: "low", label: "Low", color: "bg-green-100 text-green-700" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
  ]

  const statuses = [
    { value: "open", label: "Open", color: "bg-blue-100 text-blue-700", icon: AlertCircle },
    { value: "in-progress", label: "In Progress", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    { value: "resolved", label: "Resolved", color: "bg-green-100 text-green-700", icon: CheckCircle },
    { value: "closed", label: "Closed", color: "bg-gray-100 text-gray-700", icon: XCircle },
  ]

  const getFilteredTickets = () => {
    return tickets
      .filter((ticket) => {
        const matchesSearch =
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.author.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
        const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
        const isUserTicket = ticket.author === user?.username || user?.role === "admin" || user?.role === "moderator"
        return matchesSearch && matchesStatus && matchesPriority && isUserTicket
      })
      .sort((a, b) => {
        // Sort by priority first, then by creation date
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder]
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder]

        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }

  const handleCreateTicket = () => {
    if (!user) return

    createTicket({
      ...newTicket,
      author: user.username,
      authorRole: user.role,
    })

    setNewTicket({ title: "", description: "", category: "", priority: "medium" })
    setShowCreateDialog(false)
  }

  const handleReply = () => {
    if (!selectedTicket || !replyContent.trim() || !user) return

    addTicketReply(selectedTicket.id, {
      content: replyContent,
      author: user.username,
      authorRole: user.role,
    })

    setReplyContent("")
  }

  const handleTicketClick = (ticket: any) => {
    setSelectedTicket(ticket)
  }

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    updateTicketStatus(ticketId, newStatus)
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-yellow-500" />
      case "moderator":
        return <Shield className="h-3 w-3 text-blue-500" />
      default:
        return <User className="h-3 w-3 text-purple-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-gradient-to-r from-yellow-500 to-orange-500",
      moderator: "bg-gradient-to-r from-blue-500 to-indigo-500",
      user: "bg-gradient-to-r from-purple-500 to-indigo-500",
    }
    return colors[role as keyof typeof colors] || colors.user
  }

  const getStatusInfo = (status: string) => {
    return statuses.find((s) => s.value === status) || statuses[0]
  }

  const getPriorityInfo = (priority: string) => {
    return priorities.find((p) => p.value === priority) || priorities[1]
  }

  if (!user) {
    return (
      <Card className="ios-card border-0">
        <CardContent className="text-center py-12">
          <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to access the support system.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Support Tickets
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-2">Get help from our support team</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="ios-button text-white border-0 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>Describe your issue and we'll help you resolve it</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-title">Title</Label>
                <Input
                  id="ticket-title"
                  placeholder="Brief description of your issue"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="ios-search border-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticket-category">Category</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger className="ios-search border-0">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-priority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger className="ios-search border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-description">Description</Label>
                <Textarea
                  id="ticket-description"
                  placeholder="Provide detailed information about your issue..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="ios-search border-0 min-h-[120px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateTicket} className="ios-button text-white border-0 flex-1">
                  <Ticket className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tickets" className="space-y-4 sm:space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-2">
          <TabsTrigger value="tickets">
            <Ticket className="h-4 w-4 mr-2" />
            All Tickets
          </TabsTrigger>
          <TabsTrigger value="ticket" disabled={!selectedTicket}>
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {selectedTicket ? `#${selectedTicket.id.slice(-6)}` : "Select Ticket"}
            </span>
            <span className="sm:hidden">Details</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 ios-search border-0"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 ios-search border-0">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32 ios-search border-0">
                  <Tag className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {getFilteredTickets().map((ticket) => {
              const statusInfo = getStatusInfo(ticket.status)
              const priorityInfo = getPriorityInfo(ticket.priority)
              const StatusIcon = statusInfo.icon

              return (
                <Card
                  key={ticket.id}
                  className="ios-card border-0 cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <StatusIcon className="h-4 w-4" />
                          <CardTitle className="text-base sm:text-lg line-clamp-1">{ticket.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            {getRoleIcon(ticket.authorRole)}
                            <span className="text-sm font-medium">{ticket.author}</span>
                            <Badge
                              className={`ios-badge text-white border-0 text-xs ${getRoleBadge(ticket.authorRole)}`}
                            >
                              {ticket.authorRole}
                            </Badge>
                          </div>
                          <Badge className={`ios-badge text-xs border-0 ${statusInfo.color}`}>{statusInfo.label}</Badge>
                          <Badge className={`ios-badge text-xs border-0 ${priorityInfo.color}`}>
                            {priorityInfo.label}
                          </Badge>
                          <Badge className="ios-badge text-xs bg-purple-100 text-purple-700 border-0 capitalize">
                            {categories.find((c) => c.value === ticket.category)?.label || ticket.category}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{ticket.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{ticket.replies} replies</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>#{ticket.id.slice(-6)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="hidden sm:inline">{getRelativeTime(ticket.createdAt)}</span>
                        <span className="sm:hidden">{getRelativeTime(ticket.createdAt).split(" ")[0]}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {getFilteredTickets().length === 0 && (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <Ticket className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                    ? "No tickets match your filters."
                    : "You haven't created any support tickets yet."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ticket" className="space-y-4 sm:space-y-6">
          {selectedTicket ? (
            <div className="space-y-4 sm:space-y-6">
              <Card className="ios-card border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <CardTitle className="text-lg sm:text-xl">{selectedTicket.title}</CardTitle>
                        <Badge className="ios-badge text-xs bg-gray-100 text-gray-700 border-0">
                          #{selectedTicket.id.slice(-6)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(selectedTicket.authorRole)}
                          <span className="font-medium">{selectedTicket.author}</span>
                          <Badge
                            className={`ios-badge text-white border-0 text-xs ${getRoleBadge(selectedTicket.authorRole)}`}
                          >
                            {selectedTicket.authorRole}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatUKDateTime(selectedTicket.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className={`ios-badge text-xs border-0 ${getStatusInfo(selectedTicket.status).color}`}>
                          {getStatusInfo(selectedTicket.status).label}
                        </Badge>
                        <Badge
                          className={`ios-badge text-xs border-0 ${getPriorityInfo(selectedTicket.priority).color}`}
                        >
                          {getPriorityInfo(selectedTicket.priority).label}
                        </Badge>
                        <Badge className="ios-badge text-xs bg-purple-100 text-purple-700 border-0 capitalize">
                          {categories.find((c) => c.value === selectedTicket.category)?.label ||
                            selectedTicket.category}
                        </Badge>
                      </div>
                    </div>
                    {(user?.role === "admin" || user?.role === "moderator") && (
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                      >
                        <SelectTrigger className="w-32 ios-search border-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 rounded-xl mb-4">
                    <p className="leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{selectedTicket.replies} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created {getRelativeTime(selectedTicket.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedTicket.replies_data && selectedTicket.replies_data.length > 0 && (
                <Card className="ios-card border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Replies ({selectedTicket.replies_data.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedTicket.replies_data.map((reply: any) => (
                      <div key={reply.id} className="border-l-2 border-purple-200 pl-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {getRoleIcon(reply.authorRole)}
                          <span className="font-medium text-sm">{reply.author}</span>
                          <Badge className={`ios-badge text-white border-0 text-xs ${getRoleBadge(reply.authorRole)}`}>
                            {reply.authorRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{getRelativeTime(reply.timestamp)}</span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {selectedTicket.status !== "closed" && (
                <Card className="ios-card border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Add Reply</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Add additional information or ask questions..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="ios-search border-0 min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReply}
                        className="ios-button text-white border-0"
                        disabled={!replyContent.trim()}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <Ticket className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a ticket to view details and replies</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
