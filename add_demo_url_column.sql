-- =========================================================================
-- Add demo_url & previewUrl columns to templates table
-- =========================================================================

ALTER TABLE IF EXISTS public.templates ADD COLUMN IF NOT EXISTS demo_url text;
ALTER TABLE IF EXISTS public.templates ADD COLUMN IF NOT EXISTS "previewUrl" text;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
