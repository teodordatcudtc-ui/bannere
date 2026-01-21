import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { redirect } from 'next/navigation'
import { getUserCredits } from '@/lib/utils/credits'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

// Cache user fetch for request deduplication
const getCachedUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Cache credits fetch for request deduplication
const getCachedCredits = cache(async (userId: string) => {
  return await getUserCredits(userId)
})

export default async function DashboardPage() {
  const user = await getCachedUser()

  if (!user) {
    redirect('/auth/login')
  }

  const supabase = await createClient()

  // Check if brand kit exists
  const { data: brandKit } = await supabase
    .from('brand_kits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!brandKit) {
    redirect('/onboarding')
  }
  
  // Get statistics - credits will be deduplicated if already fetched in layout
  const [credits, totalImages, totalScheduled, totalPosted] = await Promise.all([
    getCachedCredits(user.id),
    supabase.from('generated_images').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('scheduled_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('scheduled_posts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'posted'),
  ])

  // Get platform distribution
  const { data: allScheduledPosts } = await supabase
    .from('scheduled_posts')
    .select('platforms')
    .eq('user_id', user.id)

  const platformCounts: Record<string, number> = {}
  allScheduledPosts?.forEach((post) => {
    post.platforms.forEach((platform: string) => {
      platformCounts[platform] = (platformCounts[platform] || 0) + 1
    })
  })

  // Get images from last 7 days for activity
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { data: recentActivity } = await supabase
    .from('generated_images')
    .select('created_at')
    .eq('user_id', user.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  // Get recent images
  const { data: recentImages } = await supabase
    .from('generated_images')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(6)

  // Get scheduled posts
  const { data: scheduledPosts } = await supabase
    .from('scheduled_posts')
    .select('*, generated_images(image_url)')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('scheduled_for', { ascending: true })
    .limit(5)

  // Get recent activity (last 5 actions)
  const { data: recentPosts } = await supabase
    .from('scheduled_posts')
    .select('*, generated_images(image_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const totalImagesCount = totalImages.count || 0
  const totalScheduledCount = totalScheduled.count || 0
  const totalPostedCount = totalPosted.count || 0

  return (
    <DashboardContent
      credits={credits}
      totalImagesCount={totalImagesCount}
      totalScheduledCount={totalScheduledCount}
      totalPostedCount={totalPostedCount}
      platformCounts={platformCounts}
      recentPosts={recentPosts || []}
      recentImages={recentImages || []}
      scheduledPosts={scheduledPosts || []}
    />
  )
}
