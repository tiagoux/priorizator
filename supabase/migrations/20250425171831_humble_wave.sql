/*
  # Add deadline requirement based on feature status

  1. Changes
    - Add check constraint to ensure deadline is provided when status is not 'not_prioritized'
    - Update existing features to comply with new constraint
    - Add trigger to enforce deadline requirement on status change
    
  2. Notes
    - Deadline is optional only for 'not_prioritized' status
    - Deadline becomes mandatory for all other statuses
*/

-- First, update any existing features to ensure they comply with the new constraint
UPDATE features
SET deadline = CURRENT_TIMESTAMP + interval '30 days'
WHERE status != 'not_prioritized' 
AND deadline IS NULL;

-- Add check constraint to enforce deadline requirement
ALTER TABLE features
DROP CONSTRAINT IF EXISTS deadline_required_check;

ALTER TABLE features
ADD CONSTRAINT deadline_required_check
CHECK (
  CASE 
    WHEN status = 'not_prioritized' THEN true
    ELSE deadline IS NOT NULL
  END
);

-- Create trigger function to enforce deadline requirement on status change
CREATE OR REPLACE FUNCTION enforce_deadline_requirement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != 'not_prioritized' AND NEW.deadline IS NULL THEN
    RAISE EXCEPTION 'Deadline is required when status is not "not_prioritized"';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS enforce_deadline_requirement_trigger ON features;

CREATE TRIGGER enforce_deadline_requirement_trigger
BEFORE INSERT OR UPDATE ON features
FOR EACH ROW
EXECUTE FUNCTION enforce_deadline_requirement();