/*
  # Actualizar email del administrador en políticas RLS

  1. Cambios
    - Actualizar todas las políticas que usan el email del admin
    - Cambiar de 'rojascalaperu2025@gmail.com' a 'rojas.ca.la.admi@gmail.com'

  2. Seguridad
    - Solo el admin con email correcto puede actualizar
    - Público puede leer las configuraciones
*/

-- Actualizar política de actualización para site_settings con email correcto
DROP POLICY IF EXISTS "Authenticated users can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Admin can update site settings" ON site_settings;

CREATE POLICY "Admin can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt()->>'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt()->>'email') = 'rojas.ca.la.admi@gmail.com');

-- Actualizar política de visualización para admin
DROP POLICY IF EXISTS "Admin can view site settings" ON site_settings;

CREATE POLICY "Admin can view site settings"
  ON site_settings
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt()->>'email') = 'rojas.ca.la.admi@gmail.com');

-- Mantener política de lectura pública
DROP POLICY IF EXISTS "Public can view site settings" ON site_settings;

CREATE POLICY "Public can view site settings"
  ON site_settings
  FOR SELECT
  TO anon
  USING (true);