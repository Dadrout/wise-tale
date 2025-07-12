"use client"

import { useEffect, useState } from "react"
import { Sparkles, Star, BookOpen } from "lucide-react"

export function FloatingElements() {
  const [mounted, setMounted] = useState(false)
  const [isLowPerformance, setIsLowPerformance] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check for low performance devices
    const checkPerformance = () => {
      const memory = (navigator as any).deviceMemory
      const connection = (navigator as any).connection

      if (
        (memory && memory < 4) ||
        (connection && (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g")) ||
        window.innerWidth < 768
      ) {
        setIsLowPerformance(true)
      }
    }

    checkPerformance()
  }, [])

  if (!mounted || isLowPerformance) return null

  // Reduced number of elements for better performance
  const elements = [
    { Icon: Sparkles, delay: 0, duration: 8 },
    { Icon: Star, delay: 2, duration: 10 },
    { Icon: BookOpen, delay: 4, duration: 9 },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element, index) => (
        <div
          key={index}
          className="absolute animate-float opacity-5 dark:opacity-3"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`,
          }}
        >
          <element.Icon className="w-6 h-6 text-purple-400" />
        </div>
      ))}
    </div>
  )
}
