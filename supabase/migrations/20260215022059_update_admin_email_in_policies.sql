/*
  # Update Admin Email in RLS Policies
  
  ## Changes
  This migration updates all RLS policies to use the correct admin email: rojas.ca.la.admi@gmail.com
  
  ## Updated Policies
  All policies that check for admin authentication now use the correct email address.
  This ensures only the authorized admin can perform administrative operations.
*/

-- First, drop all existing admin policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND policyname LIKE '%Admin%'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ==============================================
-- ARTICLES TABLE - ADMIN POLICIES
-- ==============================================

CREATE POLICY "Admin can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

-- ==============================================
-- SPECIAL ARTICLES TABLE - ADMIN POLICIES
-- ==============================================

CREATE POLICY "Admin can view all special articles"
  ON special_articles FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can insert special articles"
  ON special_articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update special articles"
  ON special_articles FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete special articles"
  ON special_articles FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

-- ==============================================
-- CONTACTS TABLE - ADMIN POLICIES
-- ==============================================

CREATE POLICY "Admin can view all contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

-- ==============================================
-- CONSULTATIONS TABLE - ADMIN POLICIES
-- ==============================================

CREATE POLICY "Admin can view all consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete consultations"
  ON consultations FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

-- ==============================================
-- CATEGORIES CONFIG TABLE - ADMIN POLICIES
-- ==============================================

CREATE POLICY "Admin can view all categories"
  ON categories_config FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can insert categories"
  ON categories_config FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update categories"
  ON categories_config FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete categories"
  ON categories_config FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

-- ==============================================
-- SITE SETTINGS TABLE - ADMIN POLICIES
-- ==============================================

CREATE POLICY "Admin can view site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

-- ==============================================
-- ANALYTICS TABLES - ADMIN POLICIES
-- ==============================================

CREATE POLICY "Admin can view page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete page views"
  ON page_views FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can view analytics summary"
  ON analytics_summary FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can insert analytics summary"
  ON analytics_summary FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update analytics summary"
  ON analytics_summary FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete analytics summary"
  ON analytics_summary FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

-- ==============================================
-- NEWSLETTER TABLES - ADMIN POLICIES
-- ==============================================

CREATE POLICY "Admin can view newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can update newsletter subscribers"
  ON newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete newsletter subscribers"
  ON newsletter_subscribers FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'rojas.ca.la.admi@gmail.com');

-- Update newsletter table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'newsletter' AND schemaname = 'public') THEN
    EXECUTE 'CREATE POLICY "Admin can view newsletter alt" ON newsletter FOR SELECT TO authenticated USING (auth.jwt()->>''email'' = ''rojas.ca.la.admi@gmail.com'')';
    EXECUTE 'CREATE POLICY "Admin can update newsletter alt" ON newsletter FOR UPDATE TO authenticated USING (auth.jwt()->>''email'' = ''rojas.ca.la.admi@gmail.com'') WITH CHECK (auth.jwt()->>''email'' = ''rojas.ca.la.admi@gmail.com'')';
    EXECUTE 'CREATE POLICY "Admin can delete newsletter alt" ON newsletter FOR DELETE TO authenticated USING (auth.jwt()->>''email'' = ''rojas.ca.la.admi@gmail.com'')';
  END IF;
END $$;
