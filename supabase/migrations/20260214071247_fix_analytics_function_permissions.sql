/*
  # Arreglar permisos de función de analytics

  1. Cambios
    - Otorgar permisos de ejecución a usuarios autenticados
    - Asegurar que la función tenga los permisos correctos
    
  2. Seguridad
    - Solo usuarios autenticados pueden ejecutar la función
    - La función usa SECURITY DEFINER para tener permisos elevados
*/

-- Eliminar la función existente si hay problemas
DROP FUNCTION IF EXISTS generate_daily_analytics(date);

-- Recrear la función con permisos correctos
CREATE OR REPLACE FUNCTION generate_daily_analytics(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO authenticated;

-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Allow function to insert analytics" ON analytics_summary;

-- Permitir que la función inserte datos
CREATE POLICY "Allow function to insert analytics"
  ON analytics_summary
  FOR INSERT
  WITH CHECK (true);
