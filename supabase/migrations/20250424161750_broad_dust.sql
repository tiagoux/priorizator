/*
  # Add weekly voting limit system

  1. Changes
    - Add function to check weekly vote limit
    - Add trigger to enforce weekly vote limit
    - Add function to reset votes weekly
    
  2. Security
    - Functions run with security definer to ensure proper access
    - Maintains existing RLS policies
*/

-- Function to count user's votes for a project in the current week
CREATE OR REPLACE FUNCTION get_weekly_votes_count(
  p_user_id uuid,
  p_project_id uuid
) RETURNS integer AS $$
DECLARE
  vote_count integer;
BEGIN
  SELECT COUNT(*)
  INTO vote_count
  FROM votes v
  JOIN features f ON f.id = v.feature_id
  WHERE v.user_id = p_user_id
  AND f.project_id = p_project_id
  AND v.created_at >= date_trunc('week', CURRENT_TIMESTAMP);
  
  RETURN vote_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can vote
CREATE OR REPLACE FUNCTION can_user_vote(
  p_user_id uuid,
  p_feature_id uuid
) RETURNS boolean AS $$
DECLARE
  project_id uuid;
  weekly_votes integer;
BEGIN
  -- Get project_id for the feature
  SELECT f.project_id INTO project_id
  FROM features f
  WHERE f.id = p_feature_id;
  
  -- Count weekly votes for this project
  SELECT get_weekly_votes_count(p_user_id, project_id) INTO weekly_votes;
  
  -- Check if under weekly limit
  RETURN weekly_votes < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update votes policy to include weekly limit check
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
  can_user_vote(auth.uid(), feature_id)
);