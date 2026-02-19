/*
  # Fix Newsletter - Single Table Solution

  1. Changes
    - Drop the duplicate `newsletter_subscribers` table
    - Ensure `newsletter` table has all necessary columns and constraints
    - Keep only the essential RLS policies on `newsletter` table
  
  2. Security
    - Anon users can only INSERT (subscribe)
    - Authenticated admin can SELECT, UPDATE, DELETE
*/

DROP TABLE IF EXISTS newsletter_subscribers CASCADE;

CREATE TABLE IF NOT EXISTS newsletter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can subscribe to newsletter alt" ON newsletter;
DROP POLICY IF EXISTS "Admin can view newsletter alt" ON newsletter;
DROP POLICY IF EXISTS "Admin can update newsletter alt" ON newsletter;
DROP POLICY IF EXISTS "Admin can delete newsletter alt" ON newsletter;

CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admin can view newsletter"
  ON newsletter
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update newsletter"
  ON newsletter
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete newsletter"
  ON newsletter
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_is_active ON newsletter(is_active);
