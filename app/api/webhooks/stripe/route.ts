import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { subscriptionPlans } from '@/lib/subscription-plans'
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
          console.error('Missing metadata in checkout session:', { userId, planId, sessionId: session.id })
          break
        }

        // Only process subscription checkouts
        if (session.mode !== 'subscription') {
          console.log('Skipping non-subscription checkout:', session.id)
          break
        }

        const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
        if (!plan) {
          console.error('Invalid plan ID:', planId)
          break
        }

        // Get subscription from Stripe
        const subscriptionId = session.subscription as string | null
        if (!subscriptionId) {
          console.error('No subscription ID in checkout session:', session.id)
          break
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          // Create or update subscription in database
          const { error: subError } = await supabase
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

          if (subError) {
            console.error('Error saving subscription to database:', subError)
            break
          }

          // Add initial credits
          const creditsAdded = await addCredits(
            userId,
            plan.credits,
            'subscription',
            `Initial credits for ${plan.name} plan`
          )

          if (creditsAdded) {
            console.log(`Successfully added ${plan.credits} credits to user ${userId} for plan ${planId}`)
          } else {
            console.error(`Failed to add credits to user ${userId} for plan ${planId}`)
          }
        } catch (error: any) {
          console.error('Error processing checkout.session.completed:', error)
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        try {
          // Find user by customer ID
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (subError || !subData) {
            console.error('Subscription not found for customer:', customerId, subError)
            break
          }

          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : 'canceled',
              current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('user_id', subData.user_id)

          if (updateError) {
            console.error('Error updating subscription:', updateError)
          } else {
            console.log(`Updated subscription status for user ${subData.user_id}: ${subscription.status}`)
          }
        } catch (error: any) {
          console.error('Error processing customer.subscription.updated:', error)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        try {
          // Find user by customer ID
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (subError || !subData) {
            console.error('Subscription not found for customer:', customerId, subError)
            break
          }

          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
            })
            .eq('user_id', subData.user_id)

          if (updateError) {
            console.error('Error canceling subscription:', updateError)
          } else {
            console.log(`Canceled subscription for user ${subData.user_id}`)
          }
        } catch (error: any) {
          console.error('Error processing customer.subscription.deleted:', error)
        }

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string | null

        if (!subscriptionId) {
          // This invoice is not for a subscription (might be one-time payment)
          console.log('Invoice is not for a subscription, skipping')
          break
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const customerId = subscription.customer as string

          // Find user by customer ID
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (subError || !subData) {
            console.error('Subscription not found for customer:', customerId, subError)
            break
          }

          const plan = subscriptionPlans[subData.plan_id as keyof typeof subscriptionPlans]
          if (!plan) {
            console.error('Invalid plan ID in subscription:', subData.plan_id)
            break
          }

          // Add monthly credits renewal
          const creditsAdded = await addCredits(
            subData.user_id,
            plan.credits,
            'subscription',
            `Monthly credit renewal for ${plan.name} plan`
          )

          if (creditsAdded) {
            console.log(`Successfully added ${plan.credits} renewal credits to user ${subData.user_id} for plan ${subData.plan_id}`)
          } else {
            console.error(`Failed to add renewal credits to user ${subData.user_id} for plan ${subData.plan_id}`)
          }
        } catch (error: any) {
          console.error('Error processing invoice.payment_succeeded:', error)
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
