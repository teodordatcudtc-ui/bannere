import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { subscriptionPlans } from '@/lib/polar'
import { addCredits } from '@/lib/utils/credits'
import crypto from 'crypto'

// Verify webhook signature
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(body).digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('polar-signature') || ''

  // Verify webhook signature
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET!
  if (!verifyWebhookSignature(body, signature, webhookSecret)) {
    console.error('Webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.succeeded': {
        const checkout = event.data
        const userId = checkout.metadata?.user_id
        const planId = checkout.metadata?.plan_id

        if (!userId || !planId) {
          console.error('Missing metadata in checkout')
          break
        }

        const plan = subscriptionPlans[planId as keyof typeof subscriptionPlans]
        if (!plan) {
          console.error('Invalid plan ID:', planId)
          break
        }

        // Get subscription from Polar
        const subscriptionId = checkout.subscription_id
        if (!subscriptionId) {
          console.error('No subscription ID in checkout')
          break
        }

        // Create or update subscription in database
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            polar_subscription_id: subscriptionId,
            polar_customer_id: checkout.customer_id,
            status: 'active',
            current_period_start: new Date(checkout.created_at).toISOString(),
            current_period_end: new Date(
              new Date(checkout.created_at).setMonth(
                new Date(checkout.created_at).getMonth() + 1
              )
            ).toISOString(),
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

      case 'subscription.updated': {
        const subscription = event.data
        const customerId = subscription.customer_id

        // Find user by customer ID
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('polar_customer_id', customerId)
          .single()

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : 'canceled',
              current_period_start: new Date(subscription.current_period_start).toISOString(),
              current_period_end: new Date(subscription.current_period_end).toISOString(),
            })
            .eq('user_id', subData.user_id)
        }

        break
      }

      case 'subscription.canceled': {
        const subscription = event.data
        const customerId = subscription.customer_id

        // Find user by customer ID
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('polar_customer_id', customerId)
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

      case 'invoice.paid': {
        const invoice = event.data
        const subscriptionId = invoice.subscription_id

        if (subscriptionId) {
          // Find user by subscription ID
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .eq('polar_subscription_id', subscriptionId)
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
