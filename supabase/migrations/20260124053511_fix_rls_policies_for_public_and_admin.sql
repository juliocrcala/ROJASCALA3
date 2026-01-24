/*
  # Fix RLS policies to allow public read and admin write

  1. Changes
    - Remove all existing duplicate policies
    - Create new policies that allow:
      - Public (anon) users to read non-hidden articles
      - Authenticated users to read ALL articles
      - Authenticated users to write/update/delete articles

  2. Security
    - Public can only see visible articles (is_hidden = false)
    - Admins (authenticated) can see and manage everything
*/

-- Drop ALL existing policies to clean up
DROP POLICY IF EXISTS "Authenticated users can insert articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can update articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can delete articles" ON articles;
DROP POLICY IF EXISTS "Articles are viewable by everyone" ON articles;
DROP POLICY IF EXISTS "Users can insert articles" ON articles;
DROP POLICY IF EXISTS "Users can update articles" ON articles;
DROP POLICY IF EXISTS "Users can delete articles" ON articles;

DROP POLICY IF EXISTS "Authenticated users can insert special articles" ON special_articles;
DROP POLICY IF EXISTS "Authenticated users can update special articles" ON special_articles;
DROP POLICY IF EXISTS "Authenticated users can delete special articles" ON special_articles;
DROP POLICY IF EXISTS "Special articles are viewable by everyone" ON special_articles;
DROP POLICY IF EXISTS "Users can insert special articles" ON special_articles;
DROP POLICY IF EXISTS "Users can update special articles" ON special_articles;
DROP POLICY IF EXISTS "Users can delete special articles" ON special_articles;

-- Create new clean policies for articles
CREATE POLICY "Public can view non-hidden articles"
  ON articles FOR SELECT
  TO anon
  USING (is_hidden = false);

CREATE POLICY "Authenticated can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- Create new clean policies for special_articles
CREATE POLICY "Public can view non-hidden special articles"
  ON special_articles FOR SELECT
  TO anon
  USING (is_hidden = false);

CREATE POLICY "Authenticated can view all special articles"
  ON special_articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert special articles"
  ON special_articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update special articles"
  ON special_articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete special articles"
  ON special_articles FOR DELETE
  TO authenticated
  USING (true);
