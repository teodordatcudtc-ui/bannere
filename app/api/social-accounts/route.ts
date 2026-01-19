import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getConnectedAccounts } from '@/lib/social-media'

/**
 * GET /api/social-accounts
 * Get user's connected social media accounts
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get accounts from Outstand API
    const outstandResult = await getConnectedAccounts()

    if (!outstandResult.success) {
      return NextResponse.json(
        { error: outstandResult.error || 'Failed to fetch accounts' },
        { status: 500 }
      )
    }

    // Also get accounts from our database (for sync)
    const { data: dbAccounts } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    return NextResponse.json({
      accounts: outstandResult.accounts || [],
      dbAccounts: dbAccounts || [],
    })
  } catch (error: any) {
    console.error('Error fetching social accounts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}
