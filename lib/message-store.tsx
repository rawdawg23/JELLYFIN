"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface Message {
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

interface MessageStore {
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "timestamp" | "read" | "starred" | "archived">) => void
  markAsRead: (messageId: string) => void
  toggleStar: (messageId: string) => void
  toggleArchive: (messageId: string) => void
  deleteMessage: (messageId: string) => void
  getMessagesByUser: (userId: string) => Message[]
  getUnreadCount: (userId: string) => number
}

export const useMessageStore = create<MessageStore>()(
  persist(
    (set, get) => ({
      messages: [
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
      ],
      addMessage: (messageData) =>
        set((state) => ({
          messages: [
            {
              ...messageData,
              id: (state.messages.length + 1).toString(),
              timestamp: new Date().toISOString(),
              read: messageData.sender === "You",
              starred: false,
              archived: false,
            },
            ...state.messages,
          ],
        })),
      markAsRead: (messageId) =>
        set((state) => ({
          messages: state.messages.map((message) => (message.id === messageId ? { ...message, read: true } : message)),
        })),
      toggleStar: (messageId) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === messageId ? { ...message, starred: !message.starred } : message,
          ),
        })),
      toggleArchive: (messageId) =>
        set((state) => ({
          messages: state.messages.map((message) =>
            message.id === messageId ? { ...message, archived: !message.archived } : message,
          ),
        })),
      deleteMessage: (messageId) =>
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== messageId),
        })),
      getMessagesByUser: (userId) => {
        return get().messages.filter((message) => message.recipient === userId || message.sender === userId)
      },
      getUnreadCount: (userId) => {
        return get().messages.filter((message) => message.recipient === userId && !message.read && !message.archived)
          .length
      },
    }),
    {
      name: "message-storage",
    },
  ),
)
