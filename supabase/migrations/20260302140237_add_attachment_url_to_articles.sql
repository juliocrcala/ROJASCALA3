/*
  # Add optional attachment URL to articles

  1. Changes
    - Add `attachment_url` column to `articles` table
    - Add `attachment_label` column to customize button text (defaults to "Ver Anexo")
    - Both fields are optional and nullable

  2. Purpose
    - Allows attaching external links or documents to special articles
    - Button only appears when URL is provided
    - Flexible label allows customization (e.g., "Ver Norma Oficial", "Ver Documento", etc.)
*/

-- Add attachment_url column (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE articles ADD COLUMN attachment_url text;
  END IF;
END $$;

-- Add attachment_label column (optional, defaults to "Ver Anexo")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'attachment_label'
  ) THEN
    ALTER TABLE articles ADD COLUMN attachment_label text DEFAULT 'Ver Anexo';
  END IF;
END $$;