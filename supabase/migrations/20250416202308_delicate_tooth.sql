/*
  # Fix Database Schema and Relationships

  1. New Tables
    - `projects` table with required columns
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `projects` table
    - Add policy for public read access to projects (if not exists)

  3. Changes
    - Add foreign key constraint between features and projects
*/

-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access to projects if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE tablename = 'projects' 
    AND policyname = 'Anyone can read projects'
  ) THEN
    CREATE POLICY "Anyone can read projects"
      ON projects
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'features_project_id_fkey'
  ) THEN
    ALTER TABLE features
    ADD CONSTRAINT features_project_id_fkey
    FOREIGN KEY (project_id) REFERENCES projects(id);
  END IF;
END $$;