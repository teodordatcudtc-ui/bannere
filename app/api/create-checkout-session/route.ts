import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { subscriptionPlans } from '@/lib/subscription-plans'

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

    // Create product dynamically in Stripe
    const product = await stripe.products.create({
      name: plan.name,
      description: `${plan.name} Plan - ${plan.credits} credits per month`,
      metadata: {
        plan_id: planId,
        credits: plan.credits.toString(),
      },
    })

    // Create price dynamically for the product (monthly subscription)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price * 100, // Convert to cents
      currency: 'eur',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan_id: planId,
        credits: plan.credits.toString(),
      },
    })

    // Create or retrieve Stripe customer
    let customerId: string | undefined

    // Check if user already has a Stripe customer ID
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/dashboard/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/subscribe`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        product_id: product.id,
        price_id: price.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
