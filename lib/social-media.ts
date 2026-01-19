/**
 * Outstand.so API integration for automated social media posting
 * Documentation: https://www.outstand.so/docs
 * 
 * Supports: X (Twitter), LinkedIn, Instagram, TikTok, Facebook, Threads, YouTube, etc.
 */

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

export interface SocialMediaPost {
  imageUrl: string
  caption: string
  platforms: string[] // ['x', 'linkedin', 'instagram', 'tiktok', 'facebook']
  accountIds?: string[] // Outstand account IDs (optional, will use all connected accounts if not provided)
  scheduleAt?: string // ISO 8601 datetime string (optional, for scheduling)
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
 * Upload media to Outstand
 * Returns media ID that can be used in posts
 */
export async function uploadMediaToOutstand(
  imageUrl: string,
  mediaType: 'image' | 'video' = 'image'
): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  if (!OUTSTAND_API_KEY) {
    return { success: false, error: 'OUTSTAND_API_KEY is not configured' }
  }

  try {
    // First, we need to fetch the image from the URL
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return { success: false, error: `Failed to fetch image from URL: ${imageUrl}` }
    }

    const imageBlob = await imageResponse.blob()
    const formData = new FormData()
    formData.append('file', imageBlob, 'image.jpg')
    formData.append('type', mediaType)

    const response = await fetch(`${OUTSTAND_API_URL}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Outstand media upload error:', errorText)
      return { success: false, error: `Media upload failed: ${errorText}` }
    }

    const data = await response.json()
    return { success: true, mediaId: data.id || data.media_id }
  } catch (error: any) {
    console.error('Error uploading media to Outstand:', error)
    return { success: false, error: error.message }
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

    // Upload media first
    const mediaResult = await uploadMediaToOutstand(post.imageUrl)
    if (!mediaResult.success || !mediaResult.mediaId) {
      return post.platforms.map(platform => ({
        platform,
        success: false,
        error: mediaResult.error || 'Failed to upload media',
      }))
    }

    // Prepare request body
    const requestBody: any = {
      content: post.caption,
      accounts: outstandPlatforms,
      media: [mediaResult.mediaId],
    }

    // Add account IDs if provided
    if (post.accountIds && post.accountIds.length > 0) {
      requestBody.account_ids = post.accountIds
    }

    // Add schedule time if provided
    if (post.scheduleAt) {
      requestBody.schedule_at = post.scheduleAt
    }

    // Post to Outstand API
    const response = await fetch(`${OUTSTAND_API_URL}/posts`, {
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

    // Outstand returns a unified response
    // If it's a single post object, extract the ID
    // If it's an array of results, map them
    if (Array.isArray(data)) {
      return data.map((result: any, index: number) => ({
        platform: post.platforms[index] || 'unknown',
        success: result.status === 'published' || result.status === 'scheduled',
        postId: result.id || result.post_id,
        error: result.error || undefined,
      }))
    } else {
      // Single post response
      const postId = data.id || data.post_id
      const isSuccess = data.status === 'published' || data.status === 'scheduled' || data.status === 'scheduled'
      
      return post.platforms.map(platform => ({
        platform,
        success: isSuccess,
        postId: postId,
        error: data.error || undefined,
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
