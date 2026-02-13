/*
  # Fix Newsletter Insert Policy for Anonymous Users

  1. Changes
    - Drop the existing "Anyone can subscribe to newsletter" policy
    - Create a new policy specifically for anonymous (unauthenticated) users
    - This allows public users to subscribe without authentication

  2. Security
    - Policy restricted to INSERT operations only
    - Anyone can insert their subscription data
    - RLS remains enabled for all other operations
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;

-- Create policy for anonymous users (unauthenticated)
CREATE POLICY "Anonymous users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow authenticated users to insert (in case they're logged in)
CREATE POLICY "Authenticated users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
