import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * GET /api/tiktok/creator-info
 * Get TikTok creator information (nickname, avatar, max video duration, can_post)
 * This is required by TikTok UX Guidelines - Point 1
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

    // Get user's TikTok account from database
    const { data: tiktokAccount } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'tiktok')
      .eq('is_active', true)
      .single()

    if (!tiktokAccount) {
      return NextResponse.json(
        { 
          error: 'No TikTok account connected',
          can_post: false,
        },
        { status: 404 }
      )
    }

    // Try to get creator info from Outstand API
    // Note: Outstand may not have a direct creator_info endpoint, so we'll use account info
    try {
      const response = await fetch(`${OUTSTAND_API_URL}/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const accounts = Array.isArray(data) ? data : data.accounts || data.data || []
        const tiktokAccountInfo = accounts.find(
          (acc: any) => 
            acc.id === tiktokAccount.outstand_account_id ||
            acc.network === 'tiktok' ||
            acc.platform === 'tiktok'
        )

        if (tiktokAccountInfo) {
          // Return creator info with all required fields
          // Note: Outstand may not provide all TikTok-specific fields, so we use defaults
          return NextResponse.json({
            nickname: tiktokAccountInfo.username || tiktokAccount.username || 'Unknown',
            display_name: tiktokAccountInfo.name || tiktokAccount.name || 'Unknown',
            avatar_url: tiktokAccountInfo.avatar_url || tiktokAccountInfo.profile_picture || null,
            can_post: tiktokAccountInfo.can_post !== false, // Default to true if not specified
            max_video_post_duration_sec: tiktokAccountInfo.max_video_post_duration_sec || 600, // Default 10 minutes
            privacy_level_options: tiktokAccountInfo.privacy_level_options || [
              { value: 'PUBLIC_TO_EVERYONE', label: 'Public' },
              { value: 'MUTUAL_FOLLOW_FRIENDS', label: 'Friends' },
              { value: 'SELF_ONLY', label: 'Only me' }
            ],
            duet_enabled: tiktokAccountInfo.duet_enabled !== false, // Default to true
            stitch_enabled: tiktokAccountInfo.stitch_enabled !== false, // Default to true
            account_id: tiktokAccountInfo.id || tiktokAccount.outstand_account_id,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching from Outstand:', error)
    }

    // Fallback: Return info from database with default values
    return NextResponse.json({
      nickname: tiktokAccount.username || 'Unknown',
      display_name: tiktokAccount.name || 'Unknown',
      avatar_url: null,
      can_post: true,
      max_video_post_duration_sec: 600, // Default 10 minutes
      privacy_level_options: [
        { value: 'PUBLIC_TO_EVERYONE', label: 'Public' },
        { value: 'MUTUAL_FOLLOW_FRIENDS', label: 'Friends' },
        { value: 'SELF_ONLY', label: 'Only me' }
      ],
      duet_enabled: true,
      stitch_enabled: true,
      account_id: tiktokAccount.outstand_account_id,
    })
  } catch (error: any) {
    console.error('Error fetching TikTok creator info:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch creator info' },
      { status: 500 }
    )
  }
}
