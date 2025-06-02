/*
  # Add new fields to features table

  1. Changes
    - Add deadline column
    - Add raci column for team responsibilities
    - Update existing features with default values

  2. Notes
    - deadline is optional
    - raci is stored as a JSONB array of team responsibilities
*/

-- Add new columns to features table
ALTER TABLE features
ADD COLUMN IF NOT EXISTS deadline timestamptz,
ADD COLUMN IF NOT EXISTS raci jsonb DEFAULT '[]'::jsonb;

-- Add check constraint to ensure raci is an array
ALTER TABLE features
ADD CONSTRAINT raci_is_array
CHECK (jsonb_typeof(raci) = 'array');