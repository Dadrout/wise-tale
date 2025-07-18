"use client"

import { useState, useCallback } from 'react'
import { useAuth } from './use-auth'
import { trackEvent, trackConversion, trackFunnelStep } from '@/lib/analytics'
import { useToast } from './use-toast';

const API_URL = '/api/v1';

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
  const { getToken } = useAuth()

  const pollTask = async (taskId: string): Promise<GenerationResult> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const token = await getToken()
          const headers: HeadersInit = { 'Content-Type': 'application/json' }
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }

          const res = await fetch(`${API_URL}/tasks/${taskId}`, { headers })
          if (!res.ok) {
            // Stop polling on server error
            clearInterval(interval)
            return reject(new Error('Failed to get task status.'))
          }

          const data = await res.json()
          setProgress(data.progress || 0)
          setStatus(data.message || 'Processing...')

          if (data.status === 'SUCCESS') {
            clearInterval(interval)
            
            let fullVideoUrl: string | undefined = data.result?.video_url;
            // If API already returns an absolute path (starts with '/'), use it directly
            // Otherwise, prefix with API_URL + '/static/' to form the full URL
            if (fullVideoUrl && !fullVideoUrl.startsWith('/')) {
              fullVideoUrl = `${API_URL}/static/${fullVideoUrl}`;
            }

            resolve({
              id: taskId,
              video_url: fullVideoUrl,
              audio_url: data.result?.audio_url,
              transcript: data.result?.script,
              images_used: data.result?.images_used || [],
            })

          } else if (data.status === 'FAILURE') {
            clearInterval(interval)
            const errorMessage = data.error || data.info || 'Video generation failed.'
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
      const token = await getToken()
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...params, level: 'beginner' }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        }
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
      
      // Track funnel step - story generation started
      trackFunnelStep('story_generation_started', 1, 3)
      
      const generationResult = await pollTask(task.task_id)
      setResult(generationResult)
      
      // Track successful conversion
      trackConversion('story_generated', 1)
      trackEvent('generate_story', { id: task.task_id })
      
      // Track funnel completion
      trackFunnelStep('story_generation_completed', 3, 3)
      
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