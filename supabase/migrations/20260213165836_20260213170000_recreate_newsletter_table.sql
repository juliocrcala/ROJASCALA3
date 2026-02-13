/*
  # Recreate Newsletter Subscribers Table with Proper API Exposure

  1. Changes
    - Drop existing newsletter_subscribers table if it exists
    - Recreate table with all proper grants from the start
    - Set up RLS policies
    - Grant all necessary permissions to expose via PostgREST API
    - Force schema reload

  2. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, required)
      - `name` (text, required)
      - `subscribed_at` (timestamptz)
      - `is_active` (boolean)
      - `ip_address` (text, nullable)
      - `user_agent` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  3. Security
    - Enable RLS
    - Allow anonymous users to INSERT (subscribe)
    - Allow authenticated users full access (admin)
*/

-- Drop existing table if it exists (cascade to remove policies and dependencies)
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;

-- Create the table
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Grant permissions to all roles (critical for PostgREST API exposure)
GRANT ALL ON public.newsletter_subscribers TO postgres;
GRANT ALL ON public.newsletter_subscribers TO anon;
GRANT ALL ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anonymous users to subscribe (INSERT)
CREATE POLICY "allow_anon_insert"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to subscribe (INSERT)
CREATE POLICY "allow_auth_insert"
  ON public.newsletter_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to view all (SELECT)
CREATE POLICY "allow_auth_select"
  ON public.newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update (UPDATE)
CREATE POLICY "allow_auth_update"
  ON public.newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete (DELETE)
CREATE POLICY "allow_auth_delete"
  ON public.newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_newsletter_subscribers_email 
  ON public.newsletter_subscribers(email);

CREATE INDEX idx_newsletter_subscribers_subscribed_at 
  ON public.newsletter_subscribers(subscribed_at DESC);

CREATE INDEX idx_newsletter_subscribers_is_active 
  ON public.newsletter_subscribers(is_active);

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
