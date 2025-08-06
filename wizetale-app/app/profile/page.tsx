'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { updateUserProfile, validateUsername } from '@/lib/user-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { PremiumBadge } from '@/components/premium-badge'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Loader2, 
  Check, 
  X,
  Camera,
  Save,
  Crown
} from 'lucide-react'

function ProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userProfile, refreshUserProfile, sendVerificationEmail } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [sendingVerification, setSendingVerification] = useState(false)
  
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    bio: ''
  })
  
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [usernameError, setUsernameError] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/landing/login')
      return
    }

    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        displayName: userProfile.displayName || '',
        bio: userProfile.bio || ''
      })
    }
  }, [user, userProfile, router])

  // Debounced username check
  useEffect(() => {
    if (!formData.username || formData.username === userProfile?.username) {
      setUsernameAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsCheckingUsername(true)
      const result = await validateUsername(formData.username)
      setUsernameAvailable(result.isValid)
      setUsernameError(result.error || '')
      setIsCheckingUsername(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.username, userProfile?.username])

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError('')
    setSuccess('')
  }

  const handleSaveProfile = async () => {
    if (usernameAvailable === false) {
      setError('Please choose a different username')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateUserProfile(user!.uid, {
        username: formData.username.toLowerCase(),
        displayName: formData.displayName,
        bio: formData.bio
      })
      
      await refreshUserProfile()
      setSuccess('Profile updated successfully!')
    } catch (error) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSendVerification = async () => {
    setSendingVerification(true)
    setError('')
    
    try {
      await sendVerificationEmail()
      setSuccess('Verification email sent! Check your inbox.')
    } catch (error: any) {
      if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait before trying again.')
      } else {
        setError('Failed to send verification email.')
      }
    } finally {
      setSendingVerification(false)
    }
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const initials = userProfile.displayName
    ? userProfile.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : userProfile.username[0].toUpperCase()

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your profile information that other users will see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {(error || success) && (
                <Alert variant={error ? "destructive" : "default"}>
                  <AlertDescription>{error || success}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                  src={userProfile.photoURL} 
                  alt="Profile"
                />
                  <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" disabled>
                  <Camera className="mr-2 h-4 w-4" />
                  Change Photo (Coming Soon)
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    placeholder="johndoe"
                    className={usernameError && formData.username !== userProfile.username ? 'border-red-500' : ''}
                  />
                  {isCheckingUsername && (
                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                  )}
                  {!isCheckingUsername && formData.username !== userProfile.username && formData.username.length >= 3 && (
                    usernameAvailable ? (
                      <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    ) : (
                      <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                    )
                  )}
                </div>
                {usernameError && formData.username !== userProfile.username && (
                  <p className="text-sm text-red-600">{usernameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange('displayName')}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={handleInputChange('bio')}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <Button 
                onClick={handleSaveProfile}
                disabled={saving || isCheckingUsername || usernameAvailable === false}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Email Verification</p>
                      <p className="text-sm text-gray-600">
                        {user.emailVerified ? (
                          <span className="text-green-600">Verified</span>
                        ) : (
                          <span className="text-orange-600">Not verified</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!user.emailVerified && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSendVerification}
                      disabled={sendingVerification}
                    >
                      {sendingVerification ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Send Verification'
                      )}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">User ID</p>
                    <p className="text-sm text-gray-600 font-mono">{user.uid}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Member Since</p>
                    <p className="text-sm text-gray-600">
                      {userProfile.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Subscription Status</p>
                    <div className="flex items-center gap-2">
                      <PremiumBadge isPremium={userProfile.isPremium} />
                      {userProfile.subscriptionStatus && (
                        <span className="text-sm text-gray-600 capitalize">
                          ({userProfile.subscriptionStatus})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{userProfile.stats?.storiesGenerated || 0}</p>
                    <p className="text-sm text-gray-600">Stories Generated</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">{userProfile.stats?.storiesViewed || 0}</p>
                    <p className="text-sm text-gray-600">Stories Viewed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" disabled>
                Delete Account (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfilePageContent />
    </Suspense>
  )
} 