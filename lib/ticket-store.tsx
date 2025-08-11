import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"

interface Ticket {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "open" | "in-progress" | "closed"
  timestamp: number
}

interface TicketState {
  tickets: Ticket[]
  addTicket: (title: string, description: string, priority: "low" | "medium" | "high") => void
  updateTicketStatus: (id: string, status: "open" | "in-progress" | "closed") => void
  deleteTicket: (id: string) => void
}

export const useTicketStore = create<TicketState>((set) => ({
  tickets: [],
  addTicket: (title, description, priority) =>
    set((state) => ({
      tickets: [
        {
          id: uuidv4(),
          title,
          description,
          priority,
          status: "open",
          timestamp: Date.now(),
        },
        ...state.tickets,
      ],
    })),
  updateTicketStatus: (id, status) =>
    set((state) => ({
      tickets: state.tickets.map((ticket) => (ticket.id === id ? { ...ticket, status } : ticket)),
    })),
  deleteTicket: (id) =>
    set((state) => ({
      tickets: state.tickets.filter((ticket) => ticket.id !== id),
    })),
}))
