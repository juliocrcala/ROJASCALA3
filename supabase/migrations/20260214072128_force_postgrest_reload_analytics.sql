/*
  # Forzar recarga de PostgREST para analytics

  1. Cambios
    - Notificar a PostgREST de cambios en schema
    - Forzar recarga de cache
    
  2. Seguridad
    - No afecta la seguridad
    - Solo fuerza actualización de metadata
*/

-- Notificar cambios al sistema
NOTIFY pgrst, 'reload schema';

-- Comentario en las tablas para forzar cambio de metadata
COMMENT ON TABLE page_views IS 'Page views tracking - updated: 2026-02-14 07:20:00';
COMMENT ON TABLE analytics_summary IS 'Analytics summary - updated: 2026-02-14 07:20:00';
