/*
  # Revert to working schema structure

  1. Changes
    - Revert author_contact_id back to uuid (single value, not array)
    - Remove the array structure that broke the admin panel
    - Restore the original working structure

  2. Data Safety
    - Preserve existing data by converting arrays back to single values
*/

-- Revert articles table
ALTER TABLE articles 
  ALTER COLUMN author_contact_id TYPE uuid USING 
    CASE 
      WHEN author_contact_id IS NOT NULL AND array_length(author_contact_id, 1) > 0 
      THEN author_contact_id[1]
      ELSE NULL 
    END;

-- Revert special_articles table  
ALTER TABLE special_articles
  ALTER COLUMN author_contact_id TYPE uuid USING
    CASE 
      WHEN author_contact_id IS NOT NULL AND array_length(author_contact_id, 1) > 0
      THEN author_contact_id[1]
      ELSE NULL
    END;
