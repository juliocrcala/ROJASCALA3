/*
  # Fix PostgREST Table Exposure
  
  1. Purpose
    - Ensure newsletter_subscribers table is properly exposed to PostgREST
    - Drop functions and use direct table access with proper RLS
    
  2. Actions
    - Drop newsletter functions
    - Ensure table has proper permissions
    - Force PostgREST schema reload
*/

-- Drop the functions (we'll go back to direct table access)
DROP FUNCTION IF EXISTS subscribe_to_newsletter CASCADE;
DROP FUNCTION IF EXISTS get_all_subscribers CASCADE;
DROP FUNCTION IF EXISTS update_subscriber_status CASCADE;
DROP FUNCTION IF EXISTS delete_subscriber CASCADE;

-- Ensure the table is in public schema and has proper structure
ALTER TABLE newsletter_subscribers SET SCHEMA public;

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_anon_select" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_anon_insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_auth_all" ON newsletter_subscribers;

-- Disable RLS temporarily
ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create simple permissive policies
CREATE POLICY "anon_can_insert"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_can_select"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "auth_can_all"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions explicitly
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Update table comment with timestamp
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers - updated 2026-02-14';
