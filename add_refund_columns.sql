-- Add refund columns to purchases table
-- Run this in Supabase SQL Editor

ALTER TABLE public.purchases
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'refunded', 'revoked')),
  ADD COLUMN IF NOT EXISTS refund_id text,
  ADD COLUMN IF NOT EXISTS refunded_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS refund_reason text,
  ADD COLUMN IF NOT EXISTS refund_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS refunded_by text;

-- Index for quick status lookups
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_user_status ON public.purchases(user_id, status);
