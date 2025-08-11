"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail, Send, Search, Plus, Star, Archive, Trash2, Reply, User, Clock, Paperclip } from "lucide-react"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"

interface Message {
  id: string
  subject: string
  content: string
  sender: string
  recipient: string
  timestamp: string
  read: boolean
  starred: boolean
  archived: boolean
  thread?: Message[]
}

export function MessagingSystem() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      subject: "Welcome to OG JELLYFIN!",
      content:
        "Thank you for joining our community! We're excited to have you here. If you have any questions, feel free to reach out.",
      sender: "Admin",
      recipient: "You",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      starred: false,
      archived: false,
    },
    {
      id: "2",
      subject: "Server maintenance scheduled",
      content:
        "We'll be performing routine maintenance on Sunday from 2-4 AM GMT. There may be brief interruptions to service.",
      sender: "Support Team",
      recipient: "You",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: false,
      starred: true,
      archived: false,
    },
    {
      id: "3",
      subject: "Your subscription has been upgraded",
      content:
        "Congratulations! Your account has been successfully upgraded to Premium. You now have access to 4K streaming and 5 concurrent streams.",
      sender: "Billing",
      recipient: "You",
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      read: true,
      starred: false,
      archived: false,
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
  })

  const getFilteredMessages = (filter: string) => {
    const filtered = messages.filter((message) => {
      const matchesSearch =
        message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })

    switch (filter) {
      case "inbox":
        return filtered.filter((m) => !m.archived)
      case "sent":
        return filtered.filter((m) => m.sender === "You")
      case "starred":
        return filtered.filter((m) => m.starred && !m.archived)
      case "archived":
        return filtered.filter((m) => m.archived)
      default:
        return filtered
    }
  }

  const handleSendMessage = () => {
    const message: Message = {
      id: (messages.length + 1).toString(),
      ...newMessage,
      sender: "You",
      timestamp: new Date().toISOString(),
      read: true,
      starred: false,
      archived: false,
    }

    setMessages([message, ...messages])
    setNewMessage({ recipient: "", subject: "", content: "" })
    setShowComposeDialog(false)
  }

  const handleReply = () => {
    if (!selectedMessage || !replyContent.trim()) return

    const reply: Message = {
      id: (messages.length + 1).toString(),
      subject: `Re: ${selectedMessage.subject}`,
      content: replyContent,
      sender: "You",
      recipient: selectedMessage.sender,
      timestamp: new Date().toISOString(),
      read: true,
      starred: false,
      archived: false,
    }

    setMessages([reply, ...messages])
    setReplyContent("")
  }

  const toggleStar = (messageId: string) => {
    setMessages(messages.map((m) => (m.id === messageId ? { ...m, starred: !m.starred } : m)))
  }

  const toggleArchive = (messageId: string) => {
    setMessages(messages.map((m) => (m.id === messageId ? { ...m, archived: !m.archived } : m)))
  }

  const markAsRead = (messageId: string) => {
    setMessages(messages.map((m) => (m.id === messageId ? { ...m, read: true } : m)))
  }

  const deleteMessage = (messageId: string) => {
    setMessages(messages.filter((m) => m.id !== messageId))
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null)
    }
  }

  const unreadCount = messages.filter((m) => !m.read && !m.archived).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Messages
          </h2>
          <p className="text-lg text-muted-foreground mt-2">
            Communicate with other users and staff
            {unreadCount > 0 && (
              <Badge className="ml-2 ios-badge bg-red-500 text-white border-0">{unreadCount} unread</Badge>
            )}
          </p>
        </div>
        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogTrigger asChild>
            <Button className="ios-button text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>Send a message to another user or staff member</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">To</Label>
                <Input
                  id="recipient"
                  placeholder="Username or @admin, @support"
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                  className="ios-search border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Message subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="ios-search border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  placeholder="Type your message..."
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  className="ios-search border-0 min-h-[100px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSendMessage} className="ios-button text-white border-0 flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" onClick={() => setShowComposeDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="inbox" className="space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-4">
          <TabsTrigger value="inbox">
            <Mail className="h-4 w-4 mr-2" />
            Inbox
            {unreadCount > 0 && (
              <Badge className="ml-1 ios-badge bg-red-500 text-white border-0 text-xs">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Send className="h-4 w-4 mr-2" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="starred">
            <Star className="h-4 w-4 mr-2" />
            Starred
          </TabsTrigger>
          <TabsTrigger value="archived">
            <Archive className="h-4 w-4 mr-2" />
            Archived
          </TabsTrigger>
        </TabsList>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 ios-search border-0"
          />
        </div>

        {["inbox", "sent", "starred", "archived"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {getFilteredMessages(tab).map((message) => (
                  <Card
                    key={message.id}
                    className={`ios-card border-0 cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      selectedMessage?.id === message.id ? "ring-2 ring-purple-400" : ""
                    } ${!message.read ? "bg-purple-50" : ""}`}
                    onClick={() => {
                      setSelectedMessage(message)
                      if (!message.read) markAsRead(message.id)
                    }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className={`text-sm truncate ${!message.read ? "font-bold" : ""}`}>
                              {message.subject}
                            </CardTitle>
                            {!message.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                          </div>
                          <CardDescription className="text-xs">From: {message.sender}</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleStar(message.id)
                            }}
                          >
                            <Star
                              className={`h-3 w-3 ${message.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                            />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{message.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{getRelativeTime(message.timestamp)}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatUKDateTime(message.timestamp).split(" ")[1]}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {getFilteredMessages(tab).length === 0 && (
                  <div className="text-center py-12">
                    <div className="ios-card rounded-2xl p-8">
                      <Mail className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? "No messages match your search." : `No ${tab} messages.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-6">
                {selectedMessage ? (
                  <Card className="ios-card border-0">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg mb-2">{selectedMessage.subject}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>From: {selectedMessage.sender}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatUKDateTime(selectedMessage.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => toggleStar(selectedMessage.id)}>
                            <Star
                              className={`h-4 w-4 ${selectedMessage.starred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
                            />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleArchive(selectedMessage.id)}>
                            <Archive className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteMessage(selectedMessage.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-xl">
                        <p className="text-sm leading-relaxed">{selectedMessage.content}</p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="reply">Reply</Label>
                        <div className="relative">
                          <Textarea
                            id="reply"
                            placeholder="Type your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="ios-search border-0 min-h-[80px] pr-12"
                          />
                          <Button
                            size="sm"
                            className="absolute bottom-2 right-2 h-8 w-8 p-0 ios-button text-white border-0"
                            onClick={handleReply}
                            disabled={!replyContent.trim()}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="ios-button bg-transparent">
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach File
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <div className="ios-card rounded-2xl p-8">
                      <Mail className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a message to read</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
