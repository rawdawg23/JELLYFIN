"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Paperclip,
  Search,
  Filter,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"

interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: "technical" | "billing" | "general" | "feature-request"
  createdAt: string
  updatedAt: string
  userId: string
  assignedTo?: string
  messages: TicketMessage[]
}

interface TicketMessage {
  id: string
  content: string
  userId: string
  username: string
  avatar?: string
  isStaff: boolean
  createdAt: string
}

export function TicketSystem() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "ticket-1",
      title: "Unable to stream 4K content",
      description: "I'm having issues streaming 4K movies. The video keeps buffering.",
      status: "open",
      priority: "high",
      category: "technical",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      userId: user?.id || "",
      messages: [
        {
          id: "msg-1",
          content: "I'm having issues streaming 4K movies. The video keeps buffering every few minutes.",
          userId: user?.id || "",
          username: user?.username || "",
          avatar: user?.avatar,
          isStaff: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "msg-2",
          content:
            "Hi! I'll look into this for you. Can you tell me which device you're using and your internet speed?",
          userId: "staff-1",
          username: "Support Team",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=support",
          isStaff: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    },
    {
      id: "ticket-2",
      title: "Billing question about family plan",
      description: "I want to upgrade to the family plan but have questions about pricing.",
      status: "resolved",
      priority: "medium",
      category: "billing",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      userId: user?.id || "",
      messages: [],
    },
  ])

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [newTicketForm, setNewTicketForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  })
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      open: "bg-orange-100 text-orange-700",
      "in-progress": "bg-blue-100 text-blue-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-gray-700",
    }
    return colors[status as keyof typeof colors] || colors.open
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const handleCreateTicket = () => {
    if (!newTicketForm.title || !newTicketForm.description || !newTicketForm.category) return

    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      title: newTicketForm.title,
      description: newTicketForm.description,
      status: "open",
      priority: newTicketForm.priority as any,
      category: newTicketForm.category as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id || "",
      messages: [
        {
          id: `msg-${Date.now()}`,
          content: newTicketForm.description,
          userId: user?.id || "",
          username: user?.username || "",
          avatar: user?.avatar,
          isStaff: false,
          createdAt: new Date().toISOString(),
        },
      ],
    }

    setTickets([newTicket, ...tickets])
    setNewTicketForm({ title: "", description: "", category: "", priority: "medium" })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return

    const message: TicketMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      userId: user?.id || "",
      username: user?.username || "",
      avatar: user?.avatar,
      isStaff: false,
      createdAt: new Date().toISOString(),
    }

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      updatedAt: new Date().toISOString(),
    }

    setTickets(tickets.map((t) => (t.id === selectedTicket.id ? updatedTicket : t)))
    setSelectedTicket(updatedTicket)
    setNewMessage("")
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!user) {
    return (
      <Card className="ios-card border-0 text-center p-8">
        <CardContent>
          <AlertCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Support Tickets
          </h2>
          <p className="text-muted-foreground mt-2">Get help from our support team</p>
        </div>
        <Dialog>
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
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-category">Category</Label>
                <Select
                  value={newTicketForm.category}
                  onValueChange={(value) => setNewTicketForm({ ...newTicketForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="billing">Billing & Account</SelectItem>
                    <SelectItem value="general">General Question</SelectItem>
                    <SelectItem value="feature-request">Feature Request</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-priority">Priority</Label>
                <Select
                  value={newTicketForm.priority}
                  onValueChange={(value) => setNewTicketForm({ ...newTicketForm, priority: value })}
                >
                  <SelectTrigger>
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
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateTicket} className="w-full ios-button text-white border-0">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ios-search pl-10 border-0"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-foreground">Your Tickets ({filteredTickets.length})</h3>
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Card
                key={ticket.id}
                className={`ios-card border-0 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedTicket?.id === ticket.id ? "ring-2 ring-purple-400" : ""
                }`}
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-foreground line-clamp-2">{ticket.title}</h4>
                      {getStatusIcon(ticket.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border-0 ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.replace("-", " ")}
                      </Badge>
                      <Badge className={`text-xs border-0 ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Updated {getRelativeTime(ticket.updatedAt)}</p>
                      <p className="flex items-center gap-1 mt-1">
                        <MessageSquare className="h-3 w-3" />
                        {ticket.messages.length} messages
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="ios-card border-0">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedTicket.title}</CardTitle>
                    <CardDescription className="mt-2">
                      Ticket #{selectedTicket.id} • Created {formatUKDateTime(selectedTicket.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs border-0 ${getStatusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status.replace("-", " ")}
                    </Badge>
                    <Badge className={`text-xs border-0 ${getPriorityBadge(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTicket.messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.username} />
                        <AvatarFallback className="text-sm bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                          {message.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{message.username}</span>
                          {message.isStaff && (
                            <Badge className="text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0">
                              Staff
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{getRelativeTime(message.createdAt)}</span>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl">
                          <p className="text-sm text-foreground">{message.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== "closed" && (
                  <div className="border-t pt-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                        <AvatarFallback className="text-sm bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <Button variant="outline" size="sm">
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach File
                          </Button>
                          <Button onClick={handleSendMessage} className="ios-button text-white border-0">
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="ios-card border-0 text-center p-12">
              <CardContent>
                <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Ticket</h3>
                <p className="text-muted-foreground">Choose a ticket from the list to view the conversation</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
