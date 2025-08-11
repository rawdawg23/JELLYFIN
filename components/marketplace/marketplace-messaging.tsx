"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Shield, Star } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: Date
  type: "text" | "image" | "file"
  read: boolean
}

interface MarketplaceMessagingProps {
  isOpen: boolean
  onClose: () => void
  sellerId: string
  sellerName: string
}

export function MarketplaceMessaging({ isOpen, onClose, sellerId, sellerName }: MarketplaceMessagingProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: sellerId,
      content: "Hello! Thanks for your interest in my item. How can I help you today?",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: "text",
      read: true,
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      content: newMessage,
      timestamp: new Date(),
      type: "text",
      read: false,
    }

    setMessages([...messages, message])
    setNewMessage("")

    // Simulate seller typing and response
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const sellerResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: sellerId,
        content: "Thanks for your message! I'll get back to you shortly with more details.",
        timestamp: new Date(),
        type: "text",
        read: false,
      }
      setMessages((prev) => [...prev, sellerResponse])
    }, 2000)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    }
  }

  if (!user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In Required</DialogTitle>
          </DialogHeader>
          <p>Please sign in to message sellers.</p>
          <Button onClick={onClose}>Close</Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] p-0 bg-gradient-to-br from-card via-card to-purple-500/5 border-purple-500/20">
        {/* Header */}
        <DialogHeader className="p-4 border-b border-purple-500/20 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-user.jpg" alt={sellerName} />
                <AvatarFallback>{sellerName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="flex items-center gap-2">
                  {sellerName}
                  <Shield className="h-4 w-4 text-blue-500" />
                </DialogTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                  <span>•</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>4.9</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hover:bg-purple-500/10">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-purple-500/10">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-purple-500/10">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
            const isCurrentUser = message.senderId === user.id
            const showDate = index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp)

            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center text-xs text-muted-foreground mb-4">
                    <Badge variant="secondary" className="bg-background/50">
                      {formatDate(message.timestamp)}
                    </Badge>
                  </div>
                )}
                <div className={`flex items-end gap-2 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  {!isCurrentUser && (
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder-user.jpg" alt={sellerName} />
                      <AvatarFallback className="text-xs">{sellerName[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[70%] ${isCurrentUser ? "order-1" : "order-2"}`}>
                    <div
                      className={`p-3 rounded-2xl ${
                        isCurrentUser
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md"
                          : "bg-background/80 backdrop-blur-sm border border-purple-500/20 rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? "text-right" : "text-left"}`}>
                      {formatTime(message.timestamp)}
                      {isCurrentUser && <span className="ml-1">{message.read ? "✓✓" : "✓"}</span>}
                    </div>
                  </div>
                  {isCurrentUser && (
                    <Avatar className="h-6 w-6 order-2">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
                      <AvatarFallback className="text-xs">{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            )
          })}

          {isTyping && (
            <div className="flex items-end gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt={sellerName} />
                <AvatarFallback className="text-xs">{sellerName[0]}</AvatarFallback>
              </Avatar>
              <div className="bg-background/80 backdrop-blur-sm border border-purple-500/20 p-3 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-purple-500/20 bg-background/50 backdrop-blur-sm">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" className="hover:bg-purple-500/10">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                className="min-h-[40px] max-h-[120px] resize-none bg-background/50 border-purple-500/20 focus:border-purple-400 pr-10"
                rows={1}
              />
              <Button variant="ghost" size="sm" className="absolute right-1 bottom-1 hover:bg-purple-500/10">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
