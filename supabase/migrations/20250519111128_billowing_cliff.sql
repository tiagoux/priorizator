/*
  # Update admin access policies

  1. Changes
    - Add policies to allow admin to update any feature
    - Add policies to allow admin to update any project
    - Add policies to allow admin to manage votes
    
  2. Security
    - Full access granted only to admin user
    - Maintains existing policies for other users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can update features" ON features;
DROP POLICY IF EXISTS "Admin can update project priority" ON projects;

-- Create comprehensive admin policy for features
CREATE POLICY "Admin can update features"
ON features
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
);

-- Create comprehensive admin policy for projects
CREATE POLICY "Admin can manage projects"
ON projects
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
);

-- Create comprehensive admin policy for votes
CREATE POLICY "Admin can manage votes"
ON votes
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
);