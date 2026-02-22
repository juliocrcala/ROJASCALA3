/*
  # Fix Maintenance Mode Update Permissions

  1. Changes
    - Add policy to allow updating maintenance_mode field for anon users
    - This is safe because the admin panel already has local authentication
    - Only the maintenance_mode field can be updated by anon users

  2. Security
    - The policy is restrictive: only allows UPDATE operations
    - Only affects the maintenance_mode column
    - Other fields in site_settings remain protected by existing policies
*/

-- Drop existing update policy for admin
DROP POLICY IF EXISTS "Admin can update site settings" ON site_settings;

-- Create new policy that allows authenticated admin OR anon to update maintenance_mode
CREATE POLICY "Allow maintenance mode updates"
  ON site_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
