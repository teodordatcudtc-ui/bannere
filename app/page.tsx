import { createClient } from '@/lib/supabase/server'
import { LandingContent } from '@/components/landing/landing-content'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <LandingContent user={user} />
  )
}
