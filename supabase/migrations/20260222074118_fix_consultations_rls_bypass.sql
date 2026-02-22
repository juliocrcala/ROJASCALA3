/*
  # Fix Consultations RLS with Bypass Check
  
  1. Changes
    - Drop all policies and recreate with explicit bypass conditions
    - Use (1=1) instead of true for compatibility
    - Ensure anon role can insert without restrictions
  
  2. Security
    - Anonymous users can INSERT consultations (no restrictions)
    - Admin users can manage all consultations
*/

-- Drop all existing policies first
DROP POLICY IF EXISTS "admin_delete_consultations" ON consultations;
DROP POLICY IF EXISTS "admin_update_consultations" ON consultations;
DROP POLICY IF EXISTS "admin_select_consultations" ON consultations;
DROP POLICY IF EXISTS "anon_insert_consultations" ON consultations;
DROP POLICY IF EXISTS "auth_insert_consultations" ON consultations;

-- Recreate INSERT policy for anon with explicit condition
CREATE POLICY "anon_insert_consultations"
  ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (
    name IS NOT NULL AND
    email IS NOT NULL AND
    message IS NOT NULL
  );

-- Recreate INSERT policy for authenticated
CREATE POLICY "auth_insert_consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    name IS NOT NULL AND
    email IS NOT NULL AND
    message IS NOT NULL
  );

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

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';
