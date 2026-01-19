/**
 * Kie.ai API integration for Nano Banana image generation
 * Documentation: https://docs.kie.ai/market/google/nano-banana
 */

const KIE_API_BASE_URL = 'https://api.kie.ai/api/v1'
const KIE_API_KEY = process.env.KIE_API_KEY

export interface KieImageGenerationInput {
  prompt: string
  output_format?: 'png' | 'jpg' | 'jpeg'
  aspect_ratio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  image_size?: string
  num_images?: number
  image_urls?: string[] // Reference images (logo, product images)
}

export interface KieTaskResponse {
  taskId: string
  status: string
}

export interface KieTaskStatus {
  taskId: string
  state: 'waiting' | 'queuing' | 'generating' | 'success' | 'fail'
  resultUrls?: string[]
  error?: string
}

/**
 * Create a task for image generation using Nano Banana model
 */
export async function createImageGenerationTask(
  input: KieImageGenerationInput,
  callbackUrl?: string
): Promise<KieTaskResponse> {
  if (!KIE_API_KEY) {
    throw new Error('KIE_API_KEY is not configured')
  }

  // Determine which model to use based on whether we have reference images
  const model = input.image_urls && input.image_urls.length > 0 
    ? 'google/nano-banana-edit' 
    : 'google/nano-banana'

  const requestBody: any = {
    model,
    callBackUrl: callbackUrl,
    input: {
      prompt: input.prompt,
      output_format: input.output_format || 'png',
      aspect_ratio: input.aspect_ratio || '16:9', // Good for banners
      num_images: input.num_images || 1,
    },
  }

  // Add reference images if provided
  if (input.image_urls && input.image_urls.length > 0) {
    requestBody.input.image_urls = input.image_urls
  }

  const response = await fetch(`${KIE_API_BASE_URL}/jobs/createTask`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Kie.ai API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  
  // Handle different response formats
  const taskId = data.taskId || data.id || data.data?.taskId
  if (!taskId) {
    throw new Error('No taskId returned from Kie.ai API')
  }
  
  return {
    taskId,
    status: data.status || data.data?.state || 'pending',
  }
}

/**
 * Get task status and results
 */
export async function getTaskStatus(taskId: string): Promise<KieTaskStatus> {
  if (!KIE_API_KEY) {
    throw new Error('KIE_API_KEY is not configured')
  }

  const response = await fetch(`${KIE_API_BASE_URL}/jobs/recordInfo?taskId=${taskId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Kie.ai API error: ${response.status} - ${errorText}`)
  }

  const apiResponse = await response.json()
  
  // Handle Kie.ai response structure
  if (apiResponse.code !== 200) {
    throw new Error(apiResponse.message || 'Failed to get task status')
  }

  const data = apiResponse.data
  const state = data.state || 'waiting'
  
  // Parse resultJson if available
  let resultUrls: string[] = []
  if (state === 'success' && data.resultJson) {
    try {
      const resultData = JSON.parse(data.resultJson)
      resultUrls = resultData.resultUrls || resultData.images || []
    } catch (e) {
      console.error('Error parsing resultJson:', e)
    }
  }

  return {
    taskId: data.taskId || taskId,
    state: state as 'waiting' | 'queuing' | 'generating' | 'success' | 'fail',
    resultUrls,
    error: data.failMsg || undefined,
  }
}

/**
 * Poll task status until completion
 */
export async function pollTaskUntilComplete(
  taskId: string,
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<KieTaskStatus> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getTaskStatus(taskId)

    if (status.state === 'success') {
      return status
    }

    if (status.state === 'fail') {
      throw new Error(status.error || 'Task failed')
    }

    // Wait before next poll (for waiting, queuing, generating states)
    if (attempt < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }
  }

  throw new Error('Task timeout: Maximum polling attempts reached')
}

/**
 * Build a prompt for banner generation using brand kit
 */
export function buildBannerPrompt(
  text: string,
  theme: string = 'modern',
  brandKit?: {
    primaryColor?: string | null
    secondaryColor?: string | null
    businessDescription?: string | null
  },
  bannerDetails?: string | null,
  includeLogo?: boolean,
  hasProductImage?: boolean
): string {
  let prompt = `Create a professional social media banner with the text: "${text}". `

  if (brandKit?.businessDescription) {
    prompt += `Business context: ${brandKit.businessDescription}. `
  }

  if (brandKit?.primaryColor || brandKit?.secondaryColor) {
    const colors = [
      brandKit.primaryColor,
      brandKit.secondaryColor,
    ].filter(Boolean).join(' and ')
    prompt += `Use brand colors: ${colors}. `
  }

  if (includeLogo) {
    prompt += `Include the brand logo prominently in the design. `
  }

  if (hasProductImage) {
    prompt += `Include the product image in the banner design, making it visually appealing and integrated with the overall design. `
  }

  if (bannerDetails) {
    prompt += `Additional design requirements: ${bannerDetails}. `
  }

  prompt += `Style: ${theme}, high quality, professional design, suitable for social media advertising, eye-catching, modern typography. `

  return prompt.trim()
}

/**
 * Generate multiple image variants
 */
export async function generateImageVariants(
  prompt: string,
  variantCount: number,
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '16:9',
  referenceImages?: string[]
): Promise<string[]> {
  const imageUrls: string[] = []
  const tasks: Promise<string>[] = []

  // Create multiple tasks for variants
  for (let i = 0; i < variantCount; i++) {
    const taskPromise = (async () => {
      const task = await createImageGenerationTask({
        prompt,
        aspect_ratio: aspectRatio,
        output_format: 'png',
        num_images: 1,
        image_urls: referenceImages,
      })

      const result = await pollTaskUntilComplete(task.taskId)
      
      if (result.resultUrls && result.resultUrls.length > 0) {
        return result.resultUrls[0]
      }
      
      throw new Error('No image URL returned from task')
    })()

    tasks.push(taskPromise)
  }

  // Wait for all tasks to complete
  const results = await Promise.all(tasks)
  imageUrls.push(...results)

  return imageUrls
}
