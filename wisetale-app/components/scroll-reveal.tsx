"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "fade"
  duration?: number
  threshold?: number
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 600,
  threshold = 0.1,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      { threshold },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay, threshold])

  const getAnimationClass = () => {
    const baseClass = "transition-all ease-out"
    const durationClass = `duration-${duration}`

    if (!isVisible) {
      switch (direction) {
        case "up":
          return `${baseClass} ${durationClass} opacity-0 translate-y-8`
        case "down":
          return `${baseClass} ${durationClass} opacity-0 -translate-y-8`
        case "left":
          return `${baseClass} ${durationClass} opacity-0 translate-x-8`
        case "right":
          return `${baseClass} ${durationClass} opacity-0 -translate-x-8`
        case "fade":
          return `${baseClass} ${durationClass} opacity-0`
        default:
          return `${baseClass} ${durationClass} opacity-0 translate-y-8`
      }
    }

    return `${baseClass} ${durationClass} opacity-100 translate-x-0 translate-y-0`
  }

  return (
    <div ref={ref} className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  )
}
