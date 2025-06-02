/*
  # Disable voting for completed features

  1. Changes
    - Update vote creation policy to prevent voting on completed features
    - Add function to check if feature is voteable
    
  2. Security
    - Maintains existing RLS policies
    - Adds additional validation for feature status
*/

-- Create function to check if feature is voteable
CREATE OR REPLACE FUNCTION is_feature_voteable(feature_id uuid)
RETURNS boolean AS $$
DECLARE
  feature_status feature_status;
BEGIN
  SELECT status INTO feature_status
  FROM features
  WHERE id = feature_id;
  
  RETURN feature_status NOT IN ('done', 'in_production');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the voting policy
DROP POLICY IF EXISTS "Authenticated users can create votes" ON votes;

CREATE POLICY "Authenticated users can create votes"
ON votes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  NOT EXISTS (
    SELECT 1 FROM votes v
    WHERE v.feature_id = votes.feature_id
    AND v.user_id = auth.uid()
  ) AND
  can_user_vote(auth.uid(), feature_id) AND
  is_feature_voteable(feature_id)
);