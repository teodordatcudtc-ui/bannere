import { NextRequest } from 'next/server'
import { Locale } from './index'

/**
 * Detects user's country from request headers
 * Uses Vercel's geolocation headers if available, otherwise falls back to Accept-Language
 */
export function detectLocaleFromRequest(request: NextRequest): Locale {
  // Check if locale is already set in cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale === 'ro' || cookieLocale === 'en') {
    return cookieLocale
  }

  // Try to get country from geolocation headers
  // Vercel provides: x-vercel-ip-country
  // Cloudflare provides: cf-ipcountry
  // Other providers might use: x-country-code
  const country = request.headers.get('x-vercel-ip-country') ||
                  request.headers.get('cf-ipcountry') ||
                  request.headers.get('x-country-code') ||
                  null

  // If country is Romania, return Romanian
  if (country === 'RO') {
    return 'ro'
  }

  // Try Accept-Language header as fallback
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    // Check if Romanian is preferred
    if (acceptLanguage.toLowerCase().includes('ro')) {
      return 'ro'
    }
  }

  // Default to English for all other countries
  return 'en'
}

/**
 * Gets user's country code from request
 */
export function getCountryFromRequest(request: NextRequest): string | null {
  return request.headers.get('x-vercel-ip-country') ||
         request.headers.get('cf-ipcountry') ||
         request.headers.get('x-country-code') ||
         null
}
