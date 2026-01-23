import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * DELETE /api/social-accounts/disconnect
 * Disconnect a social account - delete from Supabase and disconnect from Outstand
 * 
 * Body: { accountId: string, platform: string }
 */
export async function DELETE(request: Request) {
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
    const { accountId, platform } = body

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      )
    }

    // Get account from database to get outstand_account_id
    const { data: account, error: accountError } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('id', accountId)
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      )
    }

    // Try to disconnect account from Outstand first (before deleting from Supabase)
    // This ensures we clean up Outstand if possible
    let outstandDisconnected = false
    if (account.outstand_account_id) {
      try {
        // Try to disconnect/delete account from Outstand
        // Endpoint: DELETE /v1/social-accounts/{accountId}
        const disconnectResponse = await fetch(
          `${OUTSTAND_API_URL}/social-accounts/${account.outstand_account_id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (disconnectResponse.ok) {
          outstandDisconnected = true
          console.log('Account disconnected from Outstand successfully')
        } else {
          const errorText = await disconnectResponse.text()
          console.log('Outstand account disconnect response:', disconnectResponse.status, errorText)
          // Continue anyway - we'll still delete from Supabase
        }
      } catch (error: any) {
        console.log('Error disconnecting from Outstand (endpoint may not exist):', error.message)
        // Continue anyway - we'll still delete from Supabase
      }
    }

    // Delete account from Supabase (permanent delete, not just is_active = false)
    const { error: deleteError } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', accountId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting account from Supabase:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete account from database', details: deleteError },
        { status: 500 }
      )
    }

    console.log('Account deleted from Supabase successfully')
    
    // For TikTok, we also need to clear any potential OAuth session
    // This helps ensure that when user reconnects, they can choose a different account
    // Note: We can't directly clear TikTok cookies from server-side,
    // but deleting the account from our DB and Outstand should help

    return NextResponse.json({
      success: true,
      message: 'Account disconnected successfully',
    })
  } catch (error: any) {
    console.error('Error disconnecting account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect account' },
      { status: 500 }
    )
  }
}
