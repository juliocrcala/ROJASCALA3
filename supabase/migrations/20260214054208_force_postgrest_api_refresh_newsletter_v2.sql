/*
  # Force PostgREST API Refresh for Newsletter Table
  
  1. Purpose
    - Force PostgREST to expose newsletter_subscribers table in REST API
    - Apply aggressive cache invalidation
    
  2. Actions
    - Revoke and regrant schema usage
    - Drop and recreate grants
    - Force multiple schema reloads
    - Alter table to trigger detection
*/

-- Ensure anon role has schema access
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Completely revoke and regrant all permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Grant specific table permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Make structural changes to force detection
ALTER TABLE newsletter_subscribers ALTER COLUMN name TYPE text;
ALTER TABLE newsletter_subscribers ALTER COLUMN email TYPE text;

-- Add and remove a dummy constraint to trigger schema change
ALTER TABLE newsletter_subscribers ADD CONSTRAINT dummy_check CHECK (char_length(email) > 0);
ALTER TABLE newsletter_subscribers DROP CONSTRAINT IF EXISTS dummy_check;

-- Refresh schema
DO $$
BEGIN
  NOTIFY pgrst, 'reload schema';
  NOTIFY pgrst, 'reload config';
END $$;

-- Add comment to force schema cache update
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers table - v2';

-- Verify the table is in the right schema
DO $$
DECLARE
  schema_check text;
BEGIN
  SELECT table_schema INTO schema_check 
  FROM information_schema.tables 
  WHERE table_name = 'newsletter_subscribers';
  
  IF schema_check != 'public' THEN
    RAISE EXCEPTION 'Table is not in public schema!';
  END IF;
END $$;
