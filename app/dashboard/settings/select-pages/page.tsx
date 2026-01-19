'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Facebook } from 'lucide-react'

const OUTSTAND_API_URL = 'https://api.outstand.so/v1'

interface PendingAccount {
  id: string
  name: string
  username?: string
  platform: string
}

export default function SelectPagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionToken = searchParams.get('session')
  const platform = searchParams.get('platform') || 'facebook'
  
  const [accounts, setAccounts] = useState<PendingAccount[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [finalizing, setFinalizing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionToken) {
      router.push('/dashboard/settings?error=missing_session')
      return
    }
    fetchPendingAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, router])

  const fetchPendingAccounts = async () => {
    try {
      const response = await fetch(`/api/social-accounts/pending?session=${sessionToken}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch pages')
      }

      const data = await response.json()
      setAccounts(data.accounts || [])
      
      // Auto-select all accounts by default
      if (data.accounts && data.accounts.length > 0) {
        setSelectedIds(data.accounts.map((acc: PendingAccount) => acc.id))
      }
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAccount = (accountId: string) => {
    setSelectedIds(prev => 
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const handleFinalize = async () => {
    if (selectedIds.length === 0) {
      setError('Selectează cel puțin o pagină')
      return
    }

    setFinalizing(true)
    setError(null)

    try {
      const response = await fetch('/api/social-accounts/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: sessionToken,
          accountIds: selectedIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to connect pages')
      }

      // Redirect to settings with success message
      router.push('/dashboard/settings?connected=success')
    } catch (err: any) {
      setError(err.message || 'A apărut o eroare la conectare')
      setFinalizing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#8B7CFF]" />
          <p className="text-gray-600">Se încarcă paginile disponibile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="border-0 bg-white rounded-2xl shadow-sm">
        <CardHeader className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Facebook className="h-6 w-6 text-[#1877F2]" />
            <CardTitle className="text-2xl font-bold text-gray-900">
              Selectează Paginile Facebook
            </CardTitle>
          </div>
          <CardDescription className="text-sm text-gray-600">
            Alege paginile Facebook pe care vrei să le conectezi. Poți selecta mai multe pagini.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200 mb-4">
              {error}
            </div>
          )}

          {accounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nu s-au găsit pagini disponibile.</p>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/settings')}
              >
                Înapoi la Setări
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleToggleAccount(account.id)}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(account.id)}
                        onCheckedChange={() => handleToggleAccount(account.id)}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {account.name}
                      </p>
                      {account.username && (
                        <p className="text-xs text-gray-500">
                          @{account.username}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/settings')}
                  disabled={finalizing}
                  className="flex-1"
                >
                  Anulează
                </Button>
                <Button
                  onClick={handleFinalize}
                  disabled={finalizing || selectedIds.length === 0}
                  className="flex-1 bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white"
                >
                  {finalizing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Se conectează...
                    </>
                  ) : (
                    `Conectează ${selectedIds.length} ${selectedIds.length === 1 ? 'pagină' : 'pagini'}`
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
