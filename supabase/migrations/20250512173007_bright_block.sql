/*
  # Update feature policies for root user

  1. Changes
    - Update policy to allow root user to edit any feature
    - Keep existing policy for other users
    
  2. Security
    - Only root user can edit any feature
    - Other users maintain existing permissions
*/

-- Drop existing update policy
DROP POLICY IF EXISTS "Admin can update feature status" ON features;

-- Create new policy for root user
CREATE POLICY "Admin can update features"
ON features
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
);