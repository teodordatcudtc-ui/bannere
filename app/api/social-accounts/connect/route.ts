import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * POST /api/social-accounts/connect
 * Initiate OAuth connection flow for a social media platform
 * 
 * Body: { platform: 'x' | 'linkedin' | 'instagram' | 'tiktok' | 'facebook', redirectUri: string }
 */
export async function POST(request: Request) {
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

    const body = await request.json()
    const { platform, redirectUri } = body

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    // Map platform names
    const platformMap: Record<string, string> = {
      'facebook': 'facebook',
      'instagram': 'instagram',
      'linkedin': 'linkedin',
      'tiktok': 'tiktok',
      'twitter': 'x',
      'x': 'x',
      'threads': 'threads',
      'youtube': 'youtube',
    }

    const outstandPlatform = platformMap[platform.toLowerCase()] || platform

    // Get OAuth authorization URL from Outstand
    // Note: This endpoint may vary based on Outstand's actual API
    // You may need to check their docs for the exact endpoint
    try {
      const response = await fetch(
        `${OUTSTAND_API_URL}/social-networks/${outstandPlatform}/auth-url`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            redirect_uri: redirectUri || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?connected=true`,
            user_id: user.id, // Pass user ID for context
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Outstand auth URL error:', errorText)
        return NextResponse.json(
          { error: `Failed to get auth URL: ${errorText}` },
          { status: 500 }
        )
      }

      const data = await response.json()
      return NextResponse.json({
        authUrl: data.auth_url || data.url,
        sessionToken: data.session_token || data.session,
      })
    } catch (error: any) {
      console.error('Error getting auth URL:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to initiate connection' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error connecting social account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to connect account' },
      { status: 500 }
    )
  }
}
