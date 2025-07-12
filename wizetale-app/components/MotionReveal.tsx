"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

interface MotionRevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function MotionReveal({ children, delay = 0, className = "" }: MotionRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: delay,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  )
} 