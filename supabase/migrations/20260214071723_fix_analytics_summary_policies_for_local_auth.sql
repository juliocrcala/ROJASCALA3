/*
  # Arreglar políticas de analytics_summary para autenticación local

  1. Cambios
    - Eliminar las políticas restrictivas que requieren autenticación de Supabase
    - Permitir lectura anónima de analytics_summary
    - Mantener la política de inserción para la función
    
  2. Seguridad
    - Los datos son resúmenes agregados y anónimos
    - No contienen información personal identificable
    - Es seguro permitir lectura para el panel de admin con auth local
*/

-- Eliminar las políticas anteriores que requieren auth.uid()
DROP POLICY IF EXISTS "Only admins can view analytics summary" ON analytics_summary;
DROP POLICY IF EXISTS "Only admins can update analytics summary" ON analytics_summary;

-- Permitir que cualquiera pueda leer analytics_summary (son datos agregados)
CREATE POLICY "Allow anonymous read access to analytics summary"
  ON analytics_summary
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Permitir actualizaciones y deletes anónimos para el sistema de reportes
CREATE POLICY "Allow anonymous update to analytics summary"
  ON analytics_summary
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous delete from analytics summary"
  ON analytics_summary
  FOR DELETE
  TO anon, authenticated
  USING (true);
