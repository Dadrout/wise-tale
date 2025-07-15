'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  getRedirectResult,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { trackEvent, trackConversion, trackFunnelStep } from '@/lib/analytics'
import { 
  createUserProfile, 
  getUserProfile, 
  checkUserProfileExists,
  updateUserProfile,
  UserProfile 
} from '@/lib/user-service'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  getToken: () => Promise<string | null>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, displayName?: string) => Promise<void>
  logout: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  sendVerificationEmail: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshUserProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Load user profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid)
        setUserProfile(profile)
        
        // If profile doesn't exist (e.g., after Google sign-in), create a basic one
        if (!profile && firebaseUser.email) {
          const username = firebaseUser.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
          await createUserProfile(
            firebaseUser.uid,
            firebaseUser.email,
            username,
            firebaseUser.displayName || undefined
          )
          const newProfile = await getUserProfile(firebaseUser.uid)
          setUserProfile(newProfile)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    // Check for redirect result when component mounts
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          trackEvent('login_google_redirect')
        }
      })
      .catch((error) => {
        console.error('Redirect result error:', error)
      })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      
      // Load user profile
      const profile = await getUserProfile(result.user.uid)
      setUserProfile(profile)
      
      trackEvent('login_email')
      trackConversion('user_logged_in', 1)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    username: string, 
    displayName?: string
  ) => {
    setLoading(true)
    try {
      // Create Firebase auth user
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name in Firebase Auth
      if (displayName) {
        await updateProfile(result.user, { displayName })
      }
      
      // Create user profile in Firestore
      await createUserProfile(
        result.user.uid,
        email,
        username,
        displayName
      )
      
      // Send verification email
      await sendEmailVerification(result.user)
      
      // Load the created profile
      const profile = await getUserProfile(result.user.uid)
      setUserProfile(profile)
      
      trackEvent('sign_up_email')
      trackConversion('user_registered', 1)
      trackFunnelStep('registration_completed', 2, 2)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null
    try {
      return await auth.currentUser.getIdToken()
    } catch (error) {
      console.error("Error getting auth token:", error)
      return null
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      
      // Try popup first
      try {
        const result = await signInWithPopup(auth, provider)
        
        // Check if user profile exists, create if not
        const profileExists = await checkUserProfileExists(result.user.uid)
        if (!profileExists && result.user.email) {
          const username = result.user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
          await createUserProfile(
            result.user.uid,
            result.user.email,
            username,
            result.user.displayName || undefined
          )
        }
        
        // Update emailVerified status for Google users
        if (result.user.emailVerified) {
          await updateUserProfile(result.user.uid, {
            emailVerified: true
          })
        }
        
        // Load user profile
        const profile = await getUserProfile(result.user.uid)
        setUserProfile(profile)
        
        trackEvent('login_google')
        trackConversion('user_logged_in', 1)
      } catch (popupError: any) {
        // If popup blocked or COOP error, fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message?.includes('Cross-Origin-Opener-Policy')) {
          console.log('Popup blocked, using redirect method')
          const { signInWithRedirect } = await import('firebase/auth')
          await signInWithRedirect(auth, provider)
          // Note: redirect will reload the page, so loading state won't be set to false here
        } else {
          throw popupError
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No user logged in')
    }
    
    try {
      await sendEmailVerification(auth.currentUser)
      trackEvent('email_verification_sent')
    } catch (error) {
      console.error('Error sending verification email:', error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      trackEvent('password_reset_requested')
    } catch (error) {
      console.error('Error sending password reset email:', error)
      throw error
    }
  }

  const refreshUserProfile = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload()
      // The onAuthStateChanged listener will automatically pick up the change
      // in emailVerified status and update the user state.
      // It also re-fetches the user profile from Firestore.
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
      setUserProfile(null)
      trackEvent('logout')
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { 
    user, 
    userProfile,
    loading, 
    signIn, 
    signUp, 
    logout, 
    getToken, 
    signInWithGoogle,
    sendVerificationEmail,
    resetPassword,
    refreshUserProfile
  }
} 