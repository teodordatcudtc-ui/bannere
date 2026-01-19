'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/onboarding')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F0F4FF] via-[#F8F9FF] to-[#E8EDFF]">
      <Card className="w-full max-w-md border-0 bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Creează un cont</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Înregistrează-te pentru a începe să creezi bannere cu AI
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-gray-900">Nume complet</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ion Popescu"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@exemplu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-900">Parolă</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full text-sm py-5" disabled={loading}>
              {loading ? 'Se creează contul...' : 'Înregistrează-te'}
            </Button>
            <div className="text-center text-sm text-gray-600">
              Ai deja un cont?{' '}
              <Link href="/auth/login" className="text-[#8B7CFF] hover:underline font-semibold">
                Autentificare
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
