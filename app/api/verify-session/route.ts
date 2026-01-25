import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'Missing session ID' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid' && session.status === 'complete') {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: 'Payment not completed' }, { status: 400 })
  } catch (error: any) {
    console.error('Error verifying checkout session:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
