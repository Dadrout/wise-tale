"use client"

import { useState } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ThemeToggle } from "@/components/theme-toggle"
import { WiseTaleLogo } from "@/components/wisetale-logo"
import { EnhancedVideoPlayer } from "@/components/enhanced-video-player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Sparkles, Play, Globe, Brain, Clock, Download, Share2, Volume2 } from "lucide-react"

export default function WiseTaleApp() {
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [showTranscript, setShowTranscript] = useState(true)
  const [generatedVideo, setGeneratedVideo] = useState<any>(null)
  const [generationStatus, setGenerationStatus] = useState("")
  const [generationProgress, setGenerationProgress] = useState(0)

  const handleGenerate = async () => {
    if (!subject || !topic) return

    setIsGenerating(true)
    setGenerationProgress(0)
    setGenerationStatus("🎭 Creating educational story...")
    
    try {
      // Запускаем реальный таймер прогресса
      let currentProgress = 0
      const progressTimer = setInterval(() => {
        currentProgress += 2
        if (currentProgress <= 15) {
          setGenerationProgress(currentProgress)
          setGenerationStatus("📚 Generating historical content...")
        } else if (currentProgress <= 35) {
          setGenerationProgress(currentProgress)
          setGenerationStatus("🎵 Creating audio narration...")
        } else if (currentProgress <= 60) {
          setGenerationProgress(currentProgress)
          setGenerationStatus("📷 Finding educational images...")
        } else if (currentProgress <= 85) {
          setGenerationProgress(currentProgress)
          setGenerationStatus("🎬 Building video with transitions...")
        } else if (currentProgress <= 95) {
          setGenerationProgress(currentProgress)
          setGenerationStatus("✨ Finalizing your story...")
        }
      }, 200) // Обновляем каждые 200ms для плавности

      const response = await fetch('http://localhost:8000/api/v1/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          topic,
          user_id: 123, // temporary user ID
        }),
      })
      
      clearInterval(progressTimer)
      
      if (response.ok) {
        const data = await response.json()
        setGenerationProgress(100)
        setGenerationStatus("🎉 Your magical story is ready!")
        setGeneratedVideo(data)
        setHasGenerated(true)
      } else {
        console.error('Generation failed:', await response.text())
        setGenerationStatus("❌ Generation failed")
        setGenerationProgress(0)
      }
    } catch (error) {
      console.error('Error generating video:', error)
      setGenerationStatus("❌ Network error")
      setGenerationProgress(0)
    } finally {
      setTimeout(() => {
        setIsGenerating(false)
        setGenerationProgress(0)
        setGenerationStatus("")
      }, 2000)
    }
  }

  const getTranscript = () => {
    return generatedVideo?.transcript || "Your story transcript will appear here after generation..."
  }

  const getSubjectIcon = (subjectName: string) => {
    switch (subjectName) {
      case "history":
        return <BookOpen className="w-5 h-5 text-purple-400 dark:text-purple-400" />
      case "geography":
        return <Globe className="w-5 h-5 text-sky-400 dark:text-sky-400" />
      case "philosophy":
        return <Brain className="w-5 h-5 text-teal-400 dark:text-teal-400" />
      default:
        return <BookOpen className="w-5 h-5 text-purple-400 dark:text-purple-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-teal-50 dark:from-gray-900 dark:via-purple-950 dark:to-teal-950 relative bg-pattern grid-bg">
      {/* Background elements */}
      <div className="geometric-bg">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <div className="orb-bg"></div>

      {/* Header Section */}
      <header className="sticky top-0 z-50 border-b border-purple-100/50 dark:border-purple-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <WiseTaleLogo size={40} />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                  WiseTale
                </span>
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Home
              </a>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors font-medium"
              >
                Contact
              </a>
              <ThemeToggle />
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-sky-600 to-teal-600 bg-clip-text text-transparent">
                  Create Your Magical Story
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                Transform any humanities topic into an engaging AI-powered video story
              </p>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Form Section */}
            <ScrollReveal direction="left">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-100 dark:border-purple-800 rounded-2xl shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2 text-2xl text-gray-800 dark:text-gray-100">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    Story Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subject Dropdown */}
                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      Subject
                    </Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-600 focus:ring-purple-200 dark:focus:ring-purple-900/50 text-base bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Choose your subject..." />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectItem
                          value="history"
                          className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            History
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="geography"
                          className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            Geography
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="philosophy"
                          className="dark:text-gray-200 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                        >
                          <div className="flex items-center gap-3">
                            <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            Philosophy
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic Input */}
                  <div className="space-y-3">
                    <Label htmlFor="topic" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      Topic
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g., French Revolution, Ancient Egypt, Socratic Method..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-600 focus:ring-purple-200 dark:focus:ring-purple-900/50 text-base px-4 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!subject || !topic || isGenerating}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 via-sky-600 to-teal-600 hover:from-purple-700 hover:via-sky-700 hover:to-teal-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border-0"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating Your Story...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        Generate Video
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Output Section */}
            <ScrollReveal direction="right">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-100 dark:border-purple-800 rounded-2xl shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2 text-2xl text-gray-800 dark:text-gray-100">
                    <Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    Your Story Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Video Player Block */}
                  <div className="aspect-video bg-black rounded-xl relative overflow-hidden">
                    {isGenerating ? (
                      // Generation Progress
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-teal-900/90 flex flex-col items-center justify-center text-white">
                        <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold mb-4">{generationStatus}</h3>
                        <div className="w-64 bg-white/20 rounded-full h-3 mb-2">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-teal-400 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${generationProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm opacity-80">{generationProgress}% complete</p>
                      </div>
                    ) : hasGenerated && generatedVideo ? (
                      // Enhanced Video Player
                      <EnhancedVideoPlayer
                        videoUrl={generatedVideo.video_url}
                        posterUrl={generatedVideo.images_used?.[0]}
                        title={`${subject} - ${topic}`}
                        className="w-full h-full"
                      />
                    ) : (
                      // Default State
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-sky-100 to-teal-100 dark:from-purple-900/20 dark:via-sky-900/20 dark:to-teal-900/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Play className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">
                            Your fairy tale video will appear here
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                            Choose a subject and topic to create your story
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Transcript Section */}
                  {hasGenerated && (
                    <>
                      <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            Story Transcript
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowTranscript(!showTranscript)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                          >
                            {showTranscript ? "Hide" : "Show"}
                          </Button>
                        </div>
                        {showTranscript && (
                          <div className="bg-gradient-to-br from-purple-50 via-sky-50 to-teal-50 dark:from-purple-900/10 dark:via-sky-900/10 dark:to-teal-900/10 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                              {getTranscript()}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-purple-100 dark:border-purple-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo and Copyright */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <WiseTaleLogo size={32} />
                  <span className="font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                    WiseTale
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">© 2025 WiseTale. All rights reserved.</span>
              </div>

              {/* Footer Links */}
              <div className="flex items-center gap-6 text-sm">
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
