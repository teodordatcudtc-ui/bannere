'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Calendar, Image as ImageIcon } from 'lucide-react'

// Recent images for dashboard preview - add your image URLs here
// Place your images in the public/images/ folder and update the paths below
const RECENT_IMAGES = [
  '/images/recent-1.png', // Replace with your first image path
  '/images/recent-2.png', // Replace with your second image path
  '/images/recent-3.png', // Replace with your third image path
]

export function DashboardPreview() {
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Dashboard Mockup */}
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Browser Bar */}
        <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 text-center">
            bannerly.ro/dashboard
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 bg-gradient-to-br from-[#F0F4FF] to-[#F8F9FF]">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Panou de control</h3>
              <p className="text-xs text-gray-600">Gestionează bannerele tale</p>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-[#E9D5FF] to-[#C4B5FD] rounded-lg">
              <span className="text-xs font-semibold text-gray-700">Credite:</span>
              <span className="text-xs font-bold text-[#8B7CFF]">250</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Generează</p>
                    <p className="text-xs text-gray-600">Bannere</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Programează</p>
                    <p className="text-xs text-gray-600">Postări</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Images Grid */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 mb-2">Imagini recente</h4>
            <div className="grid grid-cols-3 gap-2">
              {RECENT_IMAGES.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-[#E9D5FF] to-[#C4B5FD] relative"
                >
                  <img
                    src={image}
                    alt={`Imagine recentă ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to placeholder if image doesn't exist
                      const target = e.target as HTMLImageElement
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E9D5FF] to-[#C4B5FD]">
                            <svg class="h-4 w-4 text-[#8B7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        `
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#8B7CFF] to-[#A78BFA] rounded-full opacity-20 blur-2xl"></div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] rounded-full opacity-20 blur-2xl"></div>
    </div>
  )
}
