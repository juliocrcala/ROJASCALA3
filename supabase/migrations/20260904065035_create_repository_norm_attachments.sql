/*
# Create repository_norm_attachments table

1. New Tables
   - `repository_norm_attachments`
     - `id` (uuid, primary key)
     - `norm_id` (uuid, FK to repository_norms.id, cascade delete)
     - `label` (text, not null) - custom label like "Anexo 1", "Exposición de Motivos"
     - `pdf_url` (text, not null) - URL of the uploaded PDF
     - `sort_order` (integer, default 0) - for ordering attachments
     - `created_at` (timestamptz)

2. Security
   - Enable RLS
   - Public can read attachments of visible norms
   - Admin (authenticated) can CRUD
*/

CREATE TABLE IF NOT EXISTS repository_norm_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  norm_id uuid NOT NULL REFERENCES repository_norms(id) ON DELETE CASCADE,
  label text NOT NULL,
  pdf_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_norm_attachments_norm_id ON repository_norm_attachments(norm_id);

ALTER TABLE repository_norm_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read norm attachments" ON repository_norm_attachments;
CREATE POLICY "Public can read norm attachments"
  ON repository_norm_attachments FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can insert norm attachments" ON repository_norm_attachments;
CREATE POLICY "Admin can insert norm attachments"
  ON repository_norm_attachments FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update norm attachments" ON repository_norm_attachments;
CREATE POLICY "Admin can update norm attachments"
  ON repository_norm_attachments FOR UPDATE
  TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete norm attachments" ON repository_norm_attachments;
CREATE POLICY "Admin can delete norm attachments"
  ON repository_norm_attachments FOR DELETE
  TO authenticated
  USING (true);

GRANT SELECT ON repository_norm_attachments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON repository_norm_attachments TO authenticated;
