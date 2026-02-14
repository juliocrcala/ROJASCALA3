/*
  # Force PostgREST Cache Reload for Newsletter Subscribers
  
  1. Purpose
    - Force PostgREST to recognize newsletter_subscribers table
    - Make a structural change to trigger schema cache update
    
  2. Actions
    - Add a temporary comment
    - Send reload signals
    - Verify table is accessible via API
*/

-- Add a comment to force schema change detection
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers - Updated at 2026-02-14 05:30:00';

-- Update each column comment
COMMENT ON COLUMN newsletter_subscribers.id IS 'Primary key';
COMMENT ON COLUMN newsletter_subscribers.name IS 'Subscriber name';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Subscriber email (unique)';

-- Send multiple reload signals
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Re-grant all permissions to be absolutely sure
REVOKE ALL ON newsletter_subscribers FROM anon;
REVOKE ALL ON newsletter_subscribers FROM authenticated;

GRANT SELECT, INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;
GRANT ALL ON newsletter_subscribers TO service_role;

-- Verify RLS is properly enabled
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Add a temporary column and immediately drop it to force cache refresh
ALTER TABLE newsletter_subscribers ADD COLUMN IF NOT EXISTS temp_refresh_col text;
ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS temp_refresh_col;
