"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { getCurrentUKTime } from "@/lib/date-utils"

export function UKTimeDisplay() {
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(getCurrentUKTime())
    }

    // Update immediately
    updateTime()

    // Update every second
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!currentTime) return null

  return (
    <Badge className="ios-badge bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 flex items-center gap-2">
      <Clock className="h-3 w-3" />
      <span className="text-xs font-medium">UK: {currentTime}</span>
    </Badge>
  )
}
