"use client"

import { useState, useEffect, useCallback, useRef } from "react"

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

interface OnlineUser {
  id: string
  username: string
  avatar?: string
  role: string
}

interface ChatData {
  type: "message" | "users_update" | "init"
  data: any
}

export function useRealTimeChat(currentUser: any) {
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (!currentUser) return

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      // Create new EventSource connection
      const eventSource = new EventSource("/api/chat")
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log("Chat connection opened")
        setIsConnected(true)

        // Register user as online
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "user_online",
            data: {
              user: {
                id: currentUser.id,
                username: currentUser.username,
                avatar: currentUser.avatar,
                role: currentUser.role,
              },
            },
          }),
        }).catch(console.error)
      }

      eventSource.onmessage = (event) => {
        try {
          const data: ChatData = JSON.parse(event.data)

          switch (data.type) {
            case "init":
              setMessages(data.data.messages || [])
              setOnlineUsers((data.data.users || []).filter((user: OnlineUser) => user.id !== currentUser.id))
              break
            case "message":
              setMessages((prev) => [...prev, data.data])
              break
            case "users_update":
              setOnlineUsers((data.data || []).filter((user: OnlineUser) => user.id !== currentUser.id))
              break
          }
        } catch (error) {
          console.error("Error parsing chat data:", error)
        }
      }

      eventSource.onerror = (error) => {
        console.error("Chat connection error:", error)
        setIsConnected(false)
        eventSource.close()

        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect to chat...")
          connect()
        }, 3000)
      }
    } catch (error) {
      console.error("Failed to connect to chat:", error)
      setIsConnected(false)
    }
  }, [currentUser])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (currentUser) {
      // Register user as offline
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "user_offline",
          data: { userId: currentUser.id },
        }),
      }).catch(console.error)
    }

    setIsConnected(false)
  }, [currentUser])

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!currentUser || !isConnected) return false

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "send_message",
            data: {
              content,
              sender: {
                id: currentUser.id,
                username: currentUser.username,
                avatar: currentUser.avatar,
                role: currentUser.role,
              },
            },
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to send message")
        }

        // Update user activity
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "user_activity",
            data: { userId: currentUser.id },
          }),
        }).catch(console.error)

        return true
      } catch (error) {
        console.error("Error sending message:", error)
        return false
      }
    },
    [currentUser, isConnected],
  )

  // Connect when user is available
  useEffect(() => {
    if (currentUser) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [currentUser, connect, disconnect])

  // Update user activity periodically
  useEffect(() => {
    if (!currentUser || !isConnected) return

    const activityInterval = setInterval(() => {
      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "user_activity",
          data: { userId: currentUser.id },
        }),
      }).catch(console.error)
    }, 15000) // Update every 15 seconds

    return () => clearInterval(activityInterval)
  }, [currentUser, isConnected])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, disconnect
        disconnect()
      } else if (currentUser) {
        // Page is visible, reconnect
        connect()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [currentUser, connect, disconnect])

  return {
    messages,
    onlineUsers,
    isConnected,
    sendMessage,
  }
}
