/*
  # Fix Newsletter RLS Final

  1. Changes
    - Remove all existing policies
    - Create simple permissive policies that work with Supabase client
    - Allow anon role to INSERT and SELECT
    - Allow authenticated role full access

  2. Security
    - Public users can subscribe and check duplicates
    - Authenticated admins can manage all subscribers
*/

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Enable insert for all users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Enable read for anon users" ON newsletter_subscribers;

-- Create new simple policies that work with Supabase client

-- Allow anonymous users to insert (subscribe)
CREATE POLICY "anon_insert_policy"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to select (check duplicates)
CREATE POLICY "anon_select_policy"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to select (view subscribers)
CREATE POLICY "authenticated_select_policy"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update
CREATE POLICY "authenticated_update_policy"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete
CREATE POLICY "authenticated_delete_policy"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);
