"use client"

import { useState, useCallback } from 'react'

const API_URL =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
    ? `https://api.wisetale.io` // Replace with your actual production API
    : '/api/simple-proxy'

interface GenerateParams {
  subject: string
  topic: string
  voice: string
  language: string
  user_id?: number | string
}

export interface GenerationResult {
  id: string
  video_url?: string
  audio_url?: string
  transcript?: string
  images_used?: string[]
}

export const useStoryGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GenerationResult | null>(null)

  const pollTask = async (taskId: string): Promise<GenerationResult> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_URL}/api/v1/tasks/${taskId}/status`)
          if (!res.ok) {
            // Stop polling on server error
            clearInterval(interval)
            return reject(new Error('Failed to get task status.'))
          }

          const data = await res.json()
          setProgress(data.progress || 0)
          setStatus(data.message || 'Processing...')

          if (data.status === 'completed') {
            clearInterval(interval)
            const resultRes = await fetch(`${API_URL}/api/v1/tasks/${taskId}/result`)
            const resultData = await resultRes.json()
            
            // Reconstruct URLs to use the proxy
            const videoId = resultData.video_url?.split('/').pop()
            const audioId = resultData.audio_url?.split('/').pop()
            
            resolve({
              id: taskId,
              video_url: videoId ? `/api/simple-proxy/videos/${videoId}` : undefined,
              audio_url: audioId ? `/api/simple-proxy/audio/${audioId}` : undefined,
              transcript: resultData.script,
              images_used: resultData.images_used || [],
            })

          } else if (data.status === 'failed') {
            clearInterval(interval)
            const errorMessage = data.error || data.message || 'Video generation failed.'
            reject(new Error(errorMessage))
          }
        } catch (e: any) {
          clearInterval(interval)
          console.error('Polling error:', e)
          const errorMessage = e.message || (typeof e === 'string' ? e : 'An unexpected error occurred while polling.')
          reject(new Error(errorMessage))
        }
      }, 2000)
    })
  }

  const generateStory = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true)
    setProgress(0)
    setStatus('Initializing generation...')
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_URL}/api/v1/tasks/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, level: 'beginner' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle FastAPI validation errors (422)
        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Format validation errors
            const validationErrors = errorData.detail.map((err: any) => 
              `${err.loc?.join('.') || 'field'}: ${err.msg}`
            ).join('; ')
            throw new Error(`Validation error: ${validationErrors}`)
          } else {
            throw new Error(errorData.detail)
          }
        }
        
        throw new Error(errorData.detail || errorData.message || 'Failed to start generation task.')
      }

      const task = await response.json()
      const generationResult = await pollTask(task.task_id)
      setResult(generationResult)
      
    } catch (e: any) {
      console.error('Generation error:', e)
      const errorMessage = e.message || (typeof e === 'string' ? e : 'An unknown error occurred.')
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return {
    isGenerating,
    progress,
    status,
    error,
    result,
    generateStory,
  }
} 