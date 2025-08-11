"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  User,
  Calendar,
  Tag,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"

interface TicketData {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: "technical" | "billing" | "feature-request" | "bug-report" | "general"
  createdBy: string
  createdByName: string
  createdByAvatar?: string
  assignedTo?: string
  assignedToName?: string
  assignedToAvatar?: string
  createdAt: string
  updatedAt: string
  responses: TicketResponse[]
}

interface TicketResponse {
  id: string
  ticketId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  isStaff: boolean
  createdAt: string
}

const mockTickets: TicketData[] = [
  {
    id: "ticket-1",
    title: "Unable to connect to Jellyfin server",
    description:
      "I'm having trouble connecting my device to the Jellyfin server. The Quick Connect code doesn't seem to work.",
    status: "open",
    priority: "high",
    category: "technical",
    createdBy: "user-123",
    createdByName: "JellyUser",
    createdByAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    assignedTo: "admin-001",
    assignedToName: "OG Admin",
    assignedToAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    responses: [
      {
        id: "response-1",
        ticketId: "ticket-1",
        userId: "admin-001",
        userName: "OG Admin",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        content:
          "Hi! I'll help you with this. Can you tell me which device you're trying to connect and what error message you're seeing?",
        isStaff: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
    ],
  },
  {
    id: "ticket-2",
    title: "Feature request: Dark mode for web interface",
    description:
      "Would love to see a dark mode option for the web interface. It would be great for late-night viewing.",
    status: "in-progress",
    priority: "medium",
    category: "feature-request",
    createdBy: "user-456",
    createdByName: "MediaFan",
    createdByAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    responses: [],
  },
]

export function TicketSystem() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<TicketData[]>(mockTickets)
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null)
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
  })
  const [newResponse, setNewResponse] = useState("")

  if (!user) return null

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-blue-500 text-white"
      case "low":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const handleCreateTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim() || !newTicket.category) return

    const ticket: TicketData = {
      id: `ticket-${Date.now()}`,
      title: newTicket.title,
      description: newTicket.description,
      status: "open",
      priority: newTicket.priority as any,
      category: newTicket.category as any,
      createdBy: user.id,
      createdByName: user.username,
      createdByAvatar: user.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    }

    setTickets((prev) => [ticket, ...prev])
    setNewTicket({ title: "", description: "", category: "", priority: "medium" })
    setShowNewTicketDialog(false)
  }

  const handleAddResponse = () => {
    if (!newResponse.trim() || !selectedTicket) return

    const response: TicketResponse = {
      id: `response-${Date.now()}`,
      ticketId: selectedTicket,
      userId: user.id,
      userName: user.username,
      userAvatar: user.avatar,
      content: newResponse,
      isStaff: user.role === "admin" || user.role === "moderator",
      createdAt: new Date().toISOString(),
    }

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket
          ? {
              ...ticket,
              responses: [...ticket.responses, response],
              updatedAt: new Date().toISOString(),
            }
          : ticket,
      ),
    )

    setNewResponse("")
  }

  const selectedTicketData = tickets.find((t) => t.id === selectedTicket)

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="ios-card border-0 h-[700px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-green-500" />
                Support Tickets
              </CardTitle>
              <CardDescription>Get help from our support team</CardDescription>
            </div>
            <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
              <DialogTrigger asChild>
                <Button className="ios-button text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                  <DialogDescription>Describe your issue and we'll help you resolve it</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket((prev) => ({ ...prev, title: e.target.value }))}
                      className="ios-search border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(value) => setNewTicket((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="ios-search border-0">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="feature-request">Feature Request</SelectItem>
                        <SelectItem value="bug-report">Bug Report</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket((prev) => ({ ...prev, priority: value }))}
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
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Provide detailed information about your issue"
                      value={newTicket.description}
                      onChange={(e) => setNewTicket((prev) => ({ ...prev, description: e.target.value }))}
                      className="ios-search border-0 min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowNewTicketDialog(false)}
                      variant="outline"
                      className="flex-1 ios-button bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateTicket}
                      disabled={!newTicket.title.trim() || !newTicket.description.trim() || !newTicket.category}
                      className="flex-1 ios-button text-white border-0"
                    >
                      Create Ticket
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-[600px]">
          <div className="flex h-full">
            {/* Tickets List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 ios-search border-0"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="flex-1 ios-search border-0">
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
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="flex-1 ios-search border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTicket === ticket.id ? "bg-green-50 border-green-200" : ""
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">{ticket.title}</h4>
                        <div className="flex items-center gap-1 ml-2">{getStatusIcon(ticket.status)}</div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs ${getStatusBadgeColor(ticket.status)}`}>
                          {ticket.status.replace("-", " ")}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityBadgeColor(ticket.priority)}`}>{ticket.priority}</Badge>
                        <Badge variant="outline" className="text-xs">
                          {ticket.category.replace("-", " ")}
                        </Badge>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2">{ticket.description}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{ticket.createdByName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{getRelativeTime(ticket.createdAt)}</span>
                        </div>
                      </div>

                      {ticket.responses.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MessageSquare className="h-3 w-3" />
                          <span>
                            {ticket.responses.length} response{ticket.responses.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="flex-1 flex flex-col">
              {selectedTicketData ? (
                <>
                  {/* Ticket Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h2 className="text-lg font-semibold">{selectedTicketData.title}</h2>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedTicketData.status)}
                          <Badge className={`${getStatusBadgeColor(selectedTicketData.status)}`}>
                            {selectedTicketData.status.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <Badge className={`${getPriorityBadgeColor(selectedTicketData.priority)}`}>
                          {selectedTicketData.priority} priority
                        </Badge>
                        <Badge variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {selectedTicketData.category.replace("-", " ")}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Created {getRelativeTime(selectedTicketData.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedTicketData.createdByAvatar || "/placeholder.png"} />
                            <AvatarFallback className="text-xs">
                              {selectedTicketData.createdByName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-600">Created by {selectedTicketData.createdByName}</span>
                        </div>
                        {selectedTicketData.assignedTo && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={selectedTicketData.assignedToAvatar || "/placeholder.png"} />
                              <AvatarFallback className="text-xs">
                                {selectedTicketData.assignedToName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-gray-600">
                              Assigned to {selectedTicketData.assignedToName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ticket Content */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Original Ticket */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={selectedTicketData.createdByAvatar || "/placeholder.png"} />
                          <AvatarFallback>{selectedTicketData.createdByName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{selectedTicketData.createdByName}</span>
                            <span className="text-xs text-gray-500">
                              {formatUKDateTime(selectedTicketData.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{selectedTicketData.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Responses */}
                    {selectedTicketData.responses.map((response) => (
                      <div key={response.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={response.userAvatar || "/placeholder.png"} />
                          <AvatarFallback>{response.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{response.userName}</span>
                            {response.isStaff && <Badge className="text-xs bg-blue-100 text-blue-800">Staff</Badge>}
                            <span className="text-xs text-gray-500">{getRelativeTime(response.createdAt)}</span>
                          </div>
                          <div
                            className={`rounded-lg p-3 ${
                              response.isStaff ? "bg-blue-50 border border-blue-200" : "bg-white border border-gray-200"
                            }`}
                          >
                            <p className="text-sm">{response.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Response Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Type your response..."
                        value={newResponse}
                        onChange={(e) => setNewResponse(e.target.value)}
                        className="ios-search border-0 min-h-[80px]"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleAddResponse}
                          disabled={!newResponse.trim()}
                          className="ios-button text-white border-0"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Response
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Ticket className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Select a ticket</h3>
                    <p>Choose a ticket from the list to view details and responses</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
