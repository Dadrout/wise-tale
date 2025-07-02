"use client"

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'

interface EnhancedVideoPlayerProps {
  videoUrl: string
  posterUrl?: string
  title?: string
  className?: string
}

export function EnhancedVideoPlayer({ 
  videoUrl, 
  posterUrl, 
  title = "Video Player",
  className = ""
}: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnded, setIsEnded] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Обработчик клавиатуры для полноэкранного режима
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!video) return
      
      // Пауза/воспроизведение по пробелу
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
      
      // Выход из полноэкранного режима по Escape
      if (e.code === 'Escape' && isFullscreen) {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
      setError(null)
      setIsEnded(false)
    }

    const handleTimeUpdate = () => {
      const video = videoRef.current
      if (!video || !video.duration) return
      
      setCurrentTime(video.currentTime)
      
      // Проверяем достижение конца
      const isNearEnd = video.currentTime >= video.duration - 0.05
      if (isNearEnd && !isEnded) {
        setIsEnded(true)
      } else if (!isNearEnd && isEnded) {
        setIsEnded(false)
      }
    }

    const handlePlay = () => {
      setIsPlaying(true)
      setIsEnded(false)
      setIsBuffering(false)
    }
    
    const handlePause = () => setIsPlaying(false)
    
    const handleEnded = () => {
      setIsPlaying(false)
      setIsEnded(true)
    }

    const handleSeeking = () => {
      setIsBuffering(true)
      if (isEnded) {
        setIsEnded(false)
      }
    }

    const handleSeeked = () => {
      const video = videoRef.current
      if (!video) return
      
      setCurrentTime(video.currentTime)
      setIsBuffering(false)
    }

    const handleWaiting = () => {
      setIsBuffering(true)
    }

    const handleCanPlay = () => {
      setIsBuffering(false)
    }

    const handleError = () => {
      setError("Failed to load video")
      setIsLoading(false)
      setIsBuffering(false)
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setError(null)
      setIsEnded(false)
      setIsBuffering(false)
    }

    // Обработка изменения состояния fullscreen
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    // Add event listeners
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('seeking', handleSeeking)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadstart', handleLoadStart)

    // Keyboard event listeners for fullscreen mode
    document.addEventListener('keydown', handleKeyPress)

    // Fullscreen event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('seeking', handleSeeking)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)

      // Remove keyboard event listeners
      document.removeEventListener('keydown', handleKeyPress)

      // Remove fullscreen event listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [videoUrl, isEnded, isFullscreen])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      if (isEnded) {
        video.currentTime = 0
        setIsEnded(false)
      }
      video.play()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video || !duration) return

    const newTime = (value[0] / 100) * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
    
    if (newTime < duration - 0.1) {
      setIsEnded(false)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0] / 100
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    // Проверяем текущее состояние полноэкранного режима
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    )

    if (!isCurrentlyFullscreen) {
      // Входим в полноэкранный режим
      if (video.requestFullscreen) {
        video.requestFullscreen().catch(err => {
          console.log('Fullscreen request failed:', err)
        })
      } else if ((video as any).webkitRequestFullscreen) {
        (video as any).webkitRequestFullscreen()
      } else if ((video as any).mozRequestFullScreen) {
        (video as any).mozRequestFullScreen()
      } else if ((video as any).msRequestFullscreen) {
        (video as any).msRequestFullscreen()
      }
    } else {
      // Выходим из полноэкранного режима
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.log('Exit fullscreen failed:', err)
        })
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
    }

    // Обновляем состояние после небольшой задержки
    setTimeout(() => {
      const newFullscreenState = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(newFullscreenState)
    }, 100)
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    setCurrentTime(0)
    setIsEnded(false)
    if (!isPlaying) {
      video.play()
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  return (
    <div 
      className={`relative bg-black rounded-xl overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={posterUrl}
        preload="metadata"
        playsInline
        onClick={togglePlay}
      >
        <source src={videoUrl} type="video/mp4" />
        <p className="text-white p-4">Your browser does not support video playback.</p>
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-sm">Loading magical story...</p>
          </div>
        </div>
      )}

      {/* Simple Buffering Indicator */}
      {isBuffering && !isLoading && (
        <div className="absolute top-4 right-4">
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-center text-white">
            <p className="mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Button
              onClick={togglePlay}
              className={`rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20 ${
                isFullscreen ? 'w-20 h-20' : 'w-16 h-16'
              }`}
              size="lg"
            >
              {isEnded ? (
                <RotateCcw className={isFullscreen ? "w-10 h-10" : "w-8 h-8"} />
              ) : (
                <Play className={`${isFullscreen ? "w-10 h-10" : "w-8 h-8"} ml-1`} fill="currentColor" />
              )}
            </Button>
            {isFullscreen && (
              <p className="text-white mt-4 text-lg">Press SPACE to play/pause</p>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Controls for Fullscreen */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 ${
          isFullscreen ? 'p-6' : 'p-4'
        } ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Simple Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progressPercentage]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-white text-sm mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <Button
              onClick={togglePlay}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            {/* Restart */}
            <Button
              onClick={restart}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Fullscreen */}
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
} 