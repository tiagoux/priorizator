/*
  # Fix weekly voting system

  1. Changes
    - Improve weekly vote counting with proper timezone handling
    - Simplify vote checking logic
    - Update voting policies
    
  2. Security
    - Maintain existing security policies
    - Ensure proper function dependencies
*/

-- First drop the policy that depends on the functions
DROP POLICY IF EXISTS "Authenticated users can create votes" ON votes;

-- Now we can safely drop and recreate the functions
DROP FUNCTION IF EXISTS get_weekly_votes_count(uuid, uuid);
DROP FUNCTION IF EXISTS can_user_vote(uuid, uuid);

-- Recreate get_weekly_votes_count with proper week handling
CREATE OR REPLACE FUNCTION get_weekly_votes_count(
  p_user_id uuid,
  p_project_id uuid
) RETURNS integer AS $$
DECLARE
  vote_count integer;
  current_week timestamp;
BEGIN
  -- Get the start of the current week (Monday) in America/Sao_Paulo timezone
  current_week := date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'America/Sao_Paulo');
  
  -- Count votes for the current week only
  SELECT COUNT(*)
  INTO vote_count
  FROM votes v
  JOIN features f ON f.id = v.feature_id
  WHERE v.user_id = p_user_id
  AND f.project_id = p_project_id
  AND v.created_at >= current_week
  AND v.created_at < current_week + interval '7 days';
  
  RETURN COALESCE(vote_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate can_user_vote with simplified logic
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
  
  IF project_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get weekly votes count
  SELECT get_weekly_votes_count(p_user_id, project_id) INTO weekly_votes;
  
  -- Return true if user has less than 3 votes this week
  RETURN COALESCE(weekly_votes, 0) < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the voting policy with updated functions
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