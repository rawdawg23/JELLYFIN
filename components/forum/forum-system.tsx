"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Filter,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Pin,
  Lock,
  Eye,
  Clock,
  User,
  Crown,
  Shield,
} from "lucide-react"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"

interface ForumPost {
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
  replies_data?: ForumReply[]
}

interface ForumReply {
  id: string
  content: string
  author: string
  authorRole: "user" | "moderator" | "admin"
  timestamp: string
  likes: number
  dislikes: number
}

export function ForumSystem() {
  const [posts, setPosts] = useState<ForumPost[]>([
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
    },
    {
      id: "3",
      title: "Feature request: Better mobile app",
      content:
        "Would love to see improvements to the mobile app, especially for offline downloads and better UI/UX. What do you all think?",
      author: "MobileUser",
      authorRole: "user",
      category: "features",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      replies: 12,
      views: 89,
      likes: 18,
      dislikes: 3,
      pinned: false,
      locked: false,
    },
    {
      id: "4",
      title: "Server maintenance completed",
      content:
        "The scheduled maintenance has been completed successfully. All services are now running normally. Thank you for your patience!",
      author: "Support Team",
      authorRole: "moderator",
      category: "announcements",
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      replies: 5,
      views: 178,
      likes: 31,
      dislikes: 0,
      pinned: false,
      locked: true,
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "",
  })

  const categories = [
    { value: "general", label: "General Discussion" },
    { value: "technical", label: "Technical Support" },
    { value: "features", label: "Feature Requests" },
    { value: "announcements", label: "Announcements" },
  ]

  const getFilteredPosts = () => {
    return posts
      .filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === "all" || post.category === categoryFilter
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        // Pinned posts first
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        // Then by timestamp
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
  }

  const handleCreatePost = () => {
    const post: ForumPost = {
      id: (posts.length + 1).toString(),
      ...newPost,
      author: "You",
      authorRole: "user",
      timestamp: new Date().toISOString(),
      replies: 0,
      views: 1,
      likes: 0,
      dislikes: 0,
      pinned: false,
      locked: false,
    }

    setPosts([post, ...posts])
    setNewPost({ title: "", content: "", category: "" })
    setShowCreateDialog(false)
  }

  const handleReply = () => {
    if (!selectedPost || !replyContent.trim()) return

    const updatedPost = {
      ...selectedPost,
      replies: selectedPost.replies + 1,
    }

    setPosts(posts.map((p) => (p.id === selectedPost.id ? updatedPost : p)))
    setSelectedPost(updatedPost)
    setReplyContent("")
  }

  const handleLike = (postId: string, isLike: boolean) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            likes: isLike ? p.likes + 1 : p.likes,
            dislikes: !isLike ? p.dislikes + 1 : p.dislikes,
          }
        }
        return p
      }),
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-yellow-500" />
      case "moderator":
        return <Shield className="h-3 w-3 text-blue-500" />
      default:
        return <User className="h-3 w-3 text-purple-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-gradient-to-r from-yellow-500 to-orange-500",
      moderator: "bg-gradient-to-r from-blue-500 to-indigo-500",
      user: "bg-gradient-to-r from-purple-500 to-indigo-500",
    }
    return colors[role as keyof typeof colors] || colors.user
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Community Forum
          </h2>
          <p className="text-lg text-muted-foreground mt-2">Connect with the community and share knowledge</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
                <Label htmlFor="post-title">Title</Label>
                <Input
                  id="post-title"
                  placeholder="What's your post about?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="ios-search border-0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-category">Category</Label>
                <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
                  <SelectTrigger className="ios-search border-0">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  placeholder="Share your thoughts, questions, or ideas..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="ios-search border-0 min-h-[120px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePost} className="ios-button text-white border-0 flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-2">
          <TabsTrigger value="posts">
            <MessageSquare className="h-4 w-4 mr-2" />
            All Posts
          </TabsTrigger>
          <TabsTrigger value="discussion" disabled={!selectedPost}>
            <Reply className="h-4 w-4 mr-2" />
            {selectedPost ? selectedPost.title.substring(0, 20) + "..." : "Select Post"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 ios-search border-0"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 ios-search border-0">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {getFilteredPosts().map((post) => (
              <Card
                key={post.id}
                className="ios-card border-0 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => setSelectedPost(post)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {post.pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                        {post.locked && <Lock className="h-4 w-4 text-gray-500" />}
                        <CardTitle className="text-lg line-clamp-1">{post.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(post.authorRole)}
                          <span className="text-sm font-medium">{post.author}</span>
                          <Badge className={`ios-badge text-white border-0 text-xs ${getRoleBadge(post.authorRole)}`}>
                            {post.authorRole}
                          </Badge>
                        </div>
                        <Badge className="ios-badge text-xs bg-purple-100 text-purple-700 border-0 capitalize">
                          {categories.find((c) => c.value === post.category)?.label || post.category}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{post.content}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Reply className="h-3 w-3" />
                        <span>{post.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-green-500" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-3 w-3 text-red-500" />
                          <span>{post.dislikes}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{getRelativeTime(post.timestamp)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {getFilteredPosts().length === 0 && (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery || categoryFilter !== "all" ? "No posts match your filters." : "No forum posts yet."}
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="discussion" className="space-y-6">
          {selectedPost ? (
            <div className="space-y-6">
              <Card className="ios-card border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedPost.pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                        {selectedPost.locked && <Lock className="h-4 w-4 text-gray-500" />}
                        <CardTitle className="text-xl">{selectedPost.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          {getRoleIcon(selectedPost.authorRole)}
                          <span className="font-medium">{selectedPost.author}</span>
                          <Badge
                            className={`ios-badge text-white border-0 text-xs ${getRoleBadge(selectedPost.authorRole)}`}
                          >
                            {selectedPost.authorRole}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatUKDateTime(selectedPost.timestamp)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLike(selectedPost.id, true)}
                        className="ios-button bg-transparent"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {selectedPost.likes}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLike(selectedPost.id, false)}
                        className="ios-button bg-transparent"
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        {selectedPost.dislikes}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 rounded-xl mb-4">
                    <p className="leading-relaxed">{selectedPost.content}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Reply className="h-3 w-3" />
                      <span>{selectedPost.replies} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{selectedPost.views} views</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!selectedPost.locked && (
                <Card className="ios-card border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Reply to this post</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="ios-search border-0 min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReply}
                        className="ios-button text-white border-0"
                        disabled={!replyContent.trim()}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Post Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="ios-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Replies ({selectedPost.replies})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                    <p>Replies will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="ios-card rounded-2xl p-8 max-w-md mx-auto">
                <MessageSquare className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Select a post to view the discussion</p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
