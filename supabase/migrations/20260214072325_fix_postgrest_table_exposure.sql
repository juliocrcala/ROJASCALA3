/*
  # Forzar exposición de tablas a PostgREST

  1. Cambios
    - Revocar y volver a otorgar todos los permisos
    - Asegurar que las tablas estén en el rol correcto
    - Forzar recarga de PostgREST
    
  2. Seguridad
    - Permisos apropiados para anon y authenticated
*/

-- Limpiar permisos anteriores
REVOKE ALL ON page_views FROM anon, authenticated, public;
REVOKE ALL ON analytics_summary FROM anon, authenticated, public;

-- Otorgar permisos nuevamente de forma explícita
GRANT SELECT, INSERT, UPDATE, DELETE ON page_views TO anon;
GRANT ALL ON page_views TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_summary TO anon;
GRANT ALL ON analytics_summary TO authenticated;

-- Asegurar permisos de secuencias
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Forzar que las tablas sean visibles en el API schema
ALTER TABLE page_views OWNER TO postgres;
ALTER TABLE analytics_summary OWNER TO postgres;

-- Notificar a PostgREST
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
