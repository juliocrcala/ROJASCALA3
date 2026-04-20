/*
  # Crear repositorio de normas

  1. Nueva Tabla
    - `repository_norms`
      - `id` (uuid, pk)
      - `slug` (text, unique) - URL amigable
      - `title` (text) - Titulo de la norma (ej: "Ley N 31234")
      - `norm_type` (text) - Tipo (Ley, Decreto Supremo, Resolucion, etc.)
      - `norm_number` (text) - Numero de la norma
      - `published_date` (date) - Fecha de publicacion en El Peruano
      - `content` (text) - Contenido completo de la norma copiado
      - `summary` (text) - Breve resumen opcional
      - `is_hidden` (boolean) - Para ocultarla del publico
      - `created_at`, `updated_at` (timestamptz)

  2. Seguridad
    - RLS activado
    - Lectura publica solo de normas no ocultas
    - Escritura restringida al administrador (email fijo)

  3. Indices
    - Indice en slug (unique), en published_date y en norm_number
*/

CREATE TABLE IF NOT EXISTS repository_norms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  norm_type text DEFAULT '',
  norm_number text DEFAULT '',
  published_date date NOT NULL DEFAULT CURRENT_DATE,
  content text NOT NULL DEFAULT '',
  summary text DEFAULT '',
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_repository_norms_published_date ON repository_norms(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_repository_norms_norm_number ON repository_norms(norm_number);

ALTER TABLE repository_norms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible repository norms" ON repository_norms;
CREATE POLICY "Public can read visible repository norms"
  ON repository_norms FOR SELECT
  TO anon, authenticated
  USING (is_hidden = false);

DROP POLICY IF EXISTS "Admin can read all repository norms" ON repository_norms;
CREATE POLICY "Admin can read all repository norms"
  ON repository_norms FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'juliocesarrojascala07@gmail.com');

DROP POLICY IF EXISTS "Admin can insert repository norms" ON repository_norms;
CREATE POLICY "Admin can insert repository norms"
  ON repository_norms FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = 'juliocesarrojascala07@gmail.com');

DROP POLICY IF EXISTS "Admin can update repository norms" ON repository_norms;
CREATE POLICY "Admin can update repository norms"
  ON repository_norms FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'juliocesarrojascala07@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'juliocesarrojascala07@gmail.com');

DROP POLICY IF EXISTS "Admin can delete repository norms" ON repository_norms;
CREATE POLICY "Admin can delete repository norms"
  ON repository_norms FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'juliocesarrojascala07@gmail.com');

GRANT SELECT ON repository_norms TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON repository_norms TO authenticated;

NOTIFY pgrst, 'reload schema';
