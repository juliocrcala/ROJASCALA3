/*
  # Fix Consultations Insert Policy
  
  1. Changes
    - Drop existing INSERT policy for consultations
    - Recreate with proper permissions for anonymous users
    - Ensure public users can submit consultations without authentication
  
  2. Security
    - Anonymous users can only INSERT consultations
    - Admin users (authenticated) can view, update, and delete consultations
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Public can submit consultations" ON consultations;

-- Create new insert policy that allows anonymous users to insert
CREATE POLICY "Allow anonymous to insert consultations"
  ON consultations
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow authenticated users to insert (for future use)
CREATE POLICY "Allow authenticated to insert consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
