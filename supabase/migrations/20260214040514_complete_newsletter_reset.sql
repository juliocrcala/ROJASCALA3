/*
  # Complete Newsletter Table Reset

  1. Strategy
    - Backup data
    - Drop ALL constraints and policies
    - Recreate table with clean structure
    - Restore data
    - Setup fresh RLS policies
*/

-- Backup existing data to temp table
CREATE TEMP TABLE newsletter_backup_final AS 
SELECT * FROM newsletter_subscribers;

-- Drop the table completely with CASCADE
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;

-- Recreate with exact structure matching TypeScript interface
CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create index on email for faster lookups
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active);

-- Restore data if any exists
INSERT INTO newsletter_subscribers (
  id, name, email, subscribed_at, is_active, 
  ip_address, user_agent, created_at, updated_at
)
SELECT 
  id, name, email, subscribed_at, is_active,
  ip_address, user_agent, created_at, updated_at
FROM newsletter_backup_final
ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create simple policy for anon users (for inserting new subscribers)
CREATE POLICY "allow_anon_insert"
  ON newsletter_subscribers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for anon to read all subscribers
CREATE POLICY "allow_anon_select"
  ON newsletter_subscribers
  FOR SELECT
  TO anon
  USING (true);

-- Create policy for authenticated users (admin) to do everything
CREATE POLICY "allow_auth_all"
  ON newsletter_subscribers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant explicit permissions
GRANT SELECT, INSERT ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;
GRANT ALL ON newsletter_subscribers TO service_role;

-- Add helpful comment
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers - Recreated with full reset 2026-02-14';

-- Force complete schema reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
