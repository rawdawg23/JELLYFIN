"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send, UserPlus, Search, XCircle } from "lucide-react"
import { useMessageStore } from "@/lib/message-store"
import { format } from "date-fns"

interface Conversation {
  id: string
  participants: { id: string; name: string; avatar: string }[]
  messages: Message[]
  lastActivity: string
}

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
}

export function MessagingSystem() {
  const { conversations = [], addConversation, addMessageToConversation, deleteConversation } = useMessageStore()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [newMessageContent, setNewMessageContent] = useState("")
  const [newParticipantName, setNewParticipantName] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentUser = { id: "user-1", name: "Current User", avatar: "/placeholder-user.png" }

  const handleAddConversation = () => {
    if (newParticipantName.trim()) {
      const newConvo: Conversation = {
        id: `convo-${Date.now()}`,
        participants: [
          currentUser,
          { id: `user-${Date.now()}`, name: newParticipantName.trim(), avatar: "/placeholder-user.png" },
        ],
        messages: [],
        lastActivity: new Date().toISOString(),
      }
      addConversation(newConvo)
      setNewParticipantName("")
      setSelectedConversationId(newConvo.id)
    }
  }

  const handleAddMessage = (conversationId: string) => {
    if (newMessageContent.trim()) {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        content: newMessageContent.trim(),
        timestamp: new Date().toISOString(),
      }

      addMessageToConversation(conversationId, newMessage)
      setNewMessageContent("")

      // Simulate an AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: `msg-${Date.now() + 1}`,
          senderId: "ai",
          content: `Echo: ${newMessageContent.trim()}`,
          timestamp: new Date().toISOString(),
        }
        addMessageToConversation(conversationId, aiMessage)
      }, 1000)
    }
  }

  const handleDeleteConversation = (conversationId: string) => {
    deleteConversation(conversationId)
    if (selectedConversationId === conversationId) {
      setSelectedConversationId(null)
    }
  }

  const selectedConversation = conversations.find((convo) => convo.id === selectedConversationId)

  const filteredConversations = conversations
    .filter(
      (convo) =>
        convo.participants.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        convo.messages.some((m) => m.content.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedConversation?.messages])

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col md:flex-row">
      {/* Left Panel: Conversations List */}
      <Card className="w-full md:w-1/3 flex flex-col border-r rounded-r-none mb-4 md:mb-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Conversations
          </CardTitle>
          <CardDescription>Start new chats or continue existing ones.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="p-4 border-b">
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add participant name"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddConversation()
                  }
                }}
              />
              <Button onClick={handleAddConversation} size="icon">
                <UserPlus className="h-4 w-4" />
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
              <p className="text-muted-foreground text-center p-4">No conversations found.</p>
            ) : (
              filteredConversations.map((convo) => (
                <div
                  key={convo.id}
                  className={`flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-muted/50 ${
                    selectedConversationId === convo.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setSelectedConversationId(convo.id)}
                >
                  <Avatar>
                    <AvatarImage
                      src={convo.participants.find((p) => p.id !== currentUser.id)?.avatar || "/placeholder-user.png"}
                    />
                    <AvatarFallback>
                      {convo.participants.find((p) => p.id !== currentUser.id)?.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {convo.participants
                        .filter((p) => p.id !== currentUser.id)
                        .map((p) => p.name)
                        .join(", ")}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {convo.messages.length > 0
                        ? convo.messages[convo.messages.length - 1].content
                        : "No messages yet."}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(convo.lastActivity).toLocaleString("en-GB")}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteConversation(convo.id)
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right Panel: Chat Window */}
      <Card className="w-full md:w-2/3 flex flex-col rounded-l-none">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b pb-3">
              <CardTitle className="flex items-center gap-3">
                {selectedConversation.participants
                  .filter((p) => p.id !== currentUser.id)
                  .map((p) => (
                    <Avatar key={p.id} className="h-9 w-9">
                      <AvatarImage src={p.avatar || "/placeholder-user.png"} />
                      <AvatarFallback>{p.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  ))}
                {selectedConversation.participants
                  .filter((p) => p.id !== currentUser.id)
                  .map((p) => p.name)
                  .join(", ")}
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
                      message.senderId === currentUser.id ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.senderId !== currentUser.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            selectedConversation.participants.find((p) => p.id === message.senderId)?.avatar ||
                            "/placeholder-user.png" ||
                            "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {selectedConversation.participants.find((p) => p.id === message.senderId)?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.senderId === currentUser.id
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">{format(new Date(message.timestamp), "p")}</span>
                    </div>
                    {message.senderId === currentUser.id && (
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
            <p className="text-lg">Select a conversation or start a new one.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
