/*
  # Fresh Newsletter Subscribers Table

  1. Changes
    - Drop existing newsletter_subscribers table completely
    - Create new clean table
    - Setup RLS with anon access
    - Grant permissions
*/

-- Drop table completely
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;

-- Create fresh table
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anon to do everything
CREATE POLICY "anon_access"
  ON newsletter_subscribers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;

-- Force API reload
NOTIFY pgrst, 'reload schema';
