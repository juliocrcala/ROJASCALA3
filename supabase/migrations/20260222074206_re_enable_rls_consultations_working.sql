/*
  # Re-enable RLS for Consultations with Working Policies
  
  1. Changes
    - Re-enable RLS on consultations table
    - Create working policies that allow public inserts
    - Protect SELECT, UPDATE, DELETE for admin only
  
  2. Security
    - Public (anon + authenticated) can INSERT
    - Only admin can SELECT, UPDATE, DELETE
*/

-- Re-enable RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (no USING clause for INSERT, only WITH CHECK)
CREATE POLICY "allow_public_insert"
  ON consultations
  FOR INSERT
  WITH CHECK (true);

-- Only admin can SELECT
CREATE POLICY "admin_only_select"
  ON consultations
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojascalaperu2025@gmail.com');

-- Only admin can UPDATE
CREATE POLICY "admin_only_update"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojascalaperu2025@gmail.com');

-- Only admin can DELETE
CREATE POLICY "admin_only_delete"
  ON consultations
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojascalaperu2025@gmail.com');

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';
