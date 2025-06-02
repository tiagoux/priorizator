/*
  # Fix foreign key relationship between votes and users tables

  1. Changes
    - Safely add foreign key constraint if it doesn't exist
    - Add index for better query performance
    
  2. Notes
    - Uses DO block to check constraint existence
    - Creates index only if it doesn't exist
*/

-- Safely add foreign key constraint if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'votes_user_id_fkey'
    AND table_name = 'votes'
  ) THEN
    ALTER TABLE votes
    ADD CONSTRAINT votes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;

-- Add index for better performance (IF NOT EXISTS already handles idempotency)
CREATE INDEX IF NOT EXISTS votes_user_id_idx ON votes(user_id);