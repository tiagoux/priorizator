/*
  # Update feature status enum

  1. Changes
    - Rename 'pending' to 'not_prioritized' in feature_status enum
    - Update existing features with 'pending' status to 'not_prioritized'

  2. Notes
    - This migration safely updates the enum without data loss
    - All existing features with 'pending' status will be automatically updated
*/

-- First, remove the default constraint
ALTER TABLE features 
  ALTER COLUMN status DROP DEFAULT;

-- Create a new enum type with the updated values
CREATE TYPE feature_status_new AS ENUM ('not_prioritized', 'prioritized', 'in_progress', 'done', 'in_production');

-- Update the column to use the new enum type, converting 'pending' to 'not_prioritized'
ALTER TABLE features 
  ALTER COLUMN status TYPE feature_status_new 
  USING (CASE 
    WHEN status::text = 'pending' THEN 'not_prioritized'
    ELSE status::text
  END)::feature_status_new;

-- Drop the old enum type
DROP TYPE feature_status;

-- Rename the new enum type to the original name
ALTER TYPE feature_status_new RENAME TO feature_status;

-- Now set the new default value
ALTER TABLE features 
  ALTER COLUMN status SET DEFAULT 'not_prioritized'::feature_status;