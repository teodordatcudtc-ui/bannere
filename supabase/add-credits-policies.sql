-- Add missing RLS policies for credits table
-- Run this in Supabase SQL Editor

-- Allow users to insert their own credits (for initial creation)
CREATE POLICY "Users can insert own credits"
  ON public.credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own credits
CREATE POLICY "Users can update own credits"
  ON public.credits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to insert their own credit transactions
CREATE POLICY "Users can insert own credit transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
