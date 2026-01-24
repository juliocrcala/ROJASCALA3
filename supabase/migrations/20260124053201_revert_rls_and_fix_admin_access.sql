/*
  # Revert RLS changes and fix admin panel access

  1. Changes
    - Drop the problematic policies created earlier
    - Restore simple policies that work with current code
    - Ensure authenticated users can access all data

  2. Security
    - Authenticated users can view, insert, update, delete all articles
    - This allows admin panel to work correctly
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Public users can view non-hidden articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can view all articles" ON articles;
DROP POLICY IF EXISTS "Public users can view non-hidden special articles" ON special_articles;
DROP POLICY IF EXISTS "Authenticated users can view all special articles" ON special_articles;

-- Recreate simple working policies for articles
CREATE POLICY "Articles are viewable by everyone"
  ON articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (true);

-- Recreate simple working policies for special_articles
CREATE POLICY "Special articles are viewable by everyone"
  ON special_articles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert special articles"
  ON special_articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update special articles"
  ON special_articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete special articles"
  ON special_articles FOR DELETE
  TO authenticated
  USING (true);
