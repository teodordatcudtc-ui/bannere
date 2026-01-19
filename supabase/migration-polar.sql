-- Migration script to replace Stripe with Polar.sh
-- Run this after setting up Polar.sh products and prices

-- Update subscription_plans table
ALTER TABLE public.subscription_plans 
  RENAME COLUMN stripe_price_id TO polar_price_id;

-- Update subscriptions table
ALTER TABLE public.subscriptions 
  RENAME COLUMN stripe_subscription_id TO polar_subscription_id;

ALTER TABLE public.subscriptions 
  RENAME COLUMN stripe_customer_id TO polar_customer_id;

-- Add indexes for Polar IDs
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_subscription_id ON public.subscriptions(polar_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_customer_id ON public.subscriptions(polar_customer_id);
