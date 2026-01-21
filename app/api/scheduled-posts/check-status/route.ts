import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * GET /api/scheduled-posts/check-status
 * Check the status of scheduled posts in Outstand and update database
 */
export async function GET() {
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

    // Get all posts with outstand_post_id
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select('id, outstand_post_id, status')
      .eq('user_id', user.id)
      .not('outstand_post_id', 'is', null)
      .in('status', ['pending', 'posted'])

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts', details: fetchError },
        { status: 500 }
      )
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        message: 'No posts to check',
        checked: 0,
        updated: 0,
      })
    }

    const results = []
    let updatedCount = 0

    // Check each post status in Outstand
    for (const post of scheduledPosts) {
      try {
        const response = await fetch(
          `${OUTSTAND_API_URL}/posts/${post.outstand_post_id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          console.error(`Failed to fetch post ${post.outstand_post_id}:`, response.status)
          results.push({
            postId: post.id,
            outstandPostId: post.outstand_post_id,
            status: 'error',
            error: `Failed to fetch: ${response.status}`,
          })
          continue
        }

        const data = await response.json()
        
        if (!data.success || !data.post) {
          results.push({
            postId: post.id,
            outstandPostId: post.outstand_post_id,
            status: 'error',
            error: 'Invalid response from Outstand',
          })
          continue
        }

        const outstandPost = data.post
        
        // Check if any social account has been published
        const socialAccounts = outstandPost.socialAccounts || []
        const publishedAccounts = socialAccounts.filter(
          (acc: any) => acc.status === 'published' && acc.publishedAt
        )
        const failedAccounts = socialAccounts.filter(
          (acc: any) => acc.status === 'failed' || acc.error
        )

        // Determine new status
        let newStatus = post.status
        let publishedAt = null

        if (publishedAccounts.length > 0) {
          newStatus = 'posted'
          // Get the earliest publishedAt
          publishedAt = publishedAccounts
            .map((acc: any) => acc.publishedAt)
            .sort()[0]
        } else if (failedAccounts.length === socialAccounts.length && socialAccounts.length > 0) {
          newStatus = 'failed'
        } else if (outstandPost.publishedAt) {
          newStatus = 'posted'
          publishedAt = outstandPost.publishedAt
        }

        // Update database if status changed
        if (newStatus !== post.status || publishedAt) {
          await supabase
            .from('scheduled_posts')
            .update({
              status: newStatus,
              posted_at: publishedAt || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', post.id)

          updatedCount++
        }

        results.push({
          postId: post.id,
          outstandPostId: post.outstand_post_id,
          oldStatus: post.status,
          newStatus: newStatus,
          publishedAt: publishedAt,
          socialAccounts: socialAccounts.map((acc: any) => ({
            network: acc.network,
            username: acc.username,
            status: acc.status,
            publishedAt: acc.publishedAt,
            error: acc.error,
            platformPostId: acc.platformPostId,
          })),
        })
      } catch (error: any) {
        console.error(`Error checking post ${post.id}:`, error)
        results.push({
          postId: post.id,
          outstandPostId: post.outstand_post_id,
          status: 'error',
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      message: `Checked ${results.length} posts`,
      checked: results.length,
      updated: updatedCount,
      results,
    })
  } catch (error: any) {
    console.error('Error checking post status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check post status' },
      { status: 500 }
    )
  }
}
