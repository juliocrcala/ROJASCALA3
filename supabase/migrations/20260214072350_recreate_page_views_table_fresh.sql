/*
  # Recrear tabla page_views desde cero

  1. Nueva Tabla
    - `page_views` (recreada limpiamente)
      - `id` (uuid, primary key)
      - `page_url` (text)
      - `page_title` (text, nullable)
      - `article_id` (uuid, nullable, foreign key)
      - `visitor_id` (text)
      - `user_agent` (text, nullable)
      - `referrer` (text, nullable)
      - `session_id` (text)
      - `created_at` (timestamptz)
      - `ip_hash` (text, nullable)
  
  2. Seguridad
    - Enable RLS
    - Permitir inserción anónima (para tracking)
    - Permitir lectura anónima (para estadísticas)
*/

-- Respaldar datos existentes si hay alguno
CREATE TEMP TABLE IF NOT EXISTS page_views_backup AS
SELECT * FROM page_views;

-- Eliminar tabla anterior
DROP TABLE IF EXISTS page_views CASCADE;

-- Crear tabla nueva
CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url text NOT NULL,
  page_title text,
  article_id uuid,
  visitor_id text NOT NULL,
  user_agent text,
  referrer text,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  ip_hash text
);

-- Habilitar RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Políticas simples para anon
CREATE POLICY "anon_insert_page_views"
  ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_page_views"
  ON page_views
  FOR SELECT
  TO anon
  USING (true);

-- Política para authenticated
CREATE POLICY "auth_all_page_views"
  ON page_views
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Otorgar permisos explícitos
GRANT SELECT, INSERT ON page_views TO anon;
GRANT ALL ON page_views TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Restaurar datos del backup si existen
INSERT INTO page_views
SELECT * FROM page_views_backup
WHERE EXISTS (SELECT 1 FROM page_views_backup);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);

-- Comentario para documentación
COMMENT ON TABLE page_views IS 'Page views tracking - recreated: 2026-02-14 07:25:00';
