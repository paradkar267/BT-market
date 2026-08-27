-- =========================================================================
-- Allow Admin & Authenticated Full Access to Templates & Template Files
-- =========================================================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.template_files ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy on Templates (Storefront)
DROP POLICY IF EXISTS "Allow public read on templates" ON public.templates;
CREATE POLICY "Allow public read on templates" 
ON public.templates FOR SELECT 
USING (true);

-- 2. Admin/Authenticated Full Write Access on Templates
DROP POLICY IF EXISTS "Allow authenticated to insert templates" ON public.templates;
CREATE POLICY "Allow authenticated to insert templates" 
ON public.templates FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated to update templates" ON public.templates;
CREATE POLICY "Allow authenticated to update templates" 
ON public.templates FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated to delete templates" ON public.templates;
CREATE POLICY "Allow authenticated to delete templates" 
ON public.templates FOR DELETE 
USING (true);

-- 3. Template Files Policies
DROP POLICY IF EXISTS "Allow authenticated to insert template_files" ON public.template_files;
CREATE POLICY "Allow authenticated to insert template_files" 
ON public.template_files FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated to select template_files" ON public.template_files;
CREATE POLICY "Allow authenticated to select template_files" 
ON public.template_files FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow authenticated to delete template_files" ON public.template_files;
CREATE POLICY "Allow authenticated to delete template_files" 
ON public.template_files FOR DELETE 
USING (true);

-- 4. Storage Bucket Policies for 'secure_templates'
-- Grant authenticated users insert/select/delete permission on 'secure_templates'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'storage' AND tablename = 'objects') THEN
    DROP POLICY IF EXISTS "Allow authenticated users to upload templates storage" ON storage.objects;
    CREATE POLICY "Allow authenticated users to upload templates storage"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'secure_templates');

    DROP POLICY IF EXISTS "Allow authenticated users to read templates storage" ON storage.objects;
    CREATE POLICY "Allow authenticated users to read templates storage"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'secure_templates');
  END IF;
END $$;
