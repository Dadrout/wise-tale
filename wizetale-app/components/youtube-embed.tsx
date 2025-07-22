"use client"

import { useState } from "react"
import { Play } from "lucide-react"

interface YouTubeEmbedProps {
  videoId: string
  title: string
  className?: string
}

export function YouTubeEmbed({ videoId, title, className = "" }: YouTubeEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handlePlay = () => {
    setIsLoaded(true)
  }

  return (
    <div className={`relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {!isLoaded ? (
        // Custom thumbnail with play button
        <div className="relative w-full h-full bg-gradient-to-br from-purple-100 via-sky-100 to-teal-100 dark:from-purple-900/50 dark:via-sky-900/50 dark:to-teal-900/50">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-sky-400/20 to-teal-400/20"></div>

          {/* YouTube thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy" // Lazy load the image
          />

          {/* Play button overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-300 cursor-pointer group"
            onClick={handlePlay}
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300 group-hover:bg-white">
              <Play className="w-8 h-8 text-purple-600 ml-1" fill="currentColor" />
            </div>
          </div>

          {/* Wizetale branding overlay */}
          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">W</span>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Wizetale Demo</span>
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-4 right-4 bg-black/80 text-white px-2 py-1 rounded text-sm font-medium">
            Demo
          </div>
        </div>
      ) : (
        // Actual YouTube embed
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      )}
    </div>
  )
}
