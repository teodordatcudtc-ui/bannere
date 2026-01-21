import roTranslations from './translations/ro.json'
import enTranslations from './translations/en.json'

export type Locale = 'ro' | 'en'

export const locales: Locale[] = ['ro', 'en']
export const defaultLocale: Locale = 'en'

export const translations = {
  ro: roTranslations,
  en: enTranslations,
} as const

// Helper function to get nested translation
export function getTranslation(translations: any, key: string): string {
  const keys = key.split('.')
  let value: any = translations
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key
}

// Type-safe translation function
export function t(locale: Locale, key: string): string {
  const translation = translations[locale]
  return getTranslation(translation, key)
}
