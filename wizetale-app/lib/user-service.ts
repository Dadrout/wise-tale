import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore'
import { db } from './firebase'

export interface UserProfile {
  uid: string
  email: string
  username: string
  displayName?: string
  photoURL?: string
  emailVerified: boolean
  createdAt: any
  updatedAt: any
  bio?: string
  preferences?: {
    language?: string
    theme?: string
    notifications?: boolean
  }
  stats?: {
    storiesGenerated?: number
    storiesViewed?: number
  }
}

export interface UserValidation {
  isValid: boolean
  errors: {
    username?: string
    email?: string
    password?: string
    displayName?: string
  }
}

// Validate username format and availability
export const validateUsername = async (username: string): Promise<{ isValid: boolean; error?: string }> => {
  // Check format
  if (!username || username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' }
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' }
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' }
  }
  
  // Check availability
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('username', '==', username.toLowerCase()))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return { isValid: false, error: 'Username is already taken' }
    }
    
    return { isValid: true }
  } catch (error) {
    console.error('Error checking username availability:', error)
    return { isValid: false, error: 'Error checking username availability' }
  }
}

// Validate email format
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }
  
  return { isValid: true }
}

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } => {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  let score = 0
  
  // Check for various character types
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  
  // Check length
  if (password.length >= 12) score++
  if (password.length >= 16) score++
  
  // Determine strength
  if (score >= 5) strength = 'strong'
  else if (score >= 3) strength = 'medium'
  
  if (strength === 'weak') {
    return { 
      isValid: false, 
      error: 'Password is too weak. Use a mix of uppercase, lowercase, numbers, and symbols',
      strength 
    }
  }
  
  return { isValid: true, strength }
}

// Create user profile
export const createUserProfile = async (
  uid: string,
  email: string,
  username: string,
  displayName?: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userProfile: UserProfile = {
      uid,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      displayName: displayName || username,
      emailVerified: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true
      },
      stats: {
        storiesGenerated: 0,
        storiesViewed: 0
      }
    }
    
    await setDoc(userRef, userProfile)
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile
    }
    
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Check if user profile exists
export const checkUserProfileExists = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)
    return userSnap.exists()
  } catch (error) {
    console.error('Error checking user profile:', error)
    return false
  }
} 