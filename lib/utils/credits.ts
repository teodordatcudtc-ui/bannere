import { createClient } from '@/lib/supabase/server'

export async function getUserCredits(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('credits')
    .select('amount')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return 0
  }

  return data.amount
}

export async function deductCredits(
  userId: string,
  amount: number,
  type: 'generation' | 'scheduling',
  description?: string
): Promise<boolean> {
  const supabase = await createClient()

  // Get current credits
  const { data: creditsData, error: fetchError } = await supabase
    .from('credits')
    .select('amount')
    .eq('user_id', userId)
    .single()

  if (fetchError || !creditsData) {
    return false
  }

  if (creditsData.amount < amount) {
    return false // Insufficient credits
  }

  // Deduct credits
  const { error: updateError } = await supabase
    .from('credits')
    .update({ 
      amount: creditsData.amount - amount,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (updateError) {
    return false
  }

  // Log transaction
  await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount: -amount,
      type,
      description: description || `${type} - ${amount} credits`
    })

  return true
}

export async function addCredits(
  userId: string,
  amount: number,
  type: 'subscription' | 'refund',
  description?: string
): Promise<boolean> {
  const supabase = await createClient()

  // Get current credits (may not exist yet, so use maybeSingle)
  const { data: creditsData, error: fetchError } = await supabase
    .from('credits')
    .select('amount')
    .eq('user_id', userId)
    .maybeSingle()

  // If fetchError and it's not a "not found" error, log it but continue
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching credits:', fetchError)
  }

  // If no credits record exists, currentAmount is 0
  const currentAmount = creditsData?.amount ?? 0

  // Add credits using upsert (will create if doesn't exist)
  const { error: updateError } = await supabase
    .from('credits')
    .upsert({
      user_id: userId,
      amount: currentAmount + amount,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (updateError) {
    console.error('Error adding credits:', updateError)
    return false
  }

  // Log transaction
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      user_id: userId,
      amount,
      type,
      description: description || `${type} - ${amount} credits`
    })

  if (transactionError) {
    console.error('Error logging credit transaction:', transactionError)
    // Don't fail if transaction logging fails, credits were already added
  }

  return true
}
