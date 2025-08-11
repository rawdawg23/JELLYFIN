"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, ThumbsUp, Reply, Trash2 } from "lucide-react"
import { getRelativeTime } from "@/lib/date-utils"
import { useAuth } from "@/providers/auth-provider"

interface ForumPost {
  id: string
  title: string
  content: string
  author: string
  authorAvatar?: string
  createdAt: Date
  category: string
  likes: number
  replies: ForumReply[]
  isLiked: boolean
}

interface ForumReply {
  id: string
  content: string
  author: string
  authorAvatar?: string
  createdAt: Date
  likes: number
  isLiked: boolean
}

const initialPosts: ForumPost[] = [
  {
    id: "1",
    title: "Welcome to Jellyfin Store Community!",
    content:
      "This is our community forum where you can ask questions, share tips, and connect with other Jellyfin users. Feel free to introduce yourself!",
    author: "Admin",
    authorAvatar: "/placeholder-user.jpg",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    category: "General",
    likes: 15,
    replies: [
      {
        id: "r1",
        content: "Thanks for setting this up! Looking forward to connecting with the community.",
        author: "user123",
        authorAvatar: "/placeholder-user.jpg",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        likes: 3,
        isLiked: false,
      },
    ],
    isLiked: false,
  },
  {
    id: "2",
    title: "Best practices for server setup?",
    content:
      "I'm new to Jellyfin and wondering what the best practices are for setting up a server. Any recommendations for hardware, storage, and network configuration?",
    author: "newbie_user",
    authorAvatar: "/placeholder-user.jpg",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    category: "Technical Support",
    likes: 8,
    replies: [
      {
        id: "r2",
        content:
          "I'd recommend starting with at least 8GB RAM and a decent CPU. For storage, make sure you have enough space for your media library plus transcoding cache.",
        author: "tech_expert",
        authorAvatar: "/placeholder-user.jpg",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        likes: 5,
        isLiked: true,
      },
      {
        id: "r3",
        content:
          "Don't forget about network bandwidth! If you plan to stream outside your home network, make sure your upload speed can handle it.",
        author: "streaming_pro",
        authorAvatar: "/placeholder-user.jpg",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 2,
        isLiked: false,
      },
    ],
    isLiked: true,
  },
]

export function ForumSystem() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts)
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" })
  const [newReply, setNewReply] = useState("")
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "General", "Technical Support", "Feature Requests", "Announcements"]

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return

    const post: ForumPost = {
      id: Date.now().toString(),
      title: newPost.title,
      content: newPost.content,
      author: user?.username || "Anonymous",
      authorAvatar: user?.avatar || "/placeholder-user.jpg",
      createdAt: new Date(),
      category: newPost.category,
      likes: 0,
      replies: [],
      isLiked: false,
    }

    setPosts([post, ...posts])
    setNewPost({ title: "", content: "", category: "General" })
    setIsCreatePostOpen(false)
  }

  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked,
          }
        }
        return post
      }),
    )
  }

  const handleReply = (postId: string) => {
    if (!newReply.trim()) return

    const reply: ForumReply = {
      id: Date.now().toString(),
      content: newReply,
      author: user?.username || "Anonymous",
      authorAvatar: user?.avatar || "/placeholder-user.jpg",
      createdAt: new Date(),
      likes: 0,
      isLiked: false,
    }

    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: [...post.replies, reply],
          }
        }
        return post
      }),
    )

    setNewReply("")
  }

  const handleLikeReply = (postId: string, replyId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.map((reply) => {
              if (reply.id === replyId) {
                return {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked,
                }
              }
              return reply
            }),
          }
        }
        return post
      }),
    )
  }

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter((post) => post.id !== postId))
    setSelectedPost(null)
  }

  const handleDeleteReply = (postId: string, replyId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.filter((reply) => reply.id !== replyId),
          }
        }
        return post
      }),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Community Forum</h2>
          <p className="text-muted-foreground">Connect with other Jellyfin users and get help</p>
        </div>
        <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full p-2 border rounded-md"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                >
                  {categories
                    .filter((cat) => cat !== "All")
                    .map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content..."
                  rows={6}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePost}>Create Post</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          className="p-2 border rounded-md sm:max-w-xs"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.author} />
                    <AvatarFallback>{post.author[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <CardDescription>
                      by {post.author} • {getRelativeTime(post.createdAt)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{post.category}</Badge>
                  {(user?.isAdmin || user?.username === post.author) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePost(post.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.content}</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLikePost(post.id)
                  }}
                  className={post.isLiked ? "text-blue-600" : ""}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {post.likes}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPost(post)}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {post.replies.length} replies
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPost.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedPost.authorAvatar || "/placeholder.svg"} alt={selectedPost.author} />
                  <AvatarFallback>{selectedPost.author[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{selectedPost.author}</span>
                    <Badge variant="secondary">{selectedPost.category}</Badge>
                    <span className="text-sm text-muted-foreground">{getRelativeTime(selectedPost.createdAt)}</span>
                  </div>
                  <p className="text-sm">{selectedPost.content}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikePost(selectedPost.id)}
                      className={selectedPost.isLiked ? "text-blue-600" : ""}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {selectedPost.likes}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Replies ({selectedPost.replies.length})</h4>
                <div className="space-y-4">
                  {selectedPost.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-3 pl-4 border-l-2 border-muted">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={reply.authorAvatar || "/placeholder.svg"} alt={reply.author} />
                        <AvatarFallback>{reply.author[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{reply.author}</span>
                          <span className="text-xs text-muted-foreground">{getRelativeTime(reply.createdAt)}</span>
                          {(user?.isAdmin || user?.username === reply.author) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReply(selectedPost.id, reply.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm">{reply.content}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeReply(selectedPost.id, reply.id)}
                          className={reply.isLiked ? "text-blue-600" : ""}
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {reply.likes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
                      <AvatarFallback>{user?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={() => handleReply(selectedPost.id)} disabled={!newReply.trim()}>
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
