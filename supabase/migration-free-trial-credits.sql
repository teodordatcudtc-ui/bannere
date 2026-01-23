-- Migration: Add 10 free trial credits for new users
-- Run this migration in Supabase SQL Editor to update the handle_new_user function

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Initialize credits with 10 free trial credits
  INSERT INTO public.credits (user_id, amount)
  VALUES (NEW.id, 10);
  
  -- Log the free trial credits transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (NEW.id, 10, 'refund', 'Free trial credits - Welcome bonus');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
