'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

export default function OnboardingPage() {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF')
  const [businessDescription, setBusinessDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      let logoUrl = null

      // Upload logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError, data } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile)

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName)
        
        logoUrl = publicUrl
      }

      // Save brand kit
      const { error: brandKitError } = await supabase
        .from('brand_kits')
        .upsert({
          user_id: user.id,
          logo_url: logoUrl,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          business_description: businessDescription,
        }, {
          onConflict: 'user_id'
        })

      if (brandKitError) {
        throw brandKitError
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F0F4FF] via-[#F8F9FF] to-[#E8EDFF]">
      <Card className="w-full max-w-2xl border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Configurează Brand Kit-ul tău</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Configurează identitatea ta de brand pentru a genera bannere consistente
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">Logo</Label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Încarcă logo
                </Button>
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="Previzualizare logo"
                    className="h-16 w-16 object-contain border-2 border-gray-200 rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Brand Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-sm font-semibold text-gray-900">Culoare principală</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#000000"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor" className="text-sm font-semibold text-gray-900">Culoare secundară</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#FFFFFF"
                    pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div className="space-y-2">
              <Label htmlFor="businessDescription" className="text-sm font-semibold text-gray-900">Descriere business</Label>
              <Textarea
                id="businessDescription"
                placeholder="Descrie business-ul tău, produsele și publicul țintă..."
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={4}
                className="text-sm"
              />
              <p className="text-xs text-gray-500">
                Acest lucru ajută AI-ul să genereze bannere mai relevante pentru brandul tău
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 text-sm py-5" disabled={loading}>
                {loading ? 'Se salvează...' : 'Salvează și continuă'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-sm"
                disabled={loading}
                onClick={async () => {
                  setLoading(true)
                  setError(null)
                  try {
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) {
                      router.push('/auth/login')
                      return
                    }

                    // Create a default brand kit so user can skip onboarding
                    const { error: brandKitError } = await supabase
                      .from('brand_kits')
                      .upsert({
                        user_id: user.id,
                        logo_url: null,
                        primary_color: '#000000',
                        secondary_color: '#FFFFFF',
                        business_description: '',
                      }, {
                        onConflict: 'user_id'
                      })

                    if (brandKitError) {
                      throw brandKitError
                    }

                    // Use window.location for a hard redirect to ensure fresh data
                    window.location.href = '/dashboard'
                  } catch (err: any) {
                    setError(err.message || 'A apărut o eroare')
                    setLoading(false)
                  }
                }}
              >
                Omite acum
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
