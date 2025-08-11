"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

export function UKTimeDisplay() {
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const ukTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(now)
      setCurrentTime(ukTime)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm text-white/70">
      <Clock className="w-4 h-4" />
      <span>{currentTime} GMT</span>
    </div>
  )
}
