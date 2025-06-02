/*
  # Add Gerenciador de Arquivos project

  1. Changes
    - Add new project "Gerenciador de Arquivos" to the projects table
    
  2. Notes
    - Uses safe INSERT that checks for existence first to avoid duplicates
*/

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM projects 
    WHERE name = 'Gerenciador de Arquivos'
  ) THEN 
    INSERT INTO projects (name, slug)
    VALUES ('Gerenciador de Arquivos', 'gerenciador-arquivos');
  END IF;
END $$;