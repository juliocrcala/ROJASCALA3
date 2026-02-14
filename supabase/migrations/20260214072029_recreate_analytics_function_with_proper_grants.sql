/*
  # Recrear función de analytics con permisos completos

  1. Cambios
    - Recrear la función generate_daily_analytics con SECURITY DEFINER
    - Asegurar que tenga permisos para insertar/actualizar en analytics_summary
    - Otorgar ejecución a anon y authenticated
    
  2. Seguridad
    - SECURITY DEFINER permite que la función ejecute con permisos elevados
    - Solo genera datos agregados, no expone información sensible
*/

-- Eliminar función anterior
DROP FUNCTION IF EXISTS generate_daily_analytics(date);

-- Recrear con todos los permisos necesarios
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

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO anon;
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO public;

-- Comentario para documentación
COMMENT ON FUNCTION generate_daily_analytics IS 'Genera un resumen diario de analytics agregando datos de page_views';
