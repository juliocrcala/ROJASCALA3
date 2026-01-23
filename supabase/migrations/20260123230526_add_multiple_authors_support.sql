/*
  # Add Multiple Authors Support

  1. Changes to Tables
    - Convert `author` column from text to text[] (array) in both tables
    - Convert `author_contact_id` column from uuid to uuid[] (array) in both tables
    - Migrate existing data to array format
  
  2. Security
    - RLS policies remain unchanged
  
  3. Notes
    - Existing single author records will be converted to arrays with one element
    - NULL values will remain NULL
    - This allows articles to have multiple authors (both registered contacts and custom names)
*/

-- Migrate articles table
-- First, add temporary array columns
ALTER TABLE articles ADD COLUMN IF NOT EXISTS authors_temp text[];
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_contact_ids_temp uuid[];

-- Migrate existing data to arrays
UPDATE articles 
SET authors_temp = CASE 
  WHEN author IS NOT NULL THEN ARRAY[author] 
  ELSE NULL 
END;

UPDATE articles 
SET author_contact_ids_temp = CASE 
  WHEN author_contact_id IS NOT NULL THEN ARRAY[author_contact_id] 
  ELSE NULL 
END;

-- Drop old columns
ALTER TABLE articles DROP COLUMN IF EXISTS author;
ALTER TABLE articles DROP COLUMN IF EXISTS author_contact_id;

-- Rename new columns
ALTER TABLE articles RENAME COLUMN authors_temp TO author;
ALTER TABLE articles RENAME COLUMN author_contact_ids_temp TO author_contact_id;

-- Migrate special_articles table
-- First, add temporary array columns
ALTER TABLE special_articles ADD COLUMN IF NOT EXISTS authors_temp text[];
ALTER TABLE special_articles ADD COLUMN IF NOT EXISTS author_contact_ids_temp uuid[];

-- Migrate existing data to arrays
UPDATE special_articles 
SET authors_temp = CASE 
  WHEN author IS NOT NULL THEN ARRAY[author] 
  ELSE NULL 
END;

UPDATE special_articles 
SET author_contact_ids_temp = CASE 
  WHEN author_contact_id IS NOT NULL THEN ARRAY[author_contact_id] 
  ELSE NULL 
END;

-- Drop old columns
ALTER TABLE special_articles DROP COLUMN IF EXISTS author;
ALTER TABLE special_articles DROP COLUMN IF EXISTS author_contact_id;

-- Rename new columns
ALTER TABLE special_articles RENAME COLUMN authors_temp TO author;
ALTER TABLE special_articles RENAME COLUMN author_contact_ids_temp TO author_contact_id;