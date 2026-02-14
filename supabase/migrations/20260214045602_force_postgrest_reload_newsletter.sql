/*
  # Force PostgREST to Reload Newsletter Subscribers Schema

  1. Purpose
    - Force PostgREST API to recognize newsletter_subscribers table
    - Update schema cache by modifying table metadata
    - Send reload signals to PostgREST

  2. Actions
    - Update table comment with timestamp
    - Add comments to columns
    - Send reload notifications
*/

-- Update table comment to force schema refresh
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers table - Force reload 2026-02-14 04:50:00';

-- Add/update column comments
COMMENT ON COLUMN newsletter_subscribers.id IS 'Unique subscriber identifier';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN newsletter_subscribers.name IS 'Subscriber full name';
COMMENT ON COLUMN newsletter_subscribers.is_active IS 'Whether subscription is active';
COMMENT ON COLUMN newsletter_subscribers.subscribed_at IS 'Timestamp when user subscribed';
COMMENT ON COLUMN newsletter_subscribers.ip_address IS 'IP address at subscription time';
COMMENT ON COLUMN newsletter_subscribers.user_agent IS 'Browser user agent at subscription time';

-- Send reload signals
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- Grant permissions again to be absolutely sure
GRANT SELECT, INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;
GRANT ALL ON newsletter_subscribers TO service_role;

-- Verify RLS is enabled
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
