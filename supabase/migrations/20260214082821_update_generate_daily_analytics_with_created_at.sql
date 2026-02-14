/*
  # Actualizar función generate_daily_analytics
  
  1. Cambios
    - Modificar función para que establezca created_at solo en inserciones nuevas
    - Preservar created_at original en actualizaciones
  
  2. Propósito
    - Permitir distinguir entre la primera creación y actualizaciones posteriores
    - Mantener historial correcto de reportes
*/

CREATE OR REPLACE FUNCTION generate_daily_analytics(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO analytics_summary (date, total_views, unique_visitors, top_pages, created_at, updated_at)
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
    now() as created_at,
    now() as updated_at
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
