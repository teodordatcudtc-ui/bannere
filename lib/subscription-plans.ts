export const subscriptionPlans = {
  starter: {
    name: 'Starter',
    price: 29, // EUR
    credits: 100,
  },
  growth: {
    name: 'Growth',
    price: 59, // EUR
    credits: 300,
  },
  agency: {
    name: 'Agency',
    price: 119, // EUR
    credits: 1000,
  },
} as const

export type SubscriptionPlanId = keyof typeof subscriptionPlans
