"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageSquare, Send, Search, Plus, MoreHorizontal, Pin, Star, Users } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getRelativeTime } from "@/lib/date-utils"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  content: string
  timestamp: string
  isRead: boolean
  isPinned?: boolean
  isStarred?: boolean
}

interface Conversation {
  id: string
  participants: string[]
  participantNames: string[]
  participantAvatars: string[]
  lastMessage: Message
  unreadCount: number
  isGroup: boolean
  groupName?: string
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    participants: ["admin-001", "user-123"],
    participantNames: ["OG Admin"],
    participantAvatars: ["https://api.dicebear.com/7.x/avataaars/svg?seed=admin"],
    lastMessage: {
      id: "msg-1",
      senderId: "admin-001",
      senderName: "OG Admin",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      content: "Welcome to OG JELLYFIN! How can I help you today?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isRead: false,
    },
    unreadCount: 1,
    isGroup: false,
  },
  {
    id: "2",
    participants: ["user-456", "user-789", "user-123"],
    participantNames: ["JellyUser", "MediaFan"],
    participantAvatars: [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    ],
    lastMessage: {
      id: "msg-2",
      senderId: "user-456",
      senderName: "JellyUser",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
      content: "Has anyone tried the new Jellyfin 10.9 beta?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: true,
    },
    unreadCount: 0,
    isGroup: true,
    groupName: "Jellyfin Beta Testers",
  },
]

export function MessagingSystem() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false)

  if (!user) return null

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participantNames.some((name) => name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (conv.groupName && conv.groupName.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.username,
      senderAvatar: user.avatar,
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true,
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // Update conversation's last message
    setConversations((prev) =>
      prev.map((conv) => (conv.id === selectedConversation ? { ...conv, lastMessage: message } : conv)),
    )
  }

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Card className="ios-card border-0 h-[600px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Messages
              </CardTitle>
              <CardDescription>Stay connected with the community</CardDescription>
            </div>
            <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
              <DialogTrigger asChild>
                <Button className="ios-button text-white border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle>New Message</DialogTitle>
                  <DialogDescription>Start a new conversation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Search users..." className="ios-search border-0" />
                  <Textarea placeholder="Type your message..." className="ios-search border-0" />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowNewMessageDialog(false)}
                      variant="outline"
                      className="flex-1 ios-button bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button className="flex-1 ios-button text-white border-0">
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-[500px]">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 ios-search border-0"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.id ? "bg-purple-50 border-purple-200" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {conv.isGroup ? (
                          <div className="flex -space-x-2">
                            {conv.participantAvatars.slice(0, 2).map((avatar, index) => (
                              <Avatar key={index} className="h-10 w-10 border-2 border-white">
                                <AvatarImage src={avatar || "/placeholder.png"} />
                                <AvatarFallback>{conv.participantNames[index]?.charAt(0)}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        ) : (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conv.participantAvatars[0] || "/placeholder.png"} />
                            <AvatarFallback>{conv.participantNames[0]?.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        {conv.unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium truncate">
                            {conv.isGroup ? conv.groupName : conv.participantNames[0]}
                          </h4>
                          <span className="text-xs text-gray-500">{getRelativeTime(conv.lastMessage.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage.content}</p>
                        {conv.isGroup && (
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{conv.participants.length} members</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConv ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedConv.isGroup ? (
                        <div className="flex -space-x-2">
                          {selectedConv.participantAvatars.slice(0, 2).map((avatar, index) => (
                            <Avatar key={index} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={avatar || "/placeholder.png"} />
                              <AvatarFallback>{selectedConv.participantNames[index]?.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      ) : (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={selectedConv.participantAvatars[0] || "/placeholder.png"} />
                          <AvatarFallback>{selectedConv.participantNames[0]?.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <h3 className="font-medium">
                          {selectedConv.isGroup ? selectedConv.groupName : selectedConv.participantNames[0]}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedConv.isGroup ? `${selectedConv.participants.length} members` : "Online"}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-500 mt-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.senderId === user.id ? "flex-row-reverse" : ""}`}
                        >
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={message.senderAvatar || "/placeholder.png"} />
                            <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={`max-w-xs lg:max-w-md ${message.senderId === user.id ? "text-right" : ""}`}>
                            <div
                              className={`rounded-2xl px-4 py-2 ${
                                message.senderId === user.id
                                  ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500">{getRelativeTime(message.timestamp)}</span>
                              {message.isPinned && <Pin className="h-3 w-3 text-gray-400" />}
                              {message.isStarred && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 ios-search border-0"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="ios-button text-white border-0"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p>Choose a conversation from the list to start messaging</p>
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
