import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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
    console.log('🟢 Outstand finalize response:', JSON.stringify(accountData, null, 2))
    console.log('🟢 Response keys:', Object.keys(accountData))
    console.log('🟢 accountData.accounts:', accountData.accounts)
    console.log('🟢 accountData.data?.accounts:', accountData.data?.accounts)
    console.log('🟢 accountData.data:', accountData.data)
    
    // Try multiple possible response formats
    let accounts = []
    if (Array.isArray(accountData)) {
      accounts = accountData
    } else if (accountData.accounts && Array.isArray(accountData.accounts)) {
      accounts = accountData.accounts
    } else if (accountData.data?.accounts && Array.isArray(accountData.data.accounts)) {
      accounts = accountData.data.accounts
    } else if (accountData.data && Array.isArray(accountData.data)) {
      accounts = accountData.data
    } else if (accountData.account) {
      accounts = [accountData.account]
    }
    
    console.log('🟢 Extracted accounts:', JSON.stringify(accounts, null, 2))
    console.log('🟢 Accounts count:', accounts.length)

    if (accounts.length === 0) {
      console.error('No accounts found in Outstand response')
      return NextResponse.json(
        { error: 'No accounts found in response', details: accountData },
        { status: 500 }
      )
    }

    // Use admin client for all database operations
    const adminSupabase = createAdminClient()
    
    // Ensure user profile exists (user_id must reference profiles.id which should equal auth.uid())
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found for user:', user.id, profileError)
      // Try to create profile if it doesn't exist using admin client
      const { error: createProfileError } = await adminSupabase
        .from('profiles')
        .insert({ id: user.id })
      
      if (createProfileError) {
        console.error('Failed to create profile:', createProfileError)
        return NextResponse.json(
          { error: 'User profile not found and could not be created', details: createProfileError },
          { status: 500 }
        )
      }
    }

    // Save connected accounts to database
    const savedAccounts = []
    for (const account of accounts) {
      const accountToSave = {
        user_id: user.id, // This should be auth.uid() which equals profiles.id
        outstand_account_id: account.id || account.account_id,
        platform: account.platform || account.network || 'facebook',
        username: account.username || account.handle || account.name,
        name: account.name || account.display_name || account.username,
        is_active: true,
      }
      
      console.log('Saving account to database:', JSON.stringify(accountToSave, null, 2))
      console.log('User ID (auth.uid):', user.id)
      
      // Try insert first, then update if it exists
      let savedData = null
      let upsertError = null
      
      const { data: insertData, error: insertError } = await adminSupabase
        .from('social_accounts')
        .insert(accountToSave)
        .select()
      
      if (insertError) {
        // If unique constraint violation, update instead
        if (insertError.code === '23505' || insertError.message?.includes('duplicate')) {
          console.log('Account already exists, updating...')
          const { data: updateData, error: updateError } = await adminSupabase
            .from('social_accounts')
            .update({
              platform: accountToSave.platform,
              username: accountToSave.username,
              name: accountToSave.name,
              is_active: accountToSave.is_active,
            })
            .eq('user_id', accountToSave.user_id)
            .eq('outstand_account_id', accountToSave.outstand_account_id)
            .select()
          
          savedData = updateData
          upsertError = updateError
        } else {
          savedData = null
          upsertError = insertError
        }
      } else {
        savedData = insertData
      }

      if (upsertError) {
        console.error('Error saving account to database:', upsertError)
        console.error('Error code:', upsertError.code)
        console.error('Error message:', upsertError.message)
        console.error('Error details:', JSON.stringify(upsertError, null, 2))
        console.error('Account data:', accountToSave)
        // Continue with other accounts even if one fails
      } else {
        console.log('Account saved successfully:', savedData)
        if (savedData && savedData.length > 0) {
          savedAccounts.push(savedData[0])
        } else {
          // If no data returned, try to fetch it
          const { data: fetchedData } = await adminSupabase
            .from('social_accounts')
            .select('*')
            .eq('user_id', accountToSave.user_id)
            .eq('outstand_account_id', accountToSave.outstand_account_id)
            .single()
          if (fetchedData) {
            savedAccounts.push(fetchedData)
          }
        }
      }
    }

    if (savedAccounts.length === 0) {
      console.error('Failed to save any accounts to database')
      return NextResponse.json(
        { error: 'Failed to save accounts to database. Please check server logs for details.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      accounts: savedAccounts.map((acc: any) => ({
        id: acc.outstand_account_id || acc.id,
        platform: acc.platform,
        name: acc.name,
        username: acc.username,
      })),
      savedCount: savedAccounts.length,
    })
  } catch (error: any) {
    console.error('Error finalizing connection:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to finalize connection' },
      { status: 500 }
    )
  }
}
