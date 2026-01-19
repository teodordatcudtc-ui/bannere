import Stripe from 'stripe'
import { subscriptionPlans as plans } from './subscription-plans'

// Lazy initialization to prevent build-time errors when STRIPE_SECRET_KEY is not set
let stripeInstance: Stripe | null = null

function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripeInstance
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

export const subscriptionPlans = {
  starter: {
    ...plans.starter,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
  },
  growth: {
    ...plans.growth,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID!,
  },
  agency: {
    ...plans.agency,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
  },
} as const
