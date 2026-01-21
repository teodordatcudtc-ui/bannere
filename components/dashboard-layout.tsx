'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar, 
  CalendarDays,
  Settings, 
  LogOut,
  CreditCard
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'

interface DashboardLayoutProps {
  children: React.ReactNode
  credits?: number
}

export function DashboardLayout({ children, credits = 0 }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const { t } = useI18n()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => {
      setUser(user)
      if (!user) {
        router.push('/auth/login')
      }
    })
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/playground', label: t('nav.playground'), icon: Sparkles },
    { href: '/dashboard/schedule', label: t('nav.schedule'), icon: Calendar },
    { href: '/dashboard/calendar', label: t('nav.calendar'), icon: CalendarDays },
    { href: '/dashboard/settings', label: t('nav.settings'), icon: Settings },
  ]

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#F0F4FF] via-[#F8F9FF] to-[#E8EDFF]">
      {/* Sidebar */}
      <aside className="w-68 fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-sm border-r border-white/50 flex flex-col z-10 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <Link href="/">
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
              SocialPilot
            </h1>
          </Link>
        </div>
        <nav className="flex-1 p-5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link 
                key={item.href} 
                href={item.href}
                prefetch={true}
                className="block"
              >
                <div
                  className={`
                    w-full px-5 py-3 rounded-xl transition-all flex items-center gap-3 text-sm font-medium
                    ${isActive 
                      ? 'bg-gray-900 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            )
          })}
        </nav>
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full px-5 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-68">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/50 px-7 py-5 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('common.welcome')}{user?.email ? `, ${user.email.split('@')[0]}` : ''}</h2>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-gradient-to-r from-[#E9D5FF] to-[#C4B5FD] rounded-lg">
                <CreditCard className="h-4 w-4 text-[#8B7CFF]" />
                <span className="text-sm text-gray-700 font-semibold">{t('dashboard.credits')}:</span>
                <Badge className="bg-white text-[#8B7CFF] text-sm font-bold px-2.5 py-1 border border-[#8B7CFF]/20">
                  {credits}
                </Badge>
              </div>
              <Link href="/dashboard/subscribe">
                <Button className="bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white text-sm px-5">
                  {t('dashboard.update')}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-7 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
