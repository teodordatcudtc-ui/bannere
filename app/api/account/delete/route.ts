import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/account/delete
 * Delete user account and all associated data
 * This is required for GDPR compliance
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS for deletion
    const adminSupabase = createAdminClient()

    // Delete all user data (CASCADE will handle related records)
    // Order matters - delete child records first, then parent
    
    // 1. Delete scheduled posts
    await adminSupabase
      .from('scheduled_posts')
      .delete()
      .eq('user_id', user.id)

    // 2. Delete generated images
    await adminSupabase
      .from('generated_images')
      .delete()
      .eq('user_id', user.id)

    // 3. Delete credit transactions
    await adminSupabase
      .from('credit_transactions')
      .delete()
      .eq('user_id', user.id)

    // 4. Delete credits
    await adminSupabase
      .from('credits')
      .delete()
      .eq('user_id', user.id)

    // 5. Delete subscriptions
    await adminSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id)

    // 6. Delete social accounts
    await adminSupabase
      .from('social_accounts')
      .delete()
      .eq('user_id', user.id)

    // 7. Delete brand kit
    await adminSupabase
      .from('brand_kits')
      .delete()
      .eq('user_id', user.id)

    // 8. Delete profile (this will cascade to any remaining references)
    await adminSupabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    // 9. Delete auth user (this will trigger cascade deletes)
    const { error: deleteUserError } = await adminSupabase.auth.admin.deleteUser(user.id)

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      return NextResponse.json(
        { error: 'Failed to delete user account', details: deleteUserError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Account deleted successfully',
      success: true 
    })
  } catch (error: any) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete account' },
      { status: 500 }
    )
  }
}
