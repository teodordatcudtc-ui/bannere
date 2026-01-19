import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DELETE /api/scheduled-posts/delete
 * Delete a scheduled post
 * 
 * Body: { postId: string }
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      )
    }

    // Verify post belongs to user and is still pending
    const { data: post, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('id, status, user_id')
      .eq('id', postId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // Only allow deletion of pending posts
    if (post.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only delete pending posts' },
        { status: 400 }
      )
    }

    // Delete the post
    const { error: deleteError } = await supabase
      .from('scheduled_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting scheduled post:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting scheduled post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete post' },
      { status: 500 }
    )
  }
}
