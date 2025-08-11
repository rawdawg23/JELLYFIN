"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
  MessageSquare,
  Send,
  Search,
  Plus,
  Inbox,
  SendIcon as Sent,
  Trash2,
  Star,
  Reply,
  Clock,
  User,
  Crown,
  Shield,
  CheckCircle,
  Circle,
} from "lucide-react"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"
import { useMessageStore } from "@/lib/message-store"
import { useAuth } from "@/providers/auth-provider"

export function MessagingSystem() {
  const { user } = useAuth()
  const { messages, sendMessage, markAsRead, markAsUnread, deleteMessage, starMessage } = useMessageStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [newMessage, setNewMessage] = useState({
    recipient: "",
    subject: "",
    content: "",
  })

  const getFilteredMessages = (type: string) => {
    const filteredMessages = messages.filter((message) => {
      const matchesSearch =
        message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.sender.toLowerCase().includes(searchQuery.toLowerCase())

      switch (type) {
        case "inbox":
          return message.recipient === user?.username && !message.deleted && matchesSearch
        case "sent":
          return message.sender === user?.username && !message.deleted && matchesSearch
        case "starred":
          return message.starred && !message.deleted && matchesSearch
        case "archived":
          return message.archived && !message.deleted && matchesSearch
        default:
          return matchesSearch
      }
    })

    return filteredMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const handleSendMessage = () => {
    if (!user || !newMessage.recipient || !newMessage.subject || !newMessage.content) return

    sendMessage({
      ...newMessage,
      sender: user.username,
      senderRole: user.role,
    })

    setNewMessage({ recipient: "", subject: "", content: "" })
    setShowComposeDialog(false)
  }

  const handleReply = () => {
    if (!selectedMessage || !replyContent.trim() || !user) return

    sendMessage({
      recipient: selectedMessage.sender,
      subject: `Re: ${selectedMessage.subject}`,
      content: replyContent,
      sender: user.username,
      senderRole: user.role,
      parentId: selectedMessage.id,
    })

    setReplyContent("")
  }

  const handleMessageClick = (message: any) => {
    setSelectedMessage(message)
    if (!message.read && message.recipient === user?.username) {
      markAsRead(message.id)
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

  if (!user) {
    return (
      <Card className="ios-card border-0">
        <CardContent className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to access your messages.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Messages
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-2">Communicate with other community members</p>
        </div>
        <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
          <DialogTrigger asChild>
            <Button className="ios-button text-white border-0 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>Send a message to another user</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">To</Label>
                <Input
                  id="recipient"
                  placeholder="Username"
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
                  className="ios-search border-0 min-h-[120px]"
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

      <Tabs defaultValue="inbox" className="space-y-4 sm:space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-4">
          <TabsTrigger value="inbox">
            <Inbox className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Inbox</span>
            <span className="sm:hidden">In</span>
          </TabsTrigger>
          <TabsTrigger value="sent">
            <Sent className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sent</span>
          </TabsTrigger>
          <TabsTrigger value="starred">
            <Star className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Starred</span>
          </TabsTrigger>
          <TabsTrigger value="message" disabled={!selectedMessage}>
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {selectedMessage ? selectedMessage.subject.substring(0, 15) + "..." : "Select"}
            </span>
            <span className="sm:hidden">Msg</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4 sm:space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 ios-search border-0"
            />
          </div>

          <div className="space-y-3">
            {getFilteredMessages("inbox").map((message) => (
              <Card
                key={message.id}
                className={`ios-card border-0 cursor-pointer hover:shadow-lg transition-all duration-300 ${
                  !message.read ? "bg-purple-50" : ""
                }`}
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-sm">
                          {message.sender.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getRoleIcon(message.senderRole)}
                          <span className="font-medium text-sm">{message.sender}</span>
                          <Badge
                            className={`ios-badge text-white border-0 text-xs ${getRoleBadge(message.senderRole)}`}
                          >
                            {message.senderRole}
                          </Badge>
                        </div>
                        <h4 className={`text-sm mb-1 line-clamp-1 ${!message.read ? "font-semibold" : ""}`}>
                          {message.subject}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {!message.read ? (
                        <Circle className="h-2 w-2 fill-purple-500 text-purple-500" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="hidden sm:inline">{getRelativeTime(message.timestamp)}</span>
                        <span className="sm:hidden">{getRelativeTime(message.timestamp).split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredMessages("inbox").length === 0 && (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <Inbox className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No messages match your search." : "Your inbox is empty."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4 sm:space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Search sent messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 ios-search border-0"
            />
          </div>

          <div className="space-y-3">
            {getFilteredMessages("sent").map((message) => (
              <Card
                key={message.id}
                className="ios-card border-0 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.recipient}`} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-sm">
                          {message.recipient.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">To: {message.recipient}</span>
                        </div>
                        <h4 className="text-sm font-medium mb-1 line-clamp-1">{message.subject}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                      <Clock className="h-3 w-3" />
                      <span className="hidden sm:inline">{getRelativeTime(message.timestamp)}</span>
                      <span className="sm:hidden">{getRelativeTime(message.timestamp).split(" ")[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredMessages("sent").length === 0 && (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <Sent className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No sent messages match your search." : "You haven't sent any messages yet."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="starred" className="space-y-4 sm:space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Search starred messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 ios-search border-0"
            />
          </div>

          <div className="space-y-3">
            {getFilteredMessages("starred").map((message) => (
              <Card
                key={message.id}
                className="ios-card border-0 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender}`} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-sm">
                          {message.sender.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getRoleIcon(message.senderRole)}
                          <span className="font-medium text-sm">{message.sender}</span>
                          <Badge
                            className={`ios-badge text-white border-0 text-xs ${getRoleBadge(message.senderRole)}`}
                          >
                            {message.senderRole}
                          </Badge>
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        </div>
                        <h4 className="text-sm font-medium mb-1 line-clamp-1">{message.subject}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{message.content}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                      <Clock className="h-3 w-3" />
                      <span className="hidden sm:inline">{getRelativeTime(message.timestamp)}</span>
                      <span className="sm:hidden">{getRelativeTime(message.timestamp).split(" ")[0]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredMessages("starred").length === 0 && (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <Star className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No starred messages match your search." : "You haven't starred any messages yet."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="message" className="space-y-4 sm:space-y-6">
          {selectedMessage ? (
            <div className="space-y-4 sm:space-y-6">
              <Card className="ios-card border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg sm:text-xl mb-2">{selectedMessage.subject}</CardTitle>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMessage.sender}`}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs">
                              {selectedMessage.sender.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {getRoleIcon(selectedMessage.senderRole)}
                          <span className="font-medium text-sm">{selectedMessage.sender}</span>
                          <Badge
                            className={`ios-badge text-white border-0 text-xs ${getRoleBadge(selectedMessage.senderRole)}`}
                          >
                            {selectedMessage.senderRole}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatUKDateTime(selectedMessage.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => starMessage(selectedMessage.id)}
                        className="ios-button bg-transparent"
                      >
                        <Star className={`h-3 w-3 ${selectedMessage.starred ? "text-yellow-500 fill-current" : ""}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="ios-button bg-transparent text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 rounded-xl mb-4">
                    <p className="leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="ios-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Reply</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Type your reply..."
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
                      <Reply className="h-4 w-4 mr-2" />
                      Send Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a message to view the conversation</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
