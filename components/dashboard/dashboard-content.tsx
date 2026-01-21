'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Calendar, Image as ImageIcon, ArrowRight, TrendingUp, Clock, CheckCircle, Facebook, Instagram, Linkedin, Music, BarChart3 } from 'lucide-react'
import { format } from 'date-fns'
import { ro, enUS } from 'date-fns/locale'
import { useI18n } from '@/lib/i18n/context'

interface DashboardContentProps {
  credits: number
  totalImagesCount: number
  totalScheduledCount: number
  totalPostedCount: number
  platformCounts: Record<string, number>
  recentPosts: any[]
  recentImages: any[]
  scheduledPosts: any[]
}

export function DashboardContent({
  credits,
  totalImagesCount,
  totalScheduledCount,
  totalPostedCount,
  platformCounts,
  recentPosts,
  recentImages,
  scheduledPosts,
}: DashboardContentProps) {
  const { t, locale } = useI18n()
  const dateLocale = locale === 'ro' ? ro : enUS

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        <p className="text-base text-gray-600">
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('dashboard.availableCredits')}</p>
                <p className="text-3xl font-bold text-gray-900">{credits}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('dashboard.generatedBanners')}</p>
                <p className="text-3xl font-bold text-gray-900">{totalImagesCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center shadow-lg">
                <ImageIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('dashboard.scheduledPosts')}</p>
                <p className="text-3xl font-bold text-gray-900">{totalScheduledCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FCA5A5] to-[#EF4444] flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('dashboard.publishedPosts')}</p>
                <p className="text-3xl font-bold text-gray-900">{totalPostedCount}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#34D399] to-[#10B981] flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-5">
        <Link href="/dashboard/playground">
          <Card className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#8B7CFF] transition-colors" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">{t('dashboard.generateBanners')}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {t('dashboard.createBanners')}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/dashboard/schedule">
          <Card className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FCA5A5] to-[#EF4444] flex items-center justify-center shadow-lg">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-[#EF4444] transition-colors" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">{t('dashboard.schedulePosts')}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {t('dashboard.scheduleBanners')}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Platform Distribution */}
        <Card className="border-0 bg-white rounded-2xl shadow-sm lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#8B7CFF]" />
              {t('dashboard.platformDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(platformCounts).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(platformCounts).map(([platform, count]) => {
                  const platformIcons: Record<string, any> = {
                    facebook: Facebook,
                    instagram: Instagram,
                    linkedin: Linkedin,
                    tiktok: Music,
                  }
                  const Icon = platformIcons[platform.toLowerCase()] || BarChart3
                  const colors: Record<string, string> = {
                    facebook: 'bg-blue-500',
                    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
                    linkedin: 'bg-blue-600',
                    tiktok: 'bg-black',
                  }
                  return (
                    <div key={platform} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colors[platform.toLowerCase()] || 'bg-gray-500'} flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 capitalize">{platform}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                {t('dashboard.noScheduledPosts')}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 bg-white rounded-2xl shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#8B7CFF]" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts && recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map((post: any) => (
                  <div key={post.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    {post.generated_images?.image_url && (
                      <img
                        src={post.generated_images.image_url}
                        alt="Postare"
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {post.status === 'posted' 
                          ? t('dashboard.postPublished') 
                          : post.status === 'pending' 
                          ? t('dashboard.postScheduled') 
                          : t('dashboard.postFailed')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(post.created_at), 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {post.platforms.slice(0, 2).map((platform: string) => {
                        const colors: Record<string, string> = {
                          facebook: 'bg-blue-500',
                          instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
                          linkedin: 'bg-blue-600',
                          tiktok: 'bg-black',
                        }
                        return (
                          <div
                            key={platform}
                            className={`w-6 h-6 rounded-full ${colors[platform.toLowerCase()] || 'bg-gray-500'}`}
                            title={platform}
                          />
                        )
                      })}
                      {post.platforms.length > 2 && (
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-700 font-semibold">+{post.platforms.length - 2}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                {t('dashboard.noRecentActivity')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Images */}
      <div>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.recentImages')}</h2>
          <Link href="/dashboard/playground">
            <Button variant="outline" className="border-gray-200 text-gray-700 hover:border-[#8B7CFF] hover:text-[#8B7CFF] text-sm px-5">
              {t('dashboard.seeAll')}
            </Button>
          </Link>
        </div>
        {recentImages && recentImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recentImages.map((image) => (
              <Card key={image.id} className="overflow-hidden border-0 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className="aspect-square relative overflow-hidden rounded-t-2xl">
                  <img
                    src={image.image_url}
                    alt="Banner generat"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 bg-white rounded-2xl shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#E9D5FF] to-[#C4B5FD] flex items-center justify-center mb-5 shadow-lg">
                <ImageIcon className="h-8 w-8 text-[#8B7CFF]" />
              </div>
              <p className="text-base text-gray-600 mb-5">{t('dashboard.noImages')}</p>
              <Link href="/dashboard/playground">
                <Button className="bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white text-sm px-6 py-5">
                  {t('dashboard.generateFirstBanner')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Scheduled Posts */}
      {scheduledPosts && scheduledPosts.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.upcomingScheduled')}</h2>
            <Link href="/dashboard/calendar">
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:border-[#8B7CFF] hover:text-[#8B7CFF] text-sm px-5">
                {t('dashboard.seeCalendar')}
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {scheduledPosts.map((post: any) => (
              <Card key={post.id} className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center gap-5">
                    {post.generated_images && (
                      <img
                        src={post.generated_images.image_url}
                        alt="Postare programată"
                        className="w-16 h-16 object-cover rounded-xl border-2 border-gray-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate mb-1">{post.caption.substring(0, 50)}...</p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(post.scheduled_for), 'd MMMM yyyy, HH:mm', { locale: dateLocale })}
                      </p>
                    </div>
                    <div className="flex gap-2.5">
                      {post.platforms.map((platform: string, index: number) => {
                        const colors = [
                          'bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA]',
                          'bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]',
                          'bg-gradient-to-r from-[#FCA5A5] to-[#EF4444]',
                          'bg-gradient-to-r from-[#34D399] to-[#10B981]',
                        ]
                        return (
                          <span
                            key={platform}
                            className={`text-xs px-3 py-1.5 ${colors[index % colors.length]} text-white rounded-full font-semibold capitalize shadow-sm`}
                          >
                            {platform}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
