/*
  # Add feature deletion policy

  1. Changes
    - Add RLS policy to allow feature creators to delete their features if status is 'not_prioritized'
    - Ensure cascading delete for related votes
    
  2. Security
    - Only creators can delete their own features
    - Only features with 'not_prioritized' status can be deleted
*/

-- Add policy for feature deletion
CREATE POLICY "Creators can delete not prioritized features"
ON features
FOR DELETE
TO authenticated
USING (
  auth.uid() = created_by 
  AND status = 'not_prioritized'
);

-- Ensure votes are deleted when feature is deleted
ALTER TABLE votes
DROP CONSTRAINT IF EXISTS votes_feature_id_fkey;

ALTER TABLE votes
ADD CONSTRAINT votes_feature_id_fkey
FOREIGN KEY (feature_id) 
REFERENCES features(id)
ON DELETE CASCADE;