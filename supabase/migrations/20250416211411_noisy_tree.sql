/*
  # Add votes counter trigger function

  1. Changes
    - Create trigger function to update votes_count in features table
    - The function will be called after INSERT or DELETE on votes table
    - Counts total votes for each feature and updates the count

  2. Security
    - Function executes with security definer to ensure it can update features table
*/

CREATE OR REPLACE FUNCTION update_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE features
    SET votes_count = votes_count + 1
    WHERE id = NEW.feature_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE features
    SET votes_count = votes_count - 1
    WHERE id = OLD.feature_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS votes_counter ON votes;

-- Create the trigger
CREATE TRIGGER votes_counter
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_votes_count();