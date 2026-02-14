/*
  # Arreglar permisos para importación de datos

  1. Cambios
    - Añadir políticas INSERT para anon en todas las tablas necesarias
    - Permitir upsert de datos durante la migración
*/

-- Special articles
DROP POLICY IF EXISTS "Allow anon insert special_articles" ON special_articles;
CREATE POLICY "Allow anon insert special_articles"
  ON special_articles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Categories config
DROP POLICY IF EXISTS "Allow anon insert categories_config" ON categories_config;
CREATE POLICY "Allow anon insert categories_config"
  ON categories_config
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Contacts
DROP POLICY IF EXISTS "Allow anon insert contacts" ON contacts;
CREATE POLICY "Allow anon insert contacts"
  ON contacts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Articles
DROP POLICY IF EXISTS "Allow anon insert articles" ON articles;
CREATE POLICY "Allow anon insert articles"
  ON articles
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Otorgar permisos explícitos
GRANT INSERT, UPDATE ON special_articles TO anon;
GRANT INSERT, UPDATE ON categories_config TO anon;
GRANT INSERT, UPDATE ON contacts TO anon;
GRANT INSERT, UPDATE ON articles TO anon;
