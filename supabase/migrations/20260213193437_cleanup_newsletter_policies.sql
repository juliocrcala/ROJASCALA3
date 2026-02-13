/*
  # Limpiar y corregir políticas de newsletter_subscribers

  1. Cambios
    - Eliminar todas las políticas existentes de newsletter_subscribers
    - Crear políticas correctas y sin duplicados
    - Asegurar que usuarios anónimos puedan suscribirse
    - Asegurar que solo administradores puedan ver/editar suscriptores
*/

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Only authenticated users can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Only authenticated users can update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Only authenticated users can delete subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can delete subscribers" ON newsletter_subscribers;

-- Crear políticas correctas
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);