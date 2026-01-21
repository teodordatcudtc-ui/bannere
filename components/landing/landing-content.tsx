'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Palette, Calendar, Check, Zap, Wand2, Share2, ArrowRight } from 'lucide-react'
import { DashboardPreview } from '@/components/dashboard-preview'
import { useI18n } from '@/lib/i18n/context'

interface LandingContentProps {
  user: any
}

export function LandingContent({ user }: LandingContentProps) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-xl font-bold text-gray-900">SocialPilot</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-gray-700 hover:text-gray-900">
              {t('nav.features')}
            </Link>
            <Link href="#pricing" className="text-sm text-gray-700 hover:text-gray-900">
              {t('nav.pricing')}
            </Link>
            <Link href="#contact" className="text-sm text-gray-700 hover:text-gray-900">
              {t('nav.contact')}
            </Link>
          </nav>
          <div className="flex gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  {t('auth.goToDashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                    {t('auth.signup')}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full mb-6">
                  <Sparkles className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-700">{t('landing.hero.badge')}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-[1.1]">
                  {t('landing.hero.title')} <span className="text-[#8B7CFF]">{t('landing.hero.titleHighlight')}</span>
                </h1>
                <p className="text-base text-gray-600 mb-8 leading-relaxed">
                  {t('landing.hero.description')}
                </p>
                <div className="flex gap-4 mb-6">
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-[#8B7CFF] hover:bg-[#7C6EE6] text-white text-base px-8 py-6">
                      {t('landing.hero.startFree')}
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2">
                      <span className="mr-2">▶</span>
                      {t('landing.hero.seeDemo')}
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-500">{t('landing.hero.trial')}</p>
              </div>

              {/* Right Side - Dashboard Preview */}
              <div className="relative">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gradient-to-br from-white via-purple-50/30 to-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {t('landing.howItWorks.title')}
              </h2>
              <p className="text-xl text-gray-600">
                {t('landing.howItWorks.subtitle')}
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              {/* Steps Container */}
              <div className="relative">
                {/* Connection Line - Hidden on mobile, visible on desktop */}
                <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8B7CFF] via-[#A78BFA] to-[#8B7CFF] opacity-20"></div>
                
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
                  {/* Step 1 */}
                  <div className="relative group">
                    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#8B7CFF]/30 hover:-translate-y-2">
                      {/* Step Number Badge */}
                      <div className="absolute -top-4 left-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">1</span>
                        </div>
                      </div>
                      
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B7CFF]/10 to-[#A78BFA]/10 flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform">
                        <Wand2 className="h-8 w-8 text-[#8B7CFF]" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.howItWorks.step1.title')}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {t('landing.howItWorks.step1.description')}
                      </p>
                      
                      {/* Decorative Element */}
                      <div className="mt-6 flex items-center text-[#8B7CFF] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-semibold">{t('landing.howItWorks.learnMore')}</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative group">
                    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#8B7CFF]/30 hover:-translate-y-2">
                      {/* Step Number Badge */}
                      <div className="absolute -top-4 left-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">2</span>
                        </div>
                      </div>
                      
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#60A5FA]/10 to-[#3B82F6]/10 flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform">
                        <Sparkles className="h-8 w-8 text-[#60A5FA]" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.howItWorks.step2.title')}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {t('landing.howItWorks.step2.description')}
                      </p>
                      
                      {/* Decorative Element */}
                      <div className="mt-6 flex items-center text-[#60A5FA] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-semibold">{t('landing.howItWorks.learnMore')}</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative group">
                    <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[#8B7CFF]/30 hover:-translate-y-2">
                      {/* Step Number Badge */}
                      <div className="absolute -top-4 left-8">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">3</span>
                        </div>
                      </div>
                      
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#34D399]/10 to-[#10B981]/10 flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform">
                        <Share2 className="h-8 w-8 text-[#34D399]" />
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.howItWorks.step3.title')}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {t('landing.howItWorks.step3.description')}
                      </p>
                      
                      {/* Decorative Element */}
                      <div className="mt-6 flex items-center text-[#34D399] opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-semibold">{t('landing.howItWorks.learnMore')}</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-16 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#8B7CFF]/10 to-[#A78BFA]/10 rounded-2xl border border-[#8B7CFF]/20">
                  <Zap className="h-5 w-5 text-[#8B7CFF]" />
                  <p className="text-gray-700 font-medium">
                    {t('landing.howItWorks.cta')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What Sets Us Apart Section */}
        <section id="features" className="bg-gray-50 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('landing.features.title')}</h2>
              <p className="text-xl text-gray-600">
                {t('landing.features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('landing.features.aiGeneration.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('landing.features.aiGeneration.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                    <Palette className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('landing.features.brandKit.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('landing.features.brandKit.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('landing.features.scheduling.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('landing.features.scheduling.description')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t('landing.features.timeSaving.title')}</h3>
                  <p className="text-gray-600 text-sm">
                    {t('landing.features.timeSaving.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('landing.pricing.title')}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('landing.pricing.subtitle')}
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="border border-gray-200 rounded-2xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.pricing.starter.name')}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">{t('landing.pricing.starter.price')}</span>
                  <span className="text-gray-600 text-lg">{t('landing.pricing.month')}</span>
                </div>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                    {t('landing.pricing.starter.credits')}
                  </span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.starter.features.aiBanners')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.starter.features.brandKit')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.starter.features.socialScheduling')}</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all">
                    {t('landing.pricing.startNow')}
                  </Button>
                </Link>
              </div>
              <div className="border-2 border-[#8B7CFF] rounded-2xl p-8 bg-gradient-to-br from-[#8B7CFF]/5 via-white to-[#A78BFA]/5 shadow-xl relative transform scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                    {t('landing.pricing.mostPopular')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.pricing.growth.name')}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">{t('landing.pricing.growth.price')}</span>
                  <span className="text-gray-600 text-lg">{t('landing.pricing.month')}</span>
                </div>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] text-white text-sm font-semibold rounded-full">
                    {t('landing.pricing.growth.credits')}
                  </span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.growth.features.allStarter')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.growth.features.moreCredits')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.growth.features.prioritySupport')}</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all">
                    {t('landing.pricing.startNow')}
                  </Button>
                </Link>
              </div>
              <div className="border border-gray-200 rounded-2xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('landing.pricing.agency.name')}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">{t('landing.pricing.agency.price')}</span>
                  <span className="text-gray-600 text-lg">{t('landing.pricing.month')}</span>
                </div>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                    {t('landing.pricing.agency.credits')}
                  </span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.agency.features.allGrowth')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.agency.features.evenMoreCredits')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">{t('landing.pricing.agency.features.whiteLabel')}</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all">
                    {t('landing.pricing.startNow')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">SocialPilot</h3>
              <p className="text-sm text-gray-600">
                {t('landing.footer.description')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('landing.footer.product')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-gray-900">{t('nav.features')}</Link></li>
                <li><Link href="#pricing" className="hover:text-gray-900">{t('nav.pricing')}</Link></li>
                <li><Link href="/auth/signup" className="hover:text-gray-900">{t('landing.hero.startFree')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('landing.footer.company')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">{t('landing.footer.about')}</Link></li>
                <li><Link href="#" className="hover:text-gray-900">{t('landing.footer.blog')}</Link></li>
                <li><Link href="#contact" className="hover:text-gray-900">{t('nav.contact')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('landing.footer.support')}</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">{t('landing.footer.documentation')}</Link></li>
                <li><Link href="#" className="hover:text-gray-900">{t('landing.footer.faq')}</Link></li>
                <li><Link href="#" className="hover:text-gray-900">{t('landing.footer.assistance')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">{t('landing.footer.rights')}</p>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-gray-900">{t('landing.footer.terms')}</Link>
              <Link href="/privacy" className="hover:text-gray-900">{t('landing.footer.privacy')}</Link>
              <Link href="/data-deletion" className="hover:text-gray-900">{t('landing.footer.dataDeletion')}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
