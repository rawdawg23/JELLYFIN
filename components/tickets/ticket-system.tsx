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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  Paperclip,
  User,
  Shield,
  Crown,
  Settings,
} from "lucide-react"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"
import { useAuth } from "@/lib/auth-context"

interface Ticket {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "resolved" | "closed"
  createdAt: string
  updatedAt: string
  userId: string
  userName: string
  userEmail: string
  messages: Array<{
    id: string
    content: string
    sender: string
    isStaff: boolean
    timestamp: string
    userId?: string
  }>
}

export function TicketSystem() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "TICK-001",
      title: "Unable to stream 4K content",
      description: "I'm having trouble streaming 4K movies. The video keeps buffering.",
      category: "technical",
      priority: "high",
      status: "in-progress",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      userId: "user-123",
      userName: "John Smith",
      userEmail: "john@example.com",
      messages: [
        {
          id: "1",
          content: "I'm having trouble streaming 4K movies. The video keeps buffering every few minutes.",
          sender: "John Smith",
          isStaff: false,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          userId: "user-123",
        },
        {
          id: "2",
          content:
            "Hi John! I can help you with that. Can you tell me what device you're using and your internet speed?",
          sender: "Support Team",
          isStaff: true,
          timestamp: new Date(Date.now() - 82800000).toISOString(),
        },
        {
          id: "3",
          content: "I'm using a Samsung TV app and my internet speed is 50 Mbps.",
          sender: "John Smith",
          isStaff: false,
          timestamp: new Date(Date.now() - 79200000).toISOString(),
          userId: "user-123",
        },
      ],
    },
    {
      id: "TICK-002",
      title: "Feature request: Dark mode",
      description: "Would love to see a dark mode option for the web interface.",
      category: "feature",
      priority: "low",
      status: "open",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      userId: "user-456",
      userName: "Sarah Johnson",
      userEmail: "sarah@example.com",
      messages: [
        {
          id: "1",
          content: "Would love to see a dark mode option for the web interface. It would be great for night viewing.",
          sender: "Sarah Johnson",
          isStaff: false,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          userId: "user-456",
        },
      ],
    },
    {
      id: "TICK-003",
      title: "Billing question about family plan",
      description: "I have a question about upgrading to the family plan.",
      category: "billing",
      priority: "medium",
      status: "resolved",
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      userId: "user-789",
      userName: "Mike Wilson",
      userEmail: "mike@example.com",
      messages: [
        {
          id: "1",
          content: "I have a question about upgrading to the family plan. What's included?",
          sender: "Mike Wilson",
          isStaff: false,
          timestamp: new Date(Date.now() - 259200000).toISOString(),
          userId: "user-789",
        },
        {
          id: "2",
          content:
            "The family plan includes 10 user profiles, unlimited streams, and parental controls. Would you like me to upgrade your account?",
          sender: "Support Team",
          isStaff: true,
          timestamp: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "3",
          content: "Yes, please upgrade my account. Thank you!",
          sender: "Mike Wilson",
          isStaff: false,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          userId: "user-789",
        },
      ],
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
  })

  // Filter tickets based on user role
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter

    // Admin sees all tickets, users see only their own
    const matchesUser = isAdmin || ticket.userId === user?.id

    return matchesSearch && matchesStatus && matchesUser
  })

  const handleCreateTicket = () => {
    if (!user) return

    const ticket: Ticket = {
      id: `TICK-${String(tickets.length + 1).padStart(3, "0")}`,
      ...newTicket,
      status: "open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user.id,
      userName: user.username,
      userEmail: user.email,
      messages: [
        {
          id: "1",
          content: newTicket.description,
          sender: user.username,
          isStaff: false,
          timestamp: new Date().toISOString(),
          userId: user.id,
        },
      ],
    }

    setTickets([ticket, ...tickets])
    setNewTicket({ title: "", description: "", category: "", priority: "medium" })
    setShowCreateDialog(false)
  }

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim() || !user) return

    const message = {
      id: (selectedTicket.messages.length + 1).toString(),
      content: newMessage,
      sender: user.username,
      isStaff: isAdmin,
      timestamp: new Date().toISOString(),
      userId: user.id,
    }

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      updatedAt: new Date().toISOString(),
      status: isAdmin && selectedTicket.status === "open" ? ("in-progress" as const) : selectedTicket.status,
    }

    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)))
    setSelectedTicket(updatedTicket)
    setNewMessage("")
  }

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    if (!isAdmin) return

    const updatedTickets = tickets.map((ticket) =>
      ticket.id === ticketId ? { ...ticket, status: newStatus as any, updatedAt: new Date().toISOString() } : ticket,
    )
    setTickets(updatedTickets)

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus as any, updatedAt: new Date().toISOString() })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4" />
      case "in-progress":
        return <AlertTriangle className="h-4 w-4" />
      case "resolved":
        return <CheckCircle className="h-4 w-4" />
      case "closed":
        return <XCircle className="h-4 w-4" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500"
      case "in-progress":
        return "bg-yellow-500"
      case "resolved":
        return "bg-green-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  if (!user) {
    return (
      <Card className="ios-card border-0">
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to access the support ticket system.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            {isAdmin && <Crown className="h-8 w-8 text-yellow-500" />}
            Support Tickets
            {isAdmin && (
              <Badge className="ios-badge bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                Admin
              </Badge>
            )}
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            {isAdmin ? "Manage all support tickets" : "Get help from our support team"}
          </p>
        </div>
        {!isAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="ios-button text-white border-0">
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
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
                <div className="space-y-2">
                  <Label htmlFor="ticket-category">Category</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger className="ios-search border-0">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing & Account</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="general">General Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-priority">Priority</Label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(value: any) => setNewTicket({ ...newTicket, priority: value })}
                  >
                    <SelectTrigger className="ios-search border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticket-description">Description</Label>
                  <Textarea
                    id="ticket-description"
                    placeholder="Provide detailed information about your issue"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    className="ios-search border-0 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateTicket} className="ios-button text-white border-0 flex-1">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Create Ticket
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="tickets" className="space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-2">
          <TabsTrigger value="tickets">
            <HelpCircle className="h-4 w-4 mr-2" />
            {isAdmin ? "All Tickets" : "My Tickets"}
          </TabsTrigger>
          <TabsTrigger value="chat" disabled={!selectedTicket}>
            <MessageSquare className="h-4 w-4 mr-2" />
            {selectedTicket ? `Ticket #${selectedTicket.id}` : "Select Ticket"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                placeholder={isAdmin ? "Search tickets or users..." : "Search tickets..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 ios-search border-0"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 ios-search border-0">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="ios-card border-0 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{ticket.title}</CardTitle>
                        <Badge className={`ios-badge text-white border-0 ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{ticket.description}</CardDescription>
                      {isAdmin && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.userName}`} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                              {ticket.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{ticket.userName}</span>
                          <span>•</span>
                          <span>{ticket.userEmail}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <Badge
                        className={`ios-badge text-white border-0 ${getStatusColor(ticket.status)} flex items-center gap-1`}
                      >
                        {getStatusIcon(ticket.status)}
                        <span className="capitalize">{ticket.status.replace("-", " ")}</span>
                      </Badge>
                      {isAdmin && (
                        <Select value={ticket.status} onValueChange={(value) => handleStatusChange(ticket.id, value)}>
                          <SelectTrigger className="w-32 h-8 text-xs ios-search border-0">
                            <Settings className="h-3 w-3 mr-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span>#{ticket.id}</span>
                      <span className="capitalize">{ticket.category}</span>
                      <span>{ticket.messages.length} messages</span>
                    </div>
                    <div className="text-right">
                      <div>Created {getRelativeTime(ticket.createdAt)}</div>
                      <div>Updated {getRelativeTime(ticket.updatedAt)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <HelpCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "No tickets match your filters."
                    : isAdmin
                      ? "No support tickets yet."
                      : "No support tickets yet."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          {selectedTicket ? (
            <div className="space-y-6">
              <Card className="ios-card border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedTicket.title}
                        <Badge
                          className={`ios-badge text-white border-0 ${getStatusColor(selectedTicket.status)} flex items-center gap-1`}
                        >
                          {getStatusIcon(selectedTicket.status)}
                          <span className="capitalize">{selectedTicket.status.replace("-", " ")}</span>
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Ticket #{selectedTicket.id} • {selectedTicket.category} • Created{" "}
                        {formatUKDateTime(selectedTicket.createdAt)}
                      </CardDescription>
                      {isAdmin && (
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedTicket.userName}`}
                            />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                              {selectedTicket.userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{selectedTicket.userName}</span>
                          <span className="text-sm text-muted-foreground">({selectedTicket.userEmail})</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={`ios-badge text-white border-0 ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority} priority
                      </Badge>
                      {isAdmin && (
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                        >
                          <SelectTrigger className="w-36 h-8 text-xs ios-search border-0">
                            <Settings className="h-3 w-3 mr-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="ios-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    Conversation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.isStaff ? "flex-row" : "flex-row-reverse"}`}>
                      <div className={`p-2 rounded-xl ${message.isStaff ? "bg-blue-500" : "bg-purple-500"}`}>
                        {message.isStaff ? (
                          <Shield className="h-4 w-4 text-white" />
                        ) : (
                          <User className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className={`flex-1 max-w-xs ${message.isStaff ? "text-left" : "text-right"}`}>
                        <div
                          className={`p-3 rounded-xl ${
                            message.isStaff ? "bg-blue-50 text-blue-900" : "bg-purple-50 text-purple-900"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span>{message.sender}</span>
                          {message.isStaff && (
                            <Badge className="ios-badge text-xs bg-blue-500 text-white border-0">Staff</Badge>
                          )}
                          <span>•</span>
                          <span>{getRelativeTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="ios-card border-0">
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder={isAdmin ? "Reply as support team..." : "Type your message..."}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="ios-search border-0 min-h-[80px] pr-12"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        className="absolute bottom-2 right-2 h-8 w-8 p-0 ios-button text-white border-0"
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button variant="outline" size="sm" className="ios-button bg-transparent">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a ticket to view the conversation</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
