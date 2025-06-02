/*
  # Update feature policies for creators

  1. Changes
    - Add policy to allow feature creators to edit their own features
    - Keep existing admin policies intact
    - Maintain existing security constraints
    
  2. Security
    - Creators can only edit their own features
    - Admin retains full access
    - Maintains existing RLS policies
*/

-- Create policy for creators to update their features
CREATE POLICY "Creators can update their features"
ON features
FOR UPDATE
TO authenticated
USING (
  auth.uid() = created_by
)
WITH CHECK (
  auth.uid() = created_by AND
  (
    -- If status is changing, only allow if user is admin
    CASE 
      WHEN NEW.status != OLD.status THEN
        auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
      ELSE true
    END
  )
);