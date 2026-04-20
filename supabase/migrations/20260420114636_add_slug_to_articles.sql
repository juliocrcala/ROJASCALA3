/*
  # Agregar columna slug para URLs amigables

  1. Cambios
    - Agrega columna `slug` (text, unique) a `articles`
    - Agrega columna `slug` (text, unique) a `special_articles`
    - Crea funcion helper `generate_slug(text)` para convertir titulos en slugs
    - Backfill de slugs para articulos existentes basado en title
    - Crea triggers que generan slug automaticamente al insertar si no se provee

  2. Seguridad
    - No afecta las politicas RLS existentes
    - Mantiene la columna `id` (UUID) intacta para compatibilidad

  3. Notas importantes
    - Los slugs son unicos, si hay titulos duplicados se agrega sufijo numerico
    - Se normaliza: minusculas, sin acentos, espacios a guiones, solo alfanumericos
*/

-- Funcion para generar slug desde un titulo
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
DECLARE
  result text;
BEGIN
  result := lower(input_text);
  -- Reemplazar acentos
  result := translate(result,
    'áàäâãéèëêíìïîóòöôõúùüûñç',
    'aaaaaeeeeiiiiooooouuuunc');
  -- Reemplazar cualquier caracter no alfanumerico por guion
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  -- Quitar guiones al inicio y al final
  result := trim(both '-' from result);
  -- Limitar a 100 caracteres
  result := substring(result from 1 for 100);
  result := trim(both '-' from result);
  IF result = '' OR result IS NULL THEN
    result := 'articulo';
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Funcion para asegurar slug unico en una tabla
CREATE OR REPLACE FUNCTION ensure_unique_slug(base_slug text, table_name text, current_id uuid)
RETURNS text AS $$
DECLARE
  final_slug text := base_slug;
  counter int := 1;
  exists_count int;
BEGIN
  LOOP
    IF table_name = 'articles' THEN
      EXECUTE 'SELECT COUNT(*) FROM articles WHERE slug = $1 AND id != $2'
        INTO exists_count USING final_slug, current_id;
    ELSE
      EXECUTE 'SELECT COUNT(*) FROM special_articles WHERE slug = $1 AND id != $2'
        INTO exists_count USING final_slug, current_id;
    END IF;

    EXIT WHEN exists_count = 0;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Agregar columna slug a articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE articles ADD COLUMN slug text;
  END IF;
END $$;

-- Agregar columna slug a special_articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'special_articles' AND column_name = 'slug'
  ) THEN
    ALTER TABLE special_articles ADD COLUMN slug text;
  END IF;
END $$;

-- Backfill para articles existentes
DO $$
DECLARE
  rec RECORD;
  new_slug text;
BEGIN
  FOR rec IN SELECT id, title FROM articles WHERE slug IS NULL OR slug = '' LOOP
    new_slug := generate_slug(rec.title);
    new_slug := ensure_unique_slug(new_slug, 'articles', rec.id);
    UPDATE articles SET slug = new_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- Backfill para special_articles existentes
DO $$
DECLARE
  rec RECORD;
  new_slug text;
BEGIN
  FOR rec IN SELECT id, title FROM special_articles WHERE slug IS NULL OR slug = '' LOOP
    new_slug := generate_slug(rec.title);
    new_slug := ensure_unique_slug(new_slug, 'special_articles', rec.id);
    UPDATE special_articles SET slug = new_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- Crear indices unicos
CREATE UNIQUE INDEX IF NOT EXISTS articles_slug_key ON articles(slug);
CREATE UNIQUE INDEX IF NOT EXISTS special_articles_slug_key ON special_articles(slug);

-- Trigger para articles: generar slug automaticamente si no se provee
CREATE OR REPLACE FUNCTION articles_slug_trigger()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    NEW.slug := ensure_unique_slug(base_slug, 'articles', COALESCE(NEW.id, gen_random_uuid()));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS articles_slug_before_insert ON articles;
CREATE TRIGGER articles_slug_before_insert
  BEFORE INSERT ON articles
  FOR EACH ROW
  EXECUTE FUNCTION articles_slug_trigger();

-- Trigger para special_articles
CREATE OR REPLACE FUNCTION special_articles_slug_trigger()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    base_slug := generate_slug(NEW.title);
    NEW.slug := ensure_unique_slug(base_slug, 'special_articles', COALESCE(NEW.id, gen_random_uuid()));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS special_articles_slug_before_insert ON special_articles;
CREATE TRIGGER special_articles_slug_before_insert
  BEFORE INSERT ON special_articles
  FOR EACH ROW
  EXECUTE FUNCTION special_articles_slug_trigger();

NOTIFY pgrst, 'reload schema';
