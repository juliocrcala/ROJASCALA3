/*
  # Recrear page_views con enfoque fresco

  1. Cambios
    - Crear tabla temporal
    - Migrar datos si existen
    - Eliminar tabla vieja
    - Renombrar tabla nueva
*/

-- Crear tabla temporal
CREATE TABLE IF NOT EXISTS page_views_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url text NOT NULL,
  page_title text,
  article_id text,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  user_agent text,
  referrer text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Copiar datos existentes si hay
INSERT INTO page_views_new (id, page_url, page_title, article_id, visitor_id, session_id, user_agent, referrer, created_at)
SELECT id, page_url, page_title, article_id, visitor_id, session_id, user_agent, referrer, created_at
FROM page_views
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_views');

-- Eliminar tabla vieja
DROP TABLE IF EXISTS page_views CASCADE;

-- Renombrar tabla nueva
ALTER TABLE page_views_new RENAME TO page_views;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);

-- Habilitar RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes por si acaso
DROP POLICY IF EXISTS "Anyone can insert page views" ON page_views;
DROP POLICY IF EXISTS "Anyone can read page views" ON page_views;

-- Crear políticas nuevas
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

-- Otorgar permisos
GRANT USAGE ON SCHEMA public TO anon, authenticated, public;
GRANT ALL ON page_views TO anon, authenticated, public;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, public;

-- Múltiples notificaciones
SELECT pg_notify('pgrst', 'reload schema');
SELECT pg_notify('pgrst', 'reload config');
