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
    
    // For development, allow processing future posts if ?force=true is passed
    const { searchParams } = new URL(request.url)
    const forceProcess = searchParams.get('force') === 'true' || process.env.NODE_ENV === 'development'
    
    let query = supabase
      .from('scheduled_posts')
      .select(`
        *,
        generated_images (
          image_url
        )
      `)
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true })
      .limit(10) // Process max 10 posts at a time
    
    // Only filter by time if not forcing
    if (!forceProcess) {
      query = query.lte('scheduled_for', now)
    }
    
    const { data: scheduledPosts, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching scheduled posts:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch scheduled posts', details: fetchError },
        { status: 500 }
      )
    }

    console.log('Found scheduled posts:', scheduledPosts?.length || 0)
    console.log('Current time:', now)
    if (scheduledPosts && scheduledPosts.length > 0) {
      console.log('Scheduled posts:', scheduledPosts.map((p: any) => ({
        id: p.id,
        scheduled_for: p.scheduled_for,
        status: p.status,
        platforms: p.platforms,
      })))
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      // Also check if there are any pending posts at all (for debugging)
      const { data: allPending } = await supabase
        .from('scheduled_posts')
        .select('id, scheduled_for, status')
        .eq('status', 'pending')
        .limit(5)
      
      return NextResponse.json({
        message: 'No posts to process',
        processed: 0,
        currentTime: now,
        forceProcess: forceProcess,
        allPendingPosts: allPending || [],
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

        // Normalize platform names to match database format
        const normalizePlatform = (platform: string | null | undefined): string | null => {
          if (!platform) return null
          const normalized = platform.toLowerCase().trim()
          // Map Outstand platform names to our expected format
          const platformMap: Record<string, string> = {
            'tiktok': 'tiktok',
            'facebook': 'facebook',
            'instagram': 'instagram',
            'linkedin': 'linkedin',
            'x': 'x',
            'twitter': 'x',
          }
          return platformMap[normalized] || normalized
        }

        // Get all user's connected social accounts
        const { data: allUserAccounts } = await supabase
          .from('social_accounts')
          .select('outstand_account_id, platform')
          .eq('user_id', post.user_id)
          .eq('is_active', true)

        // Normalize requested platforms
        const normalizedRequestedPlatforms = post.platforms.map((p: string) => 
          p.toLowerCase().trim()
        )

        // Filter accounts by normalized platform names
        const userAccounts = (allUserAccounts || []).filter((acc: any) => {
          const normalizedPlatform = normalizePlatform(acc.platform)
          return normalizedPlatform && normalizedRequestedPlatforms.includes(normalizedPlatform)
        })

        // Extract account IDs if available
        // If no accounts in DB, Outstand will use all connected accounts for the platform
        const accountIds = userAccounts.length > 0 
          ? userAccounts.map((acc: any) => acc.outstand_account_id)
          : undefined

        console.log('Posting with:', {
          platforms: post.platforms,
          accountIds: accountIds || 'none (will use all connected accounts)',
          imageUrl,
        })

        // Post to social media platforms using Outstand
        const postResults = await postToSocialMedia({
          imageUrl,
          caption: post.caption,
          platforms: post.platforms,
          accountIds: accountIds,
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
 * GET endpoint for manual testing (calls POST logic)
 */
export async function GET(request: Request) {
  // For local testing, allow GET to trigger processing
  if (process.env.NODE_ENV === 'development') {
    const url = new URL(request.url)
    const forceProcess = url.searchParams.get('force') === 'true'
    // Reuse the POST logic
    try {
      const supabase = await createClient()
      
      // Get all pending posts that are due (scheduled_for <= now)
      const now = new Date().toISOString()
      
      let query = supabase
        .from('scheduled_posts')
        .select(`
          *,
          generated_images (
            image_url
          )
        `)
        .eq('status', 'pending')
        .order('scheduled_for', { ascending: true })
        .limit(10) // Process max 10 posts at a time
      
      // Only filter by time if not forcing
      if (!forceProcess) {
        query = query.lte('scheduled_for', now)
      }
      
      const { data: scheduledPosts, error: fetchError } = await query

      if (fetchError) {
        console.error('Error fetching scheduled posts:', fetchError)
        return NextResponse.json(
          { error: 'Failed to fetch scheduled posts', details: fetchError },
          { status: 500 }
        )
      }

      console.log('Found scheduled posts (GET):', scheduledPosts?.length || 0)
      console.log('Current time:', now)
      if (scheduledPosts && scheduledPosts.length > 0) {
        console.log('Scheduled posts:', scheduledPosts.map((p: any) => ({
          id: p.id,
          scheduled_for: p.scheduled_for,
          status: p.status,
          platforms: p.platforms,
        })))
      }

      if (!scheduledPosts || scheduledPosts.length === 0) {
        // Also check if there are any pending posts at all (for debugging)
        const { data: allPending } = await supabase
          .from('scheduled_posts')
          .select('id, scheduled_for, status')
          .eq('status', 'pending')
          .limit(5)
        
        return NextResponse.json({
          message: 'No posts to process',
          processed: 0,
          currentTime: now,
          forceProcess: forceProcess,
          allPendingPosts: allPending || [],
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

          // Normalize platform names to match database format
          const normalizePlatform = (platform: string | null | undefined): string | null => {
            if (!platform) return null
            const normalized = platform.toLowerCase().trim()
            // Map Outstand platform names to our expected format
            const platformMap: Record<string, string> = {
              'tiktok': 'tiktok',
              'facebook': 'facebook',
              'instagram': 'instagram',
              'linkedin': 'linkedin',
              'x': 'x',
              'twitter': 'x',
            }
            return platformMap[normalized] || normalized
          }

          // Get all user's connected social accounts
          const { data: allUserAccounts } = await supabase
            .from('social_accounts')
            .select('outstand_account_id, platform')
            .eq('user_id', post.user_id)
            .eq('is_active', true)

          // Normalize requested platforms
          const normalizedRequestedPlatforms = post.platforms.map((p: string) => 
            p.toLowerCase().trim()
          )

          // Filter accounts by normalized platform names
          const userAccounts = (allUserAccounts || []).filter((acc: any) => {
            const normalizedPlatform = normalizePlatform(acc.platform)
            return normalizedPlatform && normalizedRequestedPlatforms.includes(normalizedPlatform)
          })

          // Extract account IDs if available
          // If no accounts in DB, Outstand will use all connected accounts for the platform
          const accountIds = userAccounts.length > 0 
            ? userAccounts.map((acc: any) => acc.outstand_account_id)
            : undefined

          console.log('Posting with:', {
            platforms: post.platforms,
            accountIds: accountIds || 'none (will use all connected accounts)',
            imageUrl,
          })

          // Post to social media platforms using Outstand
          const postResults = await postToSocialMedia({
            imageUrl,
            caption: post.caption,
            platforms: post.platforms,
            accountIds: accountIds,
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
  
  // In production, only allow POST
  return NextResponse.json({
    message: 'Use POST to process scheduled posts',
    usage: 'POST /api/process-scheduled-posts',
  })
}
