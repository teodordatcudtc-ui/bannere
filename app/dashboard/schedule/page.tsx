'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function SchedulePage() {
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [caption, setCaption] = useState('')
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [scheduledTime, setScheduledTime] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credits, setCredits] = useState(0)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    fetchImages()
    fetchCredits()
    fetchConnectedPlatforms()
    
    const imageId = searchParams.get('imageId')
    if (imageId) {
      fetchImageById(imageId)
    }
  }, [searchParams])

  const fetchImages = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      setImages(data)
    }
  }

  const fetchImageById = async (imageId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('generated_images')
      .select('*')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .single()

    if (data) {
      setSelectedImage(data)
    }
  }

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setCredits(data.amount)
    }
  }

  const fetchConnectedPlatforms = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('social_accounts')
      .select('platform')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (data) {
      // Normalize platform names to match expected format
      const normalizePlatform = (platform: string | null | undefined): string | null => {
        if (!platform) return null
        const normalized = platform.toLowerCase().trim()
        // Map Outstand platform names to our expected format
        const platformMap: Record<string, string> = {
          'tiktok': 'tiktok',
          'facebook': 'facebook',
          'instagram': 'instagram',
          'linkedin': 'linkedin',
          'x': 'x',
          'twitter': 'x',
        }
        return platformMap[normalized] || normalized
      }

      // Get unique platforms, filtering out null values
      const uniquePlatforms: string[] = [
        ...new Set<string>(
          data
            .map((account: any) => normalizePlatform(account.platform))
            .filter((p: string | null): p is string => p !== null)
        )
      ]
      setConnectedPlatforms(uniquePlatforms)
    }
  }

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (!selectedImage) {
        setError('Te rugăm să selectezi o imagine')
        setLoading(false)
        return
      }

      if (platforms.length === 0) {
        setError('Te rugăm să selectezi cel puțin o platformă')
        setLoading(false)
        return
      }

      // Check if user is connected to all selected platforms
      const disconnectedPlatforms = platforms.filter(
        (platform: string) => !connectedPlatforms.includes(platform.toLowerCase())
      )

      if (disconnectedPlatforms.length > 0) {
        const platformNames: Record<string, string> = {
          facebook: 'Facebook',
          instagram: 'Instagram',
          linkedin: 'LinkedIn',
          tiktok: 'TikTok',
        }
        const disconnectedNames = disconnectedPlatforms
          .map((p: string) => platformNames[p.toLowerCase()] || p)
          .join(', ')
        setError(
          `Nu ești conectat la: ${disconnectedNames}. Te rugăm să te conectezi la aceste platforme în Settings înainte de a programa postări.`
        )
        setLoading(false)
        return
      }

      if (!scheduledDate || !scheduledTime) {
        setError('Te rugăm să selectezi data și ora')
        setLoading(false)
        return
      }

      // Check credits (5 credits per scheduled post)
      if (credits < 5) {
        setError(`Credite insuficiente. Ai nevoie de 5 credite dar ai doar ${credits}.`)
        setLoading(false)
        return
      }

      // Combine date and time
      const [hours, minutes] = scheduledTime.split(':')
      const scheduledFor = new Date(scheduledDate)
      scheduledFor.setHours(parseInt(hours), parseInt(minutes))

      // Check if scheduled time is in the past
      if (scheduledFor < new Date()) {
        setError('Nu poți programa o postare în trecut. Te rugăm să selectezi o dată și oră viitoare.')
        setLoading(false)
        return
      }

      // Create scheduled post
      const response = await fetch('/api/schedule-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: selectedImage.id,
          caption,
          scheduledFor: scheduledFor.toISOString(),
          platforms,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Programarea postării a eșuat')
      }

      // Deduct credits
      const deductResponse = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 5,
          type: 'scheduling',
        }),
      })

      if (!deductResponse.ok) {
        throw new Error('Scăderea creditelor a eșuat')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Programare postare</h1>
        <p className="text-base text-gray-600">
          Programează bannerele pe platformele de social media (5 credite per postare)
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Image Selection */}
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">Selectează imaginea</CardTitle>
            <CardDescription className="text-sm text-gray-600">Alege un banner de programat</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
              {images.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    'border-2 rounded-xl p-1.5 cursor-pointer transition-all aspect-square',
                    selectedImage?.id === image.id
                      ? 'border-[#8B7CFF] bg-[#8B7CFF]/5 shadow-md'
                      : 'border-gray-200 hover:border-[#8B7CFF]/50'
                  )}
                  onClick={() => setSelectedImage(image)}
                >
                  <img
                    src={image.image_url}
                    alt="Banner generat"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
              {images.length === 0 && (
                <p className="text-center text-gray-600 py-12 text-base col-span-full">
                  Nu sunt imagini disponibile. Generează mai întâi niște bannere.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduling Form */}
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">Detalii programare</CardTitle>
            <CardDescription className="text-sm text-gray-600">Configurează postarea ta</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSchedule} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {selectedImage && (
                <div className="border-2 border-gray-200 rounded-xl p-3">
                  <img
                    src={selectedImage.image_url}
                    alt="Banner selectat"
                    className="w-full rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="caption" className="text-sm font-semibold text-gray-900">Descriere</Label>
                <Textarea
                  id="caption"
                  placeholder="Scrie descrierea postării..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">Platforme</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['facebook', 'instagram', 'linkedin', 'tiktok'].map((platform) => {
                    const isConnected = connectedPlatforms.includes(platform.toLowerCase())
                    const isSelected = platforms.includes(platform)
                    return (
                      <Button
                        key={platform}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => {
                          if (isConnected) {
                            togglePlatform(platform)
                          } else {
                            setError(
                              `Nu ești conectat la ${platform}. Mergi la Settings pentru a te conecta.`
                            )
                          }
                        }}
                        disabled={!isConnected}
                        className={cn(
                          'capitalize text-sm py-5',
                          !isConnected && 'opacity-50 cursor-not-allowed'
                        )}
                        title={
                          !isConnected
                            ? `Nu ești conectat la ${platform}. Mergi la Settings pentru a te conecta.`
                            : undefined
                        }
                      >
                        {platform}
                        {!isConnected && (
                          <span className="ml-2 text-xs opacity-75">(neconectat)</span>
                        )}
                      </Button>
                    )
                  })}
                </div>
                {connectedPlatforms.length === 0 && (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Nu ai niciun cont social conectat. Mergi la{' '}
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/settings')}
                      className="underline font-semibold"
                    >
                      Settings
                    </button>{' '}
                    pentru a conecta conturile tale.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal text-sm',
                          !scheduledDate && 'text-gray-500'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? (
                          format(scheduledDate, 'PPP', { locale: ro })
                        ) : (
                          <span>Alege o dată</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={setScheduledDate}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const compareDate = new Date(date)
                          compareDate.setHours(0, 0, 0, 0)
                          return compareDate < today
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-semibold text-gray-900">Ora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="text-sm"
                    required
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Cost:</span> 5 credite
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Disponibile:</span> {credits} credite
                </p>
              </div>

              <Button type="submit" className="w-full text-sm py-5" disabled={loading || !selectedImage}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Se programează...
                  </>
                ) : (
                  'Programează postarea'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
