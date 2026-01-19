-- Seed subscription plans (optional - plans are also defined in code)
-- This is for reference and can be used for admin dashboards

INSERT INTO public.subscription_plans (name, price_monthly, credits_per_month, stripe_price_id)
VALUES
  ('starter', 2900, 100, 'your_stripe_starter_price_id'),
  ('growth', 5900, 300, 'your_stripe_growth_price_id'),
  ('agency', 11900, 1000, 'your_stripe_agency_price_id')
ON CONFLICT DO NOTHING;
