import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GalleryContent } from '@/components/dashboard/gallery-content'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if brand kit exists
  const { data: brandKit } = await supabase
    .from('brand_kits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!brandKit) {
    redirect('/onboarding')
  }

  // Get all generated images
  const { data: images, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching images:', error)
  }

  return <GalleryContent images={images || []} />
}
