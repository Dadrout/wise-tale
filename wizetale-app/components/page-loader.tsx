"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Sparkles } from "lucide-react"

export function PageLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 500)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-sky-600 to-teal-600">
      <div className="text-center text-white">
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto mb-4 relative animate-bounce">
            <Image
              src="/wisetale-logo.png"
              alt="Wizetale"
              width={96}
              height={96}
              className="w-full h-full animate-pulse"
            />
            <div className="absolute -inset-4 bg-white/20 rounded-full animate-ping"></div>
          </div>
          <div className="flex items-center justify-center space-x-1 mb-4">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <h1 className="text-3xl font-bold animate-pulse">Wizetale</h1>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto mb-4">
          <div
            className="h-full bg-white rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p className="text-lg opacity-90 animate-pulse">Preparing your magical learning experience...</p>
      </div>
    </div>
  )
}
