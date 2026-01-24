/*
  # Force Schema Cache Refresh
  
  1. Problem
    - PostgREST schema cache is not recognizing the author_photo_url column
    - Need to force a refresh by recreating the column
  
  2. Changes
    - Drop and recreate author_photo_url columns with same structure
    - This forces PostgREST to recognize the columns in its cache
*/

-- Drop and recreate for articles
ALTER TABLE articles DROP COLUMN IF EXISTS author_photo_url;
ALTER TABLE articles ADD COLUMN author_photo_url text[];

-- Drop and recreate for special_articles  
ALTER TABLE special_articles DROP COLUMN IF EXISTS author_photo_url;
ALTER TABLE special_articles ADD COLUMN author_photo_url text[];
