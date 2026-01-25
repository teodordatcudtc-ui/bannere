export const subscriptionPlans = {
  starter: {
    name: 'Starter',
    price: 19, // EUR
    credits: 100,
  },
  growth: {
    name: 'Growth',
    price: 49, // EUR
    credits: 300,
  },
  agency: {
    name: 'Agency',
    price: 99, // EUR
    credits: 1000,
  },
} as const

export type SubscriptionPlanId = keyof typeof subscriptionPlans
