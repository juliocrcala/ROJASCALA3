/*
  # Forzar reload extremo de PostgREST

  1. Cambios
    - Crear función temporal
    - Eliminarla para forzar reload
    - Recargar schema cache
*/

-- Crear y eliminar una función para forzar reload
CREATE OR REPLACE FUNCTION temp_reload_trigger() RETURNS void AS $$
BEGIN
  PERFORM pg_notify('pgrst', 'reload schema');
END;
$$ LANGUAGE plpgsql;

SELECT temp_reload_trigger();

DROP FUNCTION IF EXISTS temp_reload_trigger();

-- Reotorgar permisos explícitos
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON page_views TO anon, authenticated;

-- Notificación múltiple
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');

-- Verificar políticas
DO $$
BEGIN
  -- Forzar recreación de políticas si existen
  DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;
  DROP POLICY IF EXISTS "Anyone can read page views" ON page_views;
  
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
END $$;
