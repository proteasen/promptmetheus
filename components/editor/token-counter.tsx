"use client"

import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap } from "lucide-react"

interface TokenCounterProps {
  usage: {
    used: number
    limit: number
  }
}

export function TokenCounter({ usage }: TokenCounterProps) {
  const percentage = (usage.used / usage.limit) * 100
  const isNearLimit = percentage > 80

  return (
    <div className="flex items-center gap-2">
      <Zap className={`w-4 h-4 ${isNearLimit ? "text-red-400" : "text-green-400"}`} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white">
            {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}
          </span>
          <Badge variant={isNearLimit ? "destructive" : "secondary"} className="text-xs">
            {percentage.toFixed(1)}%
          </Badge>
        </div>
        <Progress value={percentage} className="w-24 h-1" />
      </div>
    </div>
  )
}
