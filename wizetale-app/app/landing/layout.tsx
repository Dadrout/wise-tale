'use client'

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageContext, useLanguageState } from '@/hooks/use-language'
import { AuthContext, useAuthState } from '@/hooks/use-auth'
import { PerformanceMonitor } from "@/components/performance-monitor"

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
        <title>Wizetale - Learn History as a Fairy Tale</title>
        <meta name="description" content="Transform complex humanities topics into engaging audio-visual stories. Make learning fun, memorable, and magical for students aged 10-18." />
        <link rel="icon" href="/favicon.png" />
      </head>
      <body className={inter.className}>
        <LanguageContext.Provider value={languageState}>
          <AuthContext.Provider value={authState}>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
              <PerformanceMonitor />
              {children}
            </ThemeProvider>
          </AuthContext.Provider>
        </LanguageContext.Provider>
      </body>
    </html>
  )
}
