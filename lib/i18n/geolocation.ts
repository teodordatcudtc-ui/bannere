import { NextRequest } from 'next/server'
import { Locale } from './index'

/**
 * Detects user's country from request headers
 * Uses Vercel's geolocation headers if available, otherwise falls back to Accept-Language
 */
export function detectLocaleFromRequest(request: NextRequest): { locale: Locale; shouldUpdate: boolean } {
  // Try to get country from geolocation headers
  // Vercel provides: x-vercel-ip-country
  // Cloudflare provides: cf-ipcountry
  // Other providers might use: x-country-code
  const country = request.headers.get('x-vercel-ip-country') ||
                  request.headers.get('cf-ipcountry') ||
                  request.headers.get('x-country-code') ||
                  null

  // Determine locale based on country
  let detectedLocale: Locale = 'en'
  
  if (country === 'RO') {
    detectedLocale = 'ro'
  } else if (country) {
    // If we have a country but it's not RO, use English
    detectedLocale = 'en'
  } else {
    // No country header available, try Accept-Language header as fallback
    const acceptLanguage = request.headers.get('accept-language')
    if (acceptLanguage && acceptLanguage.toLowerCase().includes('ro')) {
      detectedLocale = 'ro'
    }
  }

  // Check if locale is already set in cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value as Locale | undefined
  
  // Always check if we should update (in case country changed via VPN)
  // But only update if we have a valid country detection
  if (cookieLocale === 'ro' || cookieLocale === 'en') {
    // If we detected a country and it differs from cookie, update it
    // If no country detected, keep the cookie
    const shouldUpdate = country !== null && cookieLocale !== detectedLocale
    return { locale: shouldUpdate ? detectedLocale : cookieLocale, shouldUpdate }
  }

  // No cookie or invalid cookie, use detected locale
  return { locale: detectedLocale, shouldUpdate: true }
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
