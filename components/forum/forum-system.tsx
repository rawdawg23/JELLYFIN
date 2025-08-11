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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
  MoreVertical,
  Trash2,
  AlertTriangle,
} from "lucide-react"
import { formatUKDateTime, getRelativeTime } from "@/lib/date-utils"
import { useForumStore } from "@/lib/forum-store"
import { useAuth } from "@/providers/auth-provider"

export function ForumSystem() {
  const { user } = useAuth()
  const {
    posts,
    addPost,
    addReply,
    likePost,
    dislikePost,
    likeReply,
    dislikeReply,
    incrementViews,
    deletePost,
    deleteReply,
  } = useForumStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedPost, setSelectedPost] = useState<any>(null)
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
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })
  }

  const handleCreatePost = () => {
    if (!user) return

    addPost({
      ...newPost,
      author: user.username,
      authorRole: user.role,
      pinned: false,
      locked: false,
    })

    setNewPost({ title: "", content: "", category: "" })
    setShowCreateDialog(false)
  }

  const handleReply = () => {
    if (!selectedPost || !replyContent.trim() || !user) return

    addReply(selectedPost.id, {
      content: replyContent,
      author: user.username,
      authorRole: user.role,
    })

    setReplyContent("")
  }

  const handlePostClick = (post: any) => {
    setSelectedPost(post)
    incrementViews(post.id)
  }

  const handleDeletePost = (postId: string) => {
    deletePost(postId)
    if (selectedPost && selectedPost.id === postId) {
      setSelectedPost(null)
    }
  }

  const handleDeleteReply = (postId: string, replyId: string) => {
    deleteReply(postId, replyId)
    // Refresh selected post to show updated replies
    const updatedPost = posts.find((p) => p.id === postId)
    if (updatedPost) {
      setSelectedPost(updatedPost)
    }
  }

  const canDeletePost = (post: any) => {
    if (!user) return false
    return user.role === "admin" || user.role === "moderator" || user.username === post.author
  }

  const canDeleteReply = (reply: any) => {
    if (!user) return false
    return user.role === "admin" || user.role === "moderator" || user.username === reply.author
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

  if (!user) {
    return (
      <Card className="ios-card border-0">
        <CardContent className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-muted-foreground">Please sign in to access the community forum.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Community Forum
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-2">
            Connect with the community and share knowledge
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="ios-button text-white border-0 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md mx-4">
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

      <Tabs defaultValue="posts" className="space-y-4 sm:space-y-6">
        <TabsList className="ios-tabs grid w-full grid-cols-2">
          <TabsTrigger value="posts">
            <MessageSquare className="h-4 w-4 mr-2" />
            All Posts
          </TabsTrigger>
          <TabsTrigger value="discussion" disabled={!selectedPost}>
            <Reply className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {selectedPost ? selectedPost.title.substring(0, 20) + "..." : "Select Post"}
            </span>
            <span className="sm:hidden">Discussion</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 sm:space-y-6">
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
                onClick={() => handlePostClick(post)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {post.pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                        {post.locked && <Lock className="h-4 w-4 text-gray-500" />}
                        <CardTitle className="text-base sm:text-lg line-clamp-1">{post.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
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
                    {canDeletePost(post) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                Delete Post
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-500" />
                                  Delete Post
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this post? This action cannot be undone and will also
                                  delete all replies.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeletePost(post.id)}
                                  className="bg-red-500 hover:bg-red-600"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Reply className="h-3 w-3" />
                        <span>{post.replies}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            likePost(post.id)
                          }}
                        >
                          <ThumbsUp className="h-3 w-3 text-green-500 mr-1" />
                          <span>{post.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            dislikePost(post.id)
                          }}
                        >
                          <ThumbsDown className="h-3 w-3 text-red-500 mr-1" />
                          <span>{post.dislikes}</span>
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span className="hidden sm:inline">{getRelativeTime(post.timestamp)}</span>
                      <span className="sm:hidden">{getRelativeTime(post.timestamp).split(" ")[0]}</span>
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

        <TabsContent value="discussion" className="space-y-4 sm:space-y-6">
          {selectedPost ? (
            <div className="space-y-4 sm:space-y-6">
              <Card className="ios-card border-0">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {selectedPost.pinned && <Pin className="h-4 w-4 text-yellow-500" />}
                        {selectedPost.locked && <Lock className="h-4 w-4 text-gray-500" />}
                        <CardTitle className="text-lg sm:text-xl">{selectedPost.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
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
                        onClick={() => likePost(selectedPost.id)}
                        className="ios-button bg-transparent"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {selectedPost.likes}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dislikePost(selectedPost.id)}
                        className="ios-button bg-transparent"
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        {selectedPost.dislikes}
                      </Button>
                      {canDeletePost(selectedPost) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-600 bg-transparent"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Delete Post
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this post? This action cannot be undone and will also
                                delete all replies.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePost(selectedPost.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-purple-50 rounded-xl mb-4">
                    <p className="leading-relaxed">{selectedPost.content}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
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

              {selectedPost.replies_data && selectedPost.replies_data.length > 0 && (
                <Card className="ios-card border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Replies ({selectedPost.replies_data.length})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedPost.replies_data.map((reply: any) => (
                      <div key={reply.id} className="border-l-2 border-purple-200 pl-4 relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getRoleIcon(reply.authorRole)}
                            <span className="font-medium text-sm">{reply.author}</span>
                            <Badge
                              className={`ios-badge text-white border-0 text-xs ${getRoleBadge(reply.authorRole)}`}
                            >
                              {reply.authorRole}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{getRelativeTime(reply.timestamp)}</span>
                          </div>
                          {canDeleteReply(reply) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-500" />
                                    Delete Reply
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this reply? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteReply(selectedPost.id, reply.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                        <p className="text-sm mb-2">{reply.content}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => likeReply(selectedPost.id, reply.id)}
                          >
                            <ThumbsUp className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-xs">{reply.likes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => dislikeReply(selectedPost.id, reply.id)}
                          >
                            <ThumbsDown className="h-3 w-3 text-red-500 mr-1" />
                            <span className="text-xs">{reply.dislikes}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

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
