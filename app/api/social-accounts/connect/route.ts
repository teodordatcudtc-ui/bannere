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
      console.error('OUTSTAND_API_KEY is missing. Check environment variables.')
      return NextResponse.json(
        { 
          error: 'OUTSTAND_API_KEY is not configured',
          hint: 'Make sure OUTSTAND_API_KEY is set in your .env.local file (without spaces around =) and restart the dev server'
        },
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
    // Outstand API: POST /v1/social-networks/:network/auth-url
    const callbackUrl = redirectUri || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/social-accounts/callback`
    
    console.log('Requesting auth URL from Outstand:', {
      platform: outstandPlatform,
      callbackUrl,
      apiUrl: `${OUTSTAND_API_URL}/social-networks/${outstandPlatform}/auth-url`,
      hasApiKey: !!OUTSTAND_API_KEY,
    })
    
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
            redirect_uri: callbackUrl,
          }),
        }
      )
      
      console.log('Outstand response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Outstand auth URL error:', errorText)
        let errorMessage = 'Failed to get auth URL'
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
      console.log('Outstand auth URL response (full):', JSON.stringify(data, null, 2))
      
      // Outstand API returns: { success: true, data: { authUrl: "...", session: "..." } }
      // Or sometimes: { url: "...", session: "..." }
      const responseData = data.data || data
      
      // Check authUrl first (most common in Outstand docs: data.data.authUrl)
      // Also check for common variations - try all possible locations
      const authUrl = (data.data && data.data.authUrl) ||
                     (data.data && data.data.url) ||
                     responseData.authUrl ||
                     responseData.auth_url || 
                     responseData.url || 
                     responseData.authorization_url ||
                     responseData.redirect_url ||
                     responseData.oauth_url ||
                     data.authUrl ||
                     data.auth_url ||
                     data.url
      
      const sessionToken = responseData.session || 
                          responseData.session_token || 
                          responseData.sessionToken ||
                          responseData.session_id ||
                          data.session ||
                          data.session_token
      
      if (!authUrl) {
        console.error('No auth URL in Outstand response. Full response:', JSON.stringify(data, null, 2))
        console.error('Response keys:', Object.keys(data))
        if (data.data) {
          console.error('Data keys:', Object.keys(data.data))
        }
        return NextResponse.json(
          { 
            error: 'No authorization URL received from Outstand',
            details: data,
            hint: `Check Outstand API documentation. Response keys: ${Object.keys(data).join(', ')}. If response has 'data' object, keys: ${data.data ? Object.keys(data.data).join(', ') : 'N/A'}`
          },
          { status: 500 }
        )
      }
      
      console.log('✅ Extracted authUrl:', authUrl)
      console.log('✅ Extracted sessionToken:', sessionToken)
      
      return NextResponse.json({
        authUrl,
        sessionToken,
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
