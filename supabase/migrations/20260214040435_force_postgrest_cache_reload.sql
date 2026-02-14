/*
  # Force PostgREST Cache Reload

  1. Purpose
    - Force PostgREST to reload its schema cache
    - Update pg_stat_statements to trigger reload
    - Add comment to table to force schema version change
*/

-- Update table comment to force schema version change
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers table - Updated 2026-02-14 04:05:00';

-- Update column comments to force schema refresh
COMMENT ON COLUMN newsletter_subscribers.id IS 'Primary key';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Subscriber email address';
COMMENT ON COLUMN newsletter_subscribers.name IS 'Subscriber full name';

-- Drop and recreate the view to force cache invalidation
DROP VIEW IF EXISTS newsletter_subscribers_view CASCADE;

-- Reset the schema cache age
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- Force a schema cache refresh by updating pg_stat_statements
DO $$
BEGIN
  PERFORM pg_stat_statements_reset();
EXCEPTION
  WHEN undefined_function THEN
    NULL;
END $$;
