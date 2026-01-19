import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { addCredits } from '@/lib/utils/credits'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    const creditsToAdd = amount || 10 // Default to 10 credits for testing

    const success = await addCredits(
      user.id,
      creditsToAdd,
      'refund', // Using 'refund' type for test credits
      `Test credits - +${creditsToAdd} credits`
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add credits' },
        { status: 500 }
      )
    }

    // Get updated credits (may not exist yet, so handle error)
    const { data: creditsData, error: fetchError } = await supabase
      .from('credits')
      .select('amount')
      .eq('user_id', user.id)
      .single()

    // If fetch fails, the credits were still added, so return the amount we added
    const newAmount = creditsData?.amount ?? creditsToAdd

    return NextResponse.json({ 
      success: true,
      newAmount: newAmount
    })
  } catch (error: any) {
    console.error('Error adding credits:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json(
      { 
        error: error.message || 'Failed to add credits',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
