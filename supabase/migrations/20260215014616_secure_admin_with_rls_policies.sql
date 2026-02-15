/*
  # Secure Admin Panel with RLS Policies
  
  ## Security Overview
  This migration implements Row Level Security (RLS) policies to protect all admin tables.
  Only authenticated users with the authorized email can perform admin operations.
  
  ## Tables Protected
  1. **articles** - Legal documents and articles
  2. **special_articles** - Featured articles
  3. **contacts** - Professional contacts
  4. **consultations** - User consultation requests
  5. **categories_config** - Categories and document types
  6. **site_settings** - Maintenance mode settings
  7. **analytics_summary** - Analytics reports
  8. **newsletter_subscribers** - Newsletter subscriptions
  
  ## Access Control
  ### Public (Anonymous Users)
  - **SELECT** on published content only (where is_hidden = false or is_active = true)
  - **INSERT** on consultations and newsletter_subscribers
  
  ### Admin (Authenticated with authorized email)
  - **Full access** (SELECT, INSERT, UPDATE, DELETE) on all tables
  - Must be authenticated via Supabase Auth
  - Email must match authorized email
  
  ## Important Notes
  - RLS is already enabled on all tables
  - Policies use auth.jwt() to verify authenticated user email
  - Public users can only read published content
  - Consultations and newsletter signups are open to public
*/

-- First, drop all existing policies to start fresh
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ==============================================
-- ARTICLES TABLE POLICIES
-- ==============================================

-- Public: SELECT published articles only
CREATE POLICY "Public can view published articles"
  ON articles FOR SELECT
  TO anon
  USING (is_hidden = false OR is_hidden IS NULL);

-- Admin: Full access for authorized email
CREATE POLICY "Admin can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com')
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- ==============================================
-- SPECIAL ARTICLES TABLE POLICIES
-- ==============================================

-- Public: SELECT published special articles only
CREATE POLICY "Public can view published special articles"
  ON special_articles FOR SELECT
  TO anon
  USING (is_hidden = false OR is_hidden IS NULL);

-- Admin: Full access
CREATE POLICY "Admin can view all special articles"
  ON special_articles FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can insert special articles"
  ON special_articles FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can update special articles"
  ON special_articles FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com')
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can delete special articles"
  ON special_articles FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- ==============================================
-- CONTACTS TABLE POLICIES
-- ==============================================

-- Public: SELECT active contacts only
CREATE POLICY "Public can view active contacts"
  ON contacts FOR SELECT
  TO anon
  USING (is_active = true OR is_active IS NULL);

-- Admin: Full access
CREATE POLICY "Admin can view all contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com')
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- ==============================================
-- CONSULTATIONS TABLE POLICIES
-- ==============================================

-- Public: Can insert new consultations
CREATE POLICY "Public can submit consultations"
  ON consultations FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin: Full access
CREATE POLICY "Admin can view all consultations"
  ON consultations FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can update consultations"
  ON consultations FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com')
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can delete consultations"
  ON consultations FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- ==============================================
-- CATEGORIES CONFIG TABLE POLICIES
-- ==============================================

-- Public: SELECT active categories only
CREATE POLICY "Public can view active categories"
  ON categories_config FOR SELECT
  TO anon
  USING (is_active = true OR is_active IS NULL);

-- Admin: Full access
CREATE POLICY "Admin can view all categories"
  ON categories_config FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can insert categories"
  ON categories_config FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can update categories"
  ON categories_config FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com')
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can delete categories"
  ON categories_config FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- ==============================================
-- SITE SETTINGS TABLE POLICIES
-- ==============================================

-- Public: Can read site settings (maintenance mode)
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  TO anon
  USING (true);

-- Admin: Full access
CREATE POLICY "Admin can view site settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com')
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- ==============================================
-- ANALYTICS TABLES POLICIES
-- ==============================================

-- Public: Can insert page views for tracking
CREATE POLICY "Public can insert page views"
  ON page_views FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin: Can view analytics
CREATE POLICY "Admin can view page views"
  ON page_views FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can delete page views"
  ON page_views FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- Analytics Summary
CREATE POLICY "Admin can view analytics summary"
  ON analytics_summary FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can insert analytics summary"
  ON analytics_summary FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can update analytics summary"
  ON analytics_summary FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com')
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can delete analytics summary"
  ON analytics_summary FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- ==============================================
-- NEWSLETTER TABLES POLICIES
-- ==============================================

-- Public: Can subscribe to newsletter
CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin: Full access to manage subscribers
CREATE POLICY "Admin can view newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can update newsletter subscribers"
  ON newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com')
  WITH CHECK (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

CREATE POLICY "Admin can delete newsletter subscribers"
  ON newsletter_subscribers FOR DELETE
  TO authenticated
  USING (auth.jwt()->>'email' = 'tu_email@ejemplo.com');

-- Also apply same policies to newsletter table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'newsletter' AND schemaname = 'public') THEN
    -- Public: Can subscribe
    EXECUTE 'CREATE POLICY "Public can subscribe to newsletter alt" ON newsletter FOR INSERT TO anon WITH CHECK (true)';
    
    -- Admin: Full access
    EXECUTE 'CREATE POLICY "Admin can view newsletter alt" ON newsletter FOR SELECT TO authenticated USING (auth.jwt()->>''email'' = ''tu_email@ejemplo.com'')';
    EXECUTE 'CREATE POLICY "Admin can update newsletter alt" ON newsletter FOR UPDATE TO authenticated USING (auth.jwt()->>''email'' = ''tu_email@ejemplo.com'') WITH CHECK (auth.jwt()->>''email'' = ''tu_email@ejemplo.com'')';
    EXECUTE 'CREATE POLICY "Admin can delete newsletter alt" ON newsletter FOR DELETE TO authenticated USING (auth.jwt()->>''email'' = ''tu_email@ejemplo.com'')';
  END IF;
END $$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT INSERT ON consultations TO anon;
GRANT INSERT ON newsletter_subscribers TO anon;
GRANT INSERT ON newsletter TO anon;
GRANT INSERT ON page_views TO anon;
