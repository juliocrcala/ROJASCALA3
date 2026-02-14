/*
  # Recrear tablas de analytics desde cero

  1. Cambios
    - Eliminar tablas existentes
    - Crear page_views con permisos correctos
    - Crear analytics_summary con permisos correctos
    - Configurar RLS con TO public
*/

-- Eliminar todo lo existente
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS analytics_summary CASCADE;

-- Crear tabla page_views
CREATE TABLE page_views (
  id bigserial PRIMARY KEY,
  page_path text NOT NULL,
  visitor_id text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Crear tabla analytics_summary
CREATE TABLE analytics_summary (
  id bigserial PRIMARY KEY,
  page_path text NOT NULL,
  view_count int DEFAULT 0 NOT NULL,
  unique_visitors int DEFAULT 0 NOT NULL,
  last_updated timestamptz DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Crear políticas TO public
CREATE POLICY "Public can insert page views"
  ON page_views
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read page views"
  ON page_views
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert analytics"
  ON analytics_summary
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read analytics"
  ON analytics_summary
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can update analytics"
  ON analytics_summary
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Otorgar permisos explícitos
GRANT SELECT, INSERT ON page_views TO anon, public, authenticated;
GRANT SELECT, INSERT, UPDATE ON analytics_summary TO anon, public, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, public, authenticated;

-- Forzar reload
NOTIFY pgrst, 'reload schema';
