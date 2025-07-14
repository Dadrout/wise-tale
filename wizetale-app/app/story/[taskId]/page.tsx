"use client"

import { useState } from "react"
import { useStoryPoller } from "@/hooks/use-story-poller"
import { EnhancedVideoPlayer } from "@/components/enhanced-video-player"
import { GenerationProgress } from "@/components/generation-progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollReveal } from "@/components/scroll-reveal"
import { AlertTriangle, BookOpen, Film } from "lucide-react"

export const dynamic = 'force-dynamic';

export default function StoryPage({ params }: { params: { taskId: string } }) {
  const { taskId } = params
  const { isPolling, progress, status, error, result } = useStoryPoller(taskId)
  const [showTranscript, setShowTranscript] = useState(true)

  const getTranscript = () => {
    return result?.transcript || "Your story transcript will appear here after generation..."
  }

  const handleRetry = () => {
    // A full page reload might be the simplest way to re-initiate polling
    window.location.reload()
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <ScrollReveal direction="down">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-sky-500 to-teal-500 tracking-tight">
            Your Generated Story
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            Task ID: {taskId}
          </p>
        </div>
      </ScrollReveal>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-100 dark:border-purple-800 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl text-gray-800 dark:text-gray-100">
              <Film className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              Story Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Generation Failed</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button onClick={handleRetry} variant="outline" size="sm" className="mt-4">
                    Try Again
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {(isPolling || !result) && !error && (
              <GenerationProgress
                progress={progress}
                status={status}
              />
            )}

            {result && (
              <div className="space-y-6">
                {result.video_url && (
                  <EnhancedVideoPlayer
                    videoUrl={result.video_url}
                  />
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      Story Transcript
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTranscript(!showTranscript)}
                    >
                      {showTranscript ? "Hide" : "Show"}
                    </Button>
                  </div>
                  {showTranscript && (
                    <Card className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-serif">
                        {getTranscript()}
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 