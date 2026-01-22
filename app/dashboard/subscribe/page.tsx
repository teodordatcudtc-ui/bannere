'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check } from 'lucide-react'
import { subscriptionPlans } from '@/lib/subscription-plans'

export default function SubscribePage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        throw new Error('Crearea sesiunii de checkout a eșuat')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setLoading(null)
    }
  }

  const plans = [
    {
      id: 'starter',
      ...subscriptionPlans.starter,
      credits: 100,
      images: 100,
      posts: 20,
      features: ['Generare bannere cu AI', 'Configurare brand kit', 'Programare social media'],
    },
    {
      id: 'growth',
      ...subscriptionPlans.growth,
      credits: 300,
      images: 300,
      posts: 60,
      features: ['Tot ce e în Starter', '3x mai multe credite', 'Suport prioritar'],
      popular: true,
    },
    {
      id: 'agency',
      ...subscriptionPlans.agency,
      credits: 1000,
      images: 1000,
      posts: 200,
      features: ['Tot ce e în Growth', '10x mai multe credite', 'Opțiuni white-label'],
    },
  ]

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alege planul tău</h1>
        <p className="text-base text-gray-600">
          Selectează un plan de abonament care se potrivește nevoilor tale
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`border-0 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all ${'popular' in plan && plan.popular ? 'border-2 border-[#8B7CFF] shadow-xl relative' : ''}`}
          >
            {'popular' in plan && plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                  Cel mai popular
                </span>
              </div>
            )}
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">€{plan.price}</span>
                <span className="text-lg text-gray-600">/lună</span>
              </div>
              <CardDescription className="text-sm text-gray-600 mb-4">
                {plan.credits} credite/lună
              </CardDescription>
              {/* Usage info */}
              <div className="bg-gradient-to-br from-[#F0F4FF] to-[#E8EDFF] rounded-xl p-4 border border-[#8B7CFF]/20">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Bannere generate:</span>
                    <span className="text-lg font-bold text-[#8B7CFF]">{plan.images}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">Postări programate:</span>
                    <span className="text-lg font-bold text-[#8B7CFF]">{plan.posts}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ul className="space-y-3 text-sm mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-[#8B7CFF] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full text-sm py-5 ${'popular' in plan && plan.popular ? 'bg-gradient-to-r from-[#8B7CFF] to-[#A78BFA] hover:from-[#7C6EE6] hover:to-[#9678E9] text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading !== null}
              >
                {loading === plan.id ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Se procesează...
                  </>
                ) : (
                  'Abonează-te'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600 max-w-2xl mx-auto bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <p>
          <strong>Utilizare credite:</strong> 1 credit per imagine generată, 5 credite per postare programată.
          Creditele se resetează lunar în data facturării.
        </p>
      </div>
    </div>
  )
}
