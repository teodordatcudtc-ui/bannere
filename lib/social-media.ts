/**
 * Outstand.so API integration for automated social media posting
 * Documentation: https://www.outstand.so/docs
 * 
 * Supports: X (Twitter), LinkedIn, Instagram, TikTok, Facebook, Threads, YouTube, etc.
 */

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

// Debug: Log if API key is missing (only in development)
if (process.env.NODE_ENV === 'development' && !OUTSTAND_API_KEY) {
  console.warn('⚠️ OUTSTAND_API_KEY is not set. Make sure it\'s in .env.local and restart the dev server.')
}

export interface TikTokMetadata {
  privacy_status: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY'
  allow_comment: boolean
  allow_duet: boolean
  allow_stitch: boolean
  commercial_content: boolean
  your_brand: boolean
  branded_content: boolean
}

export interface SocialMediaPost {
  imageUrl: string
  caption: string
  platforms: string[] // ['x', 'linkedin', 'instagram', 'tiktok', 'facebook']
  accountIds?: string[] // Outstand account IDs (optional, will use all connected accounts if not provided)
  scheduleAt?: string // ISO 8601 datetime string (optional, for scheduling)
  tiktokMetadata?: TikTokMetadata // TikTok-specific metadata (required when posting to TikTok)
}

export interface PostResult {
  platform: string
  success: boolean
  postId?: string
  error?: string
}

/**
 * Map platform names to Outstand platform identifiers
 */
function mapPlatformToOutstand(platform: string): string {
  const mapping: Record<string, string> = {
    'facebook': 'facebook',
    'instagram': 'instagram',
    'linkedin': 'linkedin',
    'tiktok': 'tiktok',
    'twitter': 'x',
    'x': 'x',
    'threads': 'threads',
    'youtube': 'youtube',
  }
  
  const normalized = platform.toLowerCase()
  return mapping[normalized] || normalized
}

/**
 * Outstand handles media via URLs - no need to upload separately
 * Outstand downloads the media from the URL and uploads it to the platform
 * This function just validates the URL is accessible
 */
export async function validateMediaUrl(
  imageUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify the URL is accessible
    const response = await fetch(imageUrl, { method: 'HEAD' })
    if (!response.ok) {
      return { success: false, error: `Media URL is not accessible: ${imageUrl}` }
    }
    return { success: true }
  } catch (error: any) {
    return { success: false, error: `Failed to validate media URL: ${error.message}` }
  }
}

/**
 * Post to social media platforms using Outstand API
 */
export async function postToSocialMedia(
  post: SocialMediaPost
): Promise<PostResult[]> {
  if (!OUTSTAND_API_KEY) {
    return post.platforms.map(platform => ({
      platform,
      success: false,
      error: 'OUTSTAND_API_KEY is not configured',
    }))
  }

  try {
    // Map platforms to Outstand format
    const outstandPlatforms = post.platforms.map(mapPlatformToOutstand)

    // Validate media URL (Outstand downloads from URL, no upload needed)
    const mediaValidation = await validateMediaUrl(post.imageUrl)
    if (!mediaValidation.success) {
      return post.platforms.map(platform => ({
        platform,
        success: false,
        error: mediaValidation.error || 'Failed to validate media URL',
      }))
    }

    // Prepare request body according to Outstand API documentation
    // https://www.outstand.so/docs/api-reference/posts/create-a-post
    const requestBody: any = {
      accounts: post.accountIds && post.accountIds.length > 0 
        ? post.accountIds  // Use account IDs if provided (e.g., account IDs from Outstand)
        : outstandPlatforms, // Otherwise use platform names (e.g., 'tiktok', 'facebook') - Outstand will post to all connected accounts
    }

    // Add media URLs - Outstand will download and upload to the platform
    if (post.imageUrl) {
      // Extract filename from URL or use default
      const urlParts = post.imageUrl.split('/')
      const urlFilename = urlParts[urlParts.length - 1].split('?')[0] // Remove query params
      const filename = urlFilename && urlFilename.includes('.') 
        ? urlFilename 
        : `image_${Date.now()}.jpg` // Default filename if not found
      
      // Use containers for posts with media
      requestBody.containers = [
        {
          content: post.caption,
          media: [
            {
              url: post.imageUrl,
              filename: filename,
            }
          ]
        }
      ]
    } else {
      // Use simple content for text-only posts
      requestBody.content = post.caption
    }

    // Add schedule time if provided (ISO 8601 format)
    if (post.scheduleAt) {
      requestBody.scheduledAt = post.scheduleAt
    }

    // Add TikTok metadata if TikTok is selected and metadata is provided
    // According to Outstand documentation: TikTok config uses privacy_level, disable_duet, disable_stitch, disable_comment
    // Format: { privacy_level?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY", 
    //           disable_duet?: boolean, disable_stitch?: boolean, disable_comment?: boolean }
    if (post.platforms.includes('tiktok') && post.tiktokMetadata) {
      const tiktokConfig: any = {
        privacy_level: post.tiktokMetadata.privacy_status, // Map privacy_status to privacy_level
        disable_comment: !post.tiktokMetadata.allow_comment, // Invert: allow_comment -> disable_comment
      }
      
      // Only add disable_duet and disable_stitch if they are set (for photo posts, these don't apply)
      if (post.tiktokMetadata.allow_duet !== undefined) {
        tiktokConfig.disable_duet = !post.tiktokMetadata.allow_duet
      }
      if (post.tiktokMetadata.allow_stitch !== undefined) {
        tiktokConfig.disable_stitch = !post.tiktokMetadata.allow_stitch
      }
      
      // Add TikTok config to containers (Outstand expects network-specific configs per container)
      if (requestBody.containers && requestBody.containers.length > 0) {
        requestBody.containers[0].tiktok = tiktokConfig
      }
      
      // Note: Outstand doesn't support commercial_content, your_brand, branded_content in their API
      // These are TikTok UX Guidelines requirements for the UI compliance, but Outstand may not pass them through
      // The UI still needs to collect them for TikTok approval, even if Outstand doesn't use them
    }

    console.log('Posting to Outstand:', JSON.stringify(requestBody, null, 2))

    // Post to Outstand API
    const response = await fetch(`${OUTSTAND_API_URL}/posts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Outstand API error:', errorText)
      
      // Try to parse error
      let errorMessage = 'Failed to post to Outstand API'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        errorMessage = errorText || errorMessage
      }

      return post.platforms.map(platform => ({
        platform,
        success: false,
        error: errorMessage,
      }))
    }

    const data = await response.json()
    console.log('Outstand API response:', JSON.stringify(data, null, 2))

    // Outstand returns: { success: true, post: { id, scheduledAt, socialAccounts, containers, ... } }
    if (data.success && data.post) {
      const postId = data.post.id
      const isScheduled = data.post.scheduledAt !== null && data.post.scheduledAt !== undefined
      const isPublished = data.post.publishedAt !== null && data.post.publishedAt !== undefined
      
      // If we have a postId, the post was created successfully (either scheduled or published)
      const postCreated = !!postId
      
      // Map social accounts from response to platforms
      const socialAccounts = data.post.socialAccounts || []
      const platformMap: Record<string, string> = {}
      socialAccounts.forEach((acc: any) => {
        platformMap[acc.network] = acc.network
      })
      
      return post.platforms.map(platform => {
        const outstandPlatform = mapPlatformToOutstand(platform)
        const hasAccount = socialAccounts.some((acc: any) => 
          acc.network === outstandPlatform || acc.network === platform
        )
        
        return {
          platform,
          success: postCreated, // If postId exists, post was created successfully
          postId: postId,
          error: hasAccount ? undefined : `No account found for ${platform}`,
        }
      })
    } else {
      // Error response
      const errorMessage = data.error || data.message || 'Unknown error'
      return post.platforms.map(platform => ({
        platform,
        success: false,
        error: errorMessage,
      }))
    }
  } catch (error: any) {
    console.error('Error posting to Outstand:', error)
    return post.platforms.map(platform => ({
      platform,
      success: false,
      error: error.message || 'Unknown error occurred',
    }))
  }
}

/**
 * Get connected social accounts from Outstand
 */
export async function getConnectedAccounts(): Promise<{
  success: boolean
  accounts?: Array<{
    id: string
    platform: string
    username?: string
    name?: string
  }>
  error?: string
}> {
  if (!OUTSTAND_API_KEY) {
    return { success: false, error: 'OUTSTAND_API_KEY is not configured' }
  }

  try {
    const response = await fetch(`${OUTSTAND_API_URL}/accounts`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: `Failed to fetch accounts: ${errorText}` }
    }

    const data = await response.json()
    return {
      success: true,
      accounts: Array.isArray(data) ? data : data.accounts || [],
    }
  } catch (error: any) {
    console.error('Error fetching connected accounts:', error)
    return { success: false, error: error.message }
  }
}
