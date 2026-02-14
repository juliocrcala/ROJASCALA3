/*
  # Otorgar permisos de ejecución a anon en función de analytics

  1. Cambios
    - Permitir que el rol anon ejecute la función generate_daily_analytics
    - Esto es necesario porque la autenticación es local, no de Supabase
    
  2. Seguridad
    - La función solo genera reportes agregados
    - No expone información sensible
    - Es seguro ejecutarla con rol anon
*/

-- Otorgar permisos de ejecución a anon
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO anon;

-- También al rol público por si acaso
GRANT EXECUTE ON FUNCTION generate_daily_analytics(date) TO public;
