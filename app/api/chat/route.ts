import type { NextRequest } from "next/server"
import { chatStore } from "@/lib/chat-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  if (action === "messages") {
    return Response.json({ messages: chatStore.getMessages() })
  }

  if (action === "users") {
    return Response.json({ users: chatStore.getOnlineUsers() })
  }

  // Server-Sent Events for real-time updates
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const unsubscribe = chatStore.subscribe((data) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      })

      // Send initial data
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({
            type: "init",
            data: {
              messages: chatStore.getMessages(),
              users: chatStore.getOnlineUsers(),
            },
          })}\n\n`,
        ),
      )

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === "send_message") {
      const message = {
        id: Date.now().toString(),
        content: data.content,
        sender: data.sender,
        timestamp: new Date().toISOString(),
      }
      chatStore.addMessage(message)
      return Response.json({ success: true, message })
    }

    if (action === "user_online") {
      chatStore.addOnlineUser(data.user)
      return Response.json({ success: true })
    }

    if (action === "user_offline") {
      chatStore.removeOnlineUser(data.userId)
      return Response.json({ success: true })
    }

    if (action === "user_activity") {
      chatStore.updateUserActivity(data.userId)
      return Response.json({ success: true })
    }

    return Response.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
