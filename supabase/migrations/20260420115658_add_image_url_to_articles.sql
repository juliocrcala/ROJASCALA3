/*
  # Agregar imagen a articulos normativos

  1. Cambios
    - Agrega columna `image_url` (text, nullable) a la tabla `articles`
    - Permite que los articulos normativos tengan una imagen destacada
      igual que los articulos especiales

  2. Seguridad
    - No afecta politicas RLS existentes
    - La columna es nullable, los articulos existentes no se ven afectados
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE articles ADD COLUMN image_url text;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
