import { Crown, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PremiumBadgeProps {
  isPremium?: boolean
  className?: string
}

export function PremiumBadge({ isPremium = false, className = '' }: PremiumBadgeProps) {
  if (!isPremium) return null

  return (
    <Badge 
      variant="default" 
      className={`bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 ${className}`}
    >
      <Crown className="w-3 h-3 mr-1" />
      Premium
    </Badge>
  )
}

export function PremiumSparkle({ isPremium = false, className = '' }: PremiumBadgeProps) {
  if (!isPremium) return null

  return (
    <div className={`inline-flex items-center ${className}`}>
      <Sparkles className="w-4 h-4 text-yellow-500 mr-1" />
      <span className="text-sm font-medium text-yellow-600">Premium</span>
    </div>
  )
} 