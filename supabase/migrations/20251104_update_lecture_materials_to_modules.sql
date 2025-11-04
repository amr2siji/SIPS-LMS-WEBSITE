-- Update lecture_materials table to use modules instead of courses
-- Step 1: Drop the foreign key constraint to courses
ALTER TABLE lecture_materials DROP CONSTRAINT IF EXISTS lecture_materials_course_id_fkey;

-- Step 2: Rename the column from course_id to module_id
ALTER TABLE lecture_materials RENAME COLUMN course_id TO module_id;

-- Step 3: Add foreign key constraint to modules table
ALTER TABLE lecture_materials 
  ADD CONSTRAINT lecture_materials_module_id_fkey 
  FOREIGN KEY (module_id) 
  REFERENCES modules(id) 
  ON DELETE CASCADE;

-- Step 4: Drop old index and create new one
DROP INDEX IF EXISTS idx_lecture_materials_course;
CREATE INDEX idx_lecture_materials_module ON lecture_materials(module_id);

-- Comment on table update
COMMENT ON TABLE lecture_materials IS 'Stores lecture materials uploaded by instructors/admins for students, organized by week. References modules table.';
