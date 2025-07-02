import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "WiseTale - Transform Learning Into Magical Stories",
  description:
    "AI-powered educational storytelling platform that transforms complex humanities topics into engaging animated fairy tales for students aged 10-18.",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/wisetale-logo.png', sizes: '192x192', type: 'image/png' }
    ],
    apple: [
      { url: '/wisetale-logo.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/favicon.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true} disableTransitionOnChange={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
