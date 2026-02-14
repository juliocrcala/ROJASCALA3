/*
  # Fix PostgREST API Access

  1. Problem
    - PostgREST returns 404 for newsletter_subscribers table
    - Need to ensure API layer recognizes the table

  2. Solution
    - Revoke and re-grant all permissions
    - Ensure authenticator role has proper access
    - Force schema reload
*/

-- Revoke all existing permissions
REVOKE ALL ON newsletter_subscribers FROM anon;
REVOKE ALL ON newsletter_subscribers FROM authenticated;

-- Grant fresh permissions to anon role
GRANT ALL ON newsletter_subscribers TO anon;

-- Grant fresh permissions to authenticated role  
GRANT ALL ON newsletter_subscribers TO authenticated;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Force PostgREST to reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Wait a moment then notify again
SELECT pg_sleep(1);
NOTIFY pgrst, 'reload schema';
