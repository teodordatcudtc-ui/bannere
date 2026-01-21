import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getUserCredits } from '@/lib/utils/credits'
import { cache } from 'react'

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic'

// Cache the user fetch for the request (deduplicates within same request)
const getCachedUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Cache the credits fetch for the request (deduplicates within same request)
const getCachedCredits = cache(async (userId: string) => {
  return await getUserCredits(userId)
})

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCachedUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch credits - will be deduplicated if called multiple times in same request
  const credits = await getCachedCredits(user.id)

  return <DashboardLayout credits={credits}>{children}</DashboardLayout>
}
