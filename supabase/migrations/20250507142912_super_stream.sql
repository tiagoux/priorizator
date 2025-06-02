/*
  # Add Coletores 2.0 project

  1. Changes
    - Add new project "Coletores 2.0" to the projects table
    
  2. Notes
    - Uses safe INSERT that checks for existence first to avoid duplicates
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE name = 'Coletores 2.0'
  ) THEN 
    INSERT INTO projects (name, slug)
    VALUES ('Coletores 2.0', 'coletores-2');
  END IF;
END $$;