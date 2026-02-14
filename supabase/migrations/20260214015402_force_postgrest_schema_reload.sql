/*
  # Force PostgREST Schema Reload

  1. Purpose
    - Force PostgREST to reload the schema cache
    - Ensure newsletter_subscribers table is exposed via REST API

  2. Changes
    - Add comment to newsletter_subscribers table
    - This will trigger PostgREST to reload
*/

-- Add/update comment to force schema reload
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers table - Updated 2026-02-14 - Force reload';

-- Verify the policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'newsletter_subscribers' 
    AND policyname = 'anon_all_access'
  ) THEN
    CREATE POLICY "anon_all_access"
      ON newsletter_subscribers
      FOR ALL
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
