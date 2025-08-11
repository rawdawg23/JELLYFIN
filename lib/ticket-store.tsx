"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface TicketMessage {
  id: string
  content: string
  sender: string
  isStaff: boolean
  timestamp: string
  userId?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  status: "open" | "in-progress" | "resolved" | "closed"
  createdAt: string
  updatedAt: string
  userId: string
  userName: string
  userEmail: string
  messages: TicketMessage[]
}

interface TicketStore {
  tickets: Ticket[]
  addTicket: (ticket: Omit<Ticket, "id" | "createdAt" | "updatedAt" | "messages">) => void
  addMessage: (ticketId: string, message: Omit<TicketMessage, "id" | "timestamp">) => void
  updateTicketStatus: (ticketId: string, status: Ticket["status"]) => void
  getTicketsByUser: (userId: string) => Ticket[]
  getAllTickets: () => Ticket[]
}

export const useTicketStore = create<TicketStore>()(
  persist(
    (set, get) => ({
      tickets: [
        {
          id: "TICK-001",
          title: "Unable to stream 4K content",
          description: "I'm having trouble streaming 4K movies. The video keeps buffering.",
          category: "technical",
          priority: "high",
          status: "in-progress",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
          userId: "user-123",
          userName: "John Smith",
          userEmail: "john@example.com",
          messages: [
            {
              id: "1",
              content: "I'm having trouble streaming 4K movies. The video keeps buffering every few minutes.",
              sender: "John Smith",
              isStaff: false,
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              userId: "user-123",
            },
            {
              id: "2",
              content:
                "Hi John! I can help you with that. Can you tell me what device you're using and your internet speed?",
              sender: "Support Team",
              isStaff: true,
              timestamp: new Date(Date.now() - 82800000).toISOString(),
            },
          ],
        },
      ],
      addTicket: (ticketData) =>
        set((state) => ({
          tickets: [
            {
              ...ticketData,
              id: `TICK-${String(state.tickets.length + 1).padStart(3, "0")}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              messages: [
                {
                  id: "1",
                  content: ticketData.description,
                  sender: ticketData.userName,
                  isStaff: false,
                  timestamp: new Date().toISOString(),
                  userId: ticketData.userId,
                },
              ],
            },
            ...state.tickets,
          ],
        })),
      addMessage: (ticketId, messageData) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId
              ? {
                  ...ticket,
                  messages: [
                    ...ticket.messages,
                    {
                      ...messageData,
                      id: (ticket.messages.length + 1).toString(),
                      timestamp: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                  status: messageData.isStaff && ticket.status === "open" ? "in-progress" : ticket.status,
                }
              : ticket,
          ),
        })),
      updateTicketStatus: (ticketId, status) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket,
          ),
        })),
      getTicketsByUser: (userId) => {
        return get().tickets.filter((ticket) => ticket.userId === userId)
      },
      getAllTickets: () => {
        return get().tickets
      },
    }),
    {
      name: "ticket-storage",
    },
  ),
)
