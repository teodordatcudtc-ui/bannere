import { Polar } from '@polar-sh/sdk'
import { subscriptionPlans as plans } from './subscription-plans'

// Initialize Polar SDK
export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  serverURL: process.env.POLAR_SERVER_URL || 'https://api.polar.sh',
})

export const subscriptionPlans = {
  starter: {
    ...plans.starter,
    productId: process.env.POLAR_STARTER_PRODUCT_ID!,
  },
  growth: {
    ...plans.growth,
    productId: process.env.POLAR_GROWTH_PRODUCT_ID!,
  },
  agency: {
    ...plans.agency,
    productId: process.env.POLAR_AGENCY_PRODUCT_ID!,
  },
} as const
