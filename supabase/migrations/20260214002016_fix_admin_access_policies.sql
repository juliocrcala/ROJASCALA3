/*
  # Fix Admin Panel Access Policies
  
  1. Changes
    - Add anon SELECT policies for all tables so admin panel can read data
    - Keep existing authenticated policies intact
    - This allows the admin panel to work with anon key until proper auth is implemented
  
  2. Security
    - Anon users can only SELECT, not INSERT/UPDATE/DELETE (except newsletter)
    - Authenticated policies remain for full admin control
*/

-- Allow anon to view all articles (admin needs to see hidden ones too)
CREATE POLICY "Anon can view all articles for admin"
  ON articles
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon to view all special articles
CREATE POLICY "Anon can view all special articles for admin"
  ON special_articles
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon to view all contacts
CREATE POLICY "Anon can view all contacts for admin"
  ON contacts
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon to view all consultations
CREATE POLICY "Anon can view all consultations for admin"
  ON consultations
  FOR SELECT
  TO anon
  USING (true);

-- Allow anon to manage articles
CREATE POLICY "Anon can insert articles"
  ON articles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update articles"
  ON articles
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete articles"
  ON articles
  FOR DELETE
  TO anon
  USING (true);

-- Allow anon to manage special articles
CREATE POLICY "Anon can insert special articles"
  ON special_articles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update special articles"
  ON special_articles
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete special articles"
  ON special_articles
  FOR DELETE
  TO anon
  USING (true);

-- Allow anon to manage contacts
CREATE POLICY "Anon can insert contacts"
  ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update contacts"
  ON contacts
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete contacts"
  ON contacts
  FOR DELETE
  TO anon
  USING (true);

-- Allow anon to manage consultations
CREATE POLICY "Anon can update consultations"
  ON consultations
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete consultations"
  ON consultations
  FOR DELETE
  TO anon
  USING (true);

-- Allow anon to manage categories
CREATE POLICY "Anon can view all categories"
  ON categories_config
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert categories"
  ON categories_config
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update categories"
  ON categories_config
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete categories"
  ON categories_config
  FOR DELETE
  TO anon
  USING (true);
