"use client"

import { useState, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { Loader2 } from 'lucide-react'

interface EnhancedVideoPlayerProps {
  videoUrl: string
  posterUrl?: string
  className?: string
}

export function EnhancedVideoPlayer({ 
  videoUrl, 
  posterUrl, 
  className = ""
}: EnhancedVideoPlayerProps) {
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // react-player needs to be rendered only on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden w-full h-full aspect-video ${className}`}>
      {isLoading && isClient && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white mt-4">Loading video...</p>
        </div>
      )}
      
      {isClient && (
        <ReactPlayer
          url={videoUrl}
          className="absolute top-0 left-0"
          width="100%"
          height="100%"
          controls={true}
          playing={true} // Auto-play
          light={posterUrl} // Show poster image until play
          onReady={() => setIsLoading(false)}
          onBuffer={() => setIsLoading(true)}
          onBufferEnd={() => setIsLoading(false)}
          onError={(e) => console.error('ReactPlayer error:', e)}
          config={{
            file: {
              attributes: {
                poster: posterUrl,
                preload: 'metadata'
              }
            }
          }}
        />
      )}
    </div>
  )
} 