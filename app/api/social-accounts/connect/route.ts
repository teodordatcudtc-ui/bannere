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
    
    // For TikTok, we'll handle callback differently
    // Instead of popup=true, we'll redirect callback to parent window
    // This ensures cookies are shared and user is detected
    const finalCallbackUrl = callbackUrl
    
    // Prepare request body - for TikTok, we want to force re-authentication
    const requestBody: any = {
      redirect_uri: finalCallbackUrl,
    }
    
    // For TikTok, add parameters to force account selection
    // Outstand may support additional parameters to pass to TikTok OAuth
    if (outstandPlatform === 'tiktok') {
      // Add a unique state to make each request unique
      // This helps prevent TikTok from using cached session
      requestBody.state = `tiktok_new_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      // Try to pass provider-specific parameters to Outstand
      // These might be forwarded to TikTok OAuth endpoint
      // Note: Outstand may or may not support these, but we try
      requestBody.provider_prompt = 'select_account'
      requestBody.force_account_selection = true
      requestBody.force_login = true
    }
    
    console.log('Requesting auth URL from Outstand:', {
      platform: outstandPlatform,
      callbackUrl,
      apiUrl: `${OUTSTAND_API_URL}/social-networks/${outstandPlatform}/auth-url`,
      hasApiKey: !!OUTSTAND_API_KEY,
      requestBody,
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
          body: JSON.stringify(requestBody),
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
      let authUrl = (data.data && data.data.authUrl) ||
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
      
      // For TikTok, modify the OAuth URL to force account selection and re-authentication
      // Use max_age=0 to force fresh authentication every time (OAuth standard)
      // Also add prompt=login and provider-specific parameters
      if (outstandPlatform === 'tiktok') {
        try {
          const url = new URL(authUrl)
          
          // CRITICAL: Replace the state parameter completely with a new one
          // TikTok uses state to track sessions, so a new state = new session
          const newState = `tiktok_reauth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 10)}`
          url.searchParams.set('state', newState)
          
          // CRITICAL: max_age=0 forces re-authentication every time (OAuth/OIDC standard)
          // This is the recommended way to force fresh login
          url.searchParams.set('max_age', '0')
          url.searchParams.set('provider_max_age', '0')
          
          // Also add prompt parameters (may help as UX hint)
          url.searchParams.set('prompt', 'login')
          url.searchParams.set('provider_prompt', 'login')
          
          // Add select_account to force account selection
          url.searchParams.set('provider_prompt', 'select_account login')
          
          // Additional parameters that might help
          url.searchParams.set('force_login', 'true')
          url.searchParams.set('reauthenticate', '1')
          
          // Add a unique nonce/timestamp to make URL completely unique
          // This prevents any caching at any level
          url.searchParams.set('nonce', `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`)
          url.searchParams.set('_', Date.now().toString())
          url.searchParams.set('_r', Math.random().toString(36).substring(2, 15))
          url.searchParams.set('_force_new_session', '1')
          
          authUrl = url.toString()
          console.log('✅ Modified TikTok auth URL to force account selection')
          console.log('✅ New state parameter:', newState)
          console.log('✅ Added parameters: max_age=0, provider_max_age=0, prompt=login, provider_prompt=select_account login')
          console.log('✅ Full modified URL (first 250 chars):', authUrl.substring(0, 250))
        } catch (urlError: any) {
          console.warn('Could not modify auth URL:', urlError.message)
          // If URL parsing fails, append parameters manually
          const separator = authUrl.includes('?') ? '&' : '?'
          const newState = `tiktok_reauth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
          authUrl = `${authUrl}${separator}state=${encodeURIComponent(newState)}&max_age=0&provider_max_age=0&prompt=login&provider_prompt=select_account+login&_=${Date.now()}`
        }
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
