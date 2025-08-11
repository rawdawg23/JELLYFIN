"use client"

import { useState } from "react"
import { AuthProvider } from "@/providers/auth-provider"
import { LoginModal } from "@/components/auth/login-modal"
import { MainApp } from "@/components/main-app"

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <>
      {!isLoggedIn ? <LoginModal isOpen={true} onClose={() => {}} onLogin={() => setIsLoggedIn(true)} /> : <MainApp />}
    </>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
