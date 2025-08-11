"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"
import { formatUKDateTime } from "@/lib/date-utils"

export function UKTimeDisplay() {
  const [currentTime, setCurrentTime] = useState<string>("")

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatUKDateTime(new Date().toISOString()))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>UK Time: {currentTime}</span>
    </div>
  )
}
