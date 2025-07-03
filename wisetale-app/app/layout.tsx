'use client'

import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageContext, useLanguageState } from '@/hooks/use-language'
import { AuthContext, useAuthState } from '@/hooks/use-auth'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const languageState = useLanguageState()
  const authState = useAuthState()

  return (
    <html lang={languageState.language} suppressHydrationWarning>
      <head>
        <title>WiseTale - Transform Learning Into Magical Stories</title>
        <meta name="description" content="AI-powered educational storytelling platform that transforms complex humanities topics into engaging animated fairy tales for students aged 10-18." />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        <LanguageContext.Provider value={languageState}>
          <AuthContext.Provider value={authState}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true} disableTransitionOnChange={false}>
              {children}
            </ThemeProvider>
          </AuthContext.Provider>
        </LanguageContext.Provider>
      </body>
    </html>
  )
}
