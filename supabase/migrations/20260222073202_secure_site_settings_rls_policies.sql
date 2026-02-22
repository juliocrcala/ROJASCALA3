/*
  # Secure Site Settings RLS Policies

  1. Changes
    - Remove the insecure "Allow maintenance mode updates" policy
    - Site settings can only be updated via the secure Edge Function
    - Public users can still read settings (needed for maintenance page)
  
  2. Security
    - Prevents direct database updates from anonymous users
    - All updates must go through the update-maintenance Edge Function
    - Edge Function validates admin authentication before allowing changes
*/

-- Drop the insecure policy that allows anyone to update
DROP POLICY IF EXISTS "Allow maintenance mode updates" ON site_settings;

-- Keep read access for public (needed for maintenance page check)
-- The existing "Public can view site settings" policy already handles this

-- Note: Updates will only work through the Edge Function which uses service_role key
