/*
  # Add foreign key relationship between votes and users tables

  1. Changes
    - Add foreign key constraint to link votes.user_id to auth.users.id if it doesn't exist
    - This enables querying user metadata through the votes relationship

  2. Security
    - No changes to RLS policies
    - Maintains existing table security settings
*/

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
    FOREIGN KEY (user_id) REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;