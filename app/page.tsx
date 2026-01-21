import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, Palette, Calendar, Check, Zap, TrendingUp, Users, Clock } from 'lucide-react'
import { DashboardPreview } from '@/components/dashboard-preview'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

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
              Funcționalități
            </Link>
            <Link href="#pricing" className="text-sm text-gray-700 hover:text-gray-900">
              Prețuri
            </Link>
            <Link href="#contact" className="text-sm text-gray-700 hover:text-gray-900">
              Contact
            </Link>
          </nav>
          <div className="flex gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                  Mergi la Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                    Autentificare
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                    Începe acum
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
                  <span className="text-xs font-semibold text-purple-700">Generare AI • Programare automată</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-[1.1]">
                  Nu ai timp de reclame? <span className="text-[#8B7CFF]">Noi le facem pentru tine.</span>
                </h1>
                <p className="text-base text-gray-600 mb-8 leading-relaxed">
                  Generează bannere profesionale cu AI și programează-le automat pe toate platformele. Economisește ore de muncă și concentrează-te pe ceea ce contează cu adevărat.
                </p>
                <div className="flex gap-4 mb-6">
                  <Link href="/auth/signup">
                    <Button size="lg" className="bg-[#8B7CFF] hover:bg-[#7C6EE6] text-white text-base px-8 py-6">
                      Începe gratuit
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="text-base px-8 py-6 border-2">
                      <span className="mr-2">▶</span>
                      Vezi demo
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-gray-500">7 zile gratuite. Fără card de credit.</p>
              </div>

              {/* Right Side - Dashboard Preview */}
              <div className="relative">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </section>

        {/* What Sets Us Apart Section */}
        <section id="features" className="bg-gray-50 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Nu mai pierde timp cu reclamele</h2>
              <p className="text-xl text-gray-600">
                Soluția completă pentru afaceri ocupate care nu au timp să creeze și să programeze reclame manual.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Generare AI avansată</h3>
                  <p className="text-gray-600 text-sm">
                    Generează bannere profesionale în secunde folosind tehnologie AI de ultimă generație.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                    <Palette className="h-6 w-6 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Brand Kit integrat</h3>
                  <p className="text-gray-600 text-sm">
                    Păstrează-ți identitatea de brand consistentă pe toate bannerele cu logo-uri și culori personalizate.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Programare automată</h3>
                  <p className="text-gray-600 text-sm">
                    Programează postările pe toate platformele majore de social media dintr-un singur loc.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 bg-white shadow-sm hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Economisește timp prețios</h3>
                  <p className="text-gray-600 text-sm">
                    Nu mai pierde ore cu design și programare. Generează și programează bannere în minute, nu zile.
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
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Planuri de prețuri</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Alege planul perfect pentru nevoile tale. Toate planurile includ generare bannere cu AI și programare social media.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="border border-gray-200 rounded-2xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">€29</span>
                  <span className="text-gray-600 text-lg">/lună</span>
                </div>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                    100 credite/lună
                  </span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">Generare bannere cu AI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">Configurare brand kit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">Programare social media</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all">
                    Începe acum
                  </Button>
                </Link>
              </div>
              <div className="border-2 border-[#8B7CFF] rounded-2xl p-8 bg-gradient-to-br from-[#8B7CFF]/5 via-white to-[#A78BFA]/5 shadow-xl relative transform scale-105">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                    Cel mai popular
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Growth</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">€59</span>
                  <span className="text-gray-600 text-lg">/lună</span>
                </div>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] text-white text-sm font-semibold rounded-full">
                    300 credite/lună
                  </span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700">Tot ce e în Starter</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700">3x mai multe credite</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-700">Suport prioritar</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Începe acum
                  </Button>
                </Link>
              </div>
              <div className="border border-gray-200 rounded-2xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-xl transition-all hover:-translate-y-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Agency</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">€119</span>
                  <span className="text-gray-600 text-lg">/lună</span>
                </div>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                    1000 credite/lună
                  </span>
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">Tot ce e în Growth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">10x mai multe credite</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="h-3 w-3 text-[#8B7CFF]" />
                    </div>
                    <span className="text-gray-700">Opțiuni white-label</span>
                  </li>
                </ul>
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all">
                    Începe acum
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
                Soluția completă pentru generarea și programarea bannerelor de social media.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Produs</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-gray-900">Funcționalități</Link></li>
                <li><Link href="#pricing" className="hover:text-gray-900">Prețuri</Link></li>
                <li><Link href="/auth/signup" className="hover:text-gray-900">Începe gratuit</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Companie</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">Despre noi</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Blog</Link></li>
                <li><Link href="#contact" className="hover:text-gray-900">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Suport</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-gray-900">Documentație</Link></li>
                <li><Link href="#" className="hover:text-gray-900">FAQ</Link></li>
                <li><Link href="#" className="hover:text-gray-900">Asistență</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">&copy; 2024 SocialPilot. Toate drepturile rezervate.</p>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/terms" className="hover:text-gray-900">Termeni și Condiții</Link>
              <Link href="/privacy" className="hover:text-gray-900">Politica de Confidențialitate</Link>
              <Link href="/data-deletion" className="hover:text-gray-900">Ștergere Date</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
