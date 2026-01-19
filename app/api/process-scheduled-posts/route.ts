import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { postToSocialMedia } from '@/lib/social-media'

/**
 * Process scheduled posts that are due
 * This endpoint should be called periodically (via cron job or scheduled task)
 * 
 * Usage:
 * - Manual trigger: POST /api/process-scheduled-posts
 * - Cron job: Set up to call this endpoint every minute
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Optional: Add authentication for cron jobs
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all pending posts that are due (scheduled_for <= now)
    const now = new Date().toISOString()
    const { data: scheduledPosts, error: fetchError } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        generated_images (
          image_url
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .order('scheduled_for', { ascending: true })
      .limit(10) // Process max 10 posts at a time

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts' },
        { status: 500 }
      )
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        message: 'No posts to process',
        processed: 0,
      })
    }

    const results = []

    // Process each scheduled post
    for (const post of scheduledPosts) {
      try {
        const imageUrl = (post.generated_images as any)?.image_url
        if (!imageUrl) {
          console.error(`No image URL found for post ${post.id}`)
          // Update status to failed
          await supabase
            .from('scheduled_posts')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', post.id)
          continue
        }

        // Get user's connected social accounts for the selected platforms
        const { data: userAccounts } = await supabase
          .from('social_accounts')
          .select('outstand_account_id, platform')
          .eq('user_id', post.user_id)
          .eq('is_active', true)
          .in('platform', post.platforms.map((p: string) => {
            // Map platform names to Outstand format
            const mapping: Record<string, string> = {
              'facebook': 'facebook',
              'instagram': 'instagram',
              'linkedin': 'linkedin',
              'tiktok': 'tiktok',
              'twitter': 'x',
              'x': 'x',
            }
            return mapping[p.toLowerCase()] || p.toLowerCase()
          }))

        // Extract account IDs
        const accountIds = userAccounts?.map(acc => acc.outstand_account_id) || []

        // Post to social media platforms using Outstand
        const postResults = await postToSocialMedia({
          imageUrl,
          caption: post.caption,
          platforms: post.platforms,
          accountIds: accountIds.length > 0 ? accountIds : undefined,
        })

        // Check if all platforms succeeded
        const allSucceeded = postResults.every((r) => r.success)
        const anySucceeded = postResults.some((r) => r.success)

        // Get the first successful post ID (for tracking)
        const firstPostId = postResults.find((r) => r.success)?.postId

        // Update post status
        const newStatus = allSucceeded ? 'posted' : anySucceeded ? 'posted' : 'failed'
        
        await supabase
          .from('scheduled_posts')
          .update({
            status: newStatus,
            posted_at: newStatus === 'posted' ? new Date().toISOString() : null,
            outstand_post_id: firstPostId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        results.push({
          postId: post.id,
          status: newStatus,
          results: postResults,
        })
      } catch (error: any) {
        console.error(`Error processing post ${post.id}:`, error)
        
        // Update status to failed
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        results.push({
          postId: post.id,
          status: 'failed',
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} posts`,
      processed: results.length,
      results,
    })
  } catch (error: any) {
    console.error('Error processing scheduled posts:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process scheduled posts' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for manual testing
 */
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to process scheduled posts',
    usage: 'POST /api/process-scheduled-posts',
  })
}
