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
import { Checkbox } from '@/components/ui/checkbox'
import { CalendarIcon, Loader2, AlertCircle, CheckCircle2, User } from 'lucide-react'
import { format } from 'date-fns'
import { ro } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // TikTok-specific state (UX Guidelines requirements)
  const [tiktokCreatorInfo, setTiktokCreatorInfo] = useState<any>(null)
  const [tiktokPrivacy, setTiktokPrivacy] = useState<string>('') // NO DEFAULT VALUE!
  const [tiktokAllowComment, setTiktokAllowComment] = useState(false)
  const [tiktokAllowDuet, setTiktokAllowDuet] = useState(false)
  const [tiktokAllowStitch, setTiktokAllowStitch] = useState(false)
  const [tiktokCommercialToggle, setTiktokCommercialToggle] = useState(false)
  const [tiktokYourBrand, setTiktokYourBrand] = useState(false)
  const [tiktokBrandedContent, setTiktokBrandedContent] = useState(false)
  const [postedSuccessfully, setPostedSuccessfully] = useState(false)

  useEffect(() => {
    fetchImages()
    fetchCredits()
    
    const imageId = searchParams.get('imageId')
    if (imageId) {
      fetchImageById(imageId)
    }
  }, [searchParams])

  // Fetch TikTok creator info when TikTok is selected
  useEffect(() => {
    if (platforms.includes('tiktok') && !tiktokCreatorInfo) {
      fetchTiktokCreatorInfo()
    } else if (!platforms.includes('tiktok')) {
      // Reset TikTok-specific fields when TikTok is deselected
      setTiktokCreatorInfo(null)
      setTiktokPrivacy('')
      setTiktokAllowComment(false)
      setTiktokAllowDuet(false)
      setTiktokAllowStitch(false)
      setTiktokCommercialToggle(false)
      setTiktokYourBrand(false)
      setTiktokBrandedContent(false)
    }
  }, [platforms])

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

  const fetchTiktokCreatorInfo = async () => {
    try {
      const response = await fetch('/api/tiktok/creator-info')
      if (response.ok) {
        const data = await response.json()
        setTiktokCreatorInfo(data)
      } else {
        const errorData = await response.json()
        setTiktokCreatorInfo({ error: errorData.error, can_post: false })
      }
    } catch (error: any) {
      console.error('Error fetching TikTok creator info:', error)
      setTiktokCreatorInfo({ error: 'Failed to fetch creator info', can_post: false })
    }
  }

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  // Validate TikTok fields according to UX Guidelines
  const validateTiktokFields = (): string | null => {
    if (!platforms.includes('tiktok')) return null

    // Check if creator can post
    if (tiktokCreatorInfo && !tiktokCreatorInfo.can_post) {
      return 'Nu poți posta pe TikTok. Ai atins limita zilnică sau contul nu este configurat corect.'
    }

    // Privacy status is REQUIRED and must be selected manually (NO DEFAULT)
    if (!tiktokPrivacy) {
      return 'Te rugăm să selectezi nivelul de confidențialitate pentru TikTok'
    }

    // If commercial toggle is ON, at least one option must be selected
    if (tiktokCommercialToggle && !tiktokYourBrand && !tiktokBrandedContent) {
      return 'Dacă promovezi un brand, trebuie să selectezi cel puțin o opțiune (Brandul tău sau Conținut sponsorizat)'
    }

    // Branded content cannot be posted as "Only me"
    if (tiktokBrandedContent && tiktokPrivacy === 'SELF_ONLY') {
      return 'Conținutul sponsorizat nu poate fi postat cu setarea "Doar eu". Te rugăm să selectezi "Public" sau "Prieteni".'
    }

    return null
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

      // Validate TikTok fields
      const tiktokError = validateTiktokFields()
      if (tiktokError) {
        setError(tiktokError)
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

      // Prepare TikTok metadata if TikTok is selected
      const tiktokMetadata = platforms.includes('tiktok') ? {
        privacy_status: tiktokPrivacy,
        allow_comment: tiktokAllowComment,
        allow_duet: tiktokAllowDuet,
        allow_stitch: tiktokAllowStitch,
        commercial_content: tiktokCommercialToggle,
        your_brand: tiktokYourBrand,
        branded_content: tiktokBrandedContent,
      } : null

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
          tiktokMetadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Schedule post error:', errorData)
        // Show debug info in development
        if (errorData.debug) {
          console.error('Debug info:', errorData.debug)
          console.error('Found accounts:', errorData.debug.foundAccounts)
          console.error('Normalized platforms:', errorData.debug.normalizedPlatforms)
        }
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

      setPostedSuccessfully(true)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-7">
      {/* Development Notice */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Funcționalitate în dezvoltare
            </p>
            <p className="text-xs text-amber-800">
              Postarea automată pe social media este în curs de dezvoltare. Poți programa postări, dar acestea vor fi procesate manual în acest moment. Funcționalitatea completă va fi disponibilă în curând.
            </p>
          </div>
        </div>
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
                  <p className="text-xs text-gray-500 mt-2 text-center">Preview-ul conținutului tău</p>
                </div>
              )}

              {/* TikTok Creator Info Display (Point 1 - OBLIGATORIU) */}
              {platforms.includes('tiktok') && tiktokCreatorInfo && (
                <div className={cn(
                  "border-2 rounded-xl p-4",
                  tiktokCreatorInfo.can_post 
                    ? "border-gray-200 bg-gray-50" 
                    : "border-red-200 bg-red-50"
                )}>
                  <div className="flex items-center gap-3 mb-2">
                    {tiktokCreatorInfo.avatar_url ? (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={tiktokCreatorInfo.avatar_url} />
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Posting as: @{tiktokCreatorInfo.nickname || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {tiktokCreatorInfo.display_name || tiktokCreatorInfo.nickname}
                      </p>
                    </div>
                  </div>
                  {!tiktokCreatorInfo.can_post && (
                    <div className="flex items-start gap-2 mt-3 p-2 bg-red-100 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-700">
                        {tiktokCreatorInfo.error || "Ai atins limita zilnică. Încearcă mai târziu."}
                      </p>
                    </div>
                  )}
                  {tiktokCreatorInfo.can_post && (
                    <p className="text-xs text-gray-600 mt-2">
                      Max video duration: {Math.floor((tiktokCreatorInfo.max_video_post_duration_sec || tiktokCreatorInfo.max_video_duration || 600) / 60)} minutes
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="caption" className="text-sm font-semibold text-gray-900">
                  Descriere / Caption <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="caption"
                  placeholder="Add a caption..."
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
                    const isSelected = platforms.includes(platform)
                    return (
                      <Button
                        key={platform}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        onClick={() => togglePlatform(platform)}
                        className="capitalize text-sm py-5"
                      >
                        {platform}
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* TikTok Metadata Fields (Point 2 - OBLIGATORII) */}
              {platforms.includes('tiktok') && tiktokCreatorInfo?.can_post && (
                <div className="space-y-5 border-t pt-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">
                      Privacy Level <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={tiktokPrivacy}
                      onValueChange={(value) => {
                        // Prevent selecting "Only me" if branded content is selected
                        if (tiktokBrandedContent && value === 'SELF_ONLY') {
                          return // Don't allow this selection
                        }
                        setTiktokPrivacy(value)
                      }}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        {(tiktokCreatorInfo?.privacy_level_options || [
                          { value: 'PUBLIC_TO_EVERYONE', label: 'Public' },
                          { value: 'MUTUAL_FOLLOW_FRIENDS', label: 'Friends' },
                          { value: 'SELF_ONLY', label: 'Only me' }
                        ]).map((option: any) => {
                          const isDisabled = tiktokBrandedContent && option.value === 'SELF_ONLY'
                          return (
                            <SelectItem 
                              key={option.value} 
                              value={option.value}
                              disabled={isDisabled}
                              className={isDisabled ? "opacity-50 cursor-not-allowed" : ""}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>{option.label || option.value}</span>
                                {isDisabled && (
                                  <span className="ml-2 text-xs text-gray-500 italic">
                                    (Branded content cannot be private)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      ⚠️ Trebuie să selectezi manual nivelul de confidențialitate
                    </p>
                    {tiktokBrandedContent && (
                      <p className="text-xs text-amber-600">
                        ⚠️ Branded content visibility cannot be set to private
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Interaction Settings</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allow_comment"
                          checked={tiktokAllowComment}
                          onCheckedChange={(checked) => setTiktokAllowComment(checked === true)}
                        />
                        <Label htmlFor="allow_comment" className="text-sm font-normal cursor-pointer">
                          Allow Comments
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allow_duet"
                          checked={tiktokAllowDuet}
                          onCheckedChange={(checked) => setTiktokAllowDuet(checked === true)}
                          disabled={!tiktokCreatorInfo?.duet_enabled}
                        />
                        <Label 
                          htmlFor="allow_duet" 
                          className={cn(
                            "text-sm font-normal cursor-pointer",
                            !tiktokCreatorInfo?.duet_enabled && "text-gray-400"
                          )}
                        >
                          Allow Duet
                          {!tiktokCreatorInfo?.duet_enabled && (
                            <span className="text-xs text-gray-400 ml-1">(disabled in TikTok)</span>
                          )}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="allow_stitch"
                          checked={tiktokAllowStitch}
                          onCheckedChange={(checked) => setTiktokAllowStitch(checked === true)}
                          disabled={!tiktokCreatorInfo?.stitch_enabled}
                        />
                        <Label 
                          htmlFor="allow_stitch"
                          className={cn(
                            "text-sm font-normal cursor-pointer",
                            !tiktokCreatorInfo?.stitch_enabled && "text-gray-400"
                          )}
                        >
                          Allow Stitch
                          {!tiktokCreatorInfo?.stitch_enabled && (
                            <span className="text-xs text-gray-400 ml-1">(disabled in TikTok)</span>
                          )}
                        </Label>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Note: Duet and Stitch features are not applicable to photo posts, but you can still configure them here.
                    </p>
                  </div>

                  {/* Commercial Content Disclosure (Point 3 - OBLIGATORIU) */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="commercial_toggle"
                        checked={tiktokCommercialToggle}
                        onCheckedChange={(checked) => {
                          setTiktokCommercialToggle(checked === true)
                          if (!checked) {
                            setTiktokYourBrand(false)
                            setTiktokBrandedContent(false)
                          }
                        }}
                      />
                      <Label htmlFor="commercial_toggle" className="text-sm font-semibold cursor-pointer">
                        Promote yourself or a brand?
                      </Label>
                    </div>

                    {tiktokCommercialToggle && (
                      <div className="ml-6 space-y-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-700 font-medium">Select at least one:</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="your_brand"
                              checked={tiktokYourBrand}
                              onCheckedChange={(checked) => setTiktokYourBrand(checked === true)}
                            />
                            <div className="flex-1">
                              <Label htmlFor="your_brand" className="text-sm font-normal cursor-pointer">
                                Your Brand (promoting yourself/your business)
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                ✓ Your photo/video will be labeled as "Promotional content"
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="branded_content"
                              checked={tiktokBrandedContent}
                              onCheckedChange={(checked) => {
                                setTiktokBrandedContent(checked === true)
                                // Auto-switch privacy if branded content and privacy is SELF_ONLY
                                if (checked && tiktokPrivacy === 'SELF_ONLY') {
                                  setTiktokPrivacy('PUBLIC_TO_EVERYONE')
                                }
                              }}
                              disabled={tiktokPrivacy === 'SELF_ONLY'}
                            />
                            <div className="flex-1">
                              <Label 
                                htmlFor="branded_content"
                                className={cn(
                                  "text-sm font-normal cursor-pointer",
                                  tiktokPrivacy === 'SELF_ONLY' && "text-gray-400"
                                )}
                              >
                                Branded Content (promoting a third party)
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                ✓ Your photo/video will be labeled as "Paid partnership"
                              </p>
                              {tiktokPrivacy === 'SELF_ONLY' && (
                                <p className="text-xs text-red-600 mt-1">
                                  ⚠️ Branded content cannot be posted as "Only me"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {tiktokCommercialToggle && !tiktokYourBrand && !tiktokBrandedContent && (
                          <div 
                            className="flex items-start gap-2 mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
                            title="You need to indicate if your content promotes yourself, a third party, or both."
                          >
                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-yellow-800">
                              ⚠️ You need to indicate if your content promotes yourself, a third party, or both.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                          format(scheduledDate as Date, 'PPP', { locale: ro })
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

              {/* Compliance Declarations (Point 4 - BEFORE Publish Button) */}
              {platforms.includes('tiktok') && tiktokCreatorInfo?.can_post && (
                <div className="space-y-2 border-t pt-4">
                  {/* When only "Your Brand" is checked OR commercial toggle is off */}
                  {(!tiktokCommercialToggle || (tiktokCommercialToggle && tiktokYourBrand && !tiktokBrandedContent)) && (
                    <p className="text-xs text-gray-600">
                      By posting, you agree to TikTok's{' '}
                      <a 
                        href="https://www.tiktok.com/legal/music-usage-confirmation" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Music Usage Confirmation
                      </a>
                    </p>
                  )}
                  {/* When "Branded Content" is checked (alone or with "Your Brand") */}
                  {tiktokBrandedContent && (
                    <p className="text-xs text-gray-600">
                      By posting, you agree to TikTok's{' '}
                      <a 
                        href="https://www.tiktok.com/legal/branded-content-policy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Branded Content Policy
                      </a>
                      {' '}and{' '}
                      <a 
                        href="https://www.tiktok.com/legal/music-usage-confirmation" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Music Usage Confirmation
                      </a>
                    </p>
                  )}
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Cost:</span> 5 credite
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Disponibile:</span> {credits} credite
                </p>
              </div>

              {/* Success Message (Point 5) */}
              {postedSuccessfully && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-800 mb-1">
                        ✅ Post submitted successfully!
                      </p>
                      <p className="text-xs text-green-700">
                        ⏳ It may take a few minutes for your content to process and appear on your TikTok profile.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full text-sm py-5" 
                disabled={
                  loading || 
                  !selectedImage || 
                  (platforms.includes('tiktok') && (
                    !tiktokCreatorInfo?.can_post ||
                    !tiktokPrivacy ||
                    (tiktokCommercialToggle && !tiktokYourBrand && !tiktokBrandedContent)
                  ))
                }
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Se programează...
                  </>
                ) : (
                  '📤 Programează postarea'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
