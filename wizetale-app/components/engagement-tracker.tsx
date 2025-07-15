"use client"

import { useEffect, useRef } from 'react'
import { trackUserEngagement, trackUserJourney } from '@/lib/analytics'

interface EngagementTrackerProps {
  pageName: string
  minEngagementTime?: number // в миллисекундах
}

export default function EngagementTracker({ 
  pageName, 
  minEngagementTime = 10000 // 10 секунд по умолчанию
}: EngagementTrackerProps) {
  const startTime = useRef<number>(Date.now())
  const isTracking = useRef<boolean>(false)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Пользователь переключился на другую вкладку
        if (isTracking.current) {
          const timeSpent = Date.now() - startTime.current
          if (timeSpent >= minEngagementTime) {
            trackUserEngagement(timeSpent)
            trackUserJourney(`${pageName}_page_leave`, timeSpent)
          }
          isTracking.current = false
        }
      } else {
        // Пользователь вернулся на вкладку
        startTime.current = Date.now()
        isTracking.current = true
        trackUserJourney(`${pageName}_page_return`)
      }
    }

    const handleBeforeUnload = () => {
      if (isTracking.current) {
        const timeSpent = Date.now() - startTime.current
        if (timeSpent >= minEngagementTime) {
          trackUserEngagement(timeSpent)
          trackUserJourney(`${pageName}_page_exit`, timeSpent)
        }
      }
    }

    // Начать отслеживание
    isTracking.current = true
    trackUserJourney(`${pageName}_page_enter`)

    // Добавить слушатели событий
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      // Очистка при размонтировании компонента
      if (isTracking.current) {
        const timeSpent = Date.now() - startTime.current
        if (timeSpent >= minEngagementTime) {
          trackUserEngagement(timeSpent)
          trackUserJourney(`${pageName}_page_component_unmount`, timeSpent)
        }
      }

      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [pageName, minEngagementTime])

  return null
} 