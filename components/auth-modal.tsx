"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { AlertCircle, Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export function AuthModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [tab, setTab] = useState("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onLogin = async (data: LoginForm) => {
    setLoading(true)
    setError("")
    // TODO: Replace with real auth logic
    setTimeout(() => {
      setLoading(false)
      if (data.email === "test@example.com" && data.password === "password") {
        onOpenChange(false)
      } else {
        setError("Invalid email or password")
      }
    }, 1000)
  }

  const onRegister = async (data: RegisterForm) => {
    setLoading(true)
    setError("")
    // TODO: Replace with real registration logic
    setTimeout(() => {
      setLoading(false)
      if (data.email && data.password && data.name) {
        onOpenChange(false)
      } else {
        setError("Registration failed")
      }
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl font-bold text-center">
            {tab === "login" ? "Sign In to WiseTale" : "Create your WiseTale account"}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="p-6 pt-2">
          <TabsList className="w-full flex mb-6">
            <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
            <TabsTrigger value="register" className="flex-1">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              <Input
                {...loginRegister("email")}
                type="email"
                placeholder="Email"
                disabled={loading}
                autoComplete="email"
              />
              {loginErrors.email && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {loginErrors.email.message}
                </div>
              )}
              <Input
                {...loginRegister("password")}
                type="password"
                placeholder="Password"
                disabled={loading}
                autoComplete="current-password"
              />
              {loginErrors.password && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {loginErrors.password.message}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              <Input
                {...registerRegister("name")}
                type="text"
                placeholder="Name"
                disabled={loading}
                autoComplete="name"
              />
              {registerErrors.name && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {registerErrors.name.message}
                </div>
              )}
              <Input
                {...registerRegister("email")}
                type="email"
                placeholder="Email"
                disabled={loading}
                autoComplete="email"
              />
              {registerErrors.email && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {registerErrors.email.message}
                </div>
              )}
              <Input
                {...registerRegister("password")}
                type="password"
                placeholder="Password"
                disabled={loading}
                autoComplete="new-password"
              />
              {registerErrors.password && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {registerErrors.password.message}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 