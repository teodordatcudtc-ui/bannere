import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Simple in-memory rate limiting (for production, use Redis or similar)
const signupAttempts = new Map<string, { count: number; resetAt: number }>()

// Rate limit: 5 attempts per hour per IP
const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function getRateLimitKey(request: Request): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return `signup:${ip}`
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = signupAttempts.get(key)

  if (!record || now > record.resetAt) {
    // Reset or create new record
    signupAttempts.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    })
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_ATTEMPTS - 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    }
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_ATTEMPTS - record.count,
    resetAt: record.resetAt,
  }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of signupAttempts.entries()) {
    if (now > record.resetAt) {
      signupAttempts.delete(key)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes

/**
 * POST /api/auth/signup
 * Server-side signup with rate limiting and validation
 */
export async function POST(request: Request) {
  try {
    // Rate limiting check
    const rateLimitKey = getRateLimitKey(request)
    const rateLimit = checkRateLimit(rateLimitKey)

    if (!rateLimit.allowed) {
      const resetInMinutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60000)
      return NextResponse.json(
        {
          error: `Prea multe încercări. Te rugăm să aștepți ${resetInMinutes} minute înainte de a încerca din nou.`,
          rateLimit: {
            remaining: 0,
            resetAt: rateLimit.resetAt,
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_ATTEMPTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const body = await request.json()
    const { email, password, fullName } = body

    // Server-side validation
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

    if (!email || !EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return NextResponse.json(
        { error: 'Te rugăm să introduci un email valid' },
        { status: 400 }
      )
    }

    if (!password || !PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        { error: 'Parola trebuie să aibă cel puțin 8 caractere, o literă mare, o literă mică și o cifră' },
        { status: 400 }
      )
    }

    if (!fullName || fullName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Numele complet trebuie să aibă cel puțin 2 caractere' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 400,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_MAX_ATTEMPTS.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
          },
        }
      )
    }

    return NextResponse.json(
      { user: data.user, message: 'Account created successfully' },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': RATE_LIMIT_MAX_ATTEMPTS.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetAt.toString(),
        },
      }
    )
  } catch (error: any) {
    console.error('Error in signup API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account' },
      { status: 500 }
    )
  }
}
