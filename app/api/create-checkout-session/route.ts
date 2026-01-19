import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { polar, subscriptionPlans } from '@/lib/polar'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId } = body

    if (!planId || !(planId in subscriptionPlans)) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      )
    }

    const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create checkout link with Polar
    // Polar.sh requires products as an array
    const checkoutLink = await polar.checkouts.create({
      products: [plan.productId], // Array of product IDs
      successUrl: `${appUrl}/dashboard/subscribe/success?checkout_id={CHECKOUT_ID}`,
      customerEmail: user.email,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
    })

    return NextResponse.json({ url: checkoutLink.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
