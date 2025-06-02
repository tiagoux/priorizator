/*
  # Add Forum 2025 project

  1. Changes
    - Add new project "Fórum 2025" to the projects table
    
  2. Notes
    - Uses safe INSERT that checks for existence first to avoid duplicates
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE name = 'Fórum 2025'
  ) THEN 
    INSERT INTO projects (name, slug)
    VALUES ('Fórum 2025', 'forum-2025');
  END IF;
END $$;