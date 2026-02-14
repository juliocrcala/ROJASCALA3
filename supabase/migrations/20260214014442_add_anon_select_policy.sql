/*
  # Add Anon Select Policy

  1. Changes
    - Add SELECT policy for anon role to allow checking duplicates
    - This allows the Supabase client to verify email uniqueness

  2. Security
    - Anon can read to check for duplicates before inserting
    - Authenticated users retain full access
*/

-- Drop if exists and recreate
DROP POLICY IF EXISTS "Enable read for anon users" ON newsletter_subscribers;

-- Add SELECT policy for anon role
CREATE POLICY "Enable read for anon users"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);
