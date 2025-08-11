"use client"

import { CardDescription } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, UserIcon, ServerIcon, Trash2, Edit2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils" // Corrected import path
import { AlertCircle } from "lucide-react"

interface AdminUser {
  id: string
  username: string
  email: string
  role: "admin" | "user" | "guest"
  status: "active" | "inactive"
  lastLogin: string
}

interface ServerSetting {
  id: string
  name: string
  value: string
  type: "text" | "number" | "boolean" | "select"
  options?: { label: string; value: string }[]
}

export function AdminDashboard() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [serverSettings, setServerSettings] = useState<ServerSetting[]>([])
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "user" as "user" | "admin" | "guest" })
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<Partial<AdminUser> | null>(null)
  const [serverStatus, setServerStatus] = useState("Online")
  const [userCount, setUserCount] = useState(150)
  const [newUserName, setNewUserName] = useState("")

  useEffect(() => {
    // Simulate fetching data
    setLoading(true)
    setTimeout(() => {
      setUsers([
        {
          id: "1",
          username: "admin_user",
          email: "admin@example.com",
          role: "admin",
          status: "active",
          lastLogin: "2023-10-26T10:00:00Z",
        },
        {
          id: "2",
          username: "john_doe",
          email: "john@example.com",
          role: "user",
          status: "active",
          lastLogin: "2023-10-25T15:30:00Z",
        },
        {
          id: "3",
          username: "jane_smith",
          email: "jane@example.com",
          role: "user",
          status: "inactive",
          lastLogin: "2023-09-01T08:00:00Z",
        },
      ])
      setServerSettings([
        { id: "1", name: "Max Connections", value: "100", type: "number" },
        { id: "2", name: "Allow Registrations", value: "true", type: "boolean" },
        {
          id: "3",
          name: "Default Theme",
          value: "dark",
          type: "select",
          options: [
            { label: "Dark", value: "dark" },
            { label: "Light", value: "light" },
          ],
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const handleAddUser = () => {
    if (!newUser.username || !newUser.email) {
      setAlert({ type: "error", message: "Username and Email are required." })
      return
    }
    setLoading(true)
    setTimeout(() => {
      const userToAdd: AdminUser = {
        id: `user-${Date.now()}`,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: "active",
        lastLogin: new Date().toISOString(),
      }
      setUsers((prev) => [...prev, userToAdd])
      setNewUser({ username: "", email: "", role: "user" })
      setAlert({ type: "success", message: "User added successfully!" })
      setLoading(false)
    }, 500)
  }

  const handleDeleteUser = (userId: string) => {
    setLoading(true)
    setTimeout(() => {
      setUsers((prev) => prev.filter((user) => user.id !== userId))
      setAlert({ type: "success", message: "User deleted successfully!" })
      setLoading(false)
    }, 500)
  }

  const handleEditUser = (user: AdminUser) => {
    setEditingUserId(user.id)
    setEditingUser({ ...user })
  }

  const handleSaveUser = () => {
    if (!editingUser?.username || !editingUser?.email) {
      setAlert({ type: "error", message: "Username and Email are required." })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setUsers((prev) =>
        prev.map((user) => (user.id === editingUserId ? ({ ...user, ...editingUser } as AdminUser) : user)),
      )
      setEditingUserId(null)
      setEditingUser(null)
      setAlert({ type: "success", message: "User updated successfully!" })
      setLoading(false)
    }, 500)
  }

  const handleSettingChange = (id: string, newValue: string) => {
    setServerSettings((prev) => prev.map((setting) => (setting.id === id ? { ...setting, value: newValue } : setting)))
    setAlert({ type: "success", message: "Setting updated successfully!" })
  }

  const handleRestartServer = () => {
    setServerStatus("Restarting...")
    setAlert(null)
    setTimeout(() => {
      setServerStatus("Online")
      setAlert({ type: "success", message: "Server restarted successfully!" })
    }, 2000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Server Status</CardTitle>
          <ServerIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{serverStatus}</div>
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</p>
          <Button onClick={handleRestartServer} className="mt-4" disabled={serverStatus === "Restarting..."}>
            {serverStatus === "Restarting..." ? "Restarting..." : "Restart Server"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
          <p className="text-xs text-muted-foreground">+20% from last month</p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="new-user-name">Add New User</Label>
            <div className="flex gap-2">
              <Input
                id="new-user-name"
                placeholder="Enter user name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
              <Button onClick={handleAddUser}>Add</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" /> System Settings
          </CardTitle>
          <CardDescription>Manage application-wide settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Manage application-wide settings.</p>
          <Button className="mt-4 bg-transparent" variant="outline">
            Go to Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" /> User Management
          </CardTitle>
          <CardDescription>Manage user accounts and roles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">Username</Label>
              <Input
                id="new-username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: "user" | "admin" | "guest") => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger id="new-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAddUser} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Add User
          </Button>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Existing Users</h3>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {editingUserId === user.id ? (
                            <Input
                              value={editingUser?.username || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                            />
                          ) : (
                            user.username
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Input
                              value={editingUser?.email || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                            />
                          ) : (
                            user.email
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Select
                              value={editingUser?.role}
                              onValueChange={(value: "user" | "admin" | "guest") =>
                                setEditingUser({ ...editingUser, role: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="guest">Guest</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            user.role
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUserId === user.id ? (
                            <Select
                              value={editingUser?.status}
                              onValueChange={(value: "active" | "inactive") =>
                                setEditingUser({ ...editingUser, status: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                                user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
                              )}
                            >
                              {user.status}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {editingUserId === user.id ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={handleSaveUser}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingUserId(null)
                                  setEditingUser(null)
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit2 className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ServerIcon className="h-5 w-5" /> Server Settings
          </CardTitle>
          <CardDescription>Configure global server parameters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-6">
              {serverSettings.map((setting) => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={`setting-${setting.id}`}>{setting.name}</Label>
                  {setting.type === "text" && (
                    <Input
                      id={`setting-${setting.id}`}
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                    />
                  )}
                  {setting.type === "number" && (
                    <Input
                      id={`setting-${setting.id}`}
                      type="number"
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                    />
                  )}
                  {setting.type === "boolean" && (
                    <Select value={setting.value} onValueChange={(value) => handleSettingChange(setting.id, value)}>
                      <SelectTrigger id={`setting-${setting.id}`}>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {setting.type === "select" && setting.options && (
                    <Select value={setting.value} onValueChange={(value) => handleSettingChange(setting.id, value)}>
                      <SelectTrigger id={`setting-${setting.id}`}>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {setting.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {alert && (
        <div className="md:col-span-2 lg:col-span-3">
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{alert.type === "error" ? "Error" : "Success"}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
