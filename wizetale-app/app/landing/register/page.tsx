"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react'
import { PasswordStrengthIndicator } from '@/components/password-strength-indicator'
import { 
  validateEmail, 
  validatePassword, 
  validateUsername 
} from '@/lib/user-service'

export default function RegisterPage() {
    const router = useRouter()
    const { signUp, loading, signInWithGoogle } = useAuth()
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        displayName: ''
    })
    
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        username: '',
        displayName: ''
    })

    // Debounced username check
    useEffect(() => {
        if (!formData.username || formData.username.length < 3) {
            setUsernameAvailable(null)
            return
        }

        const timer = setTimeout(async () => {
            setIsCheckingUsername(true)
            const result = await validateUsername(formData.username)
            setUsernameAvailable(result.isValid)
            setFieldErrors(prev => ({ ...prev, username: result.error || '' }))
            setIsCheckingUsername(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [formData.username])

    const validateForm = (): boolean => {
        const errors = {
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            displayName: ''
        }

        // Email validation
        const emailValidation = validateEmail(formData.email)
        if (!emailValidation.isValid) {
            errors.email = emailValidation.error || ''
        }

        // Password validation
        const passwordValidation = validatePassword(formData.password)
        if (!passwordValidation.isValid) {
            errors.password = passwordValidation.error || ''
        }

        // Confirm password
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
        }

        // Username validation (already checked in useEffect)
        if (!formData.username) {
            errors.username = 'Username is required'
        } else if (usernameAvailable === false) {
            errors.username = 'Username is already taken'
        }

        // Display name validation (optional but has length limit)
        if (formData.displayName && formData.displayName.length > 50) {
            errors.displayName = 'Display name must be less than 50 characters'
        }

        setFieldErrors(errors)
        return !Object.values(errors).some(error => error !== '')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            setError('Please fix the errors below')
            return
        }

        try {
            setError('')
            await signUp(
                formData.email, 
                formData.password, 
                formData.username,
                formData.displayName || formData.username
            )
            router.push('/verify-email')
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                setError('An account with this email already exists')
            } else if (error.code === 'auth/weak-password') {
                setError('Password is too weak')
            } else {
                setError('Failed to create account. Please try again.')
            }
        }
    }

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        // Clear field error when user starts typing
        setFieldErrors(prev => ({ ...prev, [field]: '' }))
        setError('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-teal-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Image src="/wisetale-logo.png" alt="Wizetale Logo" width={48} height={48} />
                    </div>
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>
                        Enter your details to get started with Wizetale
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <Input
                                    id="username"
                                    placeholder="johndoe"
                                    value={formData.username}
                                    onChange={handleInputChange('username')}
                                    className={fieldErrors.username ? 'border-red-500' : ''}
                                    disabled={loading}
                                />
                                {isCheckingUsername && (
                                    <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                                )}
                                {!isCheckingUsername && formData.username.length >= 3 && (
                                    usernameAvailable ? (
                                        <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                                    ) : (
                                        <X className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                                    )
                                )}
                            </div>
                            {fieldErrors.username && (
                                <p className="text-sm text-red-600">{fieldErrors.username}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                className={fieldErrors.email ? 'border-red-500' : ''}
                                disabled={loading}
                            />
                            {fieldErrors.email && (
                                <p className="text-sm text-red-600">{fieldErrors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">Display Name (optional)</Label>
                            <Input
                                id="displayName"
                                placeholder="John Doe"
                                value={formData.displayName}
                                onChange={handleInputChange('displayName')}
                                className={fieldErrors.displayName ? 'border-red-500' : ''}
                                disabled={loading}
                            />
                            {fieldErrors.displayName && (
                                <p className="text-sm text-red-600">{fieldErrors.displayName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange('password')}
                                    className={fieldErrors.password ? 'border-red-500' : ''}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <PasswordStrengthIndicator password={formData.password} />
                            {fieldErrors.password && (
                                <p className="text-sm text-red-600">{fieldErrors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange('confirmPassword')}
                                    className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {fieldErrors.confirmPassword && (
                                <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading || isCheckingUsername || usernameAvailable === false}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <div className="mt-4 text-center text-sm">
                    <Button type="button" onClick={signInWithGoogle} variant="outline" className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm mt-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-4 h-4"><path fill="#4285F4" d="M533.5 278.4c0-17.2-1.3-34.5-4-51.3H272v97.2h146.9c-6.4 34.3-25 63.6-53.2 83.1v68h85.7c50.3-46.3 78.1-114.5 78.1-197z"/><path fill="#34A853" d="M272 544.3c71.6 0 131.7-23.6 175.6-64.3l-85.7-68c-23.8 15.9-54.3 25.2-89.9 25.2-68.9 0-127.4-46.5-148.4-109.2h-88.4v68.8C83.2 483.3 171.9 544.3 272 544.3z"/><path fill="#FBBC05" d="M123.6 324.2c-5.3-15.9-8.3-32.8-8.3-50.2s3-34.3 8.3-50.2v-68.8H35.2C12.6 200.5 0 236.3 0 274s12.6 73.5 35.2 119l88.4-68.8z"/><path fill="#EA4335" d="M272 107.7c38.8 0 73.4 13.3 100.8 39.5l75.6-75.6C403.7 29.6 343.6 0 272 0 171.9 0 83.2 61 35.2 155l88.4 68.8c21-62.7 79.5-116.1 148.4-116.1z"/></svg>
                        Sign up with Google
                    </Button>
                    <p className="mt-4 text-gray-600">
                        Already have an account?{' '}
                        <Link href="/landing/login" className="text-purple-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    )
}