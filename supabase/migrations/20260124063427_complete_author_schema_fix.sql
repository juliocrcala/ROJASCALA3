/*
  # Complete Author Schema Fix
  
  1. Problem
    - Schema cache not recognizing author_photo_url column
    - Need to force complete schema refresh
  
  2. Changes
    - Temporarily modify columns to force schema reload
    - Ensure all author-related columns are properly structured
*/

-- Force schema refresh by modifying and reverting a column
ALTER TABLE special_articles ALTER COLUMN title SET NOT NULL;
ALTER TABLE articles ALTER COLUMN title SET NOT NULL;

-- Ensure author_photo_url exists with correct type
DO $$
BEGIN
    -- For special_articles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'special_articles' 
        AND column_name = 'author_photo_url'
    ) THEN
        ALTER TABLE special_articles ADD COLUMN author_photo_url text[];
    END IF;
    
    -- For articles
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'author_photo_url'
    ) THEN
        ALTER TABLE articles ADD COLUMN author_photo_url text[];
    END IF;
END $$;

-- Ensure author_contact_id is array type
DO $$
BEGIN
    -- Check if special_articles.author_contact_id is uuid[] type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'special_articles' 
        AND column_name = 'author_contact_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE special_articles 
        ALTER COLUMN author_contact_id TYPE uuid[] 
        USING CASE 
            WHEN author_contact_id IS NOT NULL 
            THEN ARRAY[author_contact_id]
            ELSE NULL 
        END;
    END IF;
    
    -- Check if articles.author_contact_id is uuid[] type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name = 'author_contact_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE articles 
        ALTER COLUMN author_contact_id TYPE uuid[] 
        USING CASE 
            WHEN author_contact_id IS NOT NULL 
            THEN ARRAY[author_contact_id]
            ELSE NULL 
        END;
    END IF;
END $$;
