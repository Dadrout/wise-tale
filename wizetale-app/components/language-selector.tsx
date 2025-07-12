'use client'

import { Languages, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLanguage } from '@/hooks/use-language'
import { Language } from '@/lib/i18n'

interface LanguageOption {
  code: Language
  nameKey: 'english' | 'russian'
  flag: string
}

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()

  const languageOptions: LanguageOption[] = [
    { code: 'en', nameKey: 'english', flag: '🇺🇸' },
    { code: 'ru', nameKey: 'russian', flag: '🇷🇺' },
  ]
  
  const currentLanguage = languageOptions.find(lang => lang.code === language)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.flag}</span>
          <span className="hidden md:inline">{currentLanguage ? t[currentLanguage.nameKey] : ''}</span>
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`flex items-center gap-2 cursor-pointer ${
              language === lang.code ? 'bg-accent' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span>{t[lang.nameKey]}</span>
            {language === lang.code && (
              <div className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
