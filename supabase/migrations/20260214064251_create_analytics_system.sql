/*
  # Sistema de Analytics y Visitas

  1. Nueva Tabla: page_views
    - `id` (uuid, primary key)
    - `page_url` (text) - URL de la página visitada
    - `page_title` (text) - Título de la página
    - `article_id` (uuid, nullable) - Si es un artículo
    - `visitor_id` (text) - ID anónimo del visitante (hash)
    - `user_agent` (text) - Información del navegador
    - `referrer` (text, nullable) - De dónde vino el visitante
    - `session_id` (text) - ID de sesión
    - `created_at` (timestamptz) - Fecha y hora de la visita
    - `ip_hash` (text, nullable) - Hash de IP para privacidad

  2. Nueva Tabla: analytics_summary
    - `id` (uuid, primary key)
    - `date` (date) - Fecha del resumen
    - `total_views` (integer) - Total de vistas
    - `unique_visitors` (integer) - Visitantes únicos
    - `top_pages` (jsonb) - Páginas más visitadas
    - `updated_at` (timestamptz)

  3. Seguridad
    - RLS habilitado en ambas tablas
    - Solo administradores pueden leer analytics
    - Sistema puede insertar vistas anónimamente
*/

-- Tabla de vistas de página
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url text NOT NULL,
  page_title text,
  article_id uuid REFERENCES articles(id) ON DELETE SET NULL,
  visitor_id text NOT NULL,
  user_agent text,
  referrer text,
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_hash text
);

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_article_id ON page_views(article_id) WHERE article_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- Tabla de resumen de analytics
CREATE TABLE IF NOT EXISTS analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_views integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  top_pages jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date DESC);

-- Habilitar RLS
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Políticas para page_views
-- Permitir inserción anónima (para tracking)
CREATE POLICY "Anyone can insert page views"
  ON page_views
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Solo admins pueden leer
CREATE POLICY "Only admins can view page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Políticas para analytics_summary
CREATE POLICY "Only admins can view analytics summary"
  ON analytics_summary
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update analytics summary"
  ON analytics_summary
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Función para generar resumen diario
CREATE OR REPLACE FUNCTION generate_daily_analytics(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO analytics_summary (date, total_views, unique_visitors, top_pages, updated_at)
  SELECT 
    target_date,
    COUNT(*) as total_views,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'url', page_url,
          'title', page_title,
          'views', view_count
        )
      )
      FROM (
        SELECT 
          page_url,
          page_title,
          COUNT(*) as view_count
        FROM page_views
        WHERE DATE(created_at) = target_date
        GROUP BY page_url, page_title
        ORDER BY view_count DESC
        LIMIT 10
      ) top_pages_subquery
    ) as top_pages,
    now()
  FROM page_views
  WHERE DATE(created_at) = target_date
  ON CONFLICT (date) 
  DO UPDATE SET
    total_views = EXCLUDED.total_views,
    unique_visitors = EXCLUDED.unique_visitors,
    top_pages = EXCLUDED.top_pages,
    updated_at = now();
END;
$$;
