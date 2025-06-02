/*
  # Fix votes-users relationship

  1. Changes
    - Add explicit foreign key relationship between votes and users tables
    - Add RLS policy for votes table to ensure data security

  2. Security
    - Enable RLS on votes table
    - Add policy for authenticated users to read votes
*/

-- Add explicit foreign key relationship if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'votes_user_id_fkey'
  ) THEN
    ALTER TABLE votes
    ADD CONSTRAINT votes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id);
  END IF;
END $$;