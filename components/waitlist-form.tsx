"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react"

const waitlistSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
})

type WaitlistFormData = z.infer<typeof waitlistSchema>

interface WaitlistFormProps {
  className?: string
  buttonText?: string
  placeholder?: string
}

export function WaitlistForm({ 
  className = "", 
  buttonText = "Join Waitlist",
  placeholder = "Enter your email address"
}: WaitlistFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
  })

  const onSubmit = async (data: WaitlistFormData) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to join waitlist")
      }

      setIsSuccess(true)
      reset()
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={`flex items-center justify-center gap-2 text-green-600 dark:text-green-400 ${className}`}>
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Successfully joined waitlist!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className="flex-1">
        <Input
          {...register("email")}
          type="email"
          placeholder={placeholder}
          className="bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-sm transition-all duration-300 focus:scale-105"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.email.message}
          </p>
        )}
      </div>
      
      <Button 
        type="submit"
        disabled={isLoading}
        className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 transition-all duration-500 hover:scale-110 hover:shadow-lg group disabled:opacity-50"
      >
        {isLoading ? (
          "Joining..."
        ) : (
          <>
            {buttonText}
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2" />
          </>
        )}
      </Button>

      {error && (
        <div className="col-span-full flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </form>
  )
} 