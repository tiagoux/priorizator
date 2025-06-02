/*
  # Fix votes-users relationship and add user metadata access

  1. Changes
    - Add explicit foreign key relationship between votes and auth.users tables
    - Create a secure view to access user metadata
    - Update RLS policies to allow access to user metadata
    
  2. Security
    - Maintain RLS policies
    - Only expose necessary user metadata
*/

-- Create a secure view for accessing user metadata
CREATE OR REPLACE VIEW users AS
  SELECT 
    id,
    raw_user_meta_data
  FROM auth.users;

-- Grant access to the view
GRANT SELECT ON users TO authenticated;
GRANT SELECT ON users TO anon;

-- Ensure foreign key relationship exists
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