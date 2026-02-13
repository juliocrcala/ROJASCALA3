/*
  # Fix newsletter subscribers permissions - Final

  1. Security Changes
    - Grant explicit table permissions to anon and authenticated roles
    - Ensure RLS policies are working correctly
    - Add select policy for anon users to verify table exists

  2. Notes
    - This should fix the "does not exist" error completely
*/

-- Grant explicit permissions
GRANT SELECT, INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Add a select policy for anon (read-only for verification)
DROP POLICY IF EXISTS "Allow anon to verify table exists" ON newsletter_subscribers;
CREATE POLICY "Allow anon to verify table exists"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (false);

-- Refresh the RLS cache
ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;