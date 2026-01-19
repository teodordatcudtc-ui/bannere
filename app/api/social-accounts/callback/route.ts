import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * GET /api/social-accounts/callback
 * Handle OAuth callback from Outstand after user authorizes Facebook
 * 
 * Flow:
 * 1. User authorizes on Facebook
 * 2. Facebook redirects here with session token
 * 3. We fetch available pages using GET /v1/social-accounts/pending/:session
 * 4. Redirect to selection page where user chooses which pages to connect
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        new URL('/auth/login?error=unauthorized', request.url)
      )
    }

    if (!OUTSTAND_API_KEY) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=config', request.url)
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('session') || searchParams.get('session_token')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=oauth_${error}`, request.url)
      )
    }

    if (!sessionToken) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_session', request.url)
      )
    }

    // Step 1: Get available pages/accounts from Outstand
    // GET /v1/social-accounts/pending/:session
    try {
      const pendingResponse = await fetch(
        `${OUTSTAND_API_URL}/social-accounts/pending/${sessionToken}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!pendingResponse.ok) {
        const errorText = await pendingResponse.text()
        console.error('Outstand pending accounts error:', errorText)
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=failed_to_fetch_pages', request.url)
        )
      }

      const pendingData = await pendingResponse.json()
      const availableAccounts = pendingData.accounts || pendingData.pages || []

      // If no accounts available, redirect with error
      if (!availableAccounts || availableAccounts.length === 0) {
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=no_pages_available', request.url)
        )
      }

      // If only one account, auto-connect it
      if (availableAccounts.length === 1) {
        return await finalizeConnection(supabase, user.id, sessionToken, [availableAccounts[0].id], request.url)
      }

      // Multiple accounts - redirect to selection page
      const baseUrl = new URL(request.url)
      const selectionUrl = new URL('/dashboard/settings/select-pages', baseUrl.origin)
      selectionUrl.searchParams.set('session', sessionToken)
      selectionUrl.searchParams.set('platform', pendingData.platform || 'facebook')
      
      return NextResponse.redirect(selectionUrl.toString())
    } catch (error: any) {
      console.error('Error fetching pending accounts:', error)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=connection_failed', request.url)
      )
    }
  } catch (error: any) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=callback_error', request.url)
    )
  }
}

/**
 * Finalize the connection by calling Outstand API
 */
async function finalizeConnection(
  supabase: any,
  userId: string,
  sessionToken: string,
  accountIds: string[],
  baseUrl: string
) {
  const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
  const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

  try {
    // POST /v1/social-accounts/pending/:session/finalize
    const finalizeResponse = await fetch(
      `${OUTSTAND_API_URL}/social-accounts/pending/${sessionToken}/finalize`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account_ids: accountIds,
        }),
      }
    )

    if (!finalizeResponse.ok) {
      const errorText = await finalizeResponse.text()
      console.error('Outstand finalize error:', errorText)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=finalize_failed', baseUrl)
      )
    }

    const accountData = await finalizeResponse.json()
    const accounts = accountData.accounts || []

    // Save connected accounts to database
    for (const account of accounts) {
      await supabase
        .from('social_accounts')
        .upsert({
          user_id: userId,
          outstand_account_id: account.id || account.account_id,
          platform: account.platform || account.network || 'facebook',
          username: account.username || account.handle || account.name,
          name: account.name || account.display_name || account.username,
          is_active: true,
        }, {
          onConflict: 'user_id,outstand_account_id',
        })
    }

    return NextResponse.redirect(
      new URL('/dashboard/settings?connected=success', baseUrl)
    )
  } catch (error: any) {
    console.error('Error finalizing connection:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=finalize_error', baseUrl)
    )
  }
}
