-- Run this in Supabase SQL Editor if you already had a coupons table to add the new advanced fields:

ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS min_order_amount numeric DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS usage_limit integer;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS times_used integer DEFAULT 0;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;
