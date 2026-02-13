/*
  # Recreate Storage Policies for Contact Photos

  1. Changes
    - Drop and recreate storage policies to ensure they work correctly
  
  2. Security
    - Public read access for all photos
    - Authenticated users can upload/update/delete
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can upload contact photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view contact photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update contact photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete contact photos" ON storage.objects;

-- Recreate policies

-- Allow public to view photos
CREATE POLICY "Public can view contact photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'contact-photos');

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload contact photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contact-photos');

-- Allow authenticated users to update photos
CREATE POLICY "Authenticated users can update contact photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'contact-photos')
WITH CHECK (bucket_id = 'contact-photos');

-- Allow authenticated users to delete photos
CREATE POLICY "Authenticated users can delete contact photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'contact-photos');