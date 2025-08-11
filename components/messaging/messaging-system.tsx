"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Send, Search, Users, Wifi, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useRealTimeChat } from "@/lib/hooks/use-real-time-chat"
import { useAuth } from "@/providers/auth-provider"

export function MessagingSystem() {
  const { user: currentUser } = useAuth()
  const { onlineUsers, conversations, loading, startConversation, sendMessage } = useRealTimeChat()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [newMessageContent, setNewMessageContent] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlineOnly, setShowOnlineOnly] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleStartChatWithOnlineUser = async (userId: string) => {
    const conversationId = await startConversation(userId)
    if (conversationId) {
      setSelectedConversationId(conversationId)
    }
  }

  const handleAddMessage = async (conversationId: string) => {
    if (newMessageContent.trim()) {
      await sendMessage(conversationId, newMessageContent.trim())
      setNewMessageContent("")
    }
  }

  const selectedConversation = conversations.find((convo) => convo.id === selectedConversationId)

  const filteredConversations = conversations
    .filter((convo) => {
      const matchesSearch =
        convo.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        convo.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase()))

      if (!showOnlineOnly) return matchesSearch

      // Show only conversations with online participants
      const hasOnlineParticipant = convo.participants.some(
        (p) => p.id !== currentUser?.id && onlineUsers.some((ou) => ou.id === p.id),
      )

      return matchesSearch && hasOnlineParticipant
    })
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-180px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading chat...</span>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col lg:flex-row gap-4">
      {/* Left Panel: Online Users & Conversations */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        {/* Online Users Panel */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5 text-green-500" />
              Online Users ({onlineUsers.length})
            </CardTitle>
            <CardDescription>Click to start chatting with online users</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-48 overflow-y-auto">
              {onlineUsers.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">No users online right now</div>
              ) : (
                onlineUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleStartChatWithOnlineUser(user.id)}
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.location || "Unknown location"}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Online
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Conversations Panel */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Active Chats
            </CardTitle>
            <CardDescription>Your ongoing conversations</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div className="p-4 border-b space-y-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={showOnlineOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  {showOnlineOnly ? "Online Only" : "All Users"}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">
                  {showOnlineOnly ? "No conversations with online users" : "No conversations found"}
                </div>
              ) : (
                filteredConversations.map((convo) => {
                  const otherParticipant = convo.participants.find((p) => p.id !== currentUser?.id)
                  const isOnline = otherParticipant && onlineUsers.some((ou) => ou.id === otherParticipant.id)

                  return (
                    <div
                      key={convo.id}
                      className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-muted/50 ${
                        selectedConversationId === convo.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversationId(convo.id)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={otherParticipant?.avatar || "/placeholder-user.png"} />
                          <AvatarFallback>{otherParticipant?.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{otherParticipant?.name || "Unknown"}</p>
                          {isOnline && (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                              Online
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {convo.messages.length > 0
                            ? convo.messages[convo.messages.length - 1].content
                            : "No messages yet"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs text-muted-foreground">
                          {new Date(convo.updated_at).toLocaleString("en-GB")}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Chat Window */}
      <Card className="w-full lg:w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b pb-3">
              <CardTitle className="flex items-center gap-3">
                {selectedConversation.participants
                  .filter((p) => p.id !== currentUser?.id)
                  .map((p) => {
                    const isOnline = onlineUsers.some((ou) => ou.id === p.id)
                    return (
                      <div key={p.id} className="flex items-center gap-2">
                        <div className="relative">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={p.avatar || "/placeholder-user.png"} />
                            <AvatarFallback>{p.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          {isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>{p.name}</span>
                            {isOnline && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                Online
                              </Badge>
                            )}
                          </div>
                          {p.location && <p className="text-sm text-muted-foreground">{p.location}</p>}
                        </div>
                      </div>
                    )
                  })}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">Start a conversation!</div>
              ) : (
                selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-3 ${
                      message.sender_id === currentUser?.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.sender_id !== currentUser?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.avatar || "/placeholder-user.png"} />
                        <AvatarFallback>{message.sender.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender_id === currentUser?.id
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">{format(new Date(message.created_at), "p")}</span>
                    </div>
                    {message.sender_id === currentUser?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar || "/placeholder-user.png"} />
                        <AvatarFallback>{currentUser.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <div className="border-t p-4 flex items-center gap-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleAddMessage(selectedConversation.id)
                  }
                }}
                rows={1}
                className="min-h-[40px] max-h-[120px] resize-none flex-1"
              />
              <Button onClick={() => handleAddMessage(selectedConversation.id)} size="icon">
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4" />
            <p className="text-lg">Select a conversation or click an online user to start chatting.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
