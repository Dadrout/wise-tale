"use client"

import { Progress } from "@/components/ui/progress"
import { Sparkles } from "lucide-react"

interface GenerationProgressProps {
  progress: number
  status: string
}

export function GenerationProgress({ progress, status }: GenerationProgressProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-8 text-center">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-center gap-3 text-white">
          <Sparkles className="w-8 h-8 animate-pulse text-purple-400" />
          <h3 className="text-2xl font-bold tracking-tight">
            Generating Your Masterpiece
          </h3>
        </div>
        <p className="text-gray-300 text-sm">{status || "Please wait..."}</p>
        <Progress value={progress} className="w-full h-3 [&>*]:bg-gradient-to-r [&>*]:from-purple-500 [&>*]:to-sky-500" />
        <p className="text-xs text-gray-400 font-mono tracking-widest">{progress.toFixed(0)}%</p>
      </div>
    </div>
  )
} 