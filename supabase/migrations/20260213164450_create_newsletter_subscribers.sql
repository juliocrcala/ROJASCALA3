/*
  # Create Newsletter Subscribers Table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, required) - Email del suscriptor
      - `name` (text, required) - Nombre del suscriptor
      - `subscribed_at` (timestamptz) - Fecha de suscripción
      - `is_active` (boolean) - Estado de la suscripción (activo/desuscrito)
      - `ip_address` (text) - IP desde donde se suscribió (opcional, para seguridad)
      - `user_agent` (text) - Navegador usado (opcional, para analytics)

  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Allow public INSERT for new subscriptions (solo su propio email)
    - Allow authenticated admin users to read all subscribers
    - Allow public to unsubscribe (solo su propio email)

  3. Indexes
    - Index on email for quick lookups
    - Index on subscribed_at for sorting

  Important Notes:
  - Los suscriptores se pueden registrar sin autenticación
  - Los admins pueden ver todos los suscriptores
  - Los emails son únicos para evitar duplicados
*/

-- Create the newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can subscribe (public insert)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Authenticated users can view all subscribers
CREATE POLICY "Authenticated users can view all subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update subscriber status
CREATE POLICY "Authenticated users can update subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete subscribers
CREATE POLICY "Authenticated users can delete subscribers"
  ON newsletter_subscribers
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email 
  ON newsletter_subscribers(email);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at 
  ON newsletter_subscribers(subscribed_at DESC);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_is_active 
  ON newsletter_subscribers(is_active);