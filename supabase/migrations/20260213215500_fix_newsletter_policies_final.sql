/*
  # Fix Newsletter Subscribers Policies
  
  1. Changes
    - Drop all existing policies
    - Create correct policies for anonymous subscriptions
    - Allow authenticated users (admin) to manage subscribers
  
  2. Security
    - Anonymous users can only INSERT new subscriptions
    - Authenticated users can view, update, and delete all subscribers
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anon to verify table exists" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow anonymous insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated delete" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated select" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated update" ON newsletter_subscribers;

-- Allow anonymous users to subscribe
CREATE POLICY "Anonymous users can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to view all subscribers
CREATE POLICY "Authenticated users can view subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update subscribers
CREATE POLICY "Authenticated users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete subscribers
CREATE POLICY "Authenticated users can delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);
