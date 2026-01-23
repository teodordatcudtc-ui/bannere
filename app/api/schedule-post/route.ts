import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { imageId, caption, scheduledFor, platforms, tiktokMetadata } = body

    if (!imageId || !caption || !scheduledFor || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate TikTok metadata if TikTok is selected
    if (platforms.includes('tiktok')) {
      if (!tiktokMetadata) {
        return NextResponse.json(
          { error: 'TikTok metadata is required when TikTok is selected' },
          { status: 400 }
        )
      }
      if (!tiktokMetadata.privacy_status) {
        return NextResponse.json(
          { error: 'TikTok privacy status is required' },
          { status: 400 }
        )
      }
      // Validate commercial content
      if (tiktokMetadata.commercial_content && !tiktokMetadata.your_brand && !tiktokMetadata.branded_content) {
        return NextResponse.json(
          { error: 'If commercial content is enabled, at least one option (your_brand or branded_content) must be selected' },
          { status: 400 }
        )
      }
      // Branded content cannot be posted as SELF_ONLY
      if (tiktokMetadata.branded_content && tiktokMetadata.privacy_status === 'SELF_ONLY') {
        return NextResponse.json(
          { error: 'Branded content cannot be posted with privacy setting "Only me"' },
          { status: 400 }
        )
      }
    }

    // Note: We skip platform verification here because Outstand handles the connections
    // The accounts are connected in Outstand, so we trust that and proceed with scheduling
    // If the account is not connected in Outstand, the post will fail at posting time

    // Verify image belongs to user
    const { data: image, error: imageError } = await supabase
      .from('generated_images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single()

    if (imageError || !image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Create scheduled post with TikTok metadata if applicable
    const postData: any = {
      user_id: user.id,
      image_id: imageId,
      caption,
      scheduled_for: scheduledFor,
      platforms,
      status: 'pending',
    }

    // Add TikTok metadata as JSON if TikTok is selected
    if (platforms.includes('tiktok') && tiktokMetadata) {
      postData.tiktok_metadata = tiktokMetadata
    }

    const { data: scheduledPost, error: postError } = await supabase
      .from('scheduled_posts')
      .insert(postData)
      .select()
      .single()

    if (postError) {
      console.error('Error creating scheduled post:', postError)
      return NextResponse.json(
        { error: 'Failed to create scheduled post' },
        { status: 500 }
      )
    }

    // Post is now scheduled and will be processed by the cron job
    // The /api/process-scheduled-posts endpoint will handle posting at the scheduled time

    return NextResponse.json({ post: scheduledPost })
  } catch (error: any) {
    console.error('Error scheduling post:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to schedule post' },
      { status: 500 }
    )
  }
}
