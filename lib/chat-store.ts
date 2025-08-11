// Global in-memory chat store for real-time messaging
interface ChatMessage {
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
  lastSeen: number
}

class ChatStore {
  private messages: ChatMessage[] = []
  private onlineUsers: Map<string, OnlineUser> = new Map()
  private subscribers: Set<(data: any) => void> = new Set()

  addMessage(message: ChatMessage) {
    this.messages.push(message)
    // Keep only last 100 messages
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100)
    }
    this.broadcast({ type: "message", data: message })
  }

  getMessages() {
    return this.messages
  }

  addOnlineUser(user: OnlineUser) {
    this.onlineUsers.set(user.id, { ...user, lastSeen: Date.now() })
    this.broadcast({ type: "users_update", data: Array.from(this.onlineUsers.values()) })
  }

  removeOnlineUser(userId: string) {
    this.onlineUsers.delete(userId)
    this.broadcast({ type: "users_update", data: Array.from(this.onlineUsers.values()) })
  }

  getOnlineUsers() {
    // Remove users who haven't been seen in 30 seconds
    const now = Date.now()
    for (const [userId, user] of this.onlineUsers.entries()) {
      if (now - user.lastSeen > 30000) {
        this.onlineUsers.delete(userId)
      }
    }
    return Array.from(this.onlineUsers.values())
  }

  updateUserActivity(userId: string) {
    const user = this.onlineUsers.get(userId)
    if (user) {
      user.lastSeen = Date.now()
    }
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private broadcast(data: any) {
    this.subscribers.forEach((callback) => {
      try {
        callback(data)
      } catch (error) {
        console.error("Error broadcasting to subscriber:", error)
      }
    })
  }
}

export const chatStore = new ChatStore()
