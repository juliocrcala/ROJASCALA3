/*
  # Create repository-pdfs storage bucket

  1. New Storage
    - `repository-pdfs` bucket for uploading norm PDF documents
    - Public read access so users can view/download PDFs
    - Max file size: 20MB
    - Only accepts PDF files

  2. Security
    - Authenticated users can upload, update, and delete PDFs
    - Public (anon) users can view PDFs
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'repository-pdfs',
  'repository-pdfs',
  true,
  20971520,
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload repository pdfs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'repository-pdfs');

CREATE POLICY "Authenticated users can update repository pdfs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'repository-pdfs')
  WITH CHECK (bucket_id = 'repository-pdfs');

CREATE POLICY "Authenticated users can delete repository pdfs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'repository-pdfs');

CREATE POLICY "Anyone can view repository pdfs"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'repository-pdfs');
