/*
  # Update Admin Email in All RLS Policies
  
  1. Changes
    - Update all RLS policies to use the correct admin email
    - Change from 'rojascalaperu2025@gmail.com' to 'rojas.ca.la.admi@gmail.com'
  
  2. Tables Affected
    - page_views
    - analytics_summary
    - site_settings
    - articles
    - special_articles
    - categories_config
    - contacts
    - newsletter (newsletter_subscribers)
*/

-- Fix page_views policies
DROP POLICY IF EXISTS "Admin can read page views" ON page_views;
DROP POLICY IF EXISTS "Admin can delete page views" ON page_views;

CREATE POLICY "Admin can read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

CREATE POLICY "Admin can delete page views"
  ON page_views
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

-- Fix analytics_summary policies
DROP POLICY IF EXISTS "Admin can manage analytics summaries" ON analytics_summary;
DROP POLICY IF EXISTS "Admin can delete analytics summaries" ON analytics_summary;

CREATE POLICY "Admin can manage analytics summaries"
  ON analytics_summary
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

-- Fix site_settings policies
DROP POLICY IF EXISTS "Admin can manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can update site settings" ON site_settings;

CREATE POLICY "Admin can manage site settings"
  ON site_settings
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

-- Fix articles policies
DROP POLICY IF EXISTS "Admin can manage articles" ON articles;

CREATE POLICY "Admin can manage articles"
  ON articles
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

-- Fix special_articles policies
DROP POLICY IF EXISTS "Admin can manage special articles" ON special_articles;

CREATE POLICY "Admin can manage special articles"
  ON special_articles
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

-- Fix categories_config policies
DROP POLICY IF EXISTS "Admin can manage categories" ON categories_config;

CREATE POLICY "Admin can manage categories"
  ON categories_config
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

-- Fix contacts policies
DROP POLICY IF EXISTS "Admin can manage contacts" ON contacts;

CREATE POLICY "Admin can manage contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

-- Fix newsletter policies
DROP POLICY IF EXISTS "Admin can manage newsletter subscribers" ON newsletter;

CREATE POLICY "Admin can manage newsletter subscribers"
  ON newsletter
  FOR ALL
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

-- Force PostgREST reload
NOTIFY pgrst, 'reload schema';
