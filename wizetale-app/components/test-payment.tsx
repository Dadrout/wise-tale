'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'

export function TestPayment() {
  const { createCheckoutSession, loading } = useSubscription()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleTestPayment = async () => {
    setError('')
    setSuccess('')
    
    try {
      await createCheckoutSession()
      setSuccess('Redirecting to Stripe checkout...')
    } catch (err: any) {
      setError(err.message || 'Failed to create checkout session')
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Test Payment
        </CardTitle>
        <CardDescription>
          Test the Stripe integration with a $9.99 subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Test Card:</strong> 4242 4242 4242 4242</p>
          <p><strong>Expiry:</strong> Any future date</p>
          <p><strong>CVC:</strong> Any 3 digits</p>
        </div>

        <Button 
          onClick={handleTestPayment}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Test Payment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 