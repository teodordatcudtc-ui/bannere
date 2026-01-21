'use client'

import { useEffect } from 'react'
import { useI18n } from '@/lib/i18n/context'
import { Locale } from '@/lib/i18n'

export function LocaleDetector() {
  const { setLocale } = useI18n()

  useEffect(() => {
    // Check if we need to detect locale from API
    // This runs on client side to detect locale even when headers aren't available
    const detectLocale = async () => {
      try {
        const response = await fetch('/api/detect-locale')
        if (response.ok) {
          const data = await response.json()
          if (data.locale && (data.locale === 'ro' || data.locale === 'en')) {
            setLocale(data.locale as Locale)
            // Also update cookie
            document.cookie = `NEXT_LOCALE=${data.locale}; path=/; max-age=31536000`
          }
        }
      } catch (error) {
        console.error('Error detecting locale:', error)
      }
    }

    // Only detect if no cookie is set or if we want to re-detect
    const cookieLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]

    // Re-detect on mount to handle VPN changes
    // But debounce it a bit to avoid too many requests
    const timer = setTimeout(() => {
      detectLocale()
    }, 1000)

    return () => clearTimeout(timer)
  }, [setLocale])

  return null
}
