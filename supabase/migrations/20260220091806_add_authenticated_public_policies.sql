/*
  # Add Public Policies for Authenticated Users
  
  ## Problem
  Current policies only allow:
  - anon role: view public content
  - authenticated admin: full access
  
  But authenticated non-admin users cannot view public content!
  
  ## Solution
  Add SELECT policies for authenticated (non-admin) users to view public content.
  This allows logged-in users to see the same content as anonymous users.
  
  ## Security
  - Only SELECT permissions
  - Same filtering as anon policies (is_hidden/is_active)
  - Does not grant any write permissions
*/

-- =============================================
-- ARTICLES - Authenticated Public Access
-- =============================================
CREATE POLICY "Authenticated users can view published articles"
  ON articles FOR SELECT
  TO authenticated
  USING ((is_hidden = false) OR (is_hidden IS NULL));

-- =============================================
-- SPECIAL_ARTICLES - Authenticated Public Access
-- =============================================
CREATE POLICY "Authenticated users can view published special articles"
  ON special_articles FOR SELECT
  TO authenticated
  USING ((is_hidden = false) OR (is_hidden IS NULL));

-- =============================================
-- CONTACTS - Authenticated Public Access
-- =============================================
CREATE POLICY "Authenticated users can view active contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING ((is_active = true) OR (is_active IS NULL));

-- =============================================
-- CATEGORIES_CONFIG - Authenticated Public Access
-- =============================================
CREATE POLICY "Authenticated users can view active categories"
  ON categories_config FOR SELECT
  TO authenticated
  USING ((is_active = true) OR (is_active IS NULL));

-- Force PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
