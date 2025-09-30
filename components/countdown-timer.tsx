"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  initialSeconds: number
  onComplete?: () => void
  className?: string
}

export function CountdownTimer({ initialSeconds, onComplete, className }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds) => {
          if (seconds <= 1) {
            setIsActive(false)
            onComplete?.()
            return 0
          }
          return seconds - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, seconds, onComplete])

  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (seconds / initialSeconds) * circumference

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="transform -rotate-90 w-24 h-24" width="96" height="96" viewBox="0 0 96 96">
        {/* Background circle */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            "transition-all duration-1000 ease-linear",
            seconds <= 10 ? "text-destructive" : "text-primary",
          )}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-2xl font-bold tabular-nums", seconds <= 10 ? "text-destructive" : "text-foreground")}>
          {seconds}
        </span>
      </div>
    </div>
  )
}
