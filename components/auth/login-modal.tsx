"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const { login, isLoading } = useAuth()
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("login")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!loginData.username || !loginData.password) {
      setError("Please fill in all fields")
      return
    }

    const success = await login(loginData.username, loginData.password)
    if (success) {
      onLogin()
    } else {
      setError("Invalid username or password")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!registerData.username || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Auto-login after registration
    const success = await login(registerData.username, registerData.password)
    if (success) {
      onLogin()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-purple-500/20 text-white"
        hideClose
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-lg animate-pulse" />
        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Welcome To OG SERVICES
              </span>
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Join the ultimate media streaming marketplace
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border border-purple-500/20">
              <TabsTrigger value="login" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-slate-800/30 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Welcome Back</CardTitle>
                  <CardDescription className="text-gray-300">
                    Sign in to access your premium media experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-200">
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        disabled={isLoading}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-200">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          disabled={isLoading}
                          className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-slate-800/30 border-purple-500/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Join the Community</CardTitle>
                  <CardDescription className="text-gray-300">
                    Create your account and start your premium journey
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username" className="text-gray-200">
                        Username
                      </Label>
                      <Input
                        id="reg-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        disabled={isLoading}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-200">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        disabled={isLoading}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-gray-200">
                        Password
                      </Label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        disabled={isLoading}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-gray-200">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        disabled={isLoading}
                        className="bg-slate-700/50 border-purple-500/30 text-white placeholder:text-gray-400 focus:border-purple-400"
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive" className="bg-red-900/20 border-red-500/50 text-red-200">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
