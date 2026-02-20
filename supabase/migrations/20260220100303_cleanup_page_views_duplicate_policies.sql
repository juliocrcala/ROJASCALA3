/*
  # Cleanup Duplicate Page Views Policies
  
  ## Problem
  Multiple duplicate INSERT policies exist for page_views table:
  - "Anonymous can insert page views"
  - "Public can insert page views"
  - "Authenticated can insert page views"
  
  ## Solution
  Keep only the necessary policies and remove duplicates:
  - One INSERT policy for anon
  - One INSERT policy for authenticated
  - One SELECT policy for authenticated (admin)
  - One DELETE policy for authenticated (admin)
  
  ## Security
  - Maintains proper access control
  - Allows analytics tracking for all users
  - Restricts viewing and deletion to admin only
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anonymous can insert page views" ON page_views;
DROP POLICY IF EXISTS "Public can insert page views" ON page_views;
DROP POLICY IF EXISTS "Authenticated can insert page views" ON page_views;
DROP POLICY IF EXISTS "Authenticated can read all page views" ON page_views;
DROP POLICY IF EXISTS "Admin can view page views" ON page_views;
DROP POLICY IF EXISTS "Admin can delete page views" ON page_views;

-- Create clean policies
CREATE POLICY "Anon can track page views"
  ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can track page views"
  ON page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete page views"
  ON page_views
  FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojascalaperu2025@gmail.com');

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
