/*
  # Feature Voting System Schema

  1. New Tables
    - `projects` - Predefined list of projects
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamp)

    - `features` - Feature requests
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `project_id` (uuid, foreign key)
      - `created_by` (uuid, foreign key)
      - `votes_count` (int)
      - `created_at` (timestamp)

    - `votes` - User votes on features
      - `id` (uuid, primary key)
      - `feature_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create features table
CREATE TABLE features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  project_id uuid REFERENCES projects(id) NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  votes_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id uuid REFERENCES features(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(feature_id, user_id)
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Anyone can read projects" ON projects
  FOR SELECT TO public USING (true);

-- Features policies
CREATE POLICY "Anyone can read features" ON features
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can create features" ON features
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Votes policies
CREATE POLICY "Anyone can read votes" ON votes
  FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated users can create votes" ON votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert predefined projects
INSERT INTO projects (name, slug) VALUES
  ('Inscrições', 'inscricoes'),
  ('Match Online 2.0', 'match-online'),
  ('Site de eventos', 'site-eventos'),
  ('Portal ECBR', 'portal-ecbr');

-- Create function to handle vote counting
CREATE OR REPLACE FUNCTION update_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE features
    SET votes_count = votes_count + 1
    WHERE id = NEW.feature_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE features
    SET votes_count = votes_count - 1
    WHERE id = OLD.feature_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for vote counting
CREATE TRIGGER votes_counter
AFTER INSERT OR DELETE ON votes
FOR EACH ROW
EXECUTE FUNCTION update_votes_count();