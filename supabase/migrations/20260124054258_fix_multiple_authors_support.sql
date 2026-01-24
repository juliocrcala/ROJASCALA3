/*
  # Fix Multiple Authors Support
  
  1. Problem
    - author_contact_id is uuid (single value) but author is text[] (array)
    - This prevents having multiple authors with contact associations
    - author_photo_url exists but cannot be properly used with mixed single/array structure
  
  2. Changes
    - Convert author_contact_id from uuid to uuid[] (array)
    - This allows each author in the author[] array to have a corresponding contact ID
    - author_photo_url[] remains as text[] array for optional custom photos
  
  3. Data Preservation
    - Existing single author_contact_id values will be converted to single-element arrays
    - NULL values remain NULL
  
  4. Usage Pattern
    - author[i] = author name (required)
    - author_contact_id[i] = contact UUID if using contact, NULL if custom author
    - author_photo_url[i] = photo URL for custom authors, NULL for contact-based authors
*/

-- Convert author_contact_id to array type in articles table
ALTER TABLE articles 
  ALTER COLUMN author_contact_id TYPE uuid[] USING 
    CASE 
      WHEN author_contact_id IS NOT NULL 
      THEN ARRAY[author_contact_id]
      ELSE NULL 
    END;

-- Convert author_contact_id to array type in special_articles table  
ALTER TABLE special_articles
  ALTER COLUMN author_contact_id TYPE uuid[] USING
    CASE 
      WHEN author_contact_id IS NOT NULL
      THEN ARRAY[author_contact_id]
      ELSE NULL
    END;
