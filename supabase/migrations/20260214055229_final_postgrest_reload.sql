/*
  # Final PostgREST Cache Reload
  
  1. Purpose
    - Force complete PostgREST cache reload
    - Ensure newsletter_subscribers table is exposed
    
  2. Actions
    - Drop and recreate all grants
    - Force schema change detection
    - Send multiple reload signals
*/

-- Force grants refresh
REVOKE ALL ON newsletter_subscribers FROM anon;
REVOKE ALL ON newsletter_subscribers FROM authenticated;

GRANT SELECT, INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;

-- Make a structural change to force PostgREST to detect it
ALTER TABLE newsletter_subscribers ALTER COLUMN email TYPE text;
ALTER TABLE newsletter_subscribers ALTER COLUMN name TYPE text;

-- Ensure RLS is properly configured
ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Force multiple cache reloads
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Update statistics to trigger cache update
ANALYZE newsletter_subscribers;

-- Add a comment with current timestamp
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers table - last updated: 2026-02-14 05:51:00';

-- Verify RLS policies exist
DO $$
DECLARE
  policy_count int;
BEGIN
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE tablename = 'newsletter_subscribers';
  
  IF policy_count = 0 THEN
    RAISE EXCEPTION 'No RLS policies found for newsletter_subscribers!';
  END IF;
END $$;
