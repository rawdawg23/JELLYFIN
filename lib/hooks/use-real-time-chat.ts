"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, type Database, isSupabaseConfigured } from "@/lib/supabase/client"
import { useAuth } from "@/providers/auth-provider"

type User = Database["public"]["Tables"]["users"]["Row"]
type Message = Database["public"]["Tables"]["messages"]["Row"] & {
  sender: User
}
type Conversation = {
  id: string
  participants: User[]
  messages: Message[]
  created_at: string
  updated_at: string
}

const mockOnlineUsers: User[] = [
  {
    id: "1",
    name: "Alex Chen",
    email: "alex@example.com",
    avatar: "/placeholder-user.jpg",
    location: "San Francisco, CA",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    avatar: "/placeholder-user.jpg",
    location: "New York, NY",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function useRealTimeChat() {
  const { user: currentUser } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState<User[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const updatePresence = useCallback(
    async (status: "online" | "offline" | "away") => {
      if (!currentUser || !isSupabaseConfigured) return

      await supabase.from("user_presence").upsert({
        user_id: currentUser.id,
        status,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    },
    [currentUser],
  )

  const loadOnlineUsers = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setOnlineUsers(mockOnlineUsers)
      return
    }

    const { data: presenceData } = await supabase
      .from("user_presence")
      .select(`
        user_id,
        status,
        users (
          id,
          name,
          email,
          avatar,
          location
        )
      `)
      .eq("status", "online")

    if (presenceData) {
      const users = presenceData.filter((p) => p.users && p.user_id !== currentUser?.id).map((p) => p.users as User)
      setOnlineUsers(users)
    }
  }, [currentUser])

  const loadConversations = useCallback(async () => {
    if (!currentUser) return

    if (!isSupabaseConfigured) {
      setConversations([])
      return
    }

    const { data: conversationData } = await supabase
      .from("conversation_participants")
      .select(`
        conversation_id,
        conversations (
          id,
          created_at,
          updated_at
        )
      `)
      .eq("user_id", currentUser.id)

    if (conversationData) {
      const conversationIds = conversationData.map((cp) => cp.conversation_id)

      // Load participants and messages for each conversation
      const conversationsWithData = await Promise.all(
        conversationIds.map(async (convId) => {
          // Load participants
          const { data: participants } = await supabase
            .from("conversation_participants")
            .select(`
              users (
                id,
                name,
                email,
                avatar,
                location
              )
            `)
            .eq("conversation_id", convId)

          // Load messages
          const { data: messages } = await supabase
            .from("messages")
            .select(`
              *,
              sender:users (
                id,
                name,
                email,
                avatar,
                location
              )
            `)
            .eq("conversation_id", convId)
            .order("created_at", { ascending: true })

          const conversation = conversationData.find((cd) => cd.conversation_id === convId)?.conversations

          return {
            id: convId,
            participants: participants?.map((p) => p.users as User) || [],
            messages: messages?.map((m) => ({ ...m, sender: m.sender as User })) || [],
            created_at: conversation?.created_at || "",
            updated_at: conversation?.updated_at || "",
          }
        }),
      )

      setConversations(conversationsWithData)
    }
  }, [currentUser])

  const startConversation = useCallback(
    async (otherUserId: string) => {
      if (!currentUser || !isSupabaseConfigured) return null

      // Check if conversation already exists
      const existingConv = conversations.find((conv) => conv.participants.some((p) => p.id === otherUserId))
      if (existingConv) return existingConv.id

      // Create new conversation
      const { data: newConv } = await supabase.from("conversations").insert({}).select().single()

      if (newConv) {
        // Add participants
        await supabase.from("conversation_participants").insert([
          { conversation_id: newConv.id, user_id: currentUser.id },
          { conversation_id: newConv.id, user_id: otherUserId },
        ])

        await loadConversations()
        return newConv.id
      }

      return null
    },
    [currentUser, conversations, loadConversations],
  )

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!currentUser || !isSupabaseConfigured) return

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content,
      })
    },
    [currentUser],
  )

  useEffect(() => {
    if (!currentUser) return

    if (!isSupabaseConfigured) {
      loadOnlineUsers()
      setLoading(false)
      return
    }

    // Update presence to online
    updatePresence("online")

    // Subscribe to presence changes
    const presenceChannel = supabase
      .channel("user_presence")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_presence" }, () => loadOnlineUsers())
      .subscribe()

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel("messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => loadConversations())
      .subscribe()

    // Update presence every 30 seconds
    const presenceInterval = setInterval(() => {
      updatePresence("online")
    }, 30000)

    // Set offline when leaving
    const handleBeforeUnload = () => {
      updatePresence("offline")
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      updatePresence("offline")
      presenceChannel.unsubscribe()
      messagesChannel.unsubscribe()
      clearInterval(presenceInterval)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [currentUser, updatePresence, loadOnlineUsers, loadConversations])

  useEffect(() => {
    if (currentUser) {
      Promise.all([loadOnlineUsers(), loadConversations()]).finally(() => {
        setLoading(false)
      })
    }
  }, [currentUser, loadOnlineUsers, loadConversations])

  return {
    onlineUsers,
    conversations,
    loading,
    startConversation,
    sendMessage,
    refreshData: () => Promise.all([loadOnlineUsers(), loadConversations()]),
  }
}
