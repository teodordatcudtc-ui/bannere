import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/social-accounts/test-admin
 * Test if admin client can write to social_accounts table
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test admin client
    const adminSupabase = createAdminClient()
    
    // Check if profile exists
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Try to create profile
      const { data: newProfile, error: createError } = await adminSupabase
        .from('profiles')
        .insert({ id: user.id })
        .select()
        .single()
      
      if (createError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to create profile',
          profileError: createError,
        }, { status: 500 })
      }
    }

    // Try to insert a test account
    const testAccount = {
      user_id: user.id,
      outstand_account_id: `test_${Date.now()}`,
      platform: 'tiktok',
      username: 'test_user',
      name: 'Test Account',
      is_active: true,
    }

    const { data: insertData, error: insertError } = await adminSupabase
      .from('social_accounts')
      .insert(testAccount)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to insert test account',
        insertError: {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        },
        testAccount,
      }, { status: 500 })
    }

    // Clean up test account
    await adminSupabase
      .from('social_accounts')
      .delete()
      .eq('id', insertData.id)

    return NextResponse.json({
      success: true,
      message: 'Admin client works correctly!',
      testAccount: insertData,
    })
  } catch (error: any) {
    console.error('Error testing admin client:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test admin client',
      stack: error.stack,
    }, { status: 500 })
  }
}
