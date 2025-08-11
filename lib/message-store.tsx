import { create } from "zustand"

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  participants: { id: string; name: string; avatar: string }[]
  messages: Message[]
  lastActivity: string
}

interface MessageState {
  conversations: Conversation[]
  messages: Message[]
  addMessage: (sender: "user" | "ai" | "system", content: string) => void
  addConversation: (conversation: Conversation) => void
  addMessageToConversation: (conversationId: string, message: Message) => void
  deleteConversation: (conversationId: string) => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  messages: [],

  addMessage: (sender, content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${Date.now()}`,
          sender,
          content,
          timestamp: Date.now(),
        },
      ],
    })),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [...state.conversations, conversation],
    })),

  addMessageToConversation: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((convo) =>
        convo.id === conversationId
          ? {
              ...convo,
              messages: [...convo.messages, message],
              lastActivity: new Date().toISOString(),
            }
          : convo,
      ),
    })),

  deleteConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter((convo) => convo.id !== conversationId),
    })),
}))
