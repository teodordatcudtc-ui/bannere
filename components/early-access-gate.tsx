'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface EarlyAccessGateProps {
  title?: string
  description?: string
}

export function EarlyAccessGate({ title, description }: EarlyAccessGateProps) {
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    // Here you can add API call to save email for early access
    // For now, just show success message
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
      setEmail('')
    }, 500)
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-[#F0F4FF] via-[#F8F9FF] to-[#E8EDFF] rounded-2xl shadow-lg">
      <CardContent className="p-6 md:p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8B7CFF] to-[#A78BFA] mb-4 shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {title || t('earlyAccess.title')}
          </h2>
          <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            {description || t('earlyAccess.description')}
          </p>
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder={t('earlyAccess.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white whitespace-nowrap"
                >
                  {loading ? t('common.loading') : t('earlyAccess.joinButton')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">
                  {t('earlyAccess.success')}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
