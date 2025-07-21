"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import Image from "next/image"
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
  Wand2,
  Volume2,
  Brain,
  Menu,
  X,
} from "lucide-react"
import { YouTubeEmbed } from "@/components/youtube-embed"
import { useLanguage } from "@/hooks/use-language"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ScrollReveal } from "@/components/scroll-reveal"
import FeedbackForm from "@/components/feedback-form"

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
  const { t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <FloatingElements />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-purple-50 to-teal-50 dark:from-gray-900 dark:via-purple-950 dark:to-teal-950 relative">
        <div className="absolute inset-0 bg-pattern grid-bg -z-10 overflow-hidden">
          <div className="geometric-bg">
            <div className="shape"></div>
            <div className="shape"></div>
            <div className="shape"></div>
          </div>
          <div className="orb-bg"></div>
        </div>

        <header className="container mx-auto px-4 py-6 relative z-10">
          <ScrollReveal direction="down" duration={800}>
            <nav className="flex items-center justify-between">
              <div className="flex items-center space-x-3 group">
                <div className="transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <Image
                    src="/wisetale-logo.png"
                    alt="Wizetale Logo"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-purple-700 group-hover:to-teal-700">
                  Wizetale
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                {[
                  { name: t.features, href: "#features" },
                  { name: t.pricing, href: "#pricing" },
                  { name: t.howItWorks, href: "#how-it-works" },
                  { name: t.stories, href: "#testimonials" },
                ].map((item, index) => (
                  <ScrollReveal key={item.name} direction="down" delay={index * 100 + 200}>
                    <a
                      href={item.href}
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1 relative group"
                    >
                      {item.name}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-teal-600 transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </ScrollReveal>
                ))}
                <ScrollReveal direction="down" delay={500}>
                  <LanguageSwitcher />
                </ScrollReveal>
                <ScrollReveal direction="down" delay={600}>
                  <ThemeToggle />
                </ScrollReveal>
                <ScrollReveal direction="down" delay={700}>
                  <Link href="/register">
                    <Button
                      variant="outline"
                      className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:-translate-y-1"
                    >
                      {t.signIn}
                    </Button>
                  </Link>
                </ScrollReveal>
              </div>
              <div className="md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </div>
            </nav>
            {isMenuOpen && (
              <div className="md:hidden mt-4 bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg shadow-lg">
                <div className="flex flex-col space-y-4">
                  {[
                    { name: t.features, href: "#features" },
                    { name: t.pricing, href: "#pricing" },
                    { name: t.howItWorks, href: "#how-it-works" },
                    { name: t.stories, href: "#testimonials" },
                  ].map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                  ))}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                  <Link href="/register" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t.signIn}
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </ScrollReveal>
        </header>

        <section className="container mx-auto px-4 py-16 text-center relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50/30 to-transparent dark:via-purple-900/10 rounded-3xl -z-10"></div>
          <ScrollReveal direction="up" delay={300}>
            <Badge className="mb-6 bg-purple-100 text-purple-700 hover:bg-purple-100 hover:scale-110 transition-all duration-300">
              <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
              {t.heroBadge}
            </Badge>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={500}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-sky-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
                {t.heroTitle1}
              </span>
              <br />
              <span className="relative">
                <span className="bg-gradient-to-r from-purple-700 via-pink-600 to-teal-700 bg-clip-text text-transparent font-extrabold animate-gradient">
                  {t.heroTitle2}
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-purple-300 via-pink-300 to-teal-300 dark:from-purple-400 dark:via-pink-400 dark:to-teal-400 rounded-full opacity-40 -z-10 animate-pulse"></div>
                <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-purple-200 via-pink-200 to-teal-200 dark:from-purple-300 dark:via-pink-300 dark:to-teal-300 rounded-full opacity-60 -z-10 animate-pulse delay-150"></div>
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={700}>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t.heroSubtitle}
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={900}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-110 hover:-translate-y-2 group"
                >
                  <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-125" />
                  {t.heroButton1}
                </Button>
              </Link>
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
                {t.heroButton2}
              </Button>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={1100}>
            <div className="relative max-w-4xl mx-auto">
              <YouTubeEmbed
                videoId="TP01eYjFcxU"
                title="Wizetale Demo - Transform Learning into Magical Stories"
                className="hover:scale-105 transition-all duration-700 hover:shadow-3xl"
              />
              <div className="mt-6 text-center">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{t.heroVideoTitle}</p>
                <p className="text-gray-600 dark:text-gray-300">{t.heroVideoSubtitle}</p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section id="how-it-works" className="container mx-auto px-4 py-16 relative z-10" style={{ scrollMarginTop: "100px" }}>
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t.hiwTitle}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.hiwSubtitle}</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: BookOpen, title: t.hiwStep1Title, desc: t.hiwStep1Desc, delay: 200 },
              { icon: Wand2, title: t.hiwStep2Title, desc: t.hiwStep2Desc, delay: 400 },
              { icon: Play, title: t.hiwStep3Title, desc: t.hiwStep3Desc, delay: 600 },
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

        <section id="features" className="container mx-auto px-4 py-16 relative z-10" style={{ scrollMarginTop: "100px" }}>
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t.featuresTitle}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.featuresSubtitle}</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Headphones, title: t.feature1Title, desc: t.feature1Desc, color: "purple", delay: 100 },
              { icon: Sparkles, title: t.feature2Title, desc: t.feature2Desc, color: "sky", delay: 200 },
              { icon: Brain, title: t.feature3Title, desc: t.feature3Desc, color: "teal", delay: 300 },
              { icon: Clock, title: t.feature4Title, desc: t.feature4Desc, color: "purple", delay: 400 },
              { icon: Users, title: t.feature5Title, desc: t.feature5Desc, color: "sky", delay: 500 },
              { icon: CheckCircle, title: t.feature6Title, desc: t.feature6Desc, color: "teal", delay: 600 },
            ].map((feature, index) => (
              <ScrollReveal key={index} direction="up" delay={feature.delay}>
                <div className={`flex items-start space-x-4 p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl border border-${feature.color}-100 dark:border-${feature.color}-800 hover:scale-105 hover:shadow-xl transition-all duration-700 group hover:-translate-y-2`}>
                  <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-125 transition-all duration-500 group-hover:rotate-12`}>
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

        <section id="pricing" className="container mx-auto px-4 py-16 relative z-10" style={{ scrollMarginTop: "100px" }}>
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t.pricingTitle}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.pricingSubtitle}</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <ScrollReveal direction="left" delay={200}>
              <Card className="relative p-8 bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:-translate-y-4">
                <CardContent className="pt-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t.pricingFreeTitle}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">{t.pricingFreePrice}</span>
                      <span className="text-gray-500 dark:text-gray-400">/month</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{t.pricingFreeDesc}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[t.pricingFreeFeature1, t.pricingFreeFeature2, t.pricingFreeFeature3, t.pricingFreeFeature4, t.pricingFreeFeature5].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button variant="outline" className="w-full border-2 border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      {t.pricingFreeButton}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={400}>
              <Card className="relative p-8 bg-gradient-to-br from-purple-50 to-teal-50 dark:from-purple-950/50 dark:to-teal-950/50 border-2 border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-700 shadow-lg hover:scale-110 hover:shadow-2xl hover:-translate-y-4">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 animate-bounce">
                  <Badge className="bg-gradient-to-r from-purple-600 to-teal-600 text-white px-4 py-1">
                    <Sparkles className="w-4 h-4 mr-1 animate-pulse" />
                    {t.pricingPopularBadge}
                  </Badge>
                </div>
                <CardContent className="pt-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t.pricingPremiumTitle}</h3>
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Badge className="bg-red-500 text-white px-2 py-1 text-xs">
                          {t.pricingDiscountBadge}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl line-through text-gray-400">{t.pricingOriginalPrice}</span>
                        <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">{t.pricingPremiumPrice}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.pricingDiscountText}</p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{t.pricingPremiumDesc}</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {[t.pricingPremiumFeature1, t.pricingPremiumFeature2, t.pricingPremiumFeature3, t.pricingPremiumFeature4, t.pricingPremiumFeature5, t.pricingPremiumFeature6, t.pricingPremiumFeature7].map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-purple-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-200 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700 text-white font-semibold transition-all duration-500 hover:scale-110 hover:shadow-lg hover:-translate-y-2">
                      {t.pricingPremiumButton}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </ScrollReveal>

          </div>
          <ScrollReveal direction="up" delay={800}>
            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t.pricingMoneyBack}</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                {[t.pricingGuarantee1, t.pricingGuarantee2, t.pricingGuarantee3].map((item, index) => (
                  <div key={index} className="flex items-center hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

        </section>

        <section id="testimonials" className="container mx-auto px-4 py-16 relative z-10" style={{ scrollMarginTop: "100px" }}>
          <ScrollReveal direction="up">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t.testimonialsTitle}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t.testimonialsSubtitle}</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* helper to safely build initials even if translation missing */}
            {[
              { name: t.testimonial1Name, role: t.testimonial1Role, quote: t.testimonial1Quote, color: "purple", delay: 200 },
              { name: t.testimonial2Name, role: t.testimonial2Role, quote: t.testimonial2Quote, color: "sky", delay: 400 },
              { name: t.testimonial3Name, role: t.testimonial3Role, quote: t.testimonial3Quote, color: "teal", delay: 600 },
            ].map((raw, index) => {
              const initials = (raw.name ?? "").split(" ").map((n) => n[0] ?? "").join("");
              const testimonial = { ...raw, initials } as typeof raw & { initials: string };
              return (
                <ScrollReveal key={index} direction="up" delay={testimonial.delay}>
                  <Card className={`p-6 bg-white/80 dark:bg-gray-800/80 border border-${testimonial.color}-100 dark:border-${testimonial.color}-800 hover:scale-110 hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 group h-full`}>
                    <CardContent className="pt-0">
                      <div className="flex items-center mb-4">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />)}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{`"${testimonial.quote}"`}</p>
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-${testimonial.color}-100 rounded-full flex items-center justify-center mr-3 group-hover:scale-125 transition-transform duration-300`}>
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
              )
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 relative z-10">
          <ScrollReveal direction="up">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t.ctaTitle}</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t.ctaSubtitle}</p>
            </div>
            <FeedbackForm />
          </ScrollReveal>
        </section>

        <footer className="container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700 relative z-10">
          <ScrollReveal direction="up">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4 group">
                  <div className="transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">
                    <Image src="/wisetale-logo.png" alt="Wizetale Logo" width={32} height={32} className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">Wizetale</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{t.footerSlogan}</p>
              </div>
              {[
                { title: t.footerProductTitle, links: [t.footerProductLink1, t.footerProductLink2, t.footerProductLink3, t.footerProductLink4] },
                { title: t.footerEducatorsTitle, links: [t.footerEducatorsLink1, t.footerEducatorsLink2, t.footerEducatorsLink3, t.footerEducatorsLink4] },
                { title: t.footerSupportTitle, links: [t.footerSupportLink1, t.footerSupportLink2, t.footerSupportLink3, t.footerSupportLink4] },
              ].map((section, index) => (
                <div key={index}>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">{section.title}</h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a href="#" className="hover:text-purple-600 transition-all duration-300 hover:translate-x-2 hover:scale-105">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-300">
              <p>{t.footerCopyright}</p>
            </div>
          </ScrollReveal>
        </footer>
      </div>
    </>
  )
}
