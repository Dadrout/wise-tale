"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import { trackEvent } from "@/lib/analytics"
import { apiService } from "@/lib/api"

export default function FeedbackForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setStatus("sending")
    try {
      await apiService.submitFeedback({
        email: email || undefined,
        message,
      })
      trackEvent('feedback_submitted')
      setStatus("sent")
      setEmail("")
      setMessage("")
      setTimeout(() => setStatus("idle"), 4000)
    } catch (err) {
      console.error("Failed to send feedback", err)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 4000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-lg mx-auto">
      <Input
        type="email"
        placeholder={t.feedbackEmailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/80 dark:bg-gray-800/60"
      />
      <Textarea
        placeholder={t.feedbackMessagePlaceholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        rows={4}
        className="bg-white/80 dark:bg-gray-800/60"
      />
      <Button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-semibold"
      >
        {status === "sending" ? t.feedbackSending : status === "sent" ? t.feedbackThankYou : t.feedbackSendButton}
      </Button>
      {status === "error" && (
        <p className="text-red-500 text-sm text-center">{t.feedbackError}</p>
      )}
    </form>
  )
} 