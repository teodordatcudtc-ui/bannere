'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Password validation: at least 8 characters, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const validateEmail = (email: string): boolean => {
    if (!email) {
      setEmailError('Email-ul este obligatoriu')
      return false
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Te rugăm să introduci un email valid (ex: nume@domeniu.com)')
      return false
    }
    setEmailError(null)
    return true
  }

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Parola este obligatorie')
      return false
    }
    if (password.length < 8) {
      setPasswordError('Parola trebuie să aibă cel puțin 8 caractere')
      return false
    }
    if (!PASSWORD_REGEX.test(password)) {
      setPasswordError('Parola trebuie să conțină cel puțin o literă mare, o literă mică și o cifră')
      return false
    }
    setPasswordError(null)
    return true
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setEmailError(null)
    setPasswordError(null)

    // Client-side validation
    if (!validateEmail(email) || !validatePassword(password)) {
      setLoading(false)
      return
    }

    // Rate limiting check (simple client-side check)
    const lastSignupAttempt = localStorage.getItem('lastSignupAttempt')
    const signupAttempts = parseInt(localStorage.getItem('signupAttempts') || '0')
    const now = Date.now()

    if (lastSignupAttempt) {
      const timeSinceLastAttempt = now - parseInt(lastSignupAttempt)
      // Reset attempts after 1 hour
      if (timeSinceLastAttempt > 3600000) {
        localStorage.setItem('signupAttempts', '0')
      } else if (signupAttempts >= 5) {
        setError('Prea multe încercări. Te rugăm să aștepți 1 oră înainte de a încerca din nou.')
        setLoading(false)
        return
      }
    }

    try {
      // Use API endpoint for server-side validation and rate limiting
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Update rate limiting on error
        if (response.status === 429) {
          localStorage.setItem('lastSignupAttempt', now.toString())
          localStorage.setItem('signupAttempts', '5')
        } else {
          localStorage.setItem('lastSignupAttempt', now.toString())
          localStorage.setItem('signupAttempts', (signupAttempts + 1).toString())
        }
        
        setError(data.error || 'A apărut o eroare')
        setLoading(false)
      } else {
        // Reset rate limiting on success
        localStorage.removeItem('lastSignupAttempt')
        localStorage.removeItem('signupAttempts')
        
        // Sign up was successful, redirect to onboarding
        router.push('/onboarding')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare')
      setLoading(false)
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
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) validateEmail(e.target.value)
                }}
                onBlur={() => validateEmail(email)}
                className={`text-sm ${emailError ? 'border-red-500' : ''}`}
                required
              />
              {emailError && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-900">Parolă</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (passwordError) validatePassword(e.target.value)
                }}
                onBlur={() => validatePassword(password)}
                className={`text-sm ${passwordError ? 'border-red-500' : ''}`}
                required
                minLength={8}
              />
              {passwordError && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  <span>{passwordError}</span>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Minim 8 caractere, cel puțin o literă mare, o literă mică și o cifră
              </p>
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
