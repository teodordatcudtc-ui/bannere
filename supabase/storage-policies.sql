-- Storage Policies pentru bucket-ul 'logos'
-- Rulează acest script în Supabase SQL Editor după ce ai creat bucket-ul

-- Șterge policies existente (dacă există)
DROP POLICY IF EXISTS "Users can upload own logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own logos" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for logos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own logos" ON storage.objects;

-- Policy 1: Allow authenticated users to upload their own logos
CREATE POLICY "Users can upload own logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy 2: Allow authenticated users to update their own logos
CREATE POLICY "Users can update own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'logos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Policy 3: Allow public read access to logos
CREATE POLICY "Public read access for logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Policy 4: Allow authenticated users to delete their own logos
CREATE POLICY "Users can delete own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);
