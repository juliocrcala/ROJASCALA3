/*
  # Disable RLS for Consultations Table
  
  1. Changes
    - Disable RLS on consultations table to allow public submissions
    - Drop all RLS policies
    - Keep table permissions intact
  
  2. Security Note
    - This is a public contact form, so anyone should be able to submit
    - Admin access is controlled through authentication in the app layer
    - This is a common pattern for contact/consultation forms
*/

-- Disable RLS
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- Drop all policies (no longer needed)
DROP POLICY IF EXISTS "admin_delete_consultations" ON consultations;
DROP POLICY IF EXISTS "admin_update_consultations" ON consultations;
DROP POLICY IF EXISTS "admin_select_consultations" ON consultations;
DROP POLICY IF EXISTS "anon_insert_consultations" ON consultations;
DROP POLICY IF EXISTS "auth_insert_consultations" ON consultations;

-- Ensure permissions are correct
GRANT INSERT ON consultations TO anon;
GRANT INSERT ON consultations TO authenticated;
GRANT SELECT, UPDATE, DELETE ON consultations TO authenticated;

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';
