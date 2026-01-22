import { NextRequest, NextResponse } from 'next/server'
import { detectLocaleFromRequest } from '@/lib/i18n/geolocation'

export async function GET(request: NextRequest) {
  try {
    // Try to get country from headers first
    let country = request.headers.get('x-vercel-ip-country') ||
                  request.headers.get('cf-ipcountry') ||
                  request.headers.get('x-country-code')

    // If no country header, try to detect from IP using a free service
    if (!country) {
      try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   'unknown'
        
        // Use ipapi.co free service (no API key needed for basic country detection)
        if (ip !== 'unknown' && !ip.startsWith('127.') && !ip.startsWith('192.168.')) {
          const response = await fetch(`https://ipapi.co/${ip}/country_code/`, {
            headers: {
              'User-Agent': 'Bannerly/1.0'
            }
          })
          
          if (response.ok) {
            const countryCode = await response.text()
            if (countryCode && countryCode.length === 2) {
              country = countryCode.trim()
            }
          }
        }
      } catch (error) {
        console.error('Error detecting country from IP:', error)
      }
    }

    // Determine locale based on country
    const locale = country === 'RO' ? 'ro' : 'en'

    return NextResponse.json({ 
      locale,
      country: country || 'unknown'
    })
  } catch (error) {
    console.error('Error in detect-locale:', error)
    // Default to English on error
    return NextResponse.json({ locale: 'en', country: 'unknown' })
  }
}
