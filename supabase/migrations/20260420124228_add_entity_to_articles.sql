/*
  # Add entity column to articles

  1. Changes
    - Add `entity` column (text array) to `articles` to store the issuing entities (e.g., SUNAT, MINEM, INGEMMET) associated with an article.
    - Add `entity` column to `special_articles` for consistency.

  2. Security
    - No RLS changes required.

  3. Notes
    - The column defaults to an empty array so existing articles remain valid.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'entity'
  ) THEN
    ALTER TABLE articles ADD COLUMN entity text[] DEFAULT '{}'::text[] NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'special_articles' AND column_name = 'entity'
  ) THEN
    ALTER TABLE special_articles ADD COLUMN entity text[] DEFAULT '{}'::text[] NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_articles_entity ON articles USING GIN (entity);
CREATE INDEX IF NOT EXISTS idx_special_articles_entity ON special_articles USING GIN (entity);
