/*
  # Update votes table policies

  1. Changes
    - Add explicit RLS policy to ensure users can only vote once per feature
    - Keep existing policies for reading and creating votes
    - Add policy to prevent users from deleting votes

  2. Security
    - Enable RLS on votes table
    - Users can read all votes
    - Users can only create votes for themselves
    - Users cannot delete their votes (votes are permanent)
    - System enforces one vote per user per feature through unique constraint
*/

-- Enable RLS on votes table (if not already enabled)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can read votes" ON votes;
DROP POLICY IF EXISTS "Authenticated users can create votes" ON votes;

-- Create policies for votes table
CREATE POLICY "Anyone can read votes"
ON votes FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create votes"
ON votes FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  NOT EXISTS (
    SELECT 1 FROM votes v
    WHERE v.feature_id = votes.feature_id
    AND v.user_id = auth.uid()
  )
);

-- Prevent vote deletion
CREATE POLICY "No one can delete votes"
ON votes FOR DELETE
TO public
USING (false);