/*
  # Fix Newsletter Subscribers Table - Add Missing Columns

  1. Changes
    - Add missing columns that the frontend code expects
    - Ensure all columns match the TypeScript interface
    - Maintain RLS and permissions

  2. Columns Added
    - ip_address (text, optional)
    - user_agent (text, optional)
    - updated_at (timestamptz with default)
*/

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add ip_address column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'newsletter_subscribers'
      AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE newsletter_subscribers ADD COLUMN ip_address text;
  END IF;

  -- Add user_agent column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'newsletter_subscribers'
      AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE newsletter_subscribers ADD COLUMN user_agent text;
  END IF;

  -- Add updated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'newsletter_subscribers'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE newsletter_subscribers ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Update existing rows to have updated_at if NULL
UPDATE newsletter_subscribers 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Ensure RLS is enabled
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Ensure permissions are granted
GRANT ALL ON newsletter_subscribers TO anon;
GRANT ALL ON newsletter_subscribers TO authenticated;

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
