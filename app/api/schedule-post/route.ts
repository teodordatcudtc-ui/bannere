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
    const { imageId, caption, scheduledFor, platforms } = body

    if (!imageId || !caption || !scheduledFor || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify user is connected to all selected platforms
    const { data: connectedAccounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('platform')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (accountsError) {
      console.error('Error fetching connected accounts:', accountsError)
      return NextResponse.json(
        { error: 'Failed to verify connected accounts' },
        { status: 500 }
      )
    }

    const connectedPlatforms = (connectedAccounts || []).map((account: any) =>
      account.platform.toLowerCase()
    )

    const disconnectedPlatforms = platforms.filter(
      (platform) => !connectedPlatforms.includes(platform.toLowerCase())
    )

    if (disconnectedPlatforms.length > 0) {
      const platformNames: Record<string, string> = {
        facebook: 'Facebook',
        instagram: 'Instagram',
        linkedin: 'LinkedIn',
        tiktok: 'TikTok',
      }
      const disconnectedNames = disconnectedPlatforms
        .map((p) => platformNames[p.toLowerCase()] || p)
        .join(', ')
      return NextResponse.json(
        {
          error: `Nu ești conectat la: ${disconnectedNames}. Te rugăm să te conectezi la aceste platforme înainte de a programa postări.`,
        },
        { status: 400 }
      )
    }

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

    // Create scheduled post
    const { data: scheduledPost, error: postError } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: user.id,
        image_id: imageId,
        caption,
        scheduled_for: scheduledFor,
        platforms,
        status: 'pending',
      })
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
