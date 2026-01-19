import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * POST /api/social-accounts/finalize
 * Finalize the connection of selected social media accounts
 * 
 * Body: { session: string, accountIds: string[] }
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
    const { session: sessionToken, accountIds } = body

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      )
    }

    if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one account ID is required' },
        { status: 400 }
      )
    }

    // POST /v1/social-accounts/pending/:session/finalize
    const response = await fetch(
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Outstand finalize error:', errorText)
      let errorMessage = 'Failed to finalize connection'
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

    const accountData = await response.json()
    const accounts = accountData.accounts || []

    // Save connected accounts to database
    for (const account of accounts) {
      await supabase
        .from('social_accounts')
        .upsert({
          user_id: user.id,
          outstand_account_id: account.id || account.account_id,
          platform: account.platform || account.network || 'facebook',
          username: account.username || account.handle || account.name,
          name: account.name || account.display_name || account.username,
          is_active: true,
        }, {
          onConflict: 'user_id,outstand_account_id',
        })
    }

    return NextResponse.json({
      success: true,
      accounts: accounts.map((acc: any) => ({
        id: acc.id || acc.account_id,
        platform: acc.platform || acc.network,
        name: acc.name || acc.display_name,
        username: acc.username || acc.handle,
      })),
    })
  } catch (error: any) {
    console.error('Error finalizing connection:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to finalize connection' },
      { status: 500 }
    )
  }
}
