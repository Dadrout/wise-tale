"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { trackPageView } from "@/lib/analytics"

export default function AnalyticsListener() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname, window.location.href)
    }
  }, [pathname])

  return null
} 