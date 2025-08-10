"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  Lock,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Reply,
  AlertCircle,
  Users,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getRelativeTime } from "@/lib/date-utils"

interface ForumPost {
  id: string
  title: string
  content: string
  authorId: string
  authorUsername: string
  authorAvatar?: string
  categoryId: string
  categoryName: string
  isPinned: boolean
  isLocked: boolean
  views: number
  likes: number
  dislikes: number
  replyCount: number
  createdAt: string
  updatedAt: string
  replies: ForumReply[]
}

interface ForumReply {
  id: string
  content: string
  authorId: string
  authorUsername: string
  authorAvatar?: string
  likes: number
  dislikes: number
  createdAt: string
}

interface ForumCategory {
  id: string
  name: string
  description: string
  postCount: number
  color: string
}

export function ForumSystem() {
  const { user } = useAuth()
  const [categories] = useState<ForumCategory[]>([
    {
      id: "general",
      name: "General Discussion",
      description: "General chat about anything",
      postCount: 45,
      color: "bg-blue-500",
    },
    {
      id: "technical",
      name: "Technical Support",
      description: "Get help with technical issues",
      postCount: 23,
      color: "bg-red-500",
    },
    {
      id: "features",
      name: "Feature Requests",
      description: "Suggest new features",
      postCount: 12,
      color: "bg-green-500",
    },
    {
      id: "announcements",
      name: "Announcements",
      description: "Official announcements",
      postCount: 8,
      color: "bg-purple-500",
    },
  ])

  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "post-1",
      title: "Welcome to the OG JELLYFIN Community Forum!",
      content:
        "Welcome everyone! This is our community forum where you can discuss anything related to OG JELLYFIN, get help, share tips, and connect with other users. Please be respectful and follow our community guidelines.",
      authorId: "admin-1",
      authorUsername: "Admin",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      categoryId: "announcements",
      categoryName: "Announcements",
      isPinned: true,
      isLocked: false,
      views: 234,
      likes: 45,
      dislikes: 2,
      replyCount: 12,
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      replies: [],
    },
    {
      id: "post-2",
      title: "How to optimize streaming quality?",
      content:
        "I'm having some issues with streaming quality. Sometimes the video is pixelated or buffers frequently. Any tips on how to optimize the streaming experience?",
      authorId: user?.id || "user-1",
      authorUsername: user?.username || "StreamLover",
      authorAvatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
      categoryId: "technical",
      categoryName: "Technical Support",
      isPinned: false,
      isLocked: false,
      views: 89,
      likes: 12,
      dislikes: 1,
      replyCount: 5,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      replies: [],
    },
    {
      id: "post-3",
      title: "Feature Request: Dark mode for mobile app",
      content:
        "Would love to see a dark mode option for the mobile app. It would be great for watching content in low light environments.",
      authorId: "user-2",
      authorUsername: "NightOwl",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nightowl",
      categoryId: "features",
      categoryName: "Feature Requests",
      isPinned: false,
      isLocked: false,
      views: 156,
      likes: 28,
      dislikes: 3,
      replyCount: 8,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      replies: [],
    },
  ])

  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [newPostForm, setNewPostForm] = useState({
    title: "",
    content: "",
    category: "",
  })
  const [newReply, setNewReply] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const handleCreatePost = () => {
    if (!newPostForm.title || !newPostForm.content || !newPostForm.category) return

    const category = categories.find((c) => c.id === newPostForm.category)
    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title: newPostForm.title,
      content: newPostForm.content,
      authorId: user?.id || "",
      authorUsername: user?.username || "",
      authorAvatar: user?.avatar,
      categoryId: newPostForm.category,
      categoryName: category?.name || "",
      isPinned: false,
      isLocked: false,
      views: 0,
      likes: 0,
      dislikes: 0,
      replyCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    }

    setPosts([newPost, ...posts])
    setNewPostForm({ title: "", content: "", category: "" })
  }

  const handleReply = () => {
    if (!newReply.trim() || !selectedPost) return

    const reply: ForumReply = {
      id: `reply-${Date.now()}`,
      content: newReply,
      authorId: user?.id || "",
      authorUsername: user?.username || "",
      authorAvatar: user?.avatar,
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString(),
    }

    const updatedPost = {
      ...selectedPost,
      replies: [...selectedPost.replies, reply],
      replyCount: selectedPost.replyCount + 1,
      updatedAt: new Date().toISOString(),
    }

    setPosts(posts.map((p) => (p.id === selectedPost.id ? updatedPost : p)))
    setSelectedPost(updatedPost)
    setNewReply("")
  }

  const getFilteredPosts = () => {
    return posts
      .filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.authorUsername.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "all" || post.categoryId === selectedCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        // Pinned posts first
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        // Then by update time
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }

  if (!user) {
    return (
      <Card className="ios-card border-0 text-center p-8">
        <CardContent>
          <AlertCircle className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to access the community forum.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Community Forum
          </h2>
          <p className="text-muted-foreground mt-2">Connect with the community and share your thoughts</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="ios-button text-white border-0">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>Share your thoughts with the community</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="post-title">Title</label>
                <Input
                  id="post-title"
                  placeholder="Enter post title"
                  value={newPostForm.title}
                  onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="post-category">Category</label>
                <select
                  id="post-category"
                  value={newPostForm.category}
                  onChange={(e) => setNewPostForm({ ...newPostForm, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="post-content">Content</label>
                <Textarea
                  id="post-content"
                  placeholder="Write your post content..."
                  value={newPostForm.content}
                  onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                  rows={6}
                />
              </div>
              <Button onClick={handleCreatePost} className="w-full ios-button text-white border-0">
                Create Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`ios-card border-0 cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedCategory === category.id ? "ring-2 ring-purple-400" : ""
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.postCount} posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ios-search pl-10 border-0"
          />
        </div>
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategory("all")}
          className={selectedCategory === "all" ? "ios-button text-white border-0" : ""}
        >
          All Categories
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-foreground">Recent Posts ({getFilteredPosts().length})</h3>
          <div className="space-y-4">
            {getFilteredPosts().map((post) => (
              <Card
                key={post.id}
                className={`ios-card border-0 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPost?.id === post.id ? "ring-2 ring-purple-400" : ""
                }`}
                onClick={() => setSelectedPost(post)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {post.isPinned && <Pin className="h-4 w-4 text-green-500" />}
                        {post.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                        <Badge
                          className={`text-xs border-0 ${categories.find((c) => c.id === post.categoryId)?.color || "bg-gray-500"} text-white`}
                        >
                          {post.categoryName}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.replyCount}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {post.likes}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground line-clamp-2">{post.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.authorAvatar || "/placeholder.svg"} alt={post.authorUsername} />
                          <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                            {post.authorUsername.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">{post.authorUsername}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{getRelativeTime(post.updatedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          {selectedPost ? (
            <Card className="ios-card border-0">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedPost.isPinned && <Pin className="h-4 w-4 text-green-500" />}
                  {selectedPost.isLocked && <Lock className="h-4 w-4 text-red-500" />}
                  <Badge
                    className={`text-xs border-0 ${categories.find((c) => c.id === selectedPost.categoryId)?.color || "bg-gray-500"} text-white`}
                  >
                    {selectedPost.categoryName}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-3">{selectedPost.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={selectedPost.authorAvatar || "/placeholder.svg"}
                      alt={selectedPost.authorUsername}
                    />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                      {selectedPost.authorUsername.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{selectedPost.authorUsername}</span>
                  <span>•</span>
                  <span>{getRelativeTime(selectedPost.createdAt)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {selectedPost.views} views
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {selectedPost.replyCount} replies
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {selectedPost.likes}
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsDown className="h-3 w-3 mr-1" />
                      {selectedPost.dislikes}
                    </Button>
                  </div>
                </div>

                {!selectedPost.isLocked && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-foreground mb-3">Reply to this post</h4>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Write your reply..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Button onClick={handleReply} className="ios-button text-white border-0">
                        <Reply className="h-4 w-4 mr-2" />
                        Post Reply
                      </Button>
                    </div>
                  </div>
                )}

                {selectedPost.replies.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-foreground mb-3">Replies ({selectedPost.replies.length})</h4>
                    <div className="space-y-3">
                      {selectedPost.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.authorAvatar || "/placeholder.svg"} alt={reply.authorUsername} />
                            <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-indigo-500 text-white">
                              {reply.authorUsername.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{reply.authorUsername}</span>
                              <span className="text-xs text-muted-foreground">{getRelativeTime(reply.createdAt)}</span>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <p className="text-sm text-foreground">{reply.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="ios-card border-0 text-center p-8">
              <CardContent>
                <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Post</h3>
                <p className="text-muted-foreground">
                  Choose a post from the list to read and participate in the discussion
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
