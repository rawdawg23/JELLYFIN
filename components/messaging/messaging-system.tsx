"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { MessageSquare, Send, Search, Plus, Trash2, Archive, Star, Reply, Forward, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"

interface Message {
  id: string
  subject: string
  content: string
  senderId: string
  senderUsername: string
  senderAvatar?: string
  recipientId: string
  recipientUsername: string
  isRead: boolean
  isStarred: boolean
  isArchived: boolean
  createdAt: string
  replies?: Message[]
}

export function MessagingSystem() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-1",
      subject: "Welcome to OG JELLYFIN!",
      content:
        "Welcome to our community! We're excited to have you here. If you have any questions, feel free to reach out.",
      senderId: "admin-1",
      senderUsername: "Admin",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      recipientId: user?.id || "",
      recipientUsername: user?.username || "",
      isRead: false,
      isStarred: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "msg-2",
      subject: "Your subscription is active",
      content:
        "Your premium subscription has been activated successfully. You now have access to all premium features.",
      senderId: "system-1",
      senderUsername: "System",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=system",
      recipientId: user?.id || "",
      recipientUsername: user?.username || "",
      isRead: true,
      isStarred: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ])

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [newMessageForm, setNewMessageForm] = useState({
    recipient: "",
    subject: "",
    content: "",
  })
  const [replyContent, setReplyContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "starred" | "archived">("inbox")

  const handleSendMessage = () => {
    if (!newMessageForm.recipient || !newMessageForm.subject || !newMessageForm.content) return

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      subject: newMessageForm.subject,
      content: newMessageForm.content,
      senderId: user?.id || "",
      senderUsername: user?.username || "",
      senderAvatar: user?.avatar,
      recipientId: "recipient-id", // In real app, this would be resolved from username
      recipientUsername: newMessageForm.recipient,
      isRead: false,
      isStarred: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
    }

    setMessages([newMessage, ...messages])
    setNewMessageForm({ recipient: "", subject: "", content: "" })
  }

  const handleReply = () => {
    if (!replyContent.trim() || !selectedMessage) return

    const reply: Message = {
      id: `reply-${Date.now()}`,
      subject: `Re: ${selectedMessage.subject}`,
      content: replyContent,
      senderId: user?.id || "",
      senderUsername: user?.username || "",
      senderAvatar: user?.avatar,
      recipientId: selectedMessage.senderId,
      recipientUsername: selectedMessage.senderUsername,
      isRead: false,
      isStarred: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
    }

    setMessages([reply, ...messages])
    setReplyContent("")
  }

  const toggleStar = (messageId: string) => {
    setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg)))
  }

  const toggleArchive = (messageId: string) => {
    setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, isArchived: !msg.isArchived } : msg)))
  }

  const markAsRead = (messageId: string) => {
    setMessages(messages.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg)))
  }

  const deleteMessage = (messageId: string) => {
    setMessages(messages.filter((msg) => msg.id !== messageId))
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null)
    }
  }

  const getFilteredMessages = () => {
    const filtered = messages.filter((msg) => {
      const matchesSearch =
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderUsername.toLowerCase().includes(searchQuery.toLowerCase())

      switch (activeTab) {
        case "inbox":
          return matchesSearch && msg.recipientId === user?.id && !msg.isArchived
        case "sent":
          return matchesSearch && msg.senderId === user?.id && !msg.isArchived
        case "starred":
          return matchesSearch && msg.isStarred && !msg.isArchived
        case "archived":
          return matchesSearch && msg.isArchived
        default:
          return matchesSearch
      }
    })

    return filtered
  }

  const unreadCount = messages.filter((msg) => msg.recipientId === user?.id && !msg.isRead && !msg.isArchived).length

  if (!user) {
    return (
      <Card className="ios-card border-0 text-center p-8">
        <CardContent>
          <AlertCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to access the messaging system.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Messages
          </h2>
          <p className="text-muted-foreground mt-2">Stay connected with the community</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="ios-button text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Message</DialogTitle>
              <DialogDescription>Send a message to another user</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="recipient">To</label>
                <Input
                  id="recipient"
                  placeholder="Username"
                  value={newMessageForm.recipient}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, recipient: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject">Subject</label>
                <Input
                  id="subject"
                  placeholder="Message subject"
                  value={newMessageForm.subject}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content">Message</label>
                <Textarea
                  id="content"
                  placeholder="Type your message..."
                  value={newMessageForm.content}
                  onChange={(e) => setNewMessageForm({ ...newMessageForm, content: e.target.value })}
                  rows={4}
                />
              </div>
              <Button onClick={handleSendMessage} className="w-full ios-button text-white border-0">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ios-search pl-10 border-0"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === "inbox" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("inbox")}
            className={activeTab === "inbox" ? "ios-button text-white border-0" : ""}
          >
            Inbox {unreadCount > 0 && <Badge className="ml-2 bg-red-500 text-white">{unreadCount}</Badge>}
          </Button>
          <Button
            variant={activeTab === "sent" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("sent")}
            className={activeTab === "sent" ? "ios-button text-white border-0" : ""}
          >
            Sent
          </Button>
          <Button
            variant={activeTab === "starred" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("starred")}
            className={activeTab === "starred" ? "ios-button text-white border-0" : ""}
          >
            Starred
          </Button>
          <Button
            variant={activeTab === "archived" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("archived")}
            className={activeTab === "archived" ? "ios-button text-white border-0" : ""}
          >
            Archived
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold text-foreground">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ({getFilteredMessages().length})
          </h3>
          <div className="space-y-3">
            {getFilteredMessages().map((message) => (
              <Card
                key={message.id}
                className={`ios-card border-0 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedMessage?.id === message.id ? "ring-2 ring-purple-400" : ""
                } ${!message.isRead && message.recipientId === user?.id ? "bg-purple-50" : ""}`}
                onClick={() => {
                  setSelectedMessage(message)
                  if (!message.isRead && message.recipientId === user?.id) {
                    markAsRead(message.id)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderUsername} />
                          <AvatarFallback className="text-sm bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                            {message.senderUsername.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm">{message.senderUsername}</p>
                          <p className="text-xs text-muted-foreground">{getRelativeTime(message.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {message.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                        {!message.isRead && message.recipientId === user?.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground line-clamp-1 text-sm">{message.subject}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{message.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="ios-card border-0">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedMessage.senderAvatar || "/placeholder.svg"}
                        alt={selectedMessage.senderUsername}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                        {selectedMessage.senderUsername.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedMessage.subject}</CardTitle>
                      <CardDescription>
                        From {selectedMessage.senderUsername} • {formatUKDateTime(selectedMessage.createdAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStar(selectedMessage.id)}
                      className={selectedMessage.isStarred ? "text-yellow-500" : ""}
                    >
                      <Star className={`h-4 w-4 ${selectedMessage.isStarred ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleArchive(selectedMessage.id)}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMessage(selectedMessage.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-foreground whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-foreground mb-3">Reply</h4>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Forward className="h-4 w-4 mr-2" />
                          Forward
                        </Button>
                      </div>
                      <Button onClick={handleReply} className="ios-button text-white border-0">
                        <Reply className="h-4 w-4 mr-2" />
                        Send Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="ios-card border-0 text-center p-12">
              <CardContent>
                <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Message</h3>
                <p className="text-muted-foreground">Choose a message from the list to read and reply</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
