/*
  # Create site settings table

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `maintenance_mode` (boolean, default false) - Controls if site shows maintenance page
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for public to read settings
    - Add policy for authenticated users (admin) to update settings
  
  3. Initial Data
    - Insert default settings row with maintenance_mode = false
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_mode boolean DEFAULT false NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings if not exists
INSERT INTO site_settings (maintenance_mode)
SELECT false
WHERE NOT EXISTS (SELECT 1 FROM site_settings);