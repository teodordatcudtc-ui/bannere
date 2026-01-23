'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Search, Calendar, Image as ImageIcon, Grid3x3, List } from 'lucide-react'
import { format } from 'date-fns'
import { ro, enUS } from 'date-fns/locale'
import { useI18n } from '@/lib/i18n/context'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

interface GalleryContentProps {
  images: any[]
}

export function GalleryContent({ images: initialImages }: GalleryContentProps) {
  const { t, locale } = useI18n()
  const dateLocale = locale === 'ro' ? ro : enUS
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter images based on search query
  const filteredImages = initialImages.filter((image) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      image.prompt?.toLowerCase().includes(query) ||
      image.theme?.toLowerCase().includes(query) ||
      image.id?.toLowerCase().includes(query)
    )
  })

  const handleDownload = (imageUrl: string, imageId: string) => {
    const downloadUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}&id=${imageId}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `banner-${imageId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSchedule = (imageId: string) => {
    router.push(`/dashboard/schedule?imageId=${imageId}`)
  }

  return (
    <div className="space-y-4 md:space-y-7">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Galerie Bannere</h1>
          <p className="text-sm md:text-base text-gray-600">
            Toate bannerele tale generate ({filteredImages.length} {filteredImages.length === 1 ? 'banner' : 'bannere'})
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="flex items-center gap-2"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
            <span className="hidden sm:inline">{viewMode === 'grid' ? 'Listă' : 'Grilă'}</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Caută după prompt, temă sau ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Images Grid/List */}
      {filteredImages.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {filteredImages.map((image) => (
              <Card
                key={image.id}
                className="overflow-hidden border-0 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                  <img
                    src={image.image_url}
                    alt={image.prompt || 'Banner generat'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownload(image.image_url, image.id)
                      }}
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSchedule(image.id)
                      }}
                      className="bg-[#8B7CFF] hover:bg-[#7C6EE6] text-white"
                    >
                      Programează
                    </Button>
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  {image.prompt && (
                    <p className="text-xs md:text-sm text-gray-700 line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(image.created_at), 'd MMM yyyy', { locale: dateLocale })}
                    </span>
                    {image.theme && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                        {image.theme}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {filteredImages.map((image) => (
              <Card
                key={image.id}
                className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
                  <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={image.image_url}
                      alt={image.prompt || 'Banner generat'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    {image.prompt && (
                      <p className="text-sm md:text-base font-medium text-gray-900 mb-2 line-clamp-2">
                        {image.prompt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                        {format(new Date(image.created_at), 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
                      </span>
                      {image.theme && (
                        <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                          {image.theme}
                        </span>
                      )}
                      {image.variant_number && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          Varianta {image.variant_number}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(image.image_url, image.id)
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSchedule(image.id)
                        }}
                        className="bg-[#8B7CFF] hover:bg-[#7C6EE6] text-white"
                      >
                        Programează
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#E9D5FF] to-[#C4B5FD] flex items-center justify-center mb-5 shadow-lg">
              <ImageIcon className="h-8 w-8 text-[#8B7CFF]" />
            </div>
            <p className="text-base text-gray-600 mb-2 text-center">
              {searchQuery ? 'Nu s-au găsit bannere care să corespundă căutării' : 'Nu ai generat încă bannere'}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => router.push('/dashboard/playground')}
                className="bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white mt-4"
              >
                Generează primul banner
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Preview Banner</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="p-6 pt-4">
              <div className="relative w-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden mb-4">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.prompt || 'Banner preview'}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              {selectedImage.prompt && (
                <p className="text-sm text-gray-700 mb-4">
                  <strong>Prompt:</strong> {selectedImage.prompt}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(selectedImage.created_at), 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
                </span>
                {selectedImage.theme && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full capitalize">
                    {selectedImage.theme}
                  </span>
                )}
                {selectedImage.variant_number && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                    Varianta {selectedImage.variant_number}
                  </span>
                )}
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedImage.image_url, selectedImage.id)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => {
                    setSelectedImage(null)
                    handleSchedule(selectedImage.id)
                  }}
                  className="flex-1 bg-[#8B7CFF] hover:bg-[#7C6EE6] text-white"
                >
                  Programează
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
