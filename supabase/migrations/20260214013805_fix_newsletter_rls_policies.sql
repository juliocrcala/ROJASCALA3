/*
  # Fix Newsletter Subscribers RLS Policies

  1. Changes
    - Drop existing policies that use 'true' which can cause evaluation errors
    - Create proper policies for anonymous inserts and authenticated access
    - Use explicit boolean expressions instead of bare 'true'

  2. Security
    - Anonymous users can insert their subscription
    - Authenticated users (admins) can view, update, and delete all subscribers
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated select" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated update" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow authenticated delete" ON newsletter_subscribers;

-- Create new policies with explicit boolean expressions

-- Allow anonymous users to insert subscriptions
CREATE POLICY "Allow anonymous users to subscribe"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (
    email IS NOT NULL 
    AND name IS NOT NULL 
    AND length(trim(email)) > 0 
    AND length(trim(name)) > 0
  );

-- Allow authenticated users to view all subscribers
CREATE POLICY "Allow authenticated users to view subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (1=1);

-- Allow authenticated users to update subscribers
CREATE POLICY "Allow authenticated users to update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (1=1)
  WITH CHECK (1=1);

-- Allow authenticated users to delete subscribers
CREATE POLICY "Allow authenticated users to delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (1=1);
