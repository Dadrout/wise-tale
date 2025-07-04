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
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Combined effect for video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const setVideoState = () => {
      if (!video) return
      setIsPlaying(!video.paused)
      setDuration(video.duration)
      setCurrentTime(video.currentTime)
      setVolume(video.volume)
      setIsMuted(video.muted)
      setIsLoading(false)
      setError(null)
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration)
    const onLoadedData = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }
    const onWaiting = () => setIsBuffering(true)
    const onCanPlay = () => setIsBuffering(false)
    const onError = () => {
      setError('Failed to load video.')
      setIsLoading(false)
    }

    setVideoState()

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('loadeddata', onLoadedData)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('error', onError)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('loadeddata', onLoadedData)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('error', onError)
    }
  }, [videoUrl])

  // Fullscreen and keyboard handlers
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        togglePlay()
      }
      if (e.code === 'f') {
        e.preventDefault()
        toggleFullscreen()
      }
      if (e.code === 'Escape' && isFullscreen) {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video || !duration) return

    const newTime = (value[0] / 100) * duration
    if (isFinite(newTime)) {
      video.currentTime = newTime
      setCurrentTime(newTime) // Immediately update state for better responsiveness
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
        src={videoUrl}
        className="w-full h-full object-cover"
        poster={posterUrl}
        preload="metadata"
        playsInline
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      >
        Your browser does not support the video tag.
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

      {/* Clickable overlay for play/pause */}
      <div
        className="absolute inset-0 w-full h-full z-10"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-center">
            <Button
              onClick={togglePlay}
              className={`rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20 pointer-events-auto ${
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
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 z-30 ${
          showControls && !isEnded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mx-4 mb-2 pt-2">
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