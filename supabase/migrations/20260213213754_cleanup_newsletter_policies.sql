/*
  # Clean up and fix newsletter subscribers policies

  1. Security Changes
    - Drop all existing policies
    - Create fresh, working policies for newsletter_subscribers
    - Allow anonymous users to insert subscriptions
    - Allow authenticated users full access to manage subscribers

  2. Notes
    - This fixes the access issues with the newsletter table
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can delete subscribers" ON newsletter_subscribers;

-- Create fresh policies
CREATE POLICY "Allow anonymous insert"
  ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated select"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);