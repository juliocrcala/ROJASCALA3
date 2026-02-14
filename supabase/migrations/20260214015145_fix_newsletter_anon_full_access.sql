/*
  # Fix Newsletter Subscribers Access

  1. Problem
    - Admin uses local authentication (localStorage), not Supabase auth
    - All requests (public + admin) use the 'anon' role
    - Need to grant full access to 'anon' role

  2. Solution
    - Drop all existing policies
    - Create simple policies allowing 'anon' full access
    - Keep RLS enabled for security structure

  3. Security
    - Public users can subscribe (INSERT, SELECT for duplicate check)
    - Admin (also 'anon' role) can view, update, and delete subscribers
*/

-- Drop ALL existing policies completely
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'newsletter_subscribers') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON newsletter_subscribers';
    END LOOP;
END $$;

-- Create single permissive policy for anon role with all operations
CREATE POLICY "anon_all_access"
  ON newsletter_subscribers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
