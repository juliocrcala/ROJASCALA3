/*
  # Fix Newsletter Subscribers Policies
  
  1. Changes
    - Drop all existing duplicate policies
    - Create clean, simple policies
    - Ensure anon users can insert
    - Ensure authenticated users can manage subscribers
    
  2. Security
    - Allow anonymous users to subscribe (INSERT only)
    - Allow authenticated admin users to view, update, and delete subscribers
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can delete subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_anon_insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_auth_delete" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_auth_insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_auth_select" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_auth_update" ON newsletter_subscribers;

-- Create clean policies
-- Policy 1: Allow anonymous users to subscribe
CREATE POLICY "anon_can_insert"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Allow authenticated users to view all subscribers
CREATE POLICY "auth_can_select"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 3: Allow authenticated users to update subscribers
CREATE POLICY "auth_can_update"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete subscribers
CREATE POLICY "auth_can_delete"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);