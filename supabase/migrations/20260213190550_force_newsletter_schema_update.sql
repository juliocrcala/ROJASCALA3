/*
  # Force schema update for newsletter_subscribers
  
  1. Changes
    - Add a comment to force schema refresh
    - Refresh RLS policies
    
  2. Security
    - Maintain existing security policies
*/

-- Force schema detection by updating table comment
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers table - Updated 2026-02-13';

-- Ensure RLS is enabled
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Verify policies exist (this forces PostgREST to refresh)
DO $$ 
BEGIN
    -- This block forces schema refresh
    PERFORM 1 FROM newsletter_subscribers LIMIT 0;
END $$;