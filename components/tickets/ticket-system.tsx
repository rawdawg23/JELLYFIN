"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, MessageSquare, CheckCircle, Trash2 } from "lucide-react"
import { useTicketStore } from "@/lib/ticket-store"
import { format } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Ticket {
  id: string
  title: string
  description: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  timestamp: string
}

export function TicketSystem() {
  const [newTicketTitle, setNewTicketTitle] = useState("")
  const [newTicketDescription, setNewTicketDescription] = useState("")
  const [newTicketPriority, setNewTicketPriority] = useState<Ticket["priority"]>("low")
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
  const [newMessageContent, setNewMessageContent] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("All")
  const [filterPriority, setFilterPriority] = useState<string>("All")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [ticketToDeleteId, setTicketToDeleteId] = useState<string | null>(null)

  const currentUser = "Current User" // This would typically come from an auth context

  const { tickets, addTicket, updateTicketStatus, deleteTicket } = useTicketStore()

  const handleAddTicket = () => {
    if (newTicketTitle.trim() && newTicketDescription.trim()) {
      addTicket(newTicketTitle, newTicketDescription, newTicketPriority)
      setNewTicketTitle("")
      setNewTicketDescription("")
      setNewTicketPriority("low")
    }
  }

  const handleAddMessage = (ticketId: string) => {
    if (newMessageContent.trim()) {
      const now = new Date().toISOString()
      const message = {
        id: `msg-${Date.now()}`,
        sender: currentUser,
        content: newMessageContent.trim(),
        timestamp: now,
      }
      updateTicketStatus(ticketId, "in-progress")
      // Logic to add message to ticket should be implemented here
      setNewMessageContent("")
    }
  }

  const confirmDeleteTicket = (ticketId: string) => {
    setTicketToDeleteId(ticketId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirmed = () => {
    if (ticketToDeleteId) {
      deleteTicket(ticketToDeleteId)
      setShowDeleteDialog(false)
      setTicketToDeleteId(null)
      setSelectedTicketId(null) // Close ticket view if deleted
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch = filterStatus === "All" || ticket.status === filterStatus
    const priorityMatch = filterPriority === "All" || ticket.priority === filterPriority
    return statusMatch && priorityMatch
  })

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Support Ticket</CardTitle>
          <CardDescription>Submit a new issue or question to our support team.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ticket-title">Title</Label>
            <Input
              id="ticket-title"
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              placeholder="Brief summary of your issue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-description">Description</Label>
            <Textarea
              id="ticket-description"
              value={newTicketDescription}
              onChange={(e) => setNewTicketDescription(e.target.value)}
              placeholder="Provide detailed information about your issue"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket-priority">Priority</Label>
            <Select
              value={newTicketPriority}
              onValueChange={(value: Ticket["priority"]) => setNewTicketPriority(value)}
            >
              <SelectTrigger id="ticket-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddTicket} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Submit Ticket
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mt-8 mb-4">My Tickets</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="filter-status">Filter by Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="filter-priority">Filter by Priority</Label>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger id="filter-priority">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <p className="text-muted-foreground text-center">No tickets found matching your criteria.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{ticket.title}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === "open"
                          ? "bg-blue-100 text-blue-800"
                          : ticket.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.priority === "low"
                          ? "bg-gray-100 text-gray-800"
                          : ticket.priority === "medium"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </TableCell>
                  <TableCell>{format(new Date(ticket.timestamp), "PPP p")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedTicketId(ticket.id)}>
                          <MessageSquare className="mr-2 h-4 w-4" /> View / Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateTicketStatus(ticket.id, "closed")}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Mark as Closed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDeleteTicket(ticket.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedTicket && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ticket: {selectedTicket.title}</CardTitle>
              <CardDescription>
                Status: {selectedTicket.status} | Priority: {selectedTicket.priority}
              </CardDescription>
            </div>
            <Button onClick={() => setSelectedTicketId(null)} variant="outline">
              Close
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Created: {format(new Date(selectedTicket.timestamp), "PPP p")}
            </p>
            <div className="border rounded-md p-4 space-y-3 max-h-80 overflow-y-auto">
              {/* Logic to display messages should be implemented here */}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddMessage(selectedTicket.id)
                  }
                }}
              />
              <Button onClick={() => handleAddMessage(selectedTicket.id)}>
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Select
                value={selectedTicket.status}
                onValueChange={(value: Ticket["status"]) => updateTicketStatus(selectedTicket.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedTicket.priority}
                onValueChange={(value: Ticket["priority"]) => {
                  // Logic to update ticket priority should be implemented here
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Update Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="destructive" onClick={() => confirmDeleteTicket(selectedTicket.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your ticket and remove its data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
