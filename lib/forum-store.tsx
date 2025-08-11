"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  category: string
  createdAt: Date
  likes: number
  dislikes: number
  replies: ForumReply[]
}

export interface ForumReply {
  id: string
  content: string
  author: string
  createdAt: Date
}

interface ForumStore {
  posts: ForumPost[]
  addPost: (post: Omit<ForumPost, "id" | "createdAt" | "likes" | "dislikes" | "replies">) => void
  deletePost: (postId: string) => void
  addReply: (postId: string, reply: Omit<ForumReply, "id" | "createdAt">) => void
  deleteReply: (postId: string, replyId: string) => void
  likePost: (postId: string) => void
  dislikePost: (postId: string) => void
}

export const useForumStore = create<ForumStore>()(
  persist(
    (set) => ({
      posts: [
        {
          id: "1",
          title: "Welcome to the Jellyfin Community!",
          content: "This is a place to discuss all things Jellyfin. Share your setups, ask questions, and help others!",
          author: "Admin",
          category: "Announcements",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          likes: 15,
          dislikes: 0,
          replies: [
            {
              id: "r1",
              content: "Thanks for setting this up! Looking forward to the discussions.",
              author: "JellyUser",
              createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            },
          ],
        },
        {
          id: "2",
          title: "Best practices for Jellyfin server setup?",
          content:
            "I'm new to Jellyfin and wondering what the community recommends for server hardware and configuration. Any tips?",
          author: "NewUser123",
          category: "General",
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          likes: 8,
          dislikes: 1,
          replies: [],
        },
      ],
      addPost: (postData) =>
        set((state) => ({
          posts: [
            {
              ...postData,
              id: Date.now().toString(),
              createdAt: new Date(),
              likes: 0,
              dislikes: 0,
              replies: [],
            },
            ...state.posts,
          ],
        })),
      deletePost: (postId) =>
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== postId),
        })),
      addReply: (postId, replyData) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  replies: [
                    ...post.replies,
                    {
                      ...replyData,
                      id: Date.now().toString(),
                      createdAt: new Date(),
                    },
                  ],
                }
              : post,
          ),
        })),
      deleteReply: (postId, replyId) =>
        set((state) => ({
          posts: state.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  replies: post.replies.filter((reply) => reply.id !== replyId),
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
    }),
    {
      name: "forum-storage",
    },
  ),
)
