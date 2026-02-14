/*
  # Grant explicit permissions for newsletter_subscribers

  1. Changes
    - Grant table-level permissions to anon role for INSERT
    - Grant full permissions to authenticated role
    - Grant usage on sequence for ID generation

  2. Security
    - Explicit permissions ensure Supabase client can access the table
*/

-- Grant permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON newsletter_subscribers TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant full permissions to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON newsletter_subscribers TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
