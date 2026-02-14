/*
  # Forzar PostgREST a detectar tablas de analytics

  1. Cambios
    - Alterar ownership y permisos
    - Recrear políticas con nombres únicos
    - Forzar exposición en API
*/

-- Asegurar que postgres sea owner
ALTER TABLE IF EXISTS page_views OWNER TO postgres;
ALTER TABLE IF EXISTS analytics_summary OWNER TO postgres;

-- Eliminar todas las políticas anteriores
DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
DROP POLICY IF EXISTS "anon_select_page_views" ON page_views;
DROP POLICY IF EXISTS "auth_all_page_views" ON page_views;
DROP POLICY IF EXISTS "anon_insert_analytics_summary" ON analytics_summary;
DROP POLICY IF EXISTS "anon_select_analytics_summary" ON analytics_summary;
DROP POLICY IF EXISTS "anon_update_analytics_summary" ON analytics_summary;
DROP POLICY IF EXISTS "anon_delete_analytics_summary" ON analytics_summary;
DROP POLICY IF EXISTS "auth_all_analytics_summary" ON analytics_summary;

-- Crear políticas con TO public (igual que newsletter exitoso)
CREATE POLICY "Anyone can insert page views"
  ON page_views
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read page views"
  ON page_views
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert analytics"
  ON analytics_summary
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read analytics"
  ON analytics_summary
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update analytics"
  ON analytics_summary
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Revocar y re-otorgar permisos
REVOKE ALL ON page_views FROM public, anon, authenticated;
REVOKE ALL ON analytics_summary FROM public, anon, authenticated;

GRANT SELECT, INSERT ON page_views TO anon, public;
GRANT ALL ON page_views TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_summary TO anon, public;
GRANT ALL ON analytics_summary TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, public, authenticated;

-- Notificar
NOTIFY pgrst, 'reload schema';
