import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getUserCredits } from '@/lib/utils/credits'

// Force dynamic rendering to prevent build-time pre-rendering
export const dynamic = 'force-dynamic'

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const credits = await getUserCredits(user.id)

  return <DashboardLayout credits={credits}>{children}</DashboardLayout>
}
