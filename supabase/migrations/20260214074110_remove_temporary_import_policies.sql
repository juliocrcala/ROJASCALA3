/*
  # Remover políticas temporales de importación

  1. Cambios
    - Remover políticas INSERT para anon que solo se necesitaban para importar datos
    - Mantener solo las políticas necesarias para el funcionamiento normal
*/

-- Remover políticas temporales de INSERT para anon
DROP POLICY IF EXISTS "Allow anon insert special_articles" ON special_articles;
DROP POLICY IF EXISTS "Allow anon insert categories_config" ON categories_config;
DROP POLICY IF EXISTS "Allow anon insert contacts" ON contacts;
DROP POLICY IF EXISTS "Allow anon insert articles" ON articles;

-- Revocar permisos de INSERT para anon (mantener solo SELECT)
REVOKE INSERT, UPDATE ON special_articles FROM anon;
REVOKE INSERT, UPDATE ON categories_config FROM anon;
REVOKE INSERT, UPDATE ON contacts FROM anon;
REVOKE INSERT, UPDATE ON articles FROM anon;

-- Asegurar que anon puede leer (SELECT) las tablas
GRANT SELECT ON special_articles TO anon;
GRANT SELECT ON categories_config TO anon;
GRANT SELECT ON contacts TO anon;
GRANT SELECT ON articles TO anon;
