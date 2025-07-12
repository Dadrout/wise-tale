"use client"

import { useState, useEffect, useCallback } from 'react'

const API_URL =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? `https://api.wizetale.io` // Replace with your actual production API
    : '/api/simple-proxy'

export interface GenerationResult {
  id: string
  video_url?: string
  audio_url?: string
  transcript?: string
  images_used?: string[]
}

export const useStoryPoller = (taskId: string | null) => {
  const [isPolling, setIsPolling] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const pollTask = useCallback(async () => {
    if (!taskId) return;

    setIsPolling(true)
    setError(null)
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/tasks/${taskId}/status`)
        if (!res.ok) {
          clearInterval(interval)
          setError('Failed to get task status.')
          setIsPolling(false)
          return
        }

        const data = await res.json()
        setProgress(data.progress || 0)
        setStatus(data.message || 'Processing...')

        if (data.status === 'completed') {
          clearInterval(interval)
          const resultRes = await fetch(`${API_URL}/api/v1/tasks/${taskId}/result`)
          const resultData = await resultRes.json()
          
          const videoId = resultData.video_url?.split('/').pop()
          const audioId = resultData.audio_url?.split('/').pop()
          
          setResult({
            id: taskId,
            video_url: videoId ? `/api/simple-proxy/videos/${videoId}` : undefined,
            audio_url: audioId ? `/api/simple-proxy/audio/${audioId}` : undefined,
            transcript: resultData.script,
            images_used: resultData.images_used || [],
          })
          setIsPolling(false)

        } else if (data.status === 'failed') {
          clearInterval(interval)
          const errorMessage = data.error || data.message || 'Video generation failed.'
          setError(errorMessage)
          setIsPolling(false)
        }
      } catch (e: any) {
        clearInterval(interval)
        console.error('Polling error:', e)
        const errorMessage = e.message || (typeof e === 'string' ? e : 'An unexpected error occurred while polling.')
        setError(errorMessage)
        setIsPolling(false)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [taskId])

  useEffect(() => {
    pollTask()
  }, [pollTask])

  return {
    isPolling,
    progress,
    status,
    error,
    result,
  }
} 