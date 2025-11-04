-- Fix lecture_materials table to use module_id instead of course_id
-- This aligns with how the StudentDashboard queries the data

-- Drop existing lecture_materials table
DROP TABLE IF EXISTS lecture_materials CASCADE;

-- Recreate lecture_materials table with module_id
CREATE TABLE lecture_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  week_number integer CHECK (week_number >= 1 AND week_number <= 20),
  file_type text NOT NULL CHECK (file_type IN ('ppt', 'word', 'pdf', 'excel')),
  file_url text NOT NULL,
  description text,
  uploaded_by uuid REFERENCES profiles(id),
  uploaded_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_lecture_materials_module ON lecture_materials(module_id);
CREATE INDEX idx_lecture_materials_week ON lecture_materials(week_number);
CREATE INDEX idx_lecture_materials_uploaded_at ON lecture_materials(uploaded_at);
CREATE INDEX idx_lecture_materials_active ON lecture_materials(is_active);

-- Enable Row Level Security
ALTER TABLE lecture_materials ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to read active materials
CREATE POLICY "Allow authenticated users to read active materials"
  ON lecture_materials
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow instructors and admins to manage materials
CREATE POLICY "Allow instructors and admins to manage materials"
  ON lecture_materials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

-- Comment on table
COMMENT ON TABLE lecture_materials IS 'Stores lecture materials uploaded by instructors/admins for students, organized by module';
