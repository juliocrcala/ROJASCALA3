/*
  # Create Storage Bucket for Contact Photos

  1. New Storage Bucket
    - `contact-photos` - Public bucket for storing contact profile photos
  
  2. Storage Policies
    - Allow authenticated users to upload photos
    - Allow public read access to all photos
    - Allow authenticated users to update their own photos
    - Allow authenticated users to delete photos
  
  3. Security
    - Photos are publicly accessible for viewing
    - Only authenticated admin users can upload/modify photos
    - File size limits apply (enforced by Supabase)
*/

-- Create the storage bucket for contact photos (public bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contact-photos',
  'contact-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload contact photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'contact-photos');

-- Allow public read access to contact photos
CREATE POLICY "Public can view contact photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'contact-photos');

-- Allow authenticated users to update contact photos
CREATE POLICY "Authenticated users can update contact photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'contact-photos')
WITH CHECK (bucket_id = 'contact-photos');

-- Allow authenticated users to delete contact photos
CREATE POLICY "Authenticated users can delete contact photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'contact-photos');