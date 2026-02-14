/*
  # Grant ALL Permissions to Admin Tables

  1. Problem
    - RLS policies are in place but operations still fail with "permission denied"
    - Missing GRANT permissions at the database level
    - GRANT permissions are required BEFORE RLS policies can take effect

  2. Solution
    - GRANT ALL privileges to anon and authenticated roles on ALL admin tables
    - This allows the RLS policies to work correctly
    - GRANT USAGE on public schema

  3. Tables affected
    - articles
    - special_articles
    - contacts
    - consultations
    - newsletter_subscribers
    - newsletter
    - page_views
    - site_settings
    - categories_config

  4. Security
    - RLS remains enabled and policies control actual access
    - GRANT gives permission to attempt operations
    - RLS policies determine which operations succeed
*/

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant all privileges on all tables to anon
GRANT ALL ON articles TO anon, authenticated;
GRANT ALL ON special_articles TO anon, authenticated;
GRANT ALL ON contacts TO anon, authenticated;
GRANT ALL ON consultations TO anon, authenticated;
GRANT ALL ON newsletter_subscribers TO anon, authenticated;
GRANT ALL ON newsletter TO anon, authenticated;
GRANT ALL ON page_views TO anon, authenticated;
GRANT ALL ON site_settings TO anon, authenticated;
GRANT ALL ON categories_config TO anon, authenticated;

-- Grant usage on sequences (for auto-incrementing IDs if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure future tables also get these permissions (optional but recommended)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated;

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';