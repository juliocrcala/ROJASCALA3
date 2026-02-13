/*
  # Force schema refresh for newsletter_subscribers
  
  1. Changes
    - Notify Supabase schema change
    - Refresh PostgREST schema cache
    
  2. Security
    - No security changes, just refreshing cache
*/

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';