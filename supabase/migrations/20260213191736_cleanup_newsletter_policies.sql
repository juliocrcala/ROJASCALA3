/*
  # Clean up duplicate newsletter_subscribers policies

  1. Security Changes
    - Drop all existing policies on newsletter_subscribers
    - Create only the necessary policies without duplicates:
      - Allow anonymous users to insert (subscribe)
      - Allow authenticated users full access (SELECT, UPDATE, DELETE)
    
  Notes:
    - This fixes the RLS policy conflicts causing errors in the admin panel
    - Does not modify table structure or data
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view all subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "anon_can_insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "auth_can_select" ON newsletter_subscribers;
DROP POLICY IF EXISTS "auth_can_update" ON newsletter_subscribers;
DROP POLICY IF EXISTS "auth_can_delete" ON newsletter_subscribers;

-- Create clean, non-duplicate policies
CREATE POLICY "Anyone can subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);