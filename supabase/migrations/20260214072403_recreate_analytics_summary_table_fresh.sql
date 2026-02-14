/*
  # Recrear tabla analytics_summary desde cero

  1. Nueva Tabla
    - `analytics_summary` (recreada limpiamente)
      - `id` (uuid, primary key)
      - `date` (date, unique)
      - `total_views` (integer)
      - `unique_visitors` (integer)
      - `top_pages` (jsonb)
      - `updated_at` (timestamptz)
  
  2. Seguridad
    - Enable RLS
    - Permitir acceso anónimo para estadísticas
*/

-- Respaldar datos existentes si hay alguno
CREATE TEMP TABLE IF NOT EXISTS analytics_summary_backup AS
SELECT * FROM analytics_summary;

-- Eliminar tabla anterior
DROP TABLE IF EXISTS analytics_summary CASCADE;

-- Crear tabla nueva
CREATE TABLE analytics_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_views integer DEFAULT 0 NOT NULL,
  unique_visitors integer DEFAULT 0 NOT NULL,
  top_pages jsonb DEFAULT '[]'::jsonb NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Políticas simples para anon
CREATE POLICY "anon_insert_analytics_summary"
  ON analytics_summary
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_select_analytics_summary"
  ON analytics_summary
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_update_analytics_summary"
  ON analytics_summary
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_delete_analytics_summary"
  ON analytics_summary
  FOR DELETE
  TO anon
  USING (true);

-- Política para authenticated
CREATE POLICY "auth_all_analytics_summary"
  ON analytics_summary
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Otorgar permisos explícitos
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_summary TO anon;
GRANT ALL ON analytics_summary TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Restaurar datos del backup si existen
INSERT INTO analytics_summary
SELECT * FROM analytics_summary_backup
WHERE EXISTS (SELECT 1 FROM analytics_summary_backup)
ON CONFLICT (date) DO NOTHING;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date DESC);

-- Comentario para documentación
COMMENT ON TABLE analytics_summary IS 'Analytics summary - recreated: 2026-02-14 07:25:00';
