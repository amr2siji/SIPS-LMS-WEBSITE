-- =====================================================
-- COMPREHENSIVE LMS ENHANCEMENT MIGRATION
-- Date: November 2, 2025
-- =====================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS lecturer_assignments CASCADE;
DROP TABLE IF EXISTS lecturers CASCADE;
DROP TABLE IF EXISTS overall_scores CASCADE;
DROP TABLE IF EXISTS module_score_weights CASCADE;
DROP TABLE IF EXISTS exam_submissions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS student_programs CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS intakes CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;

-- 1. CREATE FACULTIES TABLE
CREATE TABLE faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. CREATE DEPARTMENTS TABLE
CREATE TABLE departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid REFERENCES faculties(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. UPDATE PROGRAMS TABLE (enhance existing)
ALTER TABLE programs ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS program_type text; -- Certificate, Diploma, Degree
ALTER TABLE programs ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'complete'; -- complete, installment
ALTER TABLE programs ADD COLUMN IF NOT EXISTS program_amount decimal(10,2);
ALTER TABLE programs ADD COLUMN IF NOT EXISTS duration_months integer;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4. CREATE INTAKES TABLE
CREATE TABLE intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  intake_year integer NOT NULL,
  intake_month integer NOT NULL, -- 1-12
  intake_name text, -- e.g., "January 2025", auto-generated
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. CREATE MODULES TABLE (replaces courses concept)
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  intake_id uuid REFERENCES intakes(id),
  module_code text NOT NULL,
  module_name text NOT NULL,
  description text,
  credit_score integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_code, program_id, intake_id)
);

-- 6. UPDATE STUDENTS TABLE
ALTER TABLE students ADD COLUMN IF NOT EXISTS name_with_initials text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nic text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE students ADD COLUMN IF NOT EXISTS permanent_address text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mobile_number text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_mobile text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS ol_qualifications text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS al_qualifications text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS other_qualifications text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS nic_document_url text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS birth_certificate_url text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS qualification_certificate_url text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS payment_proof_url text;
ALTER TABLE students ADD COLUMN IF NOT EXISTS faculty_id uuid REFERENCES faculties(id);
ALTER TABLE students ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id);
ALTER TABLE students ADD COLUMN IF NOT EXISTS intake_id uuid REFERENCES intakes(id);

-- 7. CREATE STUDENT_PROGRAMS TABLE (for multiple program enrollment)
CREATE TABLE student_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  intake_id uuid REFERENCES intakes(id),
  enrollment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active', -- active, completed, dropout
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, program_id, intake_id)
);

-- 8. UPDATE APPLICATIONS TABLE
ALTER TABLE applications ADD COLUMN IF NOT EXISTS name_with_initials text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nic text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS permanent_address text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS mobile_number text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS emergency_contact_mobile text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ol_qualifications text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS al_qualifications text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS other_qualifications text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nic_document_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS birth_certificate_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS qualification_certificate_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_proof_url text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS processed_by uuid REFERENCES profiles(id);
ALTER TABLE applications ADD COLUMN IF NOT EXISTS processed_at timestamptz;

-- 9. CREATE OR UPDATE ASSIGNMENTS TABLE
-- Drop the table if it exists with wrong structure, then recreate
DROP TABLE IF EXISTS assignment_submissions CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;

CREATE TABLE assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  intake_id uuid REFERENCES intakes(id),
  faculty_id uuid REFERENCES faculties(id),
  department_id uuid REFERENCES departments(id),
  program_id uuid REFERENCES programs(id),
  title text NOT NULL,
  description text,
  due_date date,
  max_marks integer DEFAULT 100,
  assignment_file_url text,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assignment_submissions table
CREATE TABLE assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  submission_url text,
  marks_obtained integer,
  feedback text,
  submitted_at timestamptz DEFAULT now(),
  graded_at timestamptz,
  graded_by uuid REFERENCES profiles(id),
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- 10. CREATE EXAMS TABLE
CREATE TABLE exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  intake_id uuid REFERENCES intakes(id),
  faculty_id uuid REFERENCES faculties(id),
  department_id uuid REFERENCES departments(id),
  program_id uuid REFERENCES programs(id),
  instructor_id uuid REFERENCES profiles(id),
  exam_name text NOT NULL,
  description text,
  exam_date date,
  exam_time text,
  duration_minutes integer,
  max_marks integer DEFAULT 100,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 11. CREATE EXAM SUBMISSIONS TABLE
CREATE TABLE exam_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  score integer,
  feedback text,
  graded_at timestamptz,
  graded_by uuid REFERENCES profiles(id),
  status text DEFAULT 'pending', -- pending, graded
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, student_id)
);

-- 12. CREATE MODULE SCORE WEIGHTS TABLE
CREATE TABLE module_score_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  intake_id uuid REFERENCES intakes(id),
  assignments_weight decimal(5,2) DEFAULT 0, -- percentage
  exams_weight decimal(5,2) DEFAULT 0, -- percentage
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_id, intake_id)
);

-- 13. CREATE OVERALL SCORES TABLE
CREATE TABLE overall_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  intake_id uuid REFERENCES intakes(id),
  assignment_score decimal(5,2),
  exam_score decimal(5,2),
  overall_score decimal(5,2),
  grade text,
  is_finalized boolean DEFAULT false,
  finalized_at timestamptz,
  finalized_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, module_id, intake_id)
);

-- 14. UPDATE PAYMENTS TABLE
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'complete'; -- complete, installment
ALTER TABLE payments ADD COLUMN IF NOT EXISTS installment_number integer;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS total_installments integer;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS faculty_id uuid REFERENCES faculties(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES departments(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS program_id uuid REFERENCES programs(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS intake_id uuid REFERENCES intakes(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 15. CREATE LECTURERS TABLE
CREATE TABLE lecturers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  contact_number text,
  email text UNIQUE NOT NULL,
  residential_address text,
  highest_qualification text,
  years_academic_experience integer,
  years_industry_experience integer,
  availability_schedule jsonb, -- stores availability dates and times
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 16. CREATE LECTURER ASSIGNMENTS TABLE (multi-program assignment)
CREATE TABLE lecturer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lecturer_id uuid REFERENCES lecturers(id) ON DELETE CASCADE,
  faculty_id uuid REFERENCES faculties(id),
  department_id uuid REFERENCES departments(id),
  program_id uuid REFERENCES programs(id),
  module_id uuid REFERENCES modules(id),
  intake_id uuid REFERENCES intakes(id),
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(lecturer_id, module_id, intake_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_departments_faculty ON departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_programs_department ON programs(department_id);
CREATE INDEX IF NOT EXISTS idx_intakes_program ON intakes(program_id);
CREATE INDEX IF NOT EXISTS idx_modules_program ON modules(program_id);
CREATE INDEX IF NOT EXISTS idx_modules_intake ON modules(intake_id);
CREATE INDEX IF NOT EXISTS idx_student_programs_student ON student_programs(student_id);
CREATE INDEX IF NOT EXISTS idx_student_programs_program ON student_programs(program_id);
CREATE INDEX IF NOT EXISTS idx_students_faculty ON students(faculty_id);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_intake ON students(intake_id);
CREATE INDEX IF NOT EXISTS idx_assignments_module ON assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_assignments_intake ON assignments(intake_id);
CREATE INDEX IF NOT EXISTS idx_exams_module ON exams(module_id);
CREATE INDEX IF NOT EXISTS idx_exams_intake ON exams(intake_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_exam ON exam_submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_student ON exam_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_program ON payments(program_id);
CREATE INDEX IF NOT EXISTS idx_payments_intake ON payments(intake_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_lecturer ON lecturer_assignments(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_lecturer_assignments_module ON lecturer_assignments(module_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Faculties
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active faculties" ON faculties FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE POLICY "Admins can manage faculties" ON faculties FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active departments" ON departments FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Intakes
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active intakes" ON intakes FOR SELECT TO authenticated, anon USING (is_active = true);
CREATE POLICY "Admins can manage intakes" ON intakes FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Modules
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active modules" ON modules FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage modules" ON modules FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Student Programs
ALTER TABLE student_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own program enrollments" ON student_programs FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Admins can manage student programs" ON student_programs FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Exams
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view published exams" ON exams FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Instructors can view their exams" ON exams FOR SELECT TO authenticated USING (instructor_id = auth.uid());
CREATE POLICY "Admins and instructors can manage exams" ON exams FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor'))
);

-- Exam Submissions
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own exam submissions" ON exam_submissions FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Instructors can view submissions for their exams" ON exam_submissions FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM exams WHERE exams.id = exam_submissions.exam_id AND exams.instructor_id = auth.uid())
);
CREATE POLICY "Admins can manage all exam submissions" ON exam_submissions FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Module Score Weights
ALTER TABLE module_score_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view published weights" ON module_score_weights FOR SELECT TO authenticated USING (is_published = true);
CREATE POLICY "Admins and instructors can manage weights" ON module_score_weights FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor'))
);

-- Overall Scores
ALTER TABLE overall_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own overall scores" ON overall_scores FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "Instructors can view scores for their modules" ON overall_scores FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM lecturer_assignments WHERE lecturer_assignments.module_id = overall_scores.module_id AND lecturer_assignments.lecturer_id IN (SELECT id FROM lecturers WHERE user_id = auth.uid()))
);
CREATE POLICY "Admins can manage all overall scores" ON overall_scores FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Lecturers
ALTER TABLE lecturers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active lecturers" ON lecturers FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage lecturers" ON lecturers FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Lecturer Assignments
ALTER TABLE lecturer_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view active lecturer assignments" ON lecturer_assignments FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage lecturer assignments" ON lecturer_assignments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to auto-generate intake name
CREATE OR REPLACE FUNCTION generate_intake_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.intake_name := to_char(to_date(NEW.intake_month::text, 'MM'), 'Month') || ' ' || NEW.intake_year;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_intake_name
  BEFORE INSERT OR UPDATE ON intakes
  FOR EACH ROW
  EXECUTE FUNCTION generate_intake_name();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_faculties_updated_at BEFORE UPDATE ON faculties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_intakes_updated_at BEFORE UPDATE ON intakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecturers_updated_at BEFORE UPDATE ON lecturers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
