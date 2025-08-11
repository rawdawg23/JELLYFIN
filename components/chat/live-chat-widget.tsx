"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, X, Minimize2, Maximize2, Users, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/providers/auth-provider"

// Enhanced rainbow color generator with gradients
const getRainbowGradient = (name: string) => {
  const gradients = [
    "bg-gradient-to-r from-red-500 via-pink-500 to-purple-500",
    "bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500",
    "bg-gradient-to-r from-yellow-500 via-green-500 to-blue-500",
    "bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500",
    "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500",
    "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
    "bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500",
    "bg-gradient-to-r from-pink-500 via-rose-500 to-red-500",
    "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500",
    "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500",
    "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500",
    "bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500",
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

const getRainbowTextColor = (name: string) => {
  const colors = [
    "text-red-500",
    "text-orange-500",
    "text-yellow-500",
    "text-green-500",
    "text-blue-500",
    "text-indigo-500",
    "text-purple-500",
    "text-pink-500",
    "text-cyan-500",
    "text-emerald-500",
    "text-violet-500",
    "text-rose-500",
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

interface Message {
  id: string
  content: string
  sender: {
    id: string
    username: string
    avatar?: string
    role: string
  }
  timestamp: string
}

interface LiveChatWidgetProps {
  className?: string
}

export function LiveChatWidget({ className = "" }: LiveChatWidgetProps) {
  const { user: currentUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const registeredUsers = [
    {
      id: "1",
      username: "ogadmin",
      email: "ogstorage25@gmail.com",
      role: "admin",
      avatar: "/placeholder-user.png",
      location: "United Kingdom",
    },
    {
      id: "2",
      username: "johndoe",
      email: "john@example.com",
      role: "user",
      avatar: "/placeholder-user.png",
      location: "London, UK",
    },
    {
      id: "3",
      username: "seller123",
      email: "seller@example.com",
      role: "seller",
      avatar: "/placeholder-user.png",
      location: "Manchester, UK",
    },
  ]

  useEffect(() => {
    const simulateOnlineUsers = () => {
      // Simulate some users being online (excluding current user)
      const onlineUserIds = registeredUsers
        .filter((user) => user.id !== currentUser?.id)
        .slice(0, Math.floor(Math.random() * 3) + 1) // 1-3 users online
        .map((user) => user.id)

      const onlineUsersList = registeredUsers.filter((user) => onlineUserIds.includes(user.id))

      setOnlineUsers(onlineUsersList)
    }

    if (currentUser) {
      simulateOnlineUsers()
      // Update online users every 30 seconds
      const interval = setInterval(simulateOnlineUsers, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome-1",
        content: "Welcome to the live chat! Say hello to other members.",
        sender: {
          id: "system",
          username: "System",
          avatar: "/placeholder.svg",
          role: "system",
        },
        timestamp: new Date().toISOString(),
      }
      setMessages([welcomeMessage])
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (newMessage.trim() && currentUser) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, message])
      setNewMessage("")
      setIsTyping(true)

      setTimeout(
        () => {
          setIsTyping(false)
          if (onlineUsers.length > 0 && Math.random() > 0.7) {
            const randomUser = onlineUsers[Math.floor(Math.random() * onlineUsers.length)]
            const responses = [
              "Hey there! 👋",
              "How's everyone doing?",
              "Great to see you online!",
              "Anyone watching anything good lately?",
              "Nice to chat with fellow members!",
            ]

            const responseMessage: Message = {
              id: Date.now().toString() + "-response",
              content: responses[Math.floor(Math.random() * responses.length)],
              sender: {
                id: randomUser.id,
                username: randomUser.username,
                avatar: randomUser.avatar,
                role: randomUser.role,
              },
              timestamp: new Date().toISOString(),
            }

            setMessages((prev) => [...prev, responseMessage])
          }
        },
        1000 + Math.random() * 2000,
      )
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  if (!currentUser) {
    return null
  }

  if (!isOpen) {
    return (
      <div className={`fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 ${className}`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 animate-pulse transition-all duration-300 scale-110"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 rounded-full blur-2xl opacity-50 group-hover:opacity-75 animate-pulse transition-all duration-500 scale-125"></div>
          <Button
            onClick={() => setIsOpen(true)}
            className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 shadow-2xl transform hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20 backdrop-blur-sm"
            size="icon"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-transparent via-white/10 to-white/30 animate-pulse"></div>
            <MessageSquare className="h-5 w-5 sm:h-7 sm:w-7 text-white drop-shadow-lg relative z-10" />
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-300 absolute top-0.5 right-0.5 sm:top-1 sm:right-1 animate-spin" />
            {onlineUsers.length > 0 && (
              <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-7 sm:w-7 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs p-0 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                {onlineUsers.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-50 ${className}`}>
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-3xl animate-pulse"></div>
        <div className="absolute -inset-2 bg-gradient-to-tr from-cyan-400/10 via-violet-400/10 to-rose-400/10 rounded-xl blur-xl"></div>
        <Card
          className={`relative w-72 sm:w-80 md:w-96 shadow-2xl border border-white/20 backdrop-blur-xl bg-white/10 transition-all duration-500 transform hover:scale-[1.02] ${
            isMinimized ? "h-14 sm:h-16" : "h-80 sm:h-96 md:h-[500px]"
          }`}
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 25px 45px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 60px rgba(139, 92, 246, 0.3)",
          }}
        >
          <CardHeader className="pb-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-green-400 to-cyan-400 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
            <CardTitle className="relative z-10 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="relative">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 drop-shadow-lg" />
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-400 border border-white sm:border-2 rounded-full animate-ping"></div>
                  <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-400 border border-white sm:border-2 rounded-full"></div>
                </div>
                <span className="font-bold drop-shadow-lg truncate">
                  <span className="hidden sm:inline">Live Chat ({onlineUsers.length} members online)</span>
                  <span className="sm:hidden">Chat ({onlineUsers.length})</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-7 sm:w-7 text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          {!isMinimized && (
            <>
              <div className="px-2 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                  <span className="text-xs text-gray-700 whitespace-nowrap font-semibold flex-shrink-0">
                    <span className="hidden sm:inline">Members Online:</span>
                    <span className="sm:hidden">Online:</span>
                  </span>
                  {onlineUsers.slice(0, 8).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-2 shadow-lg border border-white/40 transform hover:scale-105 active:scale-95 transition-all duration-200 flex-shrink-0"
                    >
                      <div className="relative">
                        <Avatar className="h-5 w-5 sm:h-6 sm:w-6 ring-1 sm:ring-2 ring-white shadow-lg">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.username} />
                          <AvatarFallback className="text-xs font-bold">
                            {user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-emerald-500 border border-white sm:border-2 rounded-full animate-pulse shadow-lg"></div>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`text-xs font-bold drop-shadow-sm ${getRainbowTextColor(user.username)} truncate max-w-16 sm:max-w-20`}
                        >
                          {user.username}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[8px] px-1 sm:px-2 py-0.5 h-3 sm:h-4 ${getRainbowGradient(user.role)} text-white border-0 shadow-sm`}
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {onlineUsers.length > 8 && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-lg flex-shrink-0"
                    >
                      +{onlineUsers.length - 8}
                    </Badge>
                  )}
                  {onlineUsers.length === 0 && (
                    <span className="text-xs text-gray-500 font-medium flex-shrink-0">No members online</span>
                  )}
                </div>
              </div>

              <CardContent className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 h-48 sm:h-64 md:h-80 bg-gradient-to-b from-white/5 to-white/10 scrollbar-hide">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-600 py-4 sm:py-8 text-sm">
                    <div className="relative mb-2 sm:mb-4">
                      <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto opacity-30" />
                      <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 absolute top-0 right-1/2 translate-x-4 sm:translate-x-6 text-yellow-400 animate-spin" />
                    </div>
                    <p className="font-bold text-base sm:text-lg mb-1 sm:mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Welcome to 4D Live Chat!
                    </p>
                    <p className="text-xs sm:text-sm opacity-75">Chat with other registered members in real-time</p>
                    {onlineUsers.length === 0 && (
                      <p className="text-xs mt-2 sm:mt-3 opacity-60">No other members are online right now</p>
                    )}
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 sm:gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
                        message.sender.id === currentUser?.id ? "justify-end" : "justify-start"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {message.sender.id !== currentUser?.id && (
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 mt-1 ring-1 sm:ring-2 ring-white/50 shadow-lg flex-shrink-0">
                          <AvatarImage src={message.sender.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs font-bold">
                            {message.sender.username?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[75%] sm:max-w-[70%] p-2 sm:p-3 rounded-2xl text-xs sm:text-sm shadow-lg backdrop-blur-sm border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                          message.sender.id === currentUser?.id
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md border-blue-300/50"
                            : message.sender.id === "system"
                              ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-bl-md border-green-300/50"
                              : "bg-white/80 text-gray-800 rounded-bl-md border-gray-200/50"
                        }`}
                      >
                        {message.sender.id !== currentUser?.id && message.sender.id !== "system" && (
                          <p
                            className={`text-xs font-bold mb-1 sm:mb-2 ${getRainbowTextColor(message.sender.username || "User")} drop-shadow-sm`}
                          >
                            {message.sender.username}
                          </p>
                        )}
                        <p className="leading-relaxed break-words">{message.content}</p>
                        <span
                          className={`text-xs opacity-75 mt-1 sm:mt-2 block ${
                            message.sender.id === currentUser?.id || message.sender.id === "system"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {format(new Date(message.timestamp), "HH:mm")}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-500 text-xs animate-pulse">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span>Someone is typing...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              <div className="border-t border-white/20 p-2 sm:p-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      className="text-xs sm:text-sm bg-white/80 backdrop-blur-sm border-white/40 rounded-full px-3 sm:px-4 py-2 shadow-lg focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-200 min-h-[40px] sm:min-h-[44px]"
                      disabled={!currentUser}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"></div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-75"></div>
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="relative h-10 w-10 sm:h-11 sm:w-11 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 rounded-full shadow-lg transform hover:scale-110 active:scale-95 transition-all duration-200 border border-white/20"
                      disabled={!newMessage.trim() || !currentUser}
                    >
                      <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
