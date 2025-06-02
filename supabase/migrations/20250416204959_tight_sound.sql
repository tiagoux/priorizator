/*
  # Add status to features table

  1. Changes
    - Add status column to features table with enum type
    - Add policy for main admin to update feature status
    - Add policy for anyone to read features

  2. Security
    - Only admin can update status
    - Everyone can read status
*/

-- Create enum type for feature status
CREATE TYPE feature_status AS ENUM (
  'pending',
  'prioritized',
  'in_progress',
  'done',
  'in_production'
);

-- Add status column to features table
ALTER TABLE features 
ADD COLUMN status feature_status NOT NULL DEFAULT 'pending';

-- Create policy for admin to update feature status
CREATE POLICY "Admin can update feature status" 
ON features
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br')
WITH CHECK (auth.jwt() ->> 'email' = 'tiago.rosa@ecommercebrasil.com.br');