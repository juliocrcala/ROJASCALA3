/*
  # Corregir columnas de analytics

  1. Cambios
    - Eliminar tablas y recrear con columnas correctas
    - page_views: page_url, page_title, article_id, visitor_id, user_agent, referrer, session_id
    - analytics_summary ya no es necesaria
*/

-- Eliminar todo
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS analytics_summary CASCADE;

-- Crear tabla con columnas correctas
CREATE TABLE page_views (
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

-- Crear índices
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX idx_page_views_page_url ON page_views(page_url);

-- Habilitar RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para todos
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
GRANT SELECT, INSERT ON page_views TO anon, public, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, public, authenticated;

-- Forzar reload
NOTIFY pgrst, 'reload schema';
