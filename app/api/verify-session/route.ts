import { NextResponse } from 'next/server'
import { polar } from '@/lib/polar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const checkoutId = searchParams.get('checkout_id')

  if (!checkoutId) {
    return NextResponse.json({ success: false, error: 'Missing checkout ID' }, { status: 400 })
  }

  try {
    const checkout = await polar.checkouts.get({ id: checkoutId })

    if (checkout.status === 'succeeded') {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Payment not completed' }, { status: 400 })
  } catch (error: any) {
    console.error('Error verifying checkout:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
