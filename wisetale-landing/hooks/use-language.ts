'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { Language, getTranslation, Translations } from '@/lib/i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const useLanguageState = () => {
  const [language, setLanguageState] = useState<Language>('en')

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('wisetale_language', lang)
  }

  useEffect(() => {
    const savedLanguage = localStorage.getItem('wisetale_language') as Language
    if (savedLanguage && ['en', 'ru'].includes(savedLanguage)) {
      setLanguageState(savedLanguage)
    } else {
      // Определяем язык браузера
      const browserLang = navigator.language.slice(0, 2)
      if (browserLang === 'ru') {
        setLanguageState('ru')
      } else {
        setLanguageState('en')
      }
    }
  }, [])

  const t = getTranslation(language)

  return { language, setLanguage, t }
} 