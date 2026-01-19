export type SubscriptionPlan = 'starter' | 'growth' | 'agency'

export interface BrandKit {
  id: string
  user_id: string
  logo_url: string | null
  primary_color: string | null
  secondary_color: string | null
  business_description: string | null
  created_at: string
  updated_at: string
}

export interface Credits {
  id: string
  user_id: string
  amount: number
  last_reset_at: string
  created_at: string
  updated_at: string
}

export interface GeneratedImage {
  id: string
  user_id: string
  image_url: string
  prompt: string | null
  theme: string | null
  variant_number: number | null
  created_at: string
}

export interface ScheduledPost {
  id: string
  user_id: string
  image_id: string
  caption: string
  scheduled_for: string
  platforms: string[]
  status: 'pending' | 'posted' | 'failed'
  outstand_post_id: string | null
  posted_at: string | null
  created_at: string
  updated_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'subscription' | 'generation' | 'scheduling' | 'refund'
  description: string | null
  created_at: string
}
