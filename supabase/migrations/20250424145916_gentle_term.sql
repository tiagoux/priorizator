/*
  # Add trigger to copy user names to metadata

  1. Changes
    - Create a function to update user metadata with first and last name from email
    - Create a trigger to run this function on user creation/update
    
  2. Security
    - Function runs with security definer to ensure it can update user metadata
*/

CREATE OR REPLACE FUNCTION update_user_names()
RETURNS TRIGGER AS $$
DECLARE
  email_name text;
  first_name text;
  last_name text;
BEGIN
  -- Extract name part from email (before @)
  email_name := split_part(NEW.email, '@', 1);
  
  -- Split email name into first and last name
  first_name := split_part(email_name, '.', 1);
  last_name := split_part(email_name, '.', 2);
  
  -- Properly capitalize names
  first_name := initcap(first_name);
  last_name := initcap(last_name);
  
  -- Update user's metadata
  NEW.raw_user_meta_data := jsonb_build_object(
    'first_name', first_name,
    'last_name', CASE WHEN last_name = '' THEN NULL ELSE last_name END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE OR REPLACE TRIGGER update_user_names_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_names();