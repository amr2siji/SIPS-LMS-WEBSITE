-- Drop the table if it exists (in case of previous failed attempts)
DROP TABLE IF EXISTS lecture_materials CASCADE;

-- Create lecture_materials table
CREATE TABLE lecture_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  week_number integer NOT NULL CHECK (week_number >= 1 AND week_number <= 15),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  file_type text NOT NULL CHECK (file_type IN ('ppt', 'word', 'pdf', 'excel')),
  file_url text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Create indexes for better query performance
CREATE INDEX idx_lecture_materials_course ON lecture_materials(course_id);
CREATE INDEX idx_lecture_materials_week ON lecture_materials(week_number);
CREATE INDEX idx_lecture_materials_active ON lecture_materials(is_active);

-- Enable Row Level Security
ALTER TABLE lecture_materials ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your security requirements)
-- Allow authenticated users to read active materials
CREATE POLICY "Allow authenticated users to read active materials"
  ON lecture_materials
  FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Allow admins and instructors to manage materials
CREATE POLICY "Allow admins to manage all materials"
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
COMMENT ON TABLE lecture_materials IS 'Stores lecture materials uploaded by instructors/admins for students, organized by week';
