-- Seed subscription plans (optional - plans are also defined in code)
-- This is for reference and can be used for admin dashboards

INSERT INTO public.subscription_plans (name, price_monthly, credits_per_month)
VALUES
  ('starter', 1900, 100),
  ('growth', 4900, 300),
  ('agency', 9900, 1000)
ON CONFLICT DO NOTHING;
