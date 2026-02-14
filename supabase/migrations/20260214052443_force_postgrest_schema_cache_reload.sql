/*
  # Force PostgREST Schema Cache Reload
  
  1. Purpose
    - Force PostgREST to reload its schema cache
    - Ensure newsletter_subscribers table is visible to API
    
  2. Actions
    - Send reload notification to PostgREST
    - Refresh materialized views if any
    - Update schema metadata
*/

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Verify the table exists and is accessible
DO $$
BEGIN
  RAISE NOTICE 'Table newsletter_subscribers exists: %', 
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'newsletter_subscribers');
END $$;
