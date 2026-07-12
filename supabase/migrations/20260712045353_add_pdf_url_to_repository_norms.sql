/*
  # Add pdf_url column to repository_norms
  
  Allows storing a reference to an uploaded PDF file for each norm.
  The content field becomes optional when a PDF is provided.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'repository_norms' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE repository_norms ADD COLUMN pdf_url text;
  END IF;
END $$;

-- Make content nullable since PDF can replace it
ALTER TABLE repository_norms ALTER COLUMN content DROP NOT NULL;

NOTIFY pgrst, 'reload schema';
