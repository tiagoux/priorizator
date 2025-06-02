/*
  # Make deadline field optional

  1. Changes
    - Ensure deadline field in features table is optional (nullable)
    - No changes to existing data required since deadline was already nullable
    
  2. Notes
    - Safe migration that can be run multiple times
    - Uses IF EXISTS to prevent errors
*/

-- Ensure deadline is nullable (if it isn't already)
DO $$ 
BEGIN 
  ALTER TABLE features 
    ALTER COLUMN deadline DROP NOT NULL;
  EXCEPTION 
    WHEN undefined_column THEN 
      NULL;
    WHEN invalid_column_reference THEN 
      NULL;
END $$;