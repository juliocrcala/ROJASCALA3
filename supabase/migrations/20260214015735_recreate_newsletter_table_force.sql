/*
  # Recreate Newsletter Table - Force PostgREST Recognition

  1. Purpose
    - Drop and recreate newsletter_subscribers to force PostgREST cache refresh
    - Preserve all existing data
    - Ensure API access works correctly

  2. Process
    - Backup existing data
    - Drop table completely
    - Recreate with clean structure
    - Restore data
    - Setup RLS policies
*/

-- Step 1: Backup existing data
CREATE TEMP TABLE newsletter_backup AS 
SELECT * FROM newsletter_subscribers;

-- Step 2: Drop the table completely
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;

-- Step 3: Recreate the table with clean structure
CREATE TABLE newsletter_subscribers (
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

-- Step 4: Restore data
INSERT INTO newsletter_subscribers (
  id, email, name, subscribed_at, is_active, 
  ip_address, user_agent, created_at, updated_at
)
SELECT 
  id, email, name, subscribed_at, is_active,
  ip_address, user_agent, created_at, updated_at
FROM newsletter_backup;

-- Step 5: Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple policy for anon access
CREATE POLICY "anon_full_access"
  ON newsletter_subscribers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Step 7: Grant permissions
GRANT ALL ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;

-- Step 8: Add table comment
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscribers - Recreated 2026-02-14';

-- Step 9: Force PostgREST reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
