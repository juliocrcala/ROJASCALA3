/*
  # Fix Page Views RLS Policies for Analytics
  
  ## Problem
  Users cannot track page views because RLS policies are blocking inserts.
  Error: "new row violates row-level security policy for table page_views"
  
  ## Solution
  1. Drop all existing policies on page_views
  2. Create simple, permissive policies for both anon and authenticated users
  3. Allow INSERT and SELECT operations for analytics tracking
  
  ## Security
  - Page views are anonymous analytics data
  - No sensitive information is stored
  - Both anon and authenticated users need to insert page views
  - Admin users need to read all page views for analytics dashboard
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
DROP POLICY IF EXISTS "anon_select_page_views" ON page_views;
DROP POLICY IF EXISTS "auth_all_page_views" ON page_views;
DROP POLICY IF EXISTS "Allow all operations on page_views" ON page_views;
DROP POLICY IF EXISTS "Admin full access to page_views" ON page_views;

-- Allow anonymous users to insert page views (for tracking)
CREATE POLICY "Anonymous can insert page views"
  ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert page views (for tracking)
CREATE POLICY "Authenticated can insert page views"
  ON page_views
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to read all page views (for admin dashboard)
CREATE POLICY "Authenticated can read all page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
