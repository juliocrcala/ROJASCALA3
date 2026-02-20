/*
  # Optimize RLS Policies for Performance and Security

  This migration fixes all security and performance issues detected in the database.

  ## Changes Made:
  
  1. **RLS Performance Optimization** - All admin policies (30 policies total):
     - Changed `auth.jwt()->>'email'` to `(select auth.jwt()->>'email')`
     - This prevents re-evaluation for each row, improving query performance
     - Tables affected: articles, special_articles, contacts, consultations, 
       categories_config, site_settings, page_views, analytics_summary, newsletter

  2. **Function Search Path Security**:
     - Fixed mutable search_path for generate_daily_analytics function
     - Prevents potential SQL injection via search_path manipulation

  ## Security Notes:
  - All policies maintain the same security level
  - Admin access remains restricted to rojascalaperu2025@gmail.com
  - Public insert policies remain unchanged (consultations, newsletter, page_views)
*/

-- =============================================
-- ARTICLES TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view all articles" ON articles;
DROP POLICY IF EXISTS "Admin can insert articles" ON articles;
DROP POLICY IF EXISTS "Admin can update articles" ON articles;
DROP POLICY IF EXISTS "Admin can delete articles" ON articles;

CREATE POLICY "Admin can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- SPECIAL_ARTICLES TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view all special articles" ON special_articles;
DROP POLICY IF EXISTS "Admin can insert special articles" ON special_articles;
DROP POLICY IF EXISTS "Admin can update special articles" ON special_articles;
DROP POLICY IF EXISTS "Admin can delete special articles" ON special_articles;

CREATE POLICY "Admin can view all special articles"
  ON special_articles FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can insert special articles"
  ON special_articles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can update special articles"
  ON special_articles FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete special articles"
  ON special_articles FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- CONTACTS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Admin can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Admin can update contacts" ON contacts;
DROP POLICY IF EXISTS "Admin can delete contacts" ON contacts;

CREATE POLICY "Admin can view all contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- CONSULTATIONS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view all consultations" ON consultations;
DROP POLICY IF EXISTS "Admin can update consultations" ON consultations;
DROP POLICY IF EXISTS "Admin can delete consultations" ON consultations;

CREATE POLICY "Admin can view all consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can update consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete consultations"
  ON consultations FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- CATEGORIES_CONFIG TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view all categories" ON categories_config;
DROP POLICY IF EXISTS "Admin can insert categories" ON categories_config;
DROP POLICY IF EXISTS "Admin can update categories" ON categories_config;
DROP POLICY IF EXISTS "Admin can delete categories" ON categories_config;

CREATE POLICY "Admin can view all categories"
  ON categories_config FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can insert categories"
  ON categories_config FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can update categories"
  ON categories_config FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete categories"
  ON categories_config FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- SITE_SETTINGS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can update site settings" ON site_settings;

CREATE POLICY "Admin can view site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- PAGE_VIEWS TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view page views" ON page_views;
DROP POLICY IF EXISTS "Admin can delete page views" ON page_views;

CREATE POLICY "Admin can view page views"
  ON page_views FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete page views"
  ON page_views FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- ANALYTICS_SUMMARY TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view analytics summary" ON analytics_summary;
DROP POLICY IF EXISTS "Admin can insert analytics summary" ON analytics_summary;
DROP POLICY IF EXISTS "Admin can update analytics summary" ON analytics_summary;
DROP POLICY IF EXISTS "Admin can delete analytics summary" ON analytics_summary;

CREATE POLICY "Admin can view analytics summary"
  ON analytics_summary FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can insert analytics summary"
  ON analytics_summary FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can update analytics summary"
  ON analytics_summary FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete analytics summary"
  ON analytics_summary FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- NEWSLETTER TABLE
-- =============================================
DROP POLICY IF EXISTS "Admin can view newsletter" ON newsletter;
DROP POLICY IF EXISTS "Admin can update newsletter" ON newsletter;
DROP POLICY IF EXISTS "Admin can delete newsletter" ON newsletter;

CREATE POLICY "Admin can view newsletter"
  ON newsletter FOR SELECT
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can update newsletter"
  ON newsletter FOR UPDATE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com')
  WITH CHECK ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

CREATE POLICY "Admin can delete newsletter"
  ON newsletter FOR DELETE
  TO authenticated
  USING ((select auth.jwt()->>'email') = 'rojascalaperu2025@gmail.com');

-- =============================================
-- FIX FUNCTION SEARCH PATH FOR SECURITY
-- =============================================
-- Fix the generate_daily_analytics function search_path
ALTER FUNCTION generate_daily_analytics(date) SET search_path = public, pg_temp;
