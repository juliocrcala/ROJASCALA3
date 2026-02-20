/*
  # Arreglar permisos de actualización para site_settings

  1. Cambios
    - Eliminar política restrictiva de admin que requiere JWT
    - Agregar política que permite actualizar a usuarios autenticados
    - Mantener política de lectura pública

  2. Seguridad
    - Solo usuarios autenticados pueden actualizar
    - Cualquiera puede leer (necesario para el banner público)
*/

-- Eliminar política antigua que requiere email específico en JWT
DROP POLICY IF EXISTS "Admin can update site settings" ON site_settings;

-- Crear nueva política que permite a usuarios autenticados actualizar
CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Asegurar que la política de lectura pública existe
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;

CREATE POLICY "Public can view site settings"
  ON site_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);