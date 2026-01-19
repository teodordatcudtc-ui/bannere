'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Sparkles, X, Type, Palette, Maximize2, Hash, Image as ImageIcon, FileText, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PlaygroundPage() {
  const [bannerText, setBannerText] = useState('')
  const [theme, setTheme] = useState('')
  const [variantCount, setVariantCount] = useState('5')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [includeLogo, setIncludeLogo] = useState(false)
  const [productImage, setProductImage] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const [bannerDetails, setBannerDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<any[]>([])
  const [credits, setCredits] = useState(0)
  const [brandKit, setBrandKit] = useState<any>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchCredits()
    fetchBrandKit()
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
      setBrandKit(data)
    }
  }

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProductImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProductImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeProductImage = () => {
    setProductImage(null)
    setProductImagePreview(null)
  }

  const handleAddTestCredits = async () => {
    try {
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 10 }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Eroare la adăugarea creditelor')
      }

      const data = await response.json()
      setCredits(data.newAmount)
      
      // Show success message briefly
      const successMsg = `+10 credite adăugate! Total: ${data.newAmount} credite`
      setError(null)
      alert(successMsg) // Simple alert for now, can be replaced with toast
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare')
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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setGeneratedImages([])

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const count = parseInt(variantCount)
      const requiredCredits = count

      // Check credits
      if (credits < requiredCredits) {
        setError(`Credite insuficiente. Ai nevoie de ${requiredCredits} credite dar ai doar ${credits}.`)
        setLoading(false)
        return
      }

      // Get brand kit
      const { data: brandKit } = await supabase
        .from('brand_kits')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Upload product image if provided
      let productImageUrl = null
      if (productImage) {
        const fileExt = productImage.name.split('.').pop()
        // Path must start with user_id to match RLS policies
        const fileName = `${user.id}/products/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('logos') // Using logos bucket for now, can create separate bucket later
          .upload(fileName, productImage)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw new Error(`Eroare la încărcarea imaginii produsului: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName)
        
        productImageUrl = publicUrl
      }

      // Call API to generate images
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: bannerText,
          theme,
          variantCount: count,
          aspectRatio,
          includeLogo,
          logoUrl: includeLogo && brandKit?.logo_url ? brandKit.logo_url : null,
          productImageUrl,
          bannerDetails: bannerDetails || null,
          brandKit: brandKit || {},
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Generarea imaginilor a eșuat')
      }

      const data = await response.json()

      // Deduct credits
      const deductResponse = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: requiredCredits,
          type: 'generation',
        }),
      })

      if (!deductResponse.ok) {
        throw new Error('Scăderea creditelor a eșuat')
      }

      setGeneratedImages(data.images || [])
      await fetchCredits()
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Playground</h1>
        <p className="text-base text-gray-600">
          Generează bannere cu AI folosind identitatea ta de brand
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Generation Form */}
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardHeader className="p-8 pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-3">Generează bannere</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Creează bannere profesionale cu AI în câteva secunde
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <form onSubmit={handleGenerate} className="space-y-8">
              {error && (
                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              {/* Text Banner */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#8B7CFF]/10 rounded-lg">
                    <Type className="h-5 w-5 text-[#8B7CFF]" />
                  </div>
                  <Label htmlFor="bannerText" className="text-lg font-semibold text-gray-900">
                    Ce text vrei pe banner?
                  </Label>
                </div>
                <Textarea
                  id="bannerText"
                  placeholder="Ex: Oferta specială - 50% reducere! 📢"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  rows={3}
                  className="text-base"
                  required
                />
              </div>

              {/* Theme and Format - Side by Side */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#8B7CFF]/10 rounded-lg">
                      <Palette className="h-5 w-5 text-[#8B7CFF]" />
                    </div>
                    <Label htmlFor="theme" className="text-lg font-semibold text-gray-900">Stil</Label>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="text-base h-11">
                      <SelectValue placeholder="Alege stilul" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">✨ Modern</SelectItem>
                      <SelectItem value="realist">📸 Realist</SelectItem>
                      <SelectItem value="elegant">👔 Elegant</SelectItem>
                      <SelectItem value="playful">🎉 Jucăuș</SelectItem>
                      <SelectItem value="professional">💼 Profesional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#8B7CFF]/10 rounded-lg">
                      <Maximize2 className="h-5 w-5 text-[#8B7CFF]" />
                    </div>
                    <Label htmlFor="aspectRatio" className="text-lg font-semibold text-gray-900">Format</Label>
                  </div>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="text-base h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">📱 16:9 (Facebook, LinkedIn)</SelectItem>
                      <SelectItem value="9:16">📸 9:16 (Stories, TikTok)</SelectItem>
                      <SelectItem value="1:1">⬜ 1:1 (Instagram Post)</SelectItem>
                      <SelectItem value="4:3">🖼️ 4:3 (Clasic)</SelectItem>
                      <SelectItem value="3:4">📐 3:4 (Portrait)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Variant Count */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#8B7CFF]/10 rounded-lg">
                    <Hash className="h-5 w-5 text-[#8B7CFF]" />
                  </div>
                  <Label htmlFor="variantCount" className="text-lg font-semibold text-gray-900">
                    Câte variante vrei?
                  </Label>
                </div>
                <Select value={variantCount} onValueChange={setVariantCount}>
                  <SelectTrigger className="text-base h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 variantă - Test rapid</SelectItem>
                    <SelectItem value="5">5 variante - Recomandat</SelectItem>
                    <SelectItem value="10">10 variante - Mai multe opțiuni</SelectItem>
                    <SelectItem value="20">20 variante - Maximum</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 ml-12">1 credit = 1 imagine generată</p>
              </div>

              {/* Optional Settings */}
              <div className="pt-6 border-t-2 border-gray-200 space-y-8">
                <div>
                  <p className="text-base font-semibold text-gray-800">Opțiuni avansate</p>
                  <p className="text-sm text-gray-500 mt-1">Personalizează-ți bannerul (opțional)</p>
                </div>

                {/* Include Logo */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="includeLogo"
                      checked={includeLogo}
                      onChange={(e) => setIncludeLogo(e.target.checked)}
                      className="w-5 h-5 text-[#8B7CFF] border-gray-300 rounded focus:ring-[#8B7CFF] cursor-pointer"
                    />
                    <Label htmlFor="includeLogo" className="text-base font-medium text-gray-900 cursor-pointer flex items-center gap-3">
                      <div className="p-1.5 bg-[#8B7CFF]/10 rounded-lg">
                        <Zap className="h-4 w-4 text-[#8B7CFF]" />
                      </div>
                      <span>Include logo-ul tău în banner</span>
                    </Label>
                  </div>
                  {includeLogo && brandKit?.logo_url && (
                    <p className="text-sm text-gray-500 ml-11">
                      ✓ Logo-ul tău va fi inclus automat
                    </p>
                  )}
                  {includeLogo && !brandKit?.logo_url && (
                    <p className="text-sm text-amber-600 ml-11">
                      ⚠ Nu ai un logo încărcat. Mergi la Setări pentru a încărca un logo.
                    </p>
                  )}
                </div>

                {/* Product Image */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#8B7CFF]/10 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-[#8B7CFF]" />
                    </div>
                    <Label htmlFor="productImage" className="text-base font-medium text-gray-900">
                      Imagine produs
                    </Label>
                  </div>
                  {!productImagePreview ? (
                    <div className="ml-11">
                      <Input
                        id="productImage"
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageChange}
                        className="text-base cursor-pointer"
                      />
                      <p className="text-sm text-gray-500 mt-3">
                        Adaugă o imagine cu produsul tău pentru a o integra în design
                      </p>
                    </div>
                  ) : (
                    <div className="ml-11 space-y-3">
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-gray-200">
                        <img
                          src={productImagePreview}
                          alt="Preview produs"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeProductImage}
                        className="text-sm"
                      >
                        Șterge imaginea
                      </Button>
                    </div>
                  )}
                </div>

                {/* Banner Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#8B7CFF]/10 rounded-lg">
                      <FileText className="h-5 w-5 text-[#8B7CFF]" />
                    </div>
                    <Label htmlFor="bannerDetails" className="text-base font-medium text-gray-900">
                      Detalii suplimentare
                    </Label>
                  </div>
                  <div className="ml-11">
                    <Textarea
                      id="bannerDetails"
                      placeholder="Ex: Vreau culori vibrante, text mare și bold, fundal degradat..."
                      value={bannerDetails}
                      onChange={(e) => setBannerDetails(e.target.value)}
                      rows={3}
                      className="text-base"
                    />
                    <p className="text-sm text-gray-500 mt-3">
                      Descrie cum vrei să arate bannerul pentru rezultate mai precise
                    </p>
                  </div>
                </div>
              </div>

              {/* Credits Info */}
              <div className="p-6 bg-gradient-to-br from-[#8B7CFF]/10 to-[#A78BFA]/10 rounded-xl border-2 border-[#8B7CFF]/20">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <p className="text-lg text-gray-900">
                      <span className="font-bold">Cost:</span> <span className="text-[#8B7CFF] font-semibold">{variantCount} credite</span>
                    </p>
                    <p className="text-base text-gray-700">
                      <span className="font-semibold">Ai disponibile:</span> <span className="font-bold">{credits} credite</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTestCredits}
                    className="text-sm border-[#8B7CFF] text-[#8B7CFF] hover:bg-[#8B7CFF] hover:text-white font-medium"
                  >
                    +10 Test
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full text-base py-6 bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white font-semibold shadow-lg transition-all" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Se generează...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generează bannere
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Generated Images */}
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Imagini generate</h2>
            {generatedImages.length > 0 && (
              <Badge className="text-sm px-3 py-1">{generatedImages.length} imagini</Badge>
            )}
          </div>

          {loading && (
            <Card className="border-0 bg-white rounded-2xl shadow-sm">
              <CardContent className="flex items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-[#8B7CFF]" />
              </CardContent>
            </Card>
          )}

          {!loading && generatedImages.length === 0 && (
            <Card className="border-0 bg-white rounded-2xl shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#E9D5FF] to-[#C4B5FD] flex items-center justify-center mb-5 shadow-lg">
                  <Sparkles className="h-8 w-8 text-[#8B7CFF]" />
                </div>
                <p className="text-base text-gray-600 text-center">
                  Imaginile generate vor apărea aici
                </p>
              </CardContent>
            </Card>
          )}

          {!loading && generatedImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <Card key={image.id || index} className="overflow-hidden border-0 bg-white rounded-2xl shadow-sm">
                  <div 
                    className="aspect-video relative max-h-[300px] cursor-pointer"
                    onClick={() => setSelectedImagePreview(image)}
                  >
                    <img
                      src={image.image_url}
                      alt={`Banner generat ${index + 1}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Varianta {index + 1}
                      </span>
                      <Button
                        size="sm"
                        className="text-sm"
                        onClick={() => router.push(`/dashboard/schedule?imageId=${image.id}`)}
                      >
                        Programează
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Image Preview Dialog */}
          <Dialog open={!!selectedImagePreview} onOpenChange={(open) => !open && setSelectedImagePreview(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <DialogHeader className="p-6 pb-0">
                <DialogTitle>Preview Banner</DialogTitle>
              </DialogHeader>
              {selectedImagePreview && (
                <div className="p-6 pt-4">
                  <div className="relative w-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={selectedImagePreview.image_url}
                      alt="Banner preview"
                      className="max-w-full max-h-[70vh] object-contain"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-sm text-gray-600">
                      Varianta {generatedImages.findIndex(img => img.id === selectedImagePreview.id) + 1}
                    </span>
                    <Button
                      onClick={() => {
                        setSelectedImagePreview(null)
                        router.push(`/dashboard/schedule?imageId=${selectedImagePreview.id}`)
                      }}
                    >
                      Programează
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
