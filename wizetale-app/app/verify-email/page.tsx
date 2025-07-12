'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { user, sendVerificationEmail, refreshUserProfile } = useAuth()
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push('/landing/login')
      return
    }

    // Check if already verified
    const checkVerification = async () => {
      setChecking(true)
      await refreshUserProfile()
      if (user.emailVerified) {
        router.push('/')
      }
      setChecking(false)
    }

    // Check every 3 seconds
    const interval = setInterval(checkVerification, 3000)
    
    // Initial check
    checkVerification()

    return () => clearInterval(interval)
  }, [user, router, refreshUserProfile])

  const handleResendEmail = async () => {
    setSending(true)
    setError('')
    
    try {
      await sendVerificationEmail()
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.')
      } else {
        setError('Failed to send verification email. Please try again.')
      }
    } finally {
      setSending(false)
    }
  }

  const handleRefresh = async () => {
    setChecking(true)
    await refreshUserProfile()
    if (user?.emailVerified) {
      router.push('/')
    }
    setChecking(false)
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/wisetale-logo.png" alt="Wizetale Logo" width={48} height={48} />
          </div>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
          <CardDescription>
            We've sent a verification email to <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Please check your inbox and click the verification link to activate your account.
              This page will automatically redirect once your email is verified.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {sent && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Verification email sent successfully!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
              disabled={sending || sent}
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend verification email'
              )}
            </Button>

            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="w-full"
              disabled={checking}
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "I've verified my email"
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Didn't receive the email? Check your spam folder.</p>
            <p className="mt-2">
              Wrong email?{' '}
              <button
                onClick={() => {
                  router.push('/landing/login')
                }}
                className="text-purple-600 hover:underline"
              >
                Sign in with a different account
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 