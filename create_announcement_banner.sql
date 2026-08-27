-- ====================================================================
-- Store Announcements & Flash Sale Top Bar Configuration Table
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.store_announcements (
  id text PRIMARY KEY DEFAULT 'primary_banner',
  is_enabled boolean DEFAULT true,
  headline text DEFAULT '🔥 Weekend Mega Flash Sale Ends in:',
  coupon_code text DEFAULT 'LAUNCH50',
  discount_badge text DEFAULT '50% OFF',
  button_text text DEFAULT 'Claim 50% OFF Now →',
  button_url text DEFAULT '/explore',
  end_time timestamp with time zone DEFAULT (now() + interval '48 hours'),
  theme text DEFAULT 'fire' CHECK (theme IN ('fire', 'cyber', 'emerald', 'sunset')),
  is_dismissible boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.store_announcements ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone (including unauthenticated visitors) can read the active announcement banner
DROP POLICY IF EXISTS "Anyone can read store announcements" ON public.store_announcements;
CREATE POLICY "Anyone can read store announcements"
ON public.store_announcements FOR SELECT
USING (true);

-- Policy 2: Authenticated users / Service role can insert or update
DROP POLICY IF EXISTS "Admins can update store announcements" ON public.store_announcements;
CREATE POLICY "Admins can update store announcements"
ON public.store_announcements FOR ALL
USING (true)
WITH CHECK (true);

-- Seed initial default banner record
INSERT INTO public.store_announcements (
  id, is_enabled, headline, coupon_code, discount_badge, button_text, button_url, end_time, theme, is_dismissible
) VALUES (
  'primary_banner',
  true,
  '🔥 Weekend Mega Flash Sale Ends in:',
  'LAUNCH50',
  '50% OFF',
  'Claim 50% OFF Now →',
  '/explore',
  timezone('utc'::text, now() + interval '48 hours'),
  'fire',
  true
)
ON CONFLICT (id) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  headline = EXCLUDED.headline,
  coupon_code = EXCLUDED.coupon_code,
  button_text = EXCLUDED.button_text,
  button_url = EXCLUDED.button_url,
  theme = EXCLUDED.theme,
  updated_at = timezone('utc'::text, now());
