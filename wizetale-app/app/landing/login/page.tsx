'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { validateEmail } from '@/lib/user-service'

export default function LoginPage() {
    const router = useRouter()
    const { signIn, loading, signInWithGoogle } = useAuth()
    
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState({
        email: '',
        password: ''
    })

    const validateForm = (): boolean => {
        const errors = {
            email: '',
            password: ''
        }

        // Email validation
        const emailValidation = validateEmail(formData.email)
        if (!emailValidation.isValid) {
            errors.email = emailValidation.error || ''
        }

        // Password validation (just check if exists for login)
        if (!formData.password) {
            errors.password = 'Password is required'
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
            await signIn(formData.email, formData.password)
            router.push('/')
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                setError('No account found with this email address')
            } else if (error.code === 'auth/wrong-password') {
                setError('Incorrect password')
            } else if (error.code === 'auth/invalid-credential') {
                setError('Invalid email or password')
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.')
            } else {
                setError('Failed to sign in. Please try again.')
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

    const handleGoogleSignIn = async () => {
        try {
            setError('')
            await signInWithGoogle()
            router.push('/')
        } catch (error: any) {
            if (error.code === 'auth/popup-closed-by-user') {
                // User closed the popup, no need to show error
                return
            }
            setError('Failed to sign in with Google')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-teal-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Image src="/wisetale-logo.png" alt="Wizetale Logo" width={48} height={48} />
                    </div>
                    <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                    <CardDescription>
                        Sign in to your account to continue
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link 
                                    href="/reset-password" 
                                    className="text-sm text-purple-600 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
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
                            {fieldErrors.password && (
                                <p className="text-sm text-red-600">{fieldErrors.password}</p>
                            )}
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <Button 
                        type="button" 
                        onClick={handleGoogleSignIn} 
                        className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        disabled={loading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" className="w-4 h-4"><path fill="#4285F4" d="M533.5 278.4c0-17.2-1.3-34.5-4-51.3H272v97.2h146.9c-6.4 34.3-25 63.6-53.2 83.1v68h85.7c50.3-46.3 78.1-114.5 78.1-197z"/><path fill="#34A853" d="M272 544.3c71.6 0 131.7-23.6 175.6-64.3l-85.7-68c-23.8 15.9-54.3 25.2-89.9 25.2-68.9 0-127.4-46.5-148.4-109.2h-88.4v68.8C83.2 483.3 171.9 544.3 272 544.3z"/><path fill="#FBBC05" d="M123.6 324.2c-5.3-15.9-8.3-32.8-8.3-50.2s3-34.3 8.3-50.2v-68.8H35.2C12.6 200.5 0 236.3 0 274s12.6 73.5 35.2 119l88.4-68.8z"/><path fill="#EA4335" d="M272 107.7c38.8 0 73.4 13.3 100.8 39.5l75.6-75.6C403.7 29.6 343.6 0 272 0 171.9 0 83.2 61 35.2 155l88.4 68.8c21-62.7 79.5-116.1 148.4-116.1z"/></svg>
                        Sign in with Google
                    </Button>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/landing/register" className="text-purple-600 hover:underline">
                            Sign up
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
} 