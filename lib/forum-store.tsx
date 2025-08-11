"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  authorRole: "user" | "moderator" | "admin"
  category: string
  timestamp: string
  replies: number
  views: number
  likes: number
  dislikes: number
  pinned: boolean
  locked: boolean
  replies_data: ForumReply[]
}

export interface ForumReply {
  id: string
  content: string
  author: string
  authorRole: "user" | "moderator" | "admin"
  timestamp: string
  likes: number
  dislikes: number
}

interface ForumStore {
  posts: ForumPost[]
  addPost: (
    post: Omit<ForumPost, "id" | "timestamp" | "replies" | "views" | "likes" | "dislikes" | "replies_data">,
  ) => void
  addReply: (postId: string, reply: Omit<ForumReply, "id" | "timestamp" | "likes" | "dislikes">) => void
  likePost: (postId: string) => void
  dislikePost: (postId: string) => void
  likeReply: (postId: string, replyId: string) => void
  dislikeReply: (postId: string, replyId: string) => void
  incrementViews: (postId: string) => void
}

export const useForumStore = create<ForumStore>()(
  persist(
    (set, get) => ({
      posts: [
        {
          id: "1",
          title: "Welcome to the OG JELLYFIN Community!",
          content:
            "Welcome everyone! This is our community forum where you can discuss everything related to Jellyfin, share tips, ask questions, and connect with other users. Please be respectful and follow our community guidelines.",
          author: "Admin",
          authorRole: "admin",
          category: "announcements",
          timestamp: new Date(Date.now() - 604800000).toISOString(),
          replies: 15,
          views: 234,
          likes: 42,
          dislikes: 1,
          pinned: true,
          locked: false,
          replies_data: [
            {
              id: "1",
              content: "Thanks for the warm welcome! Excited to be part of this community.",
              author: "StreamingFan",
              authorRole: "user",
              timestamp: new Date(Date.now() - 500000000).toISOString(),
              likes: 8,
              dislikes: 0,
            },
            {
              id: "2",
              content: "Great to see such an active community around Jellyfin!",
              author: "MovieBuff",
              authorRole: "user",
              timestamp: new Date(Date.now() - 400000000).toISOString(),
              likes: 5,
              dislikes: 0,
            },
          ],
        },
        {
          id: "2",
          title: "Best practices for 4K streaming",
          content:
            "I've been experimenting with 4K streaming and wanted to share some tips that have worked well for me. First, make sure your network can handle the bandwidth...",
          author: "StreamingPro",
          authorRole: "user",
          category: "technical",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          replies: 8,
          views: 156,
          likes: 23,
          dislikes: 2,
          pinned: false,
          locked: false,
          replies_data: [],
        },
      ],
      addPost: (postData) =>
        set((state) => ({
          posts: [
            {
              ...postData,
              id: (state.posts.length + 1).toString(),
              timestamp: new Date().toISOString(),
              replies: 0,
              views: 1,
              likes: 0,
              dislikes: 0,
              replies_data: [],
            },
            ...state.posts,
          ],
        })),
      addReply: (postId, replyData) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  replies: post.replies + 1,
                  replies_data: [
                    ...post.replies_data,
                    {
                      ...replyData,
                      id: (post.replies_data.length + 1).toString(),
                      timestamp: new Date().toISOString(),
                      likes: 0,
                      dislikes: 0,
                    },
                  ],
                }
              : post,
          ),
        })),
      likePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)),
        })),
      dislikePost: (postId) =>
        set((state) => ({
          posts: state.posts.map((post) => (post.id === postId ? { ...post, dislikes: post.dislikes + 1 } : post)),
        })),
      likeReply: (postId, replyId) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  replies_data: post.replies_data.map((reply) =>
                    reply.id === replyId ? { ...reply, likes: reply.likes + 1 } : reply,
                  ),
                }
              : post,
          ),
        })),
      dislikeReply: (postId, replyId) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  replies_data: post.replies_data.map((reply) =>
                    reply.id === replyId ? { ...reply, dislikes: reply.dislikes + 1 } : reply,
                  ),
                }
              : post,
          ),
        })),
      incrementViews: (postId) =>
        set((state) => ({
          posts: state.posts.map((post) => (post.id === postId ? { ...post, views: post.views + 1 } : post)),
        })),
    }),
    {
      name: "forum-storage",
    },
  ),
)
