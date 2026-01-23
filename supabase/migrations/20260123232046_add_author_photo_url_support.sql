/*
  # Add Author Photo URL Support

  1. Changes to Tables
    - Add `author_photo_url` column (text[] array) to articles table
    - Add `author_photo_url` column (text[] array) to special_articles table
    - This allows storing photo URLs for custom authors (non-contact authors)
  
  2. Usage Notes
    - For contact-based authors: author_photo_url[i] should be NULL (photo comes from contacts table)
    - For custom authors: author_photo_url[i] contains the photo URL
    - This allows photos of contact-based authors to be updated centrally in contacts table
    - Arrays maintain same length as author[] and author_contact_id[] arrays
  
  3. Security
    - RLS policies remain unchanged
*/

-- Add author_photo_url column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_photo_url text[];

-- Add author_photo_url column to special_articles table
ALTER TABLE special_articles ADD COLUMN IF NOT EXISTS author_photo_url text[];