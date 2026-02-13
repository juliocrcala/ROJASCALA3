/*
  # Create newsletter_subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key) - Unique identifier for each subscriber
      - `email` (text, unique, not null) - Subscriber's email address
      - `created_at` (timestamptz) - Timestamp when the subscription was created
      
  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Add policy for anonymous users to insert their email (subscribe)
    - Add policy for authenticated admin users to read all subscribers
    - Prevent duplicate email subscriptions with unique constraint
*/

-- Create the newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to subscribe (insert their email)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to subscribe
CREATE POLICY "Authenticated users can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to view all subscribers (for admin panel)
CREATE POLICY "Authenticated users can view all subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);