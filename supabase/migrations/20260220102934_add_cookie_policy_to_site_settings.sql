/*
  # Add Cookie Policy Configuration to Site Settings
  
  ## Overview
  Adds editable cookie policy text to site_settings table for admin management.
  
  ## Changes
  1. New Columns
    - `cookie_title` (text) - Title for cookie banner
    - `cookie_message` (text) - Main message explaining cookie usage
    - `cookie_accept_text` (text) - Text for accept button
    - `cookie_reject_text` (text) - Text for reject button
  
  ## Security
  - RLS policies already in place:
    - Public can read site_settings
    - Only admin (rojascalaperu2025@gmail.com) can update
  
  ## Notes
  - Default values match current cookie banner text in Spanish
  - Admin can modify all cookie-related text from admin panel
*/

-- Add cookie policy columns to site_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_title'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_title text DEFAULT 'Uso de Cookies';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_message'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_message text DEFAULT 'Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Al continuar navegando, aceptas nuestro uso de cookies.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_accept_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_accept_text text DEFAULT 'Aceptar';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'cookie_reject_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN cookie_reject_text text DEFAULT 'Rechazar';
  END IF;
END $$;

-- Update existing row with default values if they exist
UPDATE site_settings
SET 
  cookie_title = COALESCE(cookie_title, 'Uso de Cookies'),
  cookie_message = COALESCE(cookie_message, 'Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Al continuar navegando, aceptas nuestro uso de cookies.'),
  cookie_accept_text = COALESCE(cookie_accept_text, 'Aceptar'),
  cookie_reject_text = COALESCE(cookie_reject_text, 'Rechazar'),
  updated_at = now()
WHERE id IS NOT NULL;

-- Ensure at least one row exists with default values
INSERT INTO site_settings (
  maintenance_mode,
  cookie_title,
  cookie_message,
  cookie_accept_text,
  cookie_reject_text
)
SELECT 
  false,
  'Uso de Cookies',
  'Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Al continuar navegando, aceptas nuestro uso de cookies.',
  'Aceptar',
  'Rechazar'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);
