import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const imageUrl = searchParams.get('url')
    const imageId = searchParams.get('id')

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL-ul imaginii este necesar' }, { status: 400 })
    }

    // Fetch the image from Supabase Storage or external URL
    const response = await fetch(imageUrl, {
      headers: {
        'Accept': 'image/*',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Nu s-a putut încărca imaginea' }, { status: 404 })
    }

    // Get the image as blob
    const blob = await response.blob()

    // Return the image with proper download headers
    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type || 'image/png',
        'Content-Disposition': `attachment; filename="banner-${imageId || Date.now()}.png"`,
        'Content-Length': blob.size.toString(),
      },
    })
  } catch (error: any) {
    console.error('Error downloading image:', error)
    return NextResponse.json(
      { error: error.message || 'Eroare la descărcarea imaginii' },
      { status: 500 }
    )
  }
}
