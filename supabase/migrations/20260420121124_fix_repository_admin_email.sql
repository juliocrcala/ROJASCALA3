/*
  # Corregir email del administrador en politicas de repository_norms

  1. Cambios
    - Actualizar las politicas RLS para usar el email correcto del admin
*/

DROP POLICY IF EXISTS "Admin can read all repository norms" ON repository_norms;
CREATE POLICY "Admin can read all repository norms"
  ON repository_norms FOR SELECT
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

DROP POLICY IF EXISTS "Admin can insert repository norms" ON repository_norms;
CREATE POLICY "Admin can insert repository norms"
  ON repository_norms FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

DROP POLICY IF EXISTS "Admin can update repository norms" ON repository_norms;
CREATE POLICY "Admin can update repository norms"
  ON repository_norms FOR UPDATE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com')
  WITH CHECK ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

DROP POLICY IF EXISTS "Admin can delete repository norms" ON repository_norms;
CREATE POLICY "Admin can delete repository norms"
  ON repository_norms FOR DELETE
  TO authenticated
  USING ((SELECT auth.jwt() ->> 'email') = 'rojas.ca.la.admi@gmail.com');

NOTIFY pgrst, 'reload schema';
