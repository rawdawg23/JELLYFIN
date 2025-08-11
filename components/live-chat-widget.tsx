"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Send, Minimize2, Maximize2, X, Users, Circle, Phone, Video } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

interface OnlineUser {
  id: string
  name: string
  avatar: string
  status: "online" | "away" | "busy"
  lastSeen: Date
  isTyping?: boolean
}

interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: "text" | "system"
}

export function LiveChatWidget() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([
    {
      id: "user-1",
      name: "Sarah Johnson",
      avatar: "/placeholder-user.jpg",
      status: "online",
      lastSeen: new Date(),
    },
    {
      id: "user-2",
      name: "Mike Chen",
      avatar: "/placeholder-user.jpg",
      status: "away",
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    },
    {
      id: "user-3",
      name: "Emma Wilson",
      avatar: "/placeholder-user.jpg",
      status: "online",
      lastSeen: new Date(),
      isTyping: true,
    },
    {
      id: "user-4",
      name: "Alex Rodriguez",
      avatar: "/placeholder-user.jpg",
      status: "busy",
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
    },
  ])

  const selectedUser = onlineUsers.find((u) => u.id === selectedUserId)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineUsers((prev) =>
        prev.map((user) => ({
          ...user,
          lastSeen: user.status === "online" ? new Date() : user.lastSeen,
          isTyping: Math.random() > 0.9 ? !user.isTyping : user.isTyping,
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUserId || !user) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.username || "You",
      content: message,
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, newMessage])
    setMessage("")

    // Simulate response
    setTimeout(() => {
      const response: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderId: selectedUserId,
        senderName: selectedUser?.name || "User",
        content: "Thanks for your message! I'll get back to you soon.",
        timestamp: new Date(),
        type: "text",
      }
      setMessages((prev) => [...prev, response])
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "away":
        return "Away"
      case "busy":
        return "Busy"
      default:
        return "Offline"
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg touch-manipulation"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        </Button>
        {onlineUsers.filter((u) => u.status === "online").length > 0 && (
          <Badge className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1">
            {onlineUsers.filter((u) => u.status === "online").length}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card
        className={`w-[95vw] max-w-[380px] sm:w-80 bg-background/95 backdrop-blur-sm border-purple-500/20 shadow-xl transition-all duration-300 ${
          isMinimized ? "h-14" : "h-[85vh] max-h-96 sm:h-96"
        }`}
      >
        <CardHeader className="p-3 border-b border-purple-500/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" />
              <span className="truncate">{selectedUser ? `Chat with ${selectedUser.name}` : "Live Chat"}</span>
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                {onlineUsers.filter((u) => u.status === "online").length} online
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 touch-manipulation"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 touch-manipulation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex-1 overflow-hidden">
            {!selectedUser ? (
              // Online users list
              <ScrollArea className="h-full p-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Online Users ({onlineUsers.filter((u) => u.status === "online").length})
                  </h4>
                  {onlineUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors touch-manipulation"
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10 sm:h-8 sm:w-8">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="text-sm">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Circle className={`h-2 w-2 ${getStatusColor(user.status)}`} />
                          {user.isTyping ? (
                            <span className="text-blue-500">Typing...</span>
                          ) : (
                            <span>{getStatusText(user.status)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 touch-manipulation">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        {user.status === "online" && (
                          <>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 touch-manipulation hidden sm:flex">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 touch-manipulation hidden sm:flex">
                              <Video className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              // Chat interface
              <div className="flex flex-col h-full">
                {/* Chat header */}
                <div className="flex items-center gap-3 p-3 border-b border-purple-500/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUserId(null)}
                    className="h-8 w-8 p-0 touch-manipulation"
                  >
                    ←
                  </Button>
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedUser.avatar || "/placeholder.svg"} alt={selectedUser.name} />
                      <AvatarFallback className="text-xs">{selectedUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(selectedUser.status)}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.isTyping ? "Typing..." : getStatusText(selectedUser.status)}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground text-sm py-4">
                        Start a conversation with {selectedUser.name}
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg text-sm ${
                              msg.senderId === user?.id
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                                : "bg-muted"
                            }`}
                          >
                            <p className="break-words">{msg.content}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {msg.timestamp.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Message input */}
                <div className="p-3 border-t border-purple-500/20">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSendMessage()
                        }
                      }}
                      className="flex-1 h-10 text-base"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      size="sm"
                      className="h-10 w-10 p-0 bg-gradient-to-r from-blue-600 to-purple-600 touch-manipulation"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
