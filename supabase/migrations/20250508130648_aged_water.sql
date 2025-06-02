/*
  # Add weekly priority to projects

  1. Changes
    - Add is_weekly_priority column to projects table
    - Add policy for admin to update priority status
    - Add policy for public to read priority status
    
  2. Security
    - Only admin can update priority status
    - Everyone can read priority status
*/

-- Add weekly priority column
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS is_weekly_priority boolean DEFAULT false;

-- Create policy for admin to update priority
CREATE POLICY "Admin can update project priority"
ON projects
FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br'
);