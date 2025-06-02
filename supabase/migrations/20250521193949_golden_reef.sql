/*
  # Allow feature creators to edit their features

  1. Changes
    - Add policy for creators to update their own features
    - Ensure only admin can change feature status
    - Allow creators to update other feature properties
    
  2. Security
    - Creators can only edit their own features
    - Status changes restricted to admin
    - Maintains existing security policies
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
  auth.uid() = created_by
);

-- Create function to handle feature updates
CREATE OR REPLACE FUNCTION handle_feature_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is changing and user is not admin, prevent the update
  IF NEW.status != OLD.status AND 
     (current_setting('request.jwt.claims', true)::json->>'email') != 'tiago.rosa@ecommercebrasil.com.br' 
  THEN
    RAISE EXCEPTION 'Only admin can change feature status';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce update rules
DROP TRIGGER IF EXISTS enforce_feature_update_rules ON features;

CREATE TRIGGER enforce_feature_update_rules
BEFORE UPDATE ON features
FOR EACH ROW
EXECUTE FUNCTION handle_feature_update();