import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * GET /api/social-accounts/callback
 * Handle OAuth callback from Outstand after user authorizes
 * 
 * Query params: session_token, code, state, etc.
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
    const sessionToken = searchParams.get('session_token') || searchParams.get('session')
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!sessionToken && !code) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_params', request.url)
      )
    }

    // Finalize the connection using Outstand API
    // The exact endpoint depends on Outstand's API structure
    try {
      let accountData

      if (sessionToken) {
        // For session-based flow (e.g., Facebook)
        const finalizeResponse = await fetch(
          `${OUTSTAND_API_URL}/social-accounts/pending/${sessionToken}/finalize`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!finalizeResponse.ok) {
          const errorText = await finalizeResponse.text()
          console.error('Outstand finalize error:', errorText)
          return NextResponse.redirect(
            new URL('/dashboard/settings?error=finalize_failed', request.url)
          )
        }

        accountData = await finalizeResponse.json()
      } else if (code) {
        // For code-based OAuth flow
        // Exchange code for access token and get account info
        // This depends on Outstand's specific implementation
        return NextResponse.redirect(
          new URL('/dashboard/settings?error=code_flow_not_implemented', request.url)
        )
      }

      // Save connected account to database
      if (accountData && accountData.accounts) {
        const accounts = Array.isArray(accountData.accounts) 
          ? accountData.accounts 
          : [accountData.accounts]

        for (const account of accounts) {
          await supabase
            .from('social_accounts')
            .upsert({
              user_id: user.id,
              outstand_account_id: account.id || account.account_id,
              platform: account.platform || account.network,
              username: account.username || account.handle,
              name: account.name || account.display_name,
              is_active: true,
            }, {
              onConflict: 'user_id,outstand_account_id',
            })
        }
      }

      return NextResponse.redirect(
        new URL('/dashboard/settings?connected=success', request.url)
      )
    } catch (error: any) {
      console.error('Error finalizing connection:', error)
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
