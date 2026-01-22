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
  CreditCard,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex w-68 fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-sm border-r border-white/50 flex-col z-10 shadow-sm">
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out md:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] bg-clip-text text-transparent">
              SocialPilot
            </h1>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link 
                key={item.href} 
                href={item.href}
                prefetch={true}
                className="block"
                onClick={() => setMobileMenuOpen(false)}
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
            onClick={() => {
              handleLogout()
              setMobileMenuOpen(false)
            }}
            className="w-full px-5 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm font-medium"
          >
            <LogOut className="h-5 w-5" />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-68">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-white/50 px-4 md:px-7 py-4 md:py-5 sticky top-0 z-10 shadow-sm">
          <div className="flex justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                {t('common.welcome')}{user?.email ? `, ${user.email.split('@')[0]}` : ''}
              </h2>
            </div>
            <div className="flex items-center gap-2 md:gap-5 flex-shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2.5 px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-[#E9D5FF] to-[#C4B5FD] rounded-lg">
                <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4 text-[#8B7CFF]" />
                <span className="text-xs md:text-sm text-gray-700 font-semibold hidden sm:inline">{t('dashboard.credits')}:</span>
                <Badge className="bg-white text-[#8B7CFF] text-xs md:text-sm font-bold px-2 md:px-2.5 py-0.5 md:py-1 border border-[#8B7CFF]/20">
                  {credits}
                </Badge>
              </div>
              <Link href="/dashboard/subscribe" className="hidden sm:block">
                <Button className="bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white text-xs md:text-sm px-3 md:px-5">
                  {t('dashboard.update')}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-7 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
