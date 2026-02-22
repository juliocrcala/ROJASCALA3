/*
  # Force Reload Consultations Policies
  
  1. Changes
    - Disable and re-enable RLS to force cache refresh
    - Recreate all policies from scratch
    - Force PostgREST schema reload
  
  2. Security
    - Anonymous users can INSERT consultations
    - Admin users can SELECT, UPDATE, DELETE consultations
*/

-- Disable RLS temporarily
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Admin can delete consultations" ON consultations;
DROP POLICY IF EXISTS "Admin can update consultations" ON consultations;
DROP POLICY IF EXISTS "Admin can view all consultations" ON consultations;
DROP POLICY IF EXISTS "Allow anonymous to insert consultations" ON consultations;
DROP POLICY IF EXISTS "Allow authenticated to insert consultations" ON consultations;
DROP POLICY IF EXISTS "Public can submit consultations" ON consultations;

-- Re-enable RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create INSERT policy for anonymous users (NO CONDITIONS)
CREATE POLICY "anon_insert_consultations"
  ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create INSERT policy for authenticated users
CREATE POLICY "auth_insert_consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create SELECT policy for admin
CREATE POLICY "admin_select_consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojascalaperu2025@gmail.com');

-- Create UPDATE policy for admin
CREATE POLICY "admin_update_consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojascalaperu2025@gmail.com');

-- Create DELETE policy for admin
CREATE POLICY "admin_delete_consultations"
  ON consultations
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojascalaperu2025@gmail.com');

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
