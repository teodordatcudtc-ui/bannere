import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe, subscriptionPlans } from '@/lib/stripe'
import Stripe from 'stripe'
import { addCredits } from '@/lib/utils/credits'

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id

        if (!userId || !planId) {
          console.error('Missing metadata in checkout session')
          break
        }

        const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
        if (!plan) {
          console.error('Invalid plan ID:', planId)
          break
        }

        // Get subscription from Stripe
        const subscriptionId = session.subscription as string
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription

        // Create or update subscription in database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: subscription.customer as string,
            status: subscription.status === 'active' ? 'active' : 'canceled',
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
          }, {
            onConflict: 'user_id'
          })

        // Add initial credits
        await addCredits(
          userId,
          plan.credits,
          'subscription',
          `Initial credits for ${plan.name} plan`
        )

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : 'canceled',
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('user_id', subData.user_id)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('user_id', subData.user_id)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
          const customerId = subscription.customer as string

          // Find user by customer ID
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (subData) {
            const plan = subscriptionPlans[subData.plan_id as keyof typeof subscriptionPlans]
            if (plan) {
              // Reset monthly credits
              await addCredits(
                subData.user_id,
                plan.credits,
                'subscription',
                `Monthly credit renewal for ${plan.name} plan`
              )
            }
          }
        }

        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
