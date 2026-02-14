/*
  # Otorgar permisos explícitos a tablas de analytics

  1. Cambios
    - Agregar GRANT SELECT/INSERT a page_views para anon
    - Agregar GRANT ALL a page_views para authenticated
    - Agregar GRANT SELECT/INSERT/UPDATE/DELETE a analytics_summary para anon
    - Agregar GRANT ALL a analytics_summary para authenticated
    - Otorgar permisos de secuencias
    
  2. Seguridad
    - Similar al patrón exitoso de newsletter
    - Permite acceso anónimo a datos estadísticos agregados
*/

-- Otorgar permisos a page_views
GRANT SELECT, INSERT ON page_views TO anon;
GRANT ALL ON page_views TO authenticated;

-- Otorgar permisos a analytics_summary
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_summary TO anon;
GRANT ALL ON analytics_summary TO authenticated;

-- Otorgar permisos de secuencias
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON analytics_summary(date DESC);
