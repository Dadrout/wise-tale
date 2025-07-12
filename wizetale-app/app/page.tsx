"use client"

import { useState, useEffect } from "react"
import { MotionReveal } from "@/components/MotionReveal"
import { ThemeToggle } from "@/components/theme-toggle"
import { WizetaleLogo } from "@/components/wizetale-logo"
import Link from "next/link"
import { FloatingElements } from "@/components/floating-elements"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/hooks/use-language"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Sparkles, Play, Globe, Brain, User, LogOut, AlertTriangle, RefreshCw, Settings, ChevronDown } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useStoryGenerator, GenerationResult } from "@/hooks/use-story-generator"
import { GenerationProgress } from "@/components/generation-progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"


export default function WizetaleApp() {
  const { t } = useLanguage()
  const { user, userProfile, logout, loading } = useAuth()
  const router = useRouter()
  
  // Form state
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [voice, setVoice] = useState("female")
  const [customDescription, setCustomDescription] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [language, setLanguage] = useState("en-US")
  
  // Generation state managed by the hook
  const {
    isGenerating,
    progress,
    status,
    error,
    result,
    generateStory,
  } = useStoryGenerator()

  const [showTranscript, setShowTranscript] = useState(true)
  const [generatedVideo, setGeneratedVideo] = useState<GenerationResult | null>(null)

  useEffect(() => {
    if (result) {
      setGeneratedVideo(result)
    }
  }, [result])

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/landing")
    }
  }, [user, loading, router])

  if (loading || (!user && typeof window !== 'undefined')) {
    // Показываем спиннер или заглушку, пока идёт проверка авторизации
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-lg text-gray-500">Loading...</span>
      </div>
    )
  }

  const handleEnhancePrompt = async () => {
    if (!customDescription.trim()) return
    
    setIsEnhancing(true)
    try {
      // Call OpenAI to enhance the prompt
      const response = await fetch('/api/simple-proxy/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: customDescription
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCustomDescription(data.enhanced_description || customDescription)
      }
    } catch (error) {
      console.error('Failed to enhance prompt:', error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleGenerate = () => {
    if (!subject || !topic) return
    
    // For custom stories, use the custom description as the topic
    const finalTopic = subject === "custom" ? customDescription : topic
    
    generateStory({ subject: subject === "custom" ? "custom" : subject, topic: finalTopic, voice, user_id: user?.uid, language })
  }

  const handleLogout = async () => {
    await logout()
    router.push('/landing/login')
  }

  const getUserDisplayName = () => {
    if (userProfile?.displayName) return userProfile.displayName
    if (userProfile?.username) return userProfile.username
    if (user?.displayName) return user.displayName
    return user?.email?.split('@')[0] || 'User'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getTranscript = () => {
    return generatedVideo?.transcript || "Your story transcript will appear here after generation..."
  }
  
  const getSubjectIcon = (subjectName: string) => {
    switch (subjectName) {
      case "history":
        return <BookOpen className="w-5 h-5 text-purple-400" />
      case "geography":
        return <Globe className="w-5 h-5 text-sky-400" />
      case "philosophy":
        return <Brain className="w-5 h-5 text-teal-400" />
      default:
        return <BookOpen className="w-5 h-5 text-purple-400" />
    }
  }

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-black/50 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <WizetaleLogo />
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <ThemeToggle />
              <Separator orientation="vertical" className="h-8 bg-gray-300 dark:bg-gray-700" />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile?.photoURL} />
                        <AvatarFallback className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                        {getUserDisplayName()}
                      </span>
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                        <p className="text-xs leading-none text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/history')}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>My Stories</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/landing/login">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg px-6 py-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t.signIn}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Animated background icons */}
      <FloatingElements />

      {/* Main Content */}
      <div className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <MotionReveal>
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-sky-500 to-teal-500 tracking-tight">
                {t.title}
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
                {t.subtitle}
              </p>
            </div>
          </MotionReveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Input Section */}
            <MotionReveal>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-100 dark:border-purple-800 rounded-2xl shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2 text-2xl text-gray-800 dark:text-gray-100">
                    <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    {t.storyGenerator}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Subject Dropdown */}
                  <div className="space-y-3">
                    <Label htmlFor="subject" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      {t.subject}
                    </Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-600 text-base px-4 bg-white dark:bg-gray-800/60">
                        <SelectValue placeholder={t.chooseSubject} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800">
                        <SelectItem value="history">
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            {t.history}
                          </div>
                        </SelectItem>
                        <SelectItem value="literature" disabled>
                          <div className="flex items-center gap-3 opacity-50">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            {t.literature} (Coming Soon)
                          </div>
                        </SelectItem>
                        <SelectItem value="custom" disabled>
                          <div className="flex items-center gap-3 opacity-50">
                            <Sparkles className="w-4 h-4 text-gray-400" />
                            {t.customStory} (Coming Soon)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Topic Input - Show different UI for custom stories */}
                  {subject === "custom" ? (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="customTitle" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          {t.storyTitle}
                        </Label>
                        <Input
                          id="customTitle"
                          placeholder={t.storyTitle}
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-600 text-base px-4 bg-white dark:bg-gray-800/60"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="customDescription" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          {t.storyDescription}
                        </Label>
                        <textarea
                          id="customDescription"
                          placeholder={t.storyDescription}
                          value={customDescription}
                          onChange={(e) => setCustomDescription(e.target.value)}
                          className="min-h-[100px] w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-600 text-base px-4 py-3 bg-white dark:bg-gray-800/60 resize-none"
                        />
                      </div>
                      <Button
                        onClick={handleEnhancePrompt}
                        disabled={!customDescription.trim() || isEnhancing}
                        variant="outline"
                        className="w-full h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      >
                        {isEnhancing ? (
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            {t.generatingStory}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            {t.enhanceWithAI}
                          </div>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label htmlFor="topic" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                        {t.topic}
                      </Label>
                      <Input
                        id="topic"
                        placeholder={t.topicPlaceholder}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-600 text-base px-4 bg-white dark:bg-gray-800/60"
                      />
                    </div>
                  )}

                  {/* Voice Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="voice" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      {t.voice}
                    </Label>
                    <RadioGroup
                      defaultValue="female"
                      value={voice}
                      onValueChange={setVoice}
                      className="grid grid-cols-2 gap-4"
                    >
                      <Label className="flex items-center gap-3 cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50 dark:has-[:checked]:bg-purple-900/20">
                        <RadioGroupItem value="female" id="female" />
                        {t.femaleVoice}
                      </Label>
                      <Label className="flex items-center gap-3 cursor-pointer rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 has-[:checked]:border-purple-500 has-[:checked]:bg-purple-50 dark:has-[:checked]:bg-purple-900/20">
                        <RadioGroupItem value="male" id="male" />
                        {t.maleVoice}
                      </Label>
                    </RadioGroup>
                  </div>
                  
                  {/* Generation Language Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="language" className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      {t.language}
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-600 text-base px-4 bg-white dark:bg-gray-800/60">
                        <SelectValue placeholder={t.language} />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800">
                        <SelectItem value="en-US">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🇺🇸</span>
                            <span>{t.english}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ru-RU">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🇷🇺</span>
                            <span>{t.russian}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!subject || !topic || isGenerating}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-purple-600 via-sky-600 to-teal-600 hover:from-purple-700 hover:via-sky-700 hover:to-teal-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        {t.generatingStory}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5" />
                        {t.generateStory}
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </MotionReveal>

            {/* Output Section */}
            <div className="space-y-8">
              <MotionReveal>
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl text-gray-800 dark:text-gray-100">
                      <Play className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      {t.yourStoryVideo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isGenerating ? (
                      <GenerationProgress progress={progress} status={status} />
                    ) : error ? (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Generation Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : (
                      <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center relative overflow-hidden">
                        {generatedVideo?.video_url ? (
                          <video src={generatedVideo.video_url} controls className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <Play className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto" />
                            <p className="mt-2 text-sm text-gray-500">{t.videoPlaceholder}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </MotionReveal>

              {generatedVideo?.transcript && (
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-2xl text-gray-800 dark:text-gray-100">
                        <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        {t.transcript}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTranscript(!showTranscript)}
                        className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                      >
                        {showTranscript ? t.hide : t.show}
                      </Button>
                    </div>
                  </CardHeader>
                  {showTranscript && (
                    <CardContent>
                      <div className="bg-gradient-to-br from-purple-50 via-sky-50 to-teal-50 dark:from-purple-900/10 dark:via-sky-900/10 dark:to-teal-900/10 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                        <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                          {getTranscript()}
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 py-8 bg-white/50 dark:bg-black/30 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto text-center text-gray-500 dark:text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Wizetale. {t.allRightsReserved}
        </div>
      </footer>
    </div>
  )
}
