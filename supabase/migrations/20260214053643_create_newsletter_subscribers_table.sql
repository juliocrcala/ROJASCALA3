/*
  # Create Newsletter Subscribers Table
  
  1. Purpose
    - Create newsletter_subscribers table for email subscriptions
    
  2. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `name` (text, subscriber full name)
      - `email` (text, unique, subscriber email)
      - `subscribed_at` (timestamp, subscription date)
      - `is_active` (boolean, subscription status)
      - `ip_address` (text, optional IP address)
      - `user_agent` (text, optional browser info)
      - `created_at` (timestamp, record creation)
      - `updated_at` (timestamp, last update)
      
  3. Security
    - Enable RLS
    - Allow anonymous users to INSERT and SELECT
    - Allow authenticated users full access
*/

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "allow_anon_select" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_anon_insert" ON newsletter_subscribers;
DROP POLICY IF EXISTS "allow_auth_all" ON newsletter_subscribers;

-- Create policies for anonymous users (public access)
CREATE POLICY "allow_anon_select"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "allow_anon_insert"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for authenticated users (admin access)
CREATE POLICY "allow_auth_all"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;
GRANT ALL ON newsletter_subscribers TO service_role;

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
