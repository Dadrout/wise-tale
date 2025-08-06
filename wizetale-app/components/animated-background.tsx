'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  animationDelay: number
  animationDuration: number
}

interface FloatingElement {
  id: number
  x: number
  y: number
  size: number
  type: 'circle' | 'square' | 'triangle'
  animationDelay: number
  animationDuration: number
}

interface ShootingStar {
  id: number
  x: number
  y: number
  angle: number
  animationDelay: number
}

export default function AnimatedBackground() {
  const [isClient, setIsClient] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { stars, floatingElements, shootingStars } = useMemo(() => {
    if (!isClient) return { stars: [], floatingElements: [], shootingStars: [] }

    const starCount = isMobile ? 25 : 50
    const elementCount = isMobile ? 7 : 15
    const shootingStarCount = isMobile ? 4 : 8

    const generatedStars: Star[] = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.1,
      animationDelay: Math.random() * 3,
      animationDuration: Math.random() * 3 + 2
    }))

    const generatedElements: FloatingElement[] = Array.from({ length: elementCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle',
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 8 + 5
    }))

    const generatedShootingStars: ShootingStar[] = Array.from({ length: shootingStarCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      angle: Math.random() * 360,
      animationDelay: Math.random() * 10
    }))

    return { stars: generatedStars, floatingElements: generatedElements, shootingStars: generatedShootingStars }
  }, [isClient, isMobile])

  if (!isClient) {
    return <div className="fixed inset-0 overflow-hidden pointer-events-none z-10" />
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-purple-500 dark:bg-white rounded-full animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity * 1.5,
            animationDelay: `${star.animationDelay}s`,
            animationDuration: `${star.animationDuration}s`
          }}
        />
      ))}

      {/* Floating Elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute animate-float"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: `${element.size}px`,
            height: `${element.size}px`,
            animationDelay: `${element.animationDelay}s`,
            animationDuration: `${element.animationDuration}s`,
            willChange: 'transform'
          }}
        >
                     {element.type === 'circle' && (
             <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-400/30 to-blue-400/30 dark:from-purple-400/10 dark:to-blue-400/10" />
           )}
           {element.type === 'square' && (
             <div className="w-full h-full bg-gradient-to-br from-teal-400/30 to-cyan-400/30 dark:from-teal-400/10 dark:to-cyan-400/10 transform rotate-45" />
           )}
           {element.type === 'triangle' && (
             <div 
               className="w-full h-full bg-gradient-to-br from-pink-400/30 to-purple-400/30 dark:from-pink-400/10 dark:to-purple-400/10"
               style={{
                 clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
               }}
             />
           )}
        </div>
      ))}

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-50 dark:opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-full animate-drift" style={{ willChange: 'transform' }} />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-full animate-drift" style={{ animationDelay: '2s', willChange: 'transform' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-green-400/20 dark:from-teal-400/10 dark:to-green-400/10 rounded-full animate-drift" style={{ animationDelay: '4s', willChange: 'transform' }} />
      
      {/* Additional Glowing Elements */}
      <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 dark:from-yellow-400/20 dark:to-orange-400/20 rounded-full animate-glow" style={{ willChange: 'opacity, transform' }}/>
      <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 dark:from-indigo-400/20 dark:to-purple-400/20 rounded-full animate-glow" style={{ animationDelay: '1s', willChange: 'opacity, transform' }} />

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute w-1 h-1 bg-purple-500 dark:bg-white rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: `rotate(${star.angle}deg)`,
            animation: `shootingStar 3s linear infinite`,
            animationDelay: `${star.animationDelay}s`,
            willChange: 'transform, opacity'
          }}
        >
          <div className="absolute w-20 h-0.5 bg-gradient-to-r from-purple-500 to-transparent dark:from-white dark:to-transparent transform -translate-x-1/2" />
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(10px) rotate(240deg);
          }
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        @keyframes shootingStar {
          0% {
            opacity: 1;
            transform: translateX(0) translateY(0) rotate(var(--angle));
          }
          100% {
            opacity: 0;
            transform: translateX(100px) translateY(-100px) rotate(var(--angle));
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-pulse,
          .animate-twinkle,
          .animate-drift,
          .animate-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  )
} 