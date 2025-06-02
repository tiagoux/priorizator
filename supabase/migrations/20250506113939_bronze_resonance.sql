/*
  # Allow multiple votes on features

  1. Changes
    - Remove unique constraint on votes table
    - Update voting policy to allow multiple votes on same feature
    - Add function to count user's votes on a specific feature
    
  2. Security
    - Maintain weekly vote limit per project
    - Keep feature voteable status check
*/

-- First drop the existing unique constraint
ALTER TABLE votes
DROP CONSTRAINT IF EXISTS votes_feature_id_user_id_key;

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can create votes" ON votes;

-- Create new policy without the unique vote check
CREATE POLICY "Authenticated users can create votes"
ON votes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  can_user_vote(auth.uid(), feature_id) AND
  is_feature_voteable(feature_id)
);