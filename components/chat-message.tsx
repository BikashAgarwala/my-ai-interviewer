import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ChatMessageProps {
  message: string
  isAI: boolean
  timestamp: string
  className?: string
}

export function ChatMessage({ message, isAI, timestamp, className }: ChatMessageProps) {
  return (
    <div className={cn("flex gap-3 p-4", className)}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-medium",
            isAI ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
          )}
        >
          {isAI ? "AI" : "You"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{isAI ? "AI Interviewer" : "You"}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <div className={cn("text-sm leading-relaxed", isAI ? "text-foreground" : "text-foreground/90")}>{message}</div>
      </div>
    </div>
  )
}
