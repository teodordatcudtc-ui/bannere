import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { deductCredits } from '@/lib/utils/credits'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, type, description } = body

    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const success = await deductCredits(
      user.id,
      parseInt(amount),
      type,
      description
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Insufficient credits or failed to deduct' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deducting credits:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to deduct credits' },
      { status: 500 }
    )
  }
}
