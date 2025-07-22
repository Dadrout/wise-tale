'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, Check, Loader2, Sparkles } from 'lucide-react'
import { PremiumBadge } from './premium-badge'

interface SubscriptionCardProps {
  isPremium?: boolean
  onUpgrade?: () => void
  loading?: boolean
}

export function SubscriptionCard({ isPremium = false, onUpgrade, loading = false }: SubscriptionCardProps) {
  const [processing, setProcessing] = useState(false)

  const handleUpgrade = async () => {
    if (onUpgrade) {
      setProcessing(true)
      try {
        await onUpgrade()
      } finally {
        setProcessing(false)
      }
    }
  }

  return (
    <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          <Crown className="h-8 w-8 text-yellow-600" />
        </div>
        <CardTitle className="text-xl">Premium Subscription</CardTitle>
        <CardDescription>
          Unlock unlimited stories and premium features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">$9.99</div>
          <div className="text-sm text-gray-600">per month</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Unlimited story generation</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Premium video quality</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Priority processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Advanced customization</span>
          </div>
        </div>

        {isPremium ? (
          <div className="text-center">
            <PremiumBadge isPremium={true} className="text-sm" />
            <p className="text-sm text-gray-600 mt-2">You are already a premium member!</p>
          </div>
        ) : (
          <Button 
            onClick={handleUpgrade}
            disabled={loading || processing}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          >
            {loading || processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 