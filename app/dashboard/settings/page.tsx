'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Facebook, Instagram, Linkedin, Music, Check, X as XIcon, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/lib/i18n/context'

export default function SettingsPage() {
  const { t } = useI18n()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF')
  const [businessDescription, setBusinessDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [socialAccounts, setSocialAccounts] = useState<any[]>([])
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const platformIcons: Record<string, any> = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    tiktok: Music,
    x: XIcon,
  }

  const platformNames: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    tiktok: 'TikTok',
    x: 'X (Twitter)',
  }

  useEffect(() => {
    fetchBrandKit()
    fetchSocialAccounts()
    
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('connected') === 'success') {
      setSuccess(true)
      // Refresh social accounts immediately and after a short delay to ensure update
      fetchSocialAccounts()
      setTimeout(() => {
        fetchSocialAccounts() // Refresh again to ensure we have the latest data
        setSuccess(false)
        window.history.replaceState({}, '', '/dashboard/settings')
      }, 1000)
    }
  }, [])

  const fetchBrandKit = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setPrimaryColor(data.primary_color || '#000000')
      setSecondaryColor(data.secondary_color || '#FFFFFF')
      setBusinessDescription(data.business_description || '')
      if (data.logo_url) {
        setLogoPreview(data.logo_url)
      }
    }
  }

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

  const fetchSocialAccounts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('platform', { ascending: true })

    if (data) {
      setSocialAccounts(data)
    }
  }

  const handleConnectAccount = async (platform: string) => {
    setConnectingPlatform(platform)
    setError(null)

    try {
      const response = await fetch('/api/social-accounts/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          redirectUri: `${window.location.origin}/api/social-accounts/callback`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Connect error:', errorData)
        throw new Error(errorData.error || errorData.hint || 'Failed to initiate connection')
      }

      const data = await response.json()
      console.log('Connect response:', data)
      
      if (data.authUrl) {
        // Redirect to Facebook OAuth
        console.log('Redirecting to:', data.authUrl)
        window.location.href = data.authUrl
      } else {
        console.error('No authUrl in response:', data)
        throw new Error(data.error || 'No auth URL received from server. Check server logs for details.')
      }
    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message || 'A apărut o eroare la conectare')
      setConnectingPlatform(null)
    }
  }

  const handleDisconnectAccount = async (accountId: string) => {
    if (!confirm(t('settings.disconnectConfirm'))) {
      return
    }

    try {
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('id', accountId)

      if (error) throw error

      fetchSocialAccounts()
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare la deconectare')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      let logoUrl = logoPreview

      // Upload new logo if provided
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true })

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName)
        
        logoUrl = publicUrl
      }

      // Update brand kit
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

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('settings.title')}</h1>
        <p className="text-base text-gray-600">
          {t('settings.subtitle')}
        </p>
      </div>

      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-xl font-bold text-gray-900 mb-2">{t('settings.brandKit')}</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {t('settings.updateBrandIdentity')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">
                {t('settings.brandKitUpdated')}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-900">{t('settings.logo')}</Label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {logoFile ? t('settings.changeLogo') : t('settings.uploadLogo')}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-sm font-semibold text-gray-900">{t('settings.primaryColor')}</Label>
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
                <Label htmlFor="secondaryColor" className="text-sm font-semibold text-gray-900">{t('settings.secondaryColor')}</Label>
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

            <div className="space-y-2">
              <Label htmlFor="businessDescription" className="text-sm font-semibold text-gray-900">{t('settings.businessDescription')}</Label>
              <Textarea
                id="businessDescription"
                placeholder={t('settings.businessDescriptionPlaceholder')}
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={4}
                className="text-sm"
              />
            </div>

            <Button type="submit" className="text-sm py-5" disabled={loading}>
              {loading ? t('settings.saving') : t('settings.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Social Media Accounts */}
      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-xl font-bold text-gray-900 mb-2">{t('settings.socialAccounts')}</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            {t('settings.connectAccounts')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 mb-4">
              <p className="font-semibold mb-1">{t('common.error')}:</p>
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200 mb-4">
              {t('settings.accountConnected')}
            </div>
          )}

          <div className="space-y-3">
            {['facebook', 'instagram', 'linkedin', 'tiktok', 'x'].map((platform) => {
              const Icon = platformIcons[platform] || XIcon
              const connectedAccount = socialAccounts.find(
                acc => acc.platform.toLowerCase() === platform.toLowerCase()
              )

              return (
                <div
                  key={platform}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {platformNames[platform] || platform}
                      </p>
                      {connectedAccount && (
                        <p className="text-xs text-gray-500">
                          {connectedAccount.username || connectedAccount.name || t('settings.connected')}
                        </p>
                      )}
                    </div>
                  </div>
                  {connectedAccount ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        {t('settings.connected')}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnectAccount(connectedAccount.id)}
                        className="text-xs"
                      >
                        {t('settings.disconnect')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnectAccount(platform)}
                      disabled={connectingPlatform === platform}
                      className="text-xs"
                    >
                      {connectingPlatform === platform ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          {t('settings.connecting')}
                        </>
                      ) : (
                        t('settings.connect')
                      )}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              {t('settings.oauthNote')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
