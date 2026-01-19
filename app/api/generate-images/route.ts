import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import {
  generateImageVariants,
  buildBannerPrompt,
} from '@/lib/kie'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      text, 
      theme, 
      variantCount, 
      brandKit, 
      aspectRatio,
      includeLogo,
      logoUrl,
      productImageUrl,
      bannerDetails
    } = body

    if (!text || !variantCount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if Kie API key is configured
    if (!process.env.KIE_API_KEY) {
      return NextResponse.json(
        { error: 'KIE_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Collect reference images (logo and product image)
    const referenceImages: string[] = []
    if (includeLogo && logoUrl) {
      referenceImages.push(logoUrl)
    }
    if (productImageUrl) {
      referenceImages.push(productImageUrl)
    }

    // Build prompt with brand kit information and new fields
    const prompt = buildBannerPrompt(
      text,
      theme || 'modern',
      {
        primaryColor: brandKit?.primary_color,
        secondaryColor: brandKit?.secondary_color,
        businessDescription: brandKit?.business_description,
      },
      bannerDetails,
      includeLogo && !!logoUrl,
      !!productImageUrl
    )

    // Generate image variants using Kie.ai
    const variantCountNum = parseInt(variantCount)
    const aspectRatioValue = aspectRatio || '16:9' // Default to 16:9 for banners
    
    const imageUrls = await generateImageVariants(
      prompt,
      variantCountNum,
      aspectRatioValue as '1:1' | '16:9' | '9:16' | '4:3' | '3:4',
      referenceImages.length > 0 ? referenceImages : undefined
    )

    // Save images to database
    const imageRecords = imageUrls.map((url: string, index: number) => ({
      user_id: user.id,
      image_url: url,
      prompt: text,
      theme: theme || 'modern',
      variant_number: index + 1,
    }))

    const { data: savedImages, error: saveError } = await supabase
      .from('generated_images')
      .insert(imageRecords)
      .select()

    if (saveError) {
      console.error('Error saving images:', saveError)
      // Return images even if save fails
      return NextResponse.json({
        images: imageUrls.map((url: string, index: number) => ({
          id: `temp-${index}`,
          image_url: url,
          url: url, // For backward compatibility
          prompt: text,
          theme: theme || 'modern',
          variant_number: index + 1,
        })),
      })
    }

    // Format response to match expected structure
    const formattedImages = savedImages.map((img: any) => ({
      ...img,
      url: img.image_url, // Add url field for backward compatibility
    }))

    return NextResponse.json({ images: formattedImages })
  } catch (error: any) {
    console.error('Error generating images:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate images' },
      { status: 500 }
    )
  }
}
