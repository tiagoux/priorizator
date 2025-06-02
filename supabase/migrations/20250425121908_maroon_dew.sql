/*
  # Fix weekly voting limit per project

  1. Changes
    - Update get_weekly_votes_count function to count votes per project
    - Update can_user_vote function to check limits per project
    - Maintain existing security and RLS policies
    
  2. Security
    - Functions run with security definer to ensure proper access
    - Maintains existing RLS policies
*/

-- First drop the policy that depends on the function
DROP POLICY IF EXISTS "Authenticated users can create votes" ON votes;

-- Now we can safely drop and recreate the functions
DROP FUNCTION IF EXISTS get_weekly_votes_count(uuid, uuid);
DROP FUNCTION IF EXISTS can_user_vote(uuid, uuid);

-- Function to count user's votes for a specific project in the current week
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

-- Function to check if user can vote on a feature
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
  
  -- Count weekly votes for this specific project
  SELECT get_weekly_votes_count(p_user_id, project_id) INTO weekly_votes;
  
  -- Check if under weekly limit (3 votes per project)
  RETURN weekly_votes < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the policy with the updated functions
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