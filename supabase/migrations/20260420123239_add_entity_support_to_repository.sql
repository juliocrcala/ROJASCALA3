/*
  # Add entity support to repository

  1. Changes
    - Add `entity` column to `repository_norms` table to store the issuing entity (e.g., SUNAT, MINEM, INGEMMET)
    - Extend `categories_config` type CHECK to include the new 'entity' type so entities can be administered in the same table used for categories and document types

  2. Security
    - No changes to RLS policies. Existing policies already govern access to these tables.

  3. Notes
    - The entity column is optional for existing norms (nullable with a safe default)
    - The check constraint is updated defensively to retain existing allowed values
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repository_norms' AND column_name = 'entity'
  ) THEN
    ALTER TABLE repository_norms ADD COLUMN entity text DEFAULT '' NOT NULL;
  END IF;
END $$;

ALTER TABLE categories_config DROP CONSTRAINT IF EXISTS categories_config_type_check;
ALTER TABLE categories_config ADD CONSTRAINT categories_config_type_check
  CHECK (type = ANY (ARRAY['category'::text, 'document_type'::text, 'entity'::text]));

CREATE INDEX IF NOT EXISTS idx_repository_norms_entity ON repository_norms(entity);
