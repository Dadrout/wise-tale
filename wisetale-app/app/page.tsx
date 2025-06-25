"use client"

import { useState } from "react"
import { ScrollReveal } from "@/components/scroll-reveal"
import { ThemeToggle } from "@/components/theme-toggle"
import { WiseTaleLogo } from "@/components/wisetale-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Sparkles, Play, Globe, Brain, Clock, Download, Share2, Volume2 } from "lucide-react"

export default function WiseTaleApp() {
  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)
  const [showTranscript, setShowTranscript] = useState(true)

  const handleGenerate = async () => {
    if (!subject || !topic || !difficulty) return

    setIsGenerating(true)
    // Simulate video generation
    await new Promise((resolve) => setTimeout(resolve, 3000))
    setIsGenerating(false)
    setHasGenerated(true)
  }

  const sampleTranscript = `Welcome to this enchanting tale of the French Revolution! 

  Our story begins in the grand palace of Versailles, where King Louis XVI lived in luxury while his people struggled with hunger and poverty. The year was 1789, and France was on the brink of monumental change.

  Picture Marie Antoinette, the queen who allegedly said "Let them eat cake" when told her people had no bread. Though this quote may be legend, it perfectly captures the disconnect between the royal court and ordinary French citizens.

  The revolution erupted like a thunderstorm, beginning with the storming of the Bastille fortress on July 14th, 1789. This moment became a symbol of the people's power against tyranny, and we still celebrate Bastille Day in France today.

  Through years of upheaval, from the Reign of Terror to the rise of Napoleon, this period transformed not just France, but the entire world's understanding of democracy, human rights, and the power of the people.`

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

                  {/* Difficulty Level */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-gray-800 dark:text-gray-200">Difficulty Level</Label>
                    <RadioGroup value={difficulty} onValueChange={setDifficulty} className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer">
                        <RadioGroupItem
                          value="beginner"
                          id="beginner"
                          className="text-purple-600 dark:text-purple-400 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-purple-600 dark:data-[state=checked]:bg-purple-500"
                        />
                        <Label htmlFor="beginner" className="text-base font-medium cursor-pointer flex-1">
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">Beginner</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Simple explanations for newcomers
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:border-sky-300 dark:hover:border-sky-600 transition-all cursor-pointer">
                        <RadioGroupItem
                          value="student"
                          id="student"
                          className="text-sky-600 dark:text-sky-400 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-sky-600 dark:data-[state=checked]:bg-sky-500"
                        />
                        <Label htmlFor="student" className="text-base font-medium cursor-pointer flex-1">
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">Student</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Detailed academic explanations
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-600 transition-all cursor-pointer">
                        <RadioGroupItem
                          value="expert"
                          id="expert"
                          className="text-teal-600 dark:text-teal-400 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-teal-600 dark:data-[state=checked]:bg-teal-500"
                        />
                        <Label htmlFor="expert" className="text-base font-medium cursor-pointer flex-1">
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">Expert</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Advanced analysis and insights
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={!subject || !topic || !difficulty || isGenerating}
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
                  <div className="aspect-video bg-gradient-to-br from-purple-100 via-sky-100 to-teal-100 dark:from-purple-900/20 dark:via-sky-900/20 dark:to-teal-900/20 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-300 dark:border-purple-700 relative overflow-hidden">
                    {hasGenerated ? (
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-teal-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer">
                          <Play className="w-10 h-10 text-white ml-1" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                          {topic ? `"${topic}"` : "Your Story"} is Ready!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {subject && `${subject.charAt(0).toUpperCase() + subject.slice(1)} • `}
                          {difficulty && `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-800/60"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 dark:hover:text-gray-200 bg-white dark:bg-gray-800/60"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center relative z-10">
                        <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                          <Play className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                          Your generated video will appear here
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                          Fill out the form and click "Generate Video" to begin
                        </p>
                      </div>
                    )}

                    {/* Magical sparkles background */}
                    <div className="absolute inset-0 opacity-20">
                      <Sparkles className="absolute top-4 left-4 w-4 h-4 text-purple-400" />
                      <Sparkles className="absolute top-8 right-8 w-3 h-3 text-sky-400" />
                      <Sparkles className="absolute bottom-6 left-8 w-3 h-3 text-teal-400" />
                      <Sparkles className="absolute bottom-4 right-4 w-4 h-4 text-purple-400" />
                    </div>
                  </div>

                  {/* Video Controls (when generated) */}
                  {hasGenerated && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">3:24</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="w-12 h-2 bg-purple-600 dark:bg-purple-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}

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
                              {sampleTranscript}
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
