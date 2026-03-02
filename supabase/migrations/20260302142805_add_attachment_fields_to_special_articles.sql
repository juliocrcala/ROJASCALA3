/*
  # Add attachment fields to special_articles table

  1. Changes
    - Add `attachment_url` column to `special_articles` table
    - Add `attachment_label` column to `special_articles` table
    - Both fields are optional and nullable

  2. Purpose
    - Allows attaching external links or documents to special articles
    - Consistent with the articles table
*/

-- Add attachment_url column (optional)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'special_articles' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE special_articles ADD COLUMN attachment_url text;
  END IF;
END $$;

-- Add attachment_label column (optional, defaults to "Ver Anexo")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'special_articles' AND column_name = 'attachment_label'
  ) THEN
    ALTER TABLE special_articles ADD COLUMN attachment_label text DEFAULT 'Ver Anexo';
  END IF;
END $$;