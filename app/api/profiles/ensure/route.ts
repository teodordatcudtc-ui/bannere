import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * POST /api/profiles/ensure
 * Ensures that a profile exists for the current user
 * This is useful when a profile was deleted but user is still authenticated
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS
    const adminSupabase = createAdminClient()

    // Check if profile exists
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Create profile if it doesn't exist
      const { error: createProfileError } = await adminSupabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
        }, {
          onConflict: 'id'
        })

      if (createProfileError) {
        console.error('Failed to create profile:', createProfileError)
        return NextResponse.json(
          { error: 'Failed to create profile', details: createProfileError.message },
          { status: 500 }
        )
      }

      // Also initialize credits if they don't exist
      const { data: credits } = await adminSupabase
        .from('credits')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!credits) {
        await adminSupabase
          .from('credits')
          .insert({
            user_id: user.id,
            amount: 10, // Free trial credits
          })

        await adminSupabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            amount: 10,
            type: 'refund',
            description: 'Free trial credits - Profile recovery',
          })
      }

      return NextResponse.json({ 
        message: 'Profile created successfully',
        created: true 
      })
    }

    return NextResponse.json({ 
      message: 'Profile already exists',
      created: false 
    })
  } catch (error: any) {
    console.error('Error ensuring profile:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to ensure profile' },
      { status: 500 }
    )
  }
}
