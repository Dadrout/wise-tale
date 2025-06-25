"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Moon, Sun, ArrowUp } from "lucide-react"
import Image from "next/image"
import { ScrollReveal } from "@/components/scroll-reveal"
import { PageLoader } from "@/components/page-loader"
import { FloatingElements } from "@/components/floating-elements"
import {
  BookOpen,
  Play,
  Headphones,
  Sparkles,
  Users,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Wand2,
  Volume2,
  Brain,
} from "lucide-react"
import { YouTubeEmbed } from "@/components/youtube-embed"
import { WaitlistForm } from "@/components/waitlist-form"
import { AuthModal } from "@/components/auth-modal"

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-300 hover:scale-110"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export default function LandingPage() {
  const [showTop, setShowTop] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 200)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      {/* Hidden anchor for top */}
      <div id="top" className="absolute -top-40"></div>
      <PageLoader />
      <FloatingElements />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-teal-50 dark:from-gray-900 dark:via-purple-950 dark:to-teal-950 relative bg-pattern grid-bg">
        {/* Simplified geometric background - only 3 shapes */}
        <div className="geometric-bg">
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </div>

        {/* Add orb background */}
        <div className="orb-bg"></div>

        {/* Add floating circles */}
        {/* Header */}
        <header className="container mx-auto px-4 py-6 relative z-10 bg-transparent border-none shadow-none">
          <ScrollReveal direction="down" duration={800}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 group">
                <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <Image
                    src="/images/wisetale-logo.png"
                    alt="WiseTale Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-purple-700 group-hover:to-teal-700">
                  WiseTale
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button
                  variant="outline"
                  className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:-translate-y-1"
                  onClick={() => setAuthOpen(true)}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </header>

        {/* Hero Section */}
        <section id="home" className="container mx-auto px-4 py-16 text-center relative z-10">
          {/* Add subtle background pattern for hero */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/30 to-transparent dark:via-purple-900/10 rounded-3xl -z-10"></div>

          <ScrollReveal direction="up" delay={300}>
            <Badge className="mb-6 bg-purple-100 text-purple-700 hover:bg-purple-100 hover:scale-110 transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
              Making Learning Magical
            </Badge>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={500}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-sky-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
                Learn History as a
              </span>
              <br />
              <div className="relative inline-block">
                <span className="bg-gradient-to-r from-purple-700 via-pink-600 to-teal-700 bg-clip-text text-transparent font-extrabold animate-gradient">
                  Fairy Tale
                </span>
              </div>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={700}>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform complex humanities topics into engaging audio-visual stories. Make learning fun, memorable, and
              magical for students aged 10-18.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={900}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 group"
                onClick={() => window.location.href = 'http://localhost:3001'}
              >
                <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-125" />
                Start Learning Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-500 hover:scale-110 hover:shadow-lg hover:-translate-y-1 group"
                onClick={() => {
                  const videoElement = document.querySelector(".aspect-video")
                  videoElement?.scrollIntoView({ behavior: "smooth", block: "center" })
                }}
              >
                <Volume2 className="w-5 h-5 mr-2 transition-transform group-hover:scale-125" />
                Watch Demo
              </Button>
            </div>
          </ScrollReveal>

          {/* Hero Video Demo */}
          <ScrollReveal direction="up" delay={1100}>
            <div className="relative max-w-4xl mx-auto">
              <YouTubeEmbed
                videoId="bCpeV08GOdY"
                title="WiseTale Demo - Transform Learning into Magical Stories"
                className="hover:scale-105 transition-all duration-700 hover:shadow-3xl"
              />

              {/* Video description */}
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">See WiseTale in Action</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Watch how we transform complex history topics into engaging fairy tale stories
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="container mx-auto px-4 py-16 relative z-10 mt-16">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Learning Made Simple
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Transform any humanities topic into an engaging story in just three easy steps
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: BookOpen,
                title: "1. Choose Topic",
                desc: "Select any humanities subject - history, philosophy, geography, or literature",
                color: "purple",
                delay: 200,
              },
              {
                icon: Wand2,
                title: "2. Let AI Narrate",
                desc: "Our AI transforms complex topics into engaging, easy-to-understand fairy tales",
                color: "sky",
                delay: 400,
              },
              {
                icon: Play,
                title: "3. Watch & Listen",
                desc: "Enjoy beautiful animations with professional voiceover and interactive quizzes",
                color: "teal",
                delay: 600,
              },
            ].map((step, index) => (
              <ScrollReveal key={index} direction="up" delay={step.delay}>
                <Card className="text-center p-8 border-2 bg-white/80 dark:bg-gray-800/80 hover:scale-110 hover:shadow-2xl hover:-translate-y-4 group transition-all duration-700 h-full flex flex-col border-purple-100 dark:border-purple-800 hover:border-purple-200 dark:hover:border-purple-600">
                  <CardContent className="pt-6 flex-1 flex flex-col">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-125 transition-all duration-500 group-hover:rotate-12 group-hover:shadow-lg bg-gradient-to-r from-purple-500 to-purple-600">
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-100">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 flex-1">{step.desc}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-4 py-16 relative z-10 mt-16">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Magical Learning Features
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything you need to make humanities education engaging and memorable
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Headphones,
                title: "Professional Voiceover",
                desc: "High-quality AI narration brings stories to life with engaging character voices",
                color: "purple",
                delay: 100,
              },
              {
                icon: Sparkles,
                title: "Story-Style Learning",
                desc: "Complex topics explained through memorable narratives and characters",
                color: "sky",
                delay: 200,
              },
              {
                icon: Brain,
                title: "Interactive Quizzes",
                desc: "Test understanding with fun quizzes that reinforce key concepts",
                color: "teal",
                delay: 300,
              },
              {
                icon: Clock,
                title: "Perfect Length",
                desc: "3-5 minute stories designed for optimal attention spans and retention",
                color: "purple",
                delay: 400,
              },
              {
                icon: Users,
                title: "Multi-Age Appeal",
                desc: "Content that engages students, parents, and teachers alike",
                color: "sky",
                delay: 500,
              },
              {
                icon: CheckCircle,
                title: "Curriculum Aligned",
                desc: "Stories designed to complement school curricula and learning objectives",
                color: "teal",
                delay: 600,
              },
            ].map((feature, index) => (
              <ScrollReveal key={index} direction="up" delay={feature.delay}>
                <div
                  className={`flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-${feature.color}-100 dark:border-${feature.color}-800 hover:scale-105 hover:shadow-xl transition-all duration-700 group hover:-translate-y-2`}
                >
                  <div
                    className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-all duration-500 group-hover:rotate-12`}
                  >
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-4 py-16 relative z-10 mt-16">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Choose Your Learning Adventure
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Start free and unlock unlimited magical learning experiences
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <ScrollReveal direction="left" delay={200}>
              <Card className="relative p-8 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:-translate-y-4">
                <CardContent className="pt-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Free Explorer</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">$0</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Perfect for trying out WiseTale</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "3 stories per month",
                      "Basic history & geography",
                      "Standard quality audio",
                      "Simple quizzes",
                      "Mobile & web access",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Start Free
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Premium Plan */}
            <ScrollReveal direction="up" delay={400}>
              <Card className="relative p-8 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-950/50 dark:to-teal-950/50 border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-700 shadow-lg hover:scale-110 hover:shadow-2xl hover:-translate-y-4">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <Badge className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-1">
                    <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
                    Most Popular
                  </Badge>
                </div>
                <CardContent className="pt-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Premium Storyteller</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">
                        $9.99
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Unlimited learning adventures</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Unlimited stories",
                      "All subjects & topics",
                      "Premium HD audio & visuals",
                      "Interactive quizzes & games",
                      "Progress tracking",
                      "Offline downloads",
                      "Priority support",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-200 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-semibold transition-all duration-500 hover:scale-110 hover:shadow-lg hover:-translate-y-2">
                    Get Premium
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Family Plan */}
            <ScrollReveal direction="right" delay={600}>
              <Card className="relative p-8 bg-white/80 dark:bg-gray-800/80 border-2 border-teal-200 dark:border-teal-700 hover:border-teal-300 dark:hover:border-teal-600 transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:-translate-y-4">
                <CardContent className="pt-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Adventure</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-teal-600">$19.99</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">Perfect for families & homeschooling</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {[
                      "Everything in Premium",
                      "Up to 6 family profiles",
                      "Parental controls & reports",
                      "Age-appropriate content",
                      "Family learning goals",
                      "Homeschool curriculum guide",
                      "Priority family support",
                    ].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    className="w-full border-2 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Start Family Trial
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          {/* Additional Info */}
          <ScrollReveal direction="up" delay={800}>
            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">All plans include our 30-day money-back guarantee</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                {["Cancel anytime", "No setup fees", "Secure payments"].map((item, index) => (
                  <div key={index} className="flex items-center hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Testimonials/Story Preview */}
        <section id="testimonials" className="container mx-auto px-4 py-16 relative z-10 mt-16">
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                Stories That Inspire
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                See how WiseTale transforms learning experiences for students and educators
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Ms. Sarah Johnson",
                role: "8th Grade History Teacher",
                initials: "MS",
                quote:
                  "My students are actually excited about history class now! The Roman Empire story had them completely engaged.",
                color: "purple",
                delay: 200,
              },
              {
                name: "Dr. Robert Chen",
                role: "Philosophy Professor",
                initials: "DR",
                quote: "Finally, a way to make philosophy accessible to teenagers. The Socrates story was brilliant!",
                color: "sky",
                delay: 400,
              },
              {
                name: "Lisa Martinez",
                role: "Parent of 7th Grader",
                initials: "LM",
                quote: "My daughter went from hating geography to asking for more stories about different countries!",
                color: "teal",
                delay: 600,
              },
            ].map((testimonial, index) => (
              <ScrollReveal key={index} direction="up" delay={testimonial.delay}>
                <Card
                  className={`p-6 bg-white/80 dark:bg-gray-800/80 border border-${testimonial.color}-100 dark:border-${testimonial.color}-800 hover:scale-110 hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 group h-full`}
                >
                  <CardContent className="pt-0">
                    <div className="flex items-center mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current animate-pulse"
                          style={{ animationDelay: `${i * 100}ms` }}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{`"${testimonial.quote}"`}</p>
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 bg-${testimonial.color}-100 rounded-full flex items-center justify-center mr-3 group-hover:scale-125 transition-transform duration-300`}
                      >
                        <span className={`text-${testimonial.color}-600 font-semibold`}>{testimonial.initials}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{testimonial.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Early Access CTA */}
        <section className="container mx-auto px-4 py-16 relative z-10 mt-16">
          <ScrollReveal direction="up">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-purple-600 via-sky-600 to-teal-600 rounded-3xl p-12 text-white relative overflow-hidden hover:scale-105 transition-all duration-700 hover:shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Learning?</h2>
                  <p className="text-xl mb-8 opacity-90">
                    Join thousands of educators and students who are making learning magical with WiseTale
                  </p>

                  <div className="max-w-md mx-auto">
                    <WaitlistForm />
                    <p className="text-sm mt-4 opacity-80">Get early access and exclusive updates. No spam, ever.</p>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-75"></div>
                <div className="absolute top-1/2 left-8 w-8 h-8 bg-white/20 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-100 dark:border-purple-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-16 relative z-10">
          <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image src="/images/wisetale-logo.png" alt="WiseTale Logo" width={32} height={32} className="w-8 h-8" />
              <span className="font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent text-lg">WiseTale</span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-3">© 2025 WiseTale. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
      {/* Floating Back to Top Button */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-all"
          aria-label="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  )
}
