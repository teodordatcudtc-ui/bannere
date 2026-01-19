import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * GET /api/social-accounts/pending
 * Get pending accounts/pages available for connection
 * 
 * Query params: session (session token from OAuth callback)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!OUTSTAND_API_KEY) {
      return NextResponse.json(
        { error: 'OUTSTAND_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('session')

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    // GET /v1/social-accounts/pending/:session
    const response = await fetch(
      `${OUTSTAND_API_URL}/social-accounts/pending/${sessionToken}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Outstand pending accounts error:', errorText)
      let errorMessage = 'Failed to fetch pending accounts'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      accounts: data.accounts || data.pages || [],
      platform: data.platform || 'facebook',
    })
  } catch (error: any) {
    console.error('Error fetching pending accounts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending accounts' },
      { status: 500 }
    )
  }
}
