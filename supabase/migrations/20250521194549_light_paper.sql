/*
  # Update feature policies for admin access

  1. Changes
    - Add comprehensive admin policy for features
    - Keep existing policy for creators
    - Ensure admin can edit all features regardless of status
    
  2. Security
    - Admin has full access to all features
    - Regular users can only edit their own features
    - Status changes still restricted to admin
*/

-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Creators can update their features" ON features;
DROP POLICY IF EXISTS "Admin can update features" ON features;

-- Create policy for admin to manage all features
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

-- Create policy for creators to update their own features
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

-- Update the feature update trigger function
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS enforce_feature_update_rules ON features;

CREATE TRIGGER enforce_feature_update_rules
BEFORE UPDATE ON features
FOR EACH ROW
EXECUTE FUNCTION handle_feature_update();