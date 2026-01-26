'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { ro } from 'date-fns/locale/ro'
import { CalendarIcon, Facebook, Instagram, Linkedin, Music, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ScheduledPost {
  id: string
  caption: string
  scheduled_for: string
  platforms: string[]
  status: 'pending' | 'posted' | 'failed'
  generated_images: {
    image_url: string
  } | null
}

const platformIcons: Record<string, any> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  tiktok: Music,
}

const platformColors: Record<string, string> = {
  facebook: 'bg-blue-500',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  linkedin: 'bg-blue-600',
  tiktok: 'bg-black',
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchScheduledPosts()
  }, [currentMonth])

  const fetchScheduledPosts = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get start and end of current month view
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const viewStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const viewEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const { data, error } = await supabase
      .from('scheduled_posts')
      .select('*, generated_images(image_url)')
      .eq('user_id', user.id)
      .gte('scheduled_for', viewStart.toISOString())
      .lte('scheduled_for', viewEnd.toISOString())
      .order('scheduled_for', { ascending: true })

    if (error) {
      console.error('Error fetching scheduled posts:', error)
    } else if (data) {
      setScheduledPosts(data)
    }
    setLoading(false)
  }

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => 
      isSameDay(new Date(post.scheduled_for), date)
    )
  }

  const getDayModifiers = (date: Date) => {
    const posts = getPostsForDate(date)
    return {
      hasPosts: posts.length > 0,
      postCount: posts.length,
    }
  }

  const selectedDatePosts = getPostsForDate(selectedDate)

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Ești sigur că vrei să ștergi această postare programată?')) {
      return
    }

    setDeletingPostId(postId)
    try {
      const response = await fetch('/api/scheduled-posts/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete post')
      }

      // Remove post from local state
      setScheduledPosts(prev => prev.filter(p => p.id !== postId))
    } catch (error: any) {
      console.error('Error deleting post:', error)
      alert(error.message || 'A apărut o eroare la ștergerea postării')
    } finally {
      setDeletingPostId(null)
    }
  }

  return (
    <div className="space-y-7">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card className="border-0 bg-white rounded-2xl shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-gray-900">Calendar postări</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={ro}
                className="rounded-lg"
                modifiersClassNames={{
                  hasPosts: 'bg-purple-100 text-purple-900 font-semibold',
                }}
                modifiers={{
                  hasPosts: (date) => getDayModifiers(date).hasPosts,
                }}
                components={{
                  DayButton: ({ day, ...props }: any) => {
                    const date = day.date
                    const modifiers = getDayModifiers(date)
                    const posts = getPostsForDate(date)
                    const isSelected = isSameDay(date, selectedDate)
                    const isToday = isSameDay(date, new Date())
                    
                    return (
                      <button
                        {...props}
                        className={cn(
                          'relative w-full h-full flex flex-col items-center justify-center p-2 rounded-md transition-colors',
                          isSelected && 'bg-purple-500 text-white',
                          !isSelected && modifiers.hasPosts && 'bg-purple-100 text-purple-900 hover:bg-purple-200',
                          !isSelected && !modifiers.hasPosts && 'hover:bg-gray-100',
                          !isToday && 'text-gray-600',
                          isToday && !isSelected && 'bg-blue-50 text-blue-900 font-semibold'
                        )}
                      >
                        <span className="text-sm font-medium">{format(date, 'd')}</span>
                        {modifiers.hasPosts && (
                          <span className={cn(
                            'absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full',
                            isSelected ? 'bg-white' : 'bg-purple-500'
                          )} />
                        )}
                        {posts.length > 1 && (
                          <span className={cn(
                            'absolute top-1 right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center',
                            isSelected 
                              ? 'bg-white text-purple-500' 
                              : 'bg-purple-500 text-white'
                          )}>
                            {posts.length}
                          </span>
                        )}
                      </button>
                    )
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Posts */}
        <div>
          <Card className="border-0 bg-white rounded-2xl shadow-sm sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#8B7CFF]" />
                {format(selectedDate, 'd MMMM yyyy', { locale: ro })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Se încarcă...</div>
              ) : selectedDatePosts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">Nu există postări programate</p>
                  <p className="text-sm text-gray-400">Alege o altă dată pentru a vedea postările</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {selectedDatePosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow relative"
                    >
                      {post.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPostId === post.id}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="flex items-start gap-3 mb-3 pr-8">
                        {post.generated_images?.image_url && (
                          <img
                            src={post.generated_images.image_url}
                            alt="Banner"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium line-clamp-2 mb-2">
                            {post.caption}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {post.platforms.map((platform) => {
                              const Icon = platformIcons[platform.toLowerCase()] || CalendarIcon
                              return (
                                <Badge
                                  key={platform}
                                  className={cn(
                                    'text-white text-xs px-2 py-1 flex items-center gap-1',
                                    platformColors[platform.toLowerCase()] || 'bg-gray-500'
                                  )}
                                >
                                  <Icon className="h-3 w-3" />
                                  {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {format(new Date(post.scheduled_for), 'HH:mm', { locale: ro })}
                        </span>
                        <Badge
                          variant={
                            post.status === 'posted' ? 'default' :
                            post.status === 'failed' ? 'destructive' :
                            'secondary'
                          }
                          className="text-xs"
                        >
                          {post.status === 'posted' ? 'Publicat' :
                           post.status === 'failed' ? 'Eșuat' :
                           'Programat'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Overview */}
        <Card className="border-0 bg-white rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">
              Prezentare generală - {format(currentMonth, 'MMMM yyyy', { locale: ro })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {scheduledPosts.filter(p => p.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Programate</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {scheduledPosts.filter(p => p.status === 'posted').length}
                </div>
                <div className="text-sm text-gray-600">Publicate</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {scheduledPosts.filter(p => p.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Eșuate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
    </div>
  )
}
