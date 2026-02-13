/*
  # Grant explicit access to newsletter_subscribers for anon users

  1. Changes
    - Grant explicit USAGE on schema public to anon
    - Grant explicit table permissions to anon role
    - Refresh schema cache
    
  2. Purpose
    - Ensure PostgREST API can expose the newsletter_subscribers table
    - Fix 404 error when accessing via REST API
*/

-- Ensure schema is accessible
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant explicit permissions on the table
GRANT ALL ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
