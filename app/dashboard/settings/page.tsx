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
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountSuccess, setAccountSuccess] = useState(false)
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
    fetchProfile()
    
    const urlParams = new URLSearchParams(window.location.search)
    
    // Check for OAuth callback success
    if (urlParams.get('connected') === 'success') {
      setSuccess(true)
      fetchSocialAccounts()
      setTimeout(() => {
        fetchSocialAccounts()
        setSuccess(false)
        window.history.replaceState({}, '', '/dashboard/settings')
      }, 1000)
    }
    
    // Check for OAuth error (e.g. from Outstand redirect)
    const oauthError = urlParams.get('error')
    if (oauthError) {
      const decoded = decodeURIComponent(oauthError)
      if (decoded.includes('Facebook Pages') || decoded.includes('No Facebook Pages') || decoded.toLowerCase().includes('pages found')) {
        setError(
          'Pentru Facebook trebuie să ai un Pagină Facebook (Page), nu doar un profil personal. ' +
          'Creează o Pagină la facebook.com/pages/create, asigură-te că ești administrator, apoi încearcă din nou conectarea.'
        )
      } else if (decoded.startsWith('oauth_')) {
        setError(decoded.replace(/^oauth_/, '').replace(/_/g, ' '))
      } else {
        setError(decoded)
      }
      window.history.replaceState({}, '', '/dashboard/settings')
    }
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get email from auth user
    setEmail(user.email || '')

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    if (profile) {
      setFullName(profile.full_name || '')
      // Use email from profile if available, otherwise from auth
      if (profile.email) {
        setEmail(profile.email)
      }
    }
  }

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
        // For TikTok, open OAuth in a popup window to allow account selection
        // This isolates the OAuth session from the main window
        if (platform === 'tiktok') {
          // Clear any TikTok-related localStorage/sessionStorage that might cache the session
          try {
            sessionStorage.removeItem('tiktok_oauth_state')
            sessionStorage.removeItem('tiktok_session')
            localStorage.removeItem('tiktok_oauth_state')
          } catch (e) {
            // Ignore if storage is not available
          }
          
          // Use an intermediate logout page that clears TikTok session, then redirects to OAuth
          // This endpoint will attempt to logout from TikTok, then redirect to OAuth with max_age=0
          const popupWidth = 600
          const popupHeight = 700
          const left = (window.screen.width - popupWidth) / 2
          const top = (window.screen.height - popupHeight) / 2
          
          // Create intermediate URL that does logout then redirects to OAuth
          const intermediateUrl = `/api/social-accounts/tiktok-logout?oauth_url=${encodeURIComponent(data.authUrl)}`
          
          // Open popup to intermediate logout page
          // This page will attempt to logout from TikTok, then redirect to OAuth
          // The OAuth URL already has max_age=0 parameter to force fresh login
          const popup = window.open(
            intermediateUrl,
            'TikTok OAuth',
            `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
          )
          
          if (!popup) {
            throw new Error('Popup blocked. Please allow popups for this site.')
          }
          
          // Listen for messages from the popup (when OAuth completes)
          const messageListener = (event: MessageEvent) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) {
              return
            }
            
            if (event.data.type === 'TIKTOK_OAUTH_SUCCESS') {
              console.log('TikTok OAuth completed successfully')
              popup?.close()
              window.removeEventListener('message', messageListener)
              // Refresh social accounts list
              fetchSocialAccounts()
              setSuccess(true)
              setTimeout(() => setSuccess(false), 3000)
              setConnectingPlatform(null)
            } else if (event.data.type === 'TIKTOK_OAUTH_ERROR') {
              console.error('TikTok OAuth error:', event.data.error)
              popup?.close()
              window.removeEventListener('message', messageListener)
              setError(event.data.error || 'A apărut o eroare la conectare')
              setConnectingPlatform(null)
            } else if (event.data.type === 'REQUEST_AUTH_TOKEN') {
              // Popup is requesting auth token - send it
              // Get auth token from Supabase
              const supabase = (window as any).supabase
              if (supabase) {
                supabase.auth.getSession().then(({ data: { session } }: any) => {
                  if (session?.access_token) {
                    popup?.postMessage({
                      type: 'AUTH_TOKEN_RESPONSE',
                      token: session.access_token
                    }, window.location.origin)
                  } else {
                    popup?.postMessage({
                      type: 'AUTH_TOKEN_ERROR',
                      error: 'No session found'
                    }, window.location.origin)
                  }
                }).catch((err: any) => {
                  popup?.postMessage({
                    type: 'AUTH_TOKEN_ERROR',
                    error: err.message
                  }, window.location.origin)
                })
              } else {
                popup?.postMessage({
                  type: 'AUTH_TOKEN_ERROR',
                  error: 'Supabase client not available'
                }, window.location.origin)
              }
            }
          }
          
          window.addEventListener('message', messageListener)
          
          // Also check if popup was closed manually
          const checkPopupClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopupClosed)
              window.removeEventListener('message', messageListener)
              setConnectingPlatform(null)
            }
          }, 1000)
          
          // Cleanup on component unmount
          return () => {
            clearInterval(checkPopupClosed)
            window.removeEventListener('message', messageListener)
            if (popup && !popup.closed) {
              popup.close()
            }
          }
        } else {
          // For other platforms, use standard redirect
          console.log('Redirecting to OAuth:', data.authUrl)
          window.location.href = data.authUrl
        }
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

  const handleDisconnectAccount = async (accountId: string, platform: string) => {
    if (!confirm(t('settings.disconnectConfirm'))) {
      return
    }

    try {
      setError(null)
      
      // For TikTok, clear any potential session storage that might cache OAuth state
      if (platform === 'tiktok') {
        try {
          // Clear session storage that might cache TikTok OAuth
          sessionStorage.removeItem('tiktok_oauth_state')
          sessionStorage.removeItem('tiktok_session')
          sessionStorage.removeItem('tiktok_auth')
          // Also try to clear any TikTok-related localStorage
          localStorage.removeItem('tiktok_oauth_state')
          localStorage.removeItem('tiktok_session')
        } catch (e) {
          // Ignore if storage is not available
          console.log('Could not clear storage:', e)
        }
      }
      
      // Call API to disconnect account (deletes from Supabase and Outstand)
      const response = await fetch('/api/social-accounts/disconnect', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId,
          platform,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to disconnect account')
      }

      // Refresh social accounts list
      fetchSocialAccounts()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare la deconectare')
    }
  }

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccountLoading(true)
    setAccountError(null)
    setAccountSuccess(false)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Validate email
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email invalid')
      }

      // Update email in auth.users if changed
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        })

        if (emailError) {
          throw emailError
        }
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          email: email || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      setAccountSuccess(true)
      setTimeout(() => setAccountSuccess(false), 3000)
    } catch (err: any) {
      setAccountError(err.message || 'A apărut o eroare la actualizarea datelor')
    } finally {
      setAccountLoading(false)
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

      {/* Account Settings */}
      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardHeader className="p-6">
          <CardTitle className="text-xl font-bold text-gray-900 mb-2">Date cont</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Actualizează informațiile tale personale
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleUpdateAccount} className="space-y-6">
            {accountError && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {accountError}
              </div>
            )}
            {accountSuccess && (
              <div className="p-4 text-sm text-green-600 bg-green-50 rounded-lg border border-green-200">
                Datele au fost actualizate cu succes!
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-gray-900">
                Nume complet
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Introdu numele tău complet"
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="text-sm"
                required
              />
              <p className="text-xs text-gray-500">
                Dacă schimbi email-ul, vei primi un email de confirmare la noua adresă
              </p>
            </div>

            <Button type="submit" className="text-sm py-5" disabled={accountLoading}>
              {accountLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                'Salvează modificările'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

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
          {/* Development Notice */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
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
                  Postarea automată pe social media este în curs de dezvoltare. Poți conecta conturile și programa postări, dar acestea vor fi procesate manual în acest moment. Funcționalitatea completă va fi disponibilă în curând.
                </p>
              </div>
            </div>
          </div>
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
              const isFacebook = platform === 'facebook'

              return (
                <div
                  key={platform}
                  className="flex flex-col gap-1"
                >
                <div
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
                        onClick={() => handleDisconnectAccount(connectedAccount.id, connectedAccount.platform)}
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
                {isFacebook && !connectedAccount && (
                  <p className="text-xs text-gray-500 px-1">
                    Pentru Facebook ai nevoie de o <strong>Pagină Facebook</strong> (Page), nu doar profil personal. Creează una la facebook.com/pages/create și fii administrator.
                  </p>
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

      {/* Account Deletion */}
      <Card className="border-0 bg-white rounded-2xl shadow-sm border-red-200">
        <CardHeader className="p-6">
          <CardTitle className="text-xl font-bold text-gray-900 mb-2">Ștergere Cont</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Șterge permanent contul tău și toate datele asociate. Această acțiune este ireversibilă.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
            <p className="text-sm text-red-800 mb-2">
              <strong>Atenție:</strong> Ștergerea contului va elimina permanent:
            </p>
            <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
              <li>Toate bannerele generate</li>
              <li>Toate postările programate</li>
              <li>Brand kit-ul tău</li>
              <li>Conturile de social media conectate</li>
              <li>Creditele și abonamentul</li>
            </ul>
          </div>
          <Button
            variant="destructive"
            onClick={async () => {
              if (!confirm('Ești sigur că vrei să ștergi contul? Această acțiune este permanentă și ireversibilă.')) {
                return
              }
              
              const finalConfirm = prompt('Pentru a confirma, scrie "ȘTERGE" în acest câmp:')
              if (finalConfirm !== 'ȘTERGE') {
                alert('Confirmare anulată. Contul nu a fost șters.')
                return
              }

              try {
                setError(null)
                setLoading(true)

                const response = await fetch('/api/account/delete', {
                  method: 'DELETE',
                })

                if (!response.ok) {
                  const errorData = await response.json()
                  throw new Error(errorData.error || 'Failed to delete account')
                }

                // Sign out and redirect
                await supabase.auth.signOut()
                window.location.href = '/'
              } catch (err: any) {
                setError(err.message || 'A apărut o eroare la ștergerea contului')
                setLoading(false)
              }
            }}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Se șterge...
              </>
            ) : (
              'Șterge Contul Permanent'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
