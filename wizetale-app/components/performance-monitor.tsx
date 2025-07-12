"use client"

import { useEffect, useState } from "react"

export function PerformanceMonitor() {
  const [isLowPerformance, setIsLowPerformance] = useState(false)

  useEffect(() => {
    // Check for low-end devices
    const checkPerformance = () => {
      // Check memory (if available)
      const memory = (navigator as any).deviceMemory
      if (memory && memory < 4) {
        setIsLowPerformance(true)
      }

      // Check connection speed
      const connection = (navigator as any).connection
      if (connection && (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g")) {
        setIsLowPerformance(true)
      }

      // Check for mobile devices
      if (window.innerWidth < 768) {
        setIsLowPerformance(true)
      }
    }

    checkPerformance()
    window.addEventListener("resize", checkPerformance)

    return () => window.removeEventListener("resize", checkPerformance)
  }, [])

  useEffect(() => {
    if (isLowPerformance) {
      // Add performance class to body
      document.body.classList.add("low-performance")

      // Reduce animation frame rate
      const style = document.createElement("style")
      style.textContent = `
        .low-performance * {
          animation-duration: 2s !important;
          transition-duration: 0.1s !important;
        }
        .low-performance .geometric-bg {
          display: none !important;
        }
        .low-performance .orb-bg {
          opacity: 0.3 !important;
        }
      `
      document.head.appendChild(style)
    }
  }, [isLowPerformance])

  return null
}
