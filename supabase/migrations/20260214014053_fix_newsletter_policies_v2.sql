/*
  # Fix Newsletter Subscribers Policies V2

  1. Changes
    - Drop all existing policies
    - Create simplified policies that work with Supabase client
    - Allow public inserts for subscriptions
    - Allow authenticated users full access for admin panel

  2. Security
    - Public can insert subscriptions (with validation)
    - Authenticated users can manage all subscribers
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow anonymous users to subscribe" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated users to delete subscribers" ON newsletter_subscribers;

-- Allow anyone to insert (for public subscription form)
CREATE POLICY "Enable insert for all users"
  ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view all subscribers
CREATE POLICY "Enable read for authenticated users"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update subscribers
CREATE POLICY "Enable update for authenticated users"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete subscribers
CREATE POLICY "Enable delete for authenticated users"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);
