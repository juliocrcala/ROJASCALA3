/*
  # Create Fresh Newsletter Table
  
  1. New Table
    - `newsletter` (new name to force PostgREST detection)
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `subscribed_at` (timestamptz)
      - `is_active` (boolean)
      - `ip_address` (text, optional)
      - `user_agent` (text, optional)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Allow anonymous users to insert and select
    - Allow authenticated users full access
*/

-- Create the new table with a different name
CREATE TABLE IF NOT EXISTS newsletter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now() NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE newsletter ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous users (public access)
CREATE POLICY "anon_insert_newsletter"
  ON newsletter
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_newsletter"
  ON newsletter
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users (admin access)
CREATE POLICY "auth_all_newsletter"
  ON newsletter
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT ON newsletter TO anon;
GRANT ALL ON newsletter TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Migrate existing data if any
INSERT INTO newsletter (id, name, email, subscribed_at, is_active, ip_address, user_agent, created_at, updated_at)
SELECT id, name, email, subscribed_at, is_active, ip_address, user_agent, created_at, updated_at
FROM newsletter_subscribers
WHERE EXISTS (SELECT 1 FROM newsletter_subscribers)
ON CONFLICT (email) DO NOTHING;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter(subscribed_at DESC);
