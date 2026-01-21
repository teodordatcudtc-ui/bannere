import { NextResponse } from 'next/server'

const OUTSTAND_API_KEY = process.env.OUTSTAND_API_KEY
const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

/**
 * GET /api/social-accounts/check-tiktok-config
 * Check TikTok configuration in Outstand
 */
export async function GET() {
  try {
    if (!OUTSTAND_API_KEY) {
      return NextResponse.json(
        { error: 'OUTSTAND_API_KEY is not configured' },
        { status: 500 }
      )
    }

    // Get social networks configuration from Outstand
    const response = await fetch(`${OUTSTAND_API_URL}/social-networks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OUTSTAND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'Failed to fetch social networks', details: errorText },
        { status: 500 }
      )
    }

    const data = await response.json()
    
    // Find TikTok configuration
    const tiktokConfig = data.data?.find((network: any) => network.network === 'tiktok')
    
    if (!tiktokConfig) {
      return NextResponse.json({
        configured: false,
        message: 'TikTok nu este configurat în Outstand. Trebuie să configurezi Client Key și Client Secret.',
        instructions: [
          '1. Mergi la TikTok Developer Portal și obține Client Key și Client Secret',
          '2. Configurează-le în Outstand Dashboard → Settings → Social Networks → TikTok',
          '3. Sau folosește API-ul Outstand pentru a le configura',
        ],
      })
    }

    return NextResponse.json({
      configured: true,
      network: tiktokConfig.network,
      clientKey: tiktokConfig.client_key ? `${tiktokConfig.client_key.substring(0, 10)}...` : 'Not set',
      hasClientSecret: !!tiktokConfig.client_secret,
      createdAt: tiktokConfig.createdAt,
      updatedAt: tiktokConfig.updatedAt,
      message: 'TikTok este configurat în Outstand. Dacă primești eroarea "unaudited_client", aplicația ta TikTok trebuie să treacă prin procesul de review pentru Content Posting API.',
      reviewRequired: true,
      reviewLink: 'https://developers.tiktok.com/doc/content-sharing-guidelines/',
    })
  } catch (error: any) {
    console.error('Error checking TikTok config:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check TikTok configuration' },
      { status: 500 }
    )
  }
}
