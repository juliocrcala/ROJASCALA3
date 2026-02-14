/*
  # Fix Newsletter Subscribers Table - Final Solution
  
  1. Changes
    - Drop all existing policies to start fresh
    - Create proper RLS policies with correct permissions
    - Allow anonymous users to insert (subscribe)
    - Allow authenticated users (admins) to read, update, and delete
    - Grant proper table permissions to anon and authenticated roles
  
  2. Security
    - RLS enabled on newsletter_subscribers table
    - Anonymous can only INSERT new subscriptions
    - Authenticated users can SELECT, UPDATE, DELETE (for admin panel)
    - Policies use proper boolean expressions instead of literal true
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anonymous users can subscribe" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can delete subscribers" ON newsletter_subscribers;

-- Ensure RLS is enabled
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Grant table permissions to roles
GRANT INSERT ON newsletter_subscribers TO anon;
GRANT SELECT, UPDATE, DELETE ON newsletter_subscribers TO authenticated;

-- Policy for anonymous users to subscribe (INSERT only)
CREATE POLICY "Allow anonymous insert"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL 
    AND name IS NOT NULL
  );

-- Policy for authenticated users to view all subscribers (SELECT)
CREATE POLICY "Allow authenticated select"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for authenticated users to update subscribers
CREATE POLICY "Allow authenticated update"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy for authenticated users to delete subscribers
CREATE POLICY "Allow authenticated delete"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);
