/*
  # Crear tabla para suscriptores del newsletter

  1. Nueva Tabla
    - `newsletter_subscribers`
      - `id` (uuid, primary key) - Identificador único del suscriptor
      - `email` (text, unique, required) - Correo electrónico del suscriptor
      - `name` (text, required) - Nombre del suscriptor
      - `subscribed_at` (timestamptz) - Fecha y hora de suscripción
      - `is_active` (boolean) - Estado de la suscripción (activo/inactivo)
  
  2. Seguridad
    - Habilitar RLS en la tabla `newsletter_subscribers`
    - Política para permitir que usuarios anónimos puedan insertar nuevos suscriptores
    - Política para que solo usuarios autenticados (admin) puedan leer los suscriptores
*/

-- Crear tabla de suscriptores del newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Habilitar Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserciones públicas (cualquiera puede suscribirse)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Política para que solo usuarios autenticados puedan ver suscriptores
CREATE POLICY "Only authenticated users can view subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para que solo usuarios autenticados puedan actualizar suscriptores
CREATE POLICY "Only authenticated users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para que solo usuarios autenticados puedan eliminar suscriptores
CREATE POLICY "Only authenticated users can delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);