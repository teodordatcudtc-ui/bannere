import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { detectLocaleFromRequest } from './lib/i18n/geolocation'
import { Locale } from './lib/i18n'

export async function middleware(request: NextRequest) {
  // Detect locale from geolocation
  const { locale, shouldUpdate } = detectLocaleFromRequest(request)
  
  // Create response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Set or update locale cookie if needed
  if (shouldUpdate || !request.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
  }

  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, skip auth checks and let the request through
  // The pages themselves will handle the error gracefully
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }

    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith('/auth')) {
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  } catch (error) {
    // If auth check fails, log error but don't block the request
    // This allows the app to work even if Supabase is temporarily unavailable
    console.error('Middleware auth error:', error)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
