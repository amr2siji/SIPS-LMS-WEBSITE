/*
  # Comprehensive Mock Data for Marks Management System
  
  This migration creates complete test data for:
  - Faculties
  - Departments
  - Programs
  - Intakes
  - Modules
  - Students with enrollments
  - Assignments and Submissions
  - Exams and Submissions
  - Module Score Weights
  - Overall Scores
  
  Note: This script temporarily disables RLS to insert test data
*/

-- Temporarily disable RLS for data insertion
ALTER TABLE faculties DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
ALTER TABLE intakes DISABLE ROW LEVEL SECURITY;
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE module_score_weights DISABLE ROW LEVEL SECURITY;

-- Clean up existing data (in reverse order of dependencies)
-- First, delete all data that references modules, intakes, and programs
DELETE FROM overall_scores WHERE intake_id IN (
  'c10e8400-e29b-41d4-a716-446655440001',
  'c10e8400-e29b-41d4-a716-446655440002',
  'c10e8400-e29b-41d4-a716-446655440003',
  'c10e8400-e29b-41d4-a716-446655440004',
  'c10e8400-e29b-41d4-a716-446655440005'
);
DELETE FROM exam_submissions WHERE exam_id IN (
  SELECT id FROM exams WHERE intake_id IN (
    'c10e8400-e29b-41d4-a716-446655440001',
    'c10e8400-e29b-41d4-a716-446655440002',
    'c10e8400-e29b-41d4-a716-446655440003',
    'c10e8400-e29b-41d4-a716-446655440004',
    'c10e8400-e29b-41d4-a716-446655440005'
  )
);
DELETE FROM assignment_submissions WHERE assignment_id IN (
  SELECT id FROM assignments WHERE intake_id IN (
    'c10e8400-e29b-41d4-a716-446655440001',
    'c10e8400-e29b-41d4-a716-446655440002',
    'c10e8400-e29b-41d4-a716-446655440003',
    'c10e8400-e29b-41d4-a716-446655440004',
    'c10e8400-e29b-41d4-a716-446655440005'
  )
);
DELETE FROM module_score_weights WHERE intake_id IN (
  'c10e8400-e29b-41d4-a716-446655440001',
  'c10e8400-e29b-41d4-a716-446655440002',
  'c10e8400-e29b-41d4-a716-446655440003',
  'c10e8400-e29b-41d4-a716-446655440004',
  'c10e8400-e29b-41d4-a716-446655440005'
);
DELETE FROM exams WHERE intake_id IN (
  'c10e8400-e29b-41d4-a716-446655440001',
  'c10e8400-e29b-41d4-a716-446655440002',
  'c10e8400-e29b-41d4-a716-446655440003',
  'c10e8400-e29b-41d4-a716-446655440004',
  'c10e8400-e29b-41d4-a716-446655440005'
);
DELETE FROM assignments WHERE intake_id IN (
  'c10e8400-e29b-41d4-a716-446655440001',
  'c10e8400-e29b-41d4-a716-446655440002',
  'c10e8400-e29b-41d4-a716-446655440003',
  'c10e8400-e29b-41d4-a716-446655440004',
  'c10e8400-e29b-41d4-a716-446655440005'
);
DELETE FROM lecturer_assignments WHERE module_id IN (
  SELECT id FROM modules WHERE intake_id IN (
    'c10e8400-e29b-41d4-a716-446655440001',
    'c10e8400-e29b-41d4-a716-446655440002',
    'c10e8400-e29b-41d4-a716-446655440003',
    'c10e8400-e29b-41d4-a716-446655440004',
    'c10e8400-e29b-41d4-a716-446655440005'
  )
);
DELETE FROM student_programs WHERE intake_id IN (
  'c10e8400-e29b-41d4-a716-446655440001',
  'c10e8400-e29b-41d4-a716-446655440002',
  'c10e8400-e29b-41d4-a716-446655440003',
  'c10e8400-e29b-41d4-a716-446655440004',
  'c10e8400-e29b-41d4-a716-446655440005'
);
DELETE FROM modules WHERE intake_id IN (
  'c10e8400-e29b-41d4-a716-446655440001',
  'c10e8400-e29b-41d4-a716-446655440002',
  'c10e8400-e29b-41d4-a716-446655440003',
  'c10e8400-e29b-41d4-a716-446655440004',
  'c10e8400-e29b-41d4-a716-446655440005'
);
-- Delete students that reference our test intakes
DELETE FROM students WHERE intake_id IN (
  'c10e8400-e29b-41d4-a716-446655440001',
  'c10e8400-e29b-41d4-a716-446655440002',
  'c10e8400-e29b-41d4-a716-446655440003',
  'c10e8400-e29b-41d4-a716-446655440004',
  'c10e8400-e29b-41d4-a716-446655440005'
);
DELETE FROM intakes WHERE id IN (
  'c10e8400-e29b-41d4-a716-446655440001',
  'c10e8400-e29b-41d4-a716-446655440002',
  'c10e8400-e29b-41d4-a716-446655440003',
  'c10e8400-e29b-41d4-a716-446655440004',
  'c10e8400-e29b-41d4-a716-446655440005'
);
-- Clean up test user profiles
DELETE FROM profiles WHERE email LIKE '%@sips-test.edu.lk' OR email LIKE '%@sips.edu.lk';
DELETE FROM programs WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440012',
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440014',
  '550e8400-e29b-41d4-a716-446655440015',
  '550e8400-e29b-41d4-a716-446655440016'
);
DELETE FROM departments WHERE id IN (
  'b10e8400-e29b-41d4-a716-446655440001',
  'b10e8400-e29b-41d4-a716-446655440002',
  'b10e8400-e29b-41d4-a716-446655440003',
  'b10e8400-e29b-41d4-a716-446655440004',
  'b10e8400-e29b-41d4-a716-446655440005',
  'b10e8400-e29b-41d4-a716-446655440006',
  'b10e8400-e29b-41d4-a716-446655440007'
);
DELETE FROM faculties WHERE id IN (
  'a10e8400-e29b-41d4-a716-446655440001',
  'a10e8400-e29b-41d4-a716-446655440002',
  'a10e8400-e29b-41d4-a716-446655440003'
);

-- 1. CREATE FACULTIES
INSERT INTO faculties (id, name, description, is_active, created_at) VALUES
  ('a10e8400-e29b-41d4-a716-446655440001', 'Faculty of Business Studies', 'Leading business education with industry-focused programs', true, now()),
  ('a10e8400-e29b-41d4-a716-446655440002', 'Faculty of Engineering', 'Cutting-edge engineering and technology programs', true, now()),
  ('a10e8400-e29b-41d4-a716-446655440003', 'Faculty of Computing', 'Advanced IT and computing education', true, now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. CREATE DEPARTMENTS
INSERT INTO departments (id, faculty_id, name, description, is_active, created_at) VALUES
  ('b10e8400-e29b-41d4-a716-446655440001', 'a10e8400-e29b-41d4-a716-446655440001', 'Department of Business Administration', 'Core business management programs', true, now()),
  ('b10e8400-e29b-41d4-a716-446655440002', 'a10e8400-e29b-41d4-a716-446655440001', 'Department of Marketing', 'Marketing and brand management', true, now()),
  ('b10e8400-e29b-41d4-a716-446655440003', 'a10e8400-e29b-41d4-a716-446655440002', 'Department of Civil Engineering', 'Infrastructure and construction engineering', true, now()),
  ('b10e8400-e29b-41d4-a716-446655440004', 'a10e8400-e29b-41d4-a716-446655440002', 'Department of Electrical Engineering', 'Electrical systems and power engineering', true, now()),
  ('b10e8400-e29b-41d4-a716-446655440005', 'a10e8400-e29b-41d4-a716-446655440003', 'Department of Software Engineering', 'Software development and systems', true, now()),
  ('b10e8400-e29b-41d4-a716-446655440006', 'a10e8400-e29b-41d4-a716-446655440003', 'Department of Information Systems', 'Business information systems', true, now()),
  ('b10e8400-e29b-41d4-a716-446655440007', 'a10e8400-e29b-41d4-a716-446655440003', 'Department of Data Science', 'Analytics and machine learning', true, now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 3. CREATE PROGRAMS
INSERT INTO programs (id, name, description, duration, level, is_active, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Bachelor of Business Administration', 'Comprehensive business management program', '4 years', 'Bachelor', true, now()),
  ('550e8400-e29b-41d4-a716-446655440012', 'Bachelor of Software Engineering', 'Professional software development program', '4 years', 'Bachelor', true, now()),
  ('550e8400-e29b-41d4-a716-446655440013', 'Bachelor of Data Science', 'Advanced data analytics program', '4 years', 'Bachelor', true, now()),
  ('550e8400-e29b-41d4-a716-446655440014', 'Diploma in Marketing', 'Professional marketing qualification', '2 years', 'Diploma', true, now()),
  ('550e8400-e29b-41d4-a716-446655440015', 'Bachelor of Civil Engineering', 'Civil engineering professional degree', '4 years', 'Bachelor', true, now()),
  ('550e8400-e29b-41d4-a716-446655440016', 'Bachelor of Electrical Engineering', 'Electrical engineering professional degree', '4 years', 'Bachelor', true, now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 4. CREATE INTAKES
INSERT INTO intakes (id, program_id, intake_year, intake_month, intake_name, start_date, end_date, is_active, created_at) VALUES
  ('c10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 2024, 1, 'January 2024', '2024-01-15', '2027-12-31', true, now()),
  ('c10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', 2024, 6, 'June 2024', '2024-06-01', '2028-05-31', true, now()),
  ('c10e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012', 2024, 1, 'January 2024', '2024-01-15', '2027-12-31', true, now()),
  ('c10e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440013', 2024, 1, 'January 2024', '2024-01-15', '2027-12-31', true, now()),
  ('c10e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440014', 2024, 3, 'March 2024', '2024-03-01', '2026-02-28', true, now())
ON CONFLICT (id) DO UPDATE SET
  intake_name = EXCLUDED.intake_name,
  start_date = EXCLUDED.start_date;

-- 5. CREATE MODULES
INSERT INTO modules (id, program_id, intake_id, module_code, module_name, description, credit_score, is_active, created_at) VALUES
  -- BBA Modules (January 2024 Intake)
  ('d10e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 'c10e8400-e29b-41d4-a716-446655440001', 'BBA101', 'Principles of Management', 'Introduction to management theories and practices', 3, true, now()),
  ('d10e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', 'c10e8400-e29b-41d4-a716-446655440001', 'BBA102', 'Business Mathematics', 'Mathematical concepts for business applications', 3, true, now()),
  ('d10e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440011', 'c10e8400-e29b-41d4-a716-446655440001', 'BBA201', 'Marketing Management', 'Strategic marketing principles', 4, true, now()),
  ('d10e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440011', 'c10e8400-e29b-41d4-a716-446655440001', 'BBA202', 'Financial Accounting', 'Accounting principles and financial reporting', 4, true, now()),
  
  -- Software Engineering Modules (January 2024 Intake)
  ('d10e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440012', 'c10e8400-e29b-41d4-a716-446655440003', 'SE101', 'Programming Fundamentals', 'Introduction to programming with Python', 4, true, now()),
  ('d10e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440012', 'c10e8400-e29b-41d4-a716-446655440003', 'SE102', 'Data Structures', 'Core data structures and algorithms', 4, true, now()),
  ('d10e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440012', 'c10e8400-e29b-41d4-a716-446655440003', 'SE201', 'Database Systems', 'Relational databases and SQL', 4, true, now()),
  ('d10e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440012', 'c10e8400-e29b-41d4-a716-446655440003', 'SE202', 'Web Development', 'Modern web technologies and frameworks', 4, true, now()),
  
  -- Data Science Modules (January 2024 Intake)
  ('d10e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440013', 'c10e8400-e29b-41d4-a716-446655440004', 'DS101', 'Statistics for Data Science', 'Statistical methods and analysis', 4, true, now()),
  ('d10e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440013', 'c10e8400-e29b-41d4-a716-446655440004', 'DS102', 'Machine Learning', 'ML algorithms and applications', 4, true, now())
ON CONFLICT (module_code, program_id, intake_id) DO UPDATE SET
  module_name = EXCLUDED.module_name,
  description = EXCLUDED.description;

-- Note: Test user profiles will be created via Supabase Auth
-- We'll create placeholder student records that can be linked later

-- 6. CREATE MODULE SCORE WEIGHTS
INSERT INTO module_score_weights (id, module_id, intake_id, assignments_weight, exams_weight, is_published, published_at, created_at) VALUES
  ('e10e8400-e29b-41d4-a716-446655440001', 'd10e8400-e29b-41d4-a716-446655440001', 'c10e8400-e29b-41d4-a716-446655440001', 40.00, 60.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440002', 'd10e8400-e29b-41d4-a716-446655440002', 'c10e8400-e29b-41d4-a716-446655440001', 30.00, 70.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440003', 'd10e8400-e29b-41d4-a716-446655440003', 'c10e8400-e29b-41d4-a716-446655440001', 45.00, 55.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440004', 'd10e8400-e29b-41d4-a716-446655440004', 'c10e8400-e29b-41d4-a716-446655440001', 35.00, 65.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440005', 'd10e8400-e29b-41d4-a716-446655440005', 'c10e8400-e29b-41d4-a716-446655440003', 50.00, 50.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440006', 'd10e8400-e29b-41d4-a716-446655440006', 'c10e8400-e29b-41d4-a716-446655440003', 40.00, 60.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440007', 'd10e8400-e29b-41d4-a716-446655440007', 'c10e8400-e29b-41d4-a716-446655440003', 45.00, 55.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440008', 'd10e8400-e29b-41d4-a716-446655440008', 'c10e8400-e29b-41d4-a716-446655440003', 50.00, 50.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440009', 'd10e8400-e29b-41d4-a716-446655440009', 'c10e8400-e29b-41d4-a716-446655440004', 30.00, 70.00, true, now(), now()),
  ('e10e8400-e29b-41d4-a716-446655440010', 'd10e8400-e29b-41d4-a716-446655440010', 'c10e8400-e29b-41d4-a716-446655440004', 40.00, 60.00, true, now(), now())
ON CONFLICT (module_id, intake_id) DO UPDATE SET
  assignments_weight = EXCLUDED.assignments_weight,
  exams_weight = EXCLUDED.exams_weight;

-- Re-enable RLS policies
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_score_weights ENABLE ROW LEVEL SECURITY;

/*
  IMPORTANT SETUP INSTRUCTIONS:
  
  After running this migration, you need to:
  
  1. Create test student accounts using the SetupTestUsers page or manually:
     - student1@sips-test.edu.lk (Password: Student@123)
     - student2@sips-test.edu.lk (Password: Student@123)
     - student3@sips-test.edu.lk (Password: Student@123)
  
  2. After creating auth users, run this to create student records:
  
     -- Get the user IDs from auth.users and insert into students table
     INSERT INTO students (id, student_id, program_id, intake_id, faculty_id, department_id, status, payment_status)
     SELECT 
       id,
       'SIPS-2024-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::text, 4, '0'),
       '550e8400-e29b-41d4-a716-446655440011', -- BBA Program
       'c10e8400-e29b-41d4-a716-446655440001', -- January 2024 Intake
       'a10e8400-e29b-41d4-a716-446655440001', -- Faculty of Business
       'b10e8400-e29b-41d4-a716-446655440001', -- Department of Business Admin
       'active',
       'paid'
     FROM profiles
     WHERE email LIKE '%@sips-test.edu.lk' AND role = 'student'
     ON CONFLICT (id) DO NOTHING;
  
  3. Then run the extended mock data script to add assignments, exams, and scores
*/
