import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/social-accounts/check
 * Check what accounts are saved in the database for debugging
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all accounts for this user
    const { data: accounts, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching accounts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch accounts', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      userId: user.id,
      totalAccounts: accounts?.length || 0,
      activeAccounts: accounts?.filter(a => a.is_active).length || 0,
      accounts: accounts || [],
    })
  } catch (error: any) {
    console.error('Error checking accounts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check accounts' },
      { status: 500 }
    )
  }
}
