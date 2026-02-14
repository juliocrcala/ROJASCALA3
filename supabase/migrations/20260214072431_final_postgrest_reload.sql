/*
  # Recarga final de PostgREST

  1. Cambios
    - Notificar a PostgREST de todos los cambios
    - Forzar recarga completa del schema
    
  2. Verificación
    - Confirmar que las tablas son visibles en la API
*/

-- Notificar múltiples veces para asegurar recarga
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Actualizar comentarios para forzar detección de cambios
COMMENT ON TABLE page_views IS 'Page views tracking - final reload: 2026-02-14 07:26:00';
COMMENT ON TABLE analytics_summary IS 'Analytics summary - final reload: 2026-02-14 07:26:00';
COMMENT ON FUNCTION generate_daily_analytics(date) IS 'Generate daily analytics report - final reload: 2026-02-14 07:26:00';
