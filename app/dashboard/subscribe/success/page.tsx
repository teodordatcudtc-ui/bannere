'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SubscribeSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkoutId = searchParams.get('checkout_id')
    if (checkoutId) {
      // Verify the checkout was successful
      fetch(`/api/verify-session?checkout_id=${checkoutId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setLoading(false)
            // Refresh to update credits
            setTimeout(() => {
              router.push('/dashboard')
              router.refresh()
            }, 2000)
          }
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle>Subscription Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated. Credits have been added to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <p className="text-muted-foreground">Verifying subscription...</p>
          ) : (
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
