/*
  # Recrear función de analytics con todos los permisos

  1. Cambios
    - Eliminar función anterior
    - Recrear con SECURITY DEFINER
    - Otorgar permisos a anon, authenticated y public
    
  2. Seguridad
    - SECURITY DEFINER permite ejecutar con permisos elevados
    - Solo genera datos agregados
*/

-- Eliminar función anterior
DROP FUNCTION IF EXISTS generate_daily_analytics(date);

-- Recrear función
CREATE OR REPLACE FUNCTION generate_daily_analytics(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insertar o actualizar el resumen del día
  INSERT INTO analytics_summary (date, total_views, unique_visitors, top_pages, updated_at)
  SELECT 
    target_date,
    COALESCE(COUNT(*), 0) as total_views,
    COALESCE(COUNT(DISTINCT visitor_id), 0) as unique_visitors,
    COALESCE(
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
      ),
      '[]'::jsonb
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

-- Otorgar todos los permisos posibles
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO anon;
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO public;

-- Comentario
COMMENT ON FUNCTION generate_daily_analytics IS 'Genera resumen diario de analytics - recreated: 2026-02-14 07:25:00';
