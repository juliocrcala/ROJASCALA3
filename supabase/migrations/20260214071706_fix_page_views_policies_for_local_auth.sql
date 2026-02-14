/*
  # Arreglar políticas de page_views para autenticación local

  1. Cambios
    - Eliminar la política restrictiva que requiere autenticación de Supabase
    - Permitir lectura anónima de page_views para que funcione con autenticación local
    - Mantener la política de inserción para usuarios anónimos
    
  2. Seguridad
    - Los datos de page_views son agregados y anónimos
    - No contienen información personal identificable
    - Es seguro permitir lectura para generar estadísticas
*/

-- Eliminar la política anterior que requiere auth.uid()
DROP POLICY IF EXISTS "Only admins can view page views" ON page_views;

-- Permitir que cualquiera pueda leer page_views (son datos anónimos de estadísticas)
CREATE POLICY "Allow anonymous read access to page views"
  ON page_views
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Asegurar que la política de inserción sigue funcionando
DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;

CREATE POLICY "Allow anonymous insert to page views"
  ON page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
