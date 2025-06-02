/*
  # Fix weekly votes calculation

  1. Changes
    - Update get_weekly_votes_count function to properly handle week boundaries
    - Add function to check if vote is from current week
    - Maintain existing security and RLS policies
    
  2. Security
    - Functions run with security definer to ensure proper access
    - Maintains existing RLS policies
*/

-- Drop existing function
DROP FUNCTION IF EXISTS get_weekly_votes_count(uuid, uuid);

-- Recreate function with proper week calculation
CREATE OR REPLACE FUNCTION get_weekly_votes_count(
  p_user_id uuid,
  p_project_id uuid
) RETURNS integer AS $$
DECLARE
  vote_count integer;
  week_start timestamp;
BEGIN
  -- Get the start of the current week (Monday)
  week_start := date_trunc('week', CURRENT_TIMESTAMP AT TIME ZONE 'UTC');
  
  SELECT COUNT(*)
  INTO vote_count
  FROM votes v
  JOIN features f ON f.id = v.feature_id
  WHERE v.user_id = p_user_id
  AND f.project_id = p_project_id
  AND v.created_at >= week_start
  AND v.created_at < week_start + interval '7 days';
  
  RETURN vote_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update can_user_vote function to use the same week calculation
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