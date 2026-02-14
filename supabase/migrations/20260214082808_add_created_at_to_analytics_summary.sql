/*
  # Agregar columna created_at a analytics_summary
  
  1. Cambios
    - Agregar columna `created_at` (timestamptz) a la tabla `analytics_summary`
    - Establecer valor por defecto como now()
    - Actualizar registros existentes para que created_at = updated_at
  
  2. Propósito
    - Diferenciar entre cuándo se creó el reporte y cuándo se actualizó
    - Permitir ordenar reportes por fecha de creación más reciente
*/

-- Agregar columna created_at si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'analytics_summary' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE analytics_summary ADD COLUMN created_at timestamptz DEFAULT now();
    
    -- Actualizar registros existentes
    UPDATE analytics_summary SET created_at = updated_at WHERE created_at IS NULL;
  END IF;
END $$;
