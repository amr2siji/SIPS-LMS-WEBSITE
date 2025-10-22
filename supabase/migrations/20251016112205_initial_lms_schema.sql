/*
  # SIPS LMS Initial Database Schema

  ## Overview
  This migration creates the complete database structure for the SIPS Learning Management System.

  ## New Tables Created

  ### 1. `profiles`
  User profile information extending Supabase auth.users
  - `id` (uuid, FK to auth.users) - User ID
  - `email` (text) - User email
  - `full_name` (text) - Full name
  - `role` (text) - User role: 'admin', 'instructor', 'student'
  - `phone` (text) - Contact number
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `programs`
  Academic programs offered by SIPS
  - `id` (uuid, PK) - Program ID
  - `name` (text) - Program name
  - `description` (text) - Program description
  - `duration` (text) - Program duration
  - `level` (text) - Degree level
  - `curriculum` (text) - Curriculum details
  - `is_active` (boolean) - Program status
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `courses`
  Individual courses within programs
  - `id` (uuid, PK) - Course ID
  - `program_id` (uuid, FK) - Related program
  - `code` (text) - Course code
  - `name` (text) - Course name
  - `description` (text) - Course description
  - `credits` (integer) - Credit hours
  - `is_active` (boolean) - Course status
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. `batches`
  Student batches/cohorts
  - `id` (uuid, PK) - Batch ID
  - `program_id` (uuid, FK) - Related program
  - `name` (text) - Batch name
  - `start_date` (date) - Batch start date
  - `end_date` (date) - Batch end date
  - `is_active` (boolean) - Batch status
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. `students`
  Student-specific information
  - `id` (uuid, FK to profiles) - Student profile ID
  - `student_id` (text, unique) - Student ID number
  - `batch_id` (uuid, FK) - Assigned batch
  - `program_id` (uuid, FK) - Enrolled program
  - `enrollment_date` (date) - Enrollment date
  - `status` (text) - Status: 'active', 'dropout', 'graduated', 'suspended'
  - `payment_status` (text) - Payment status: 'paid', 'pending', 'partial'
  - `created_at` (timestamptz) - Record creation timestamp

  ### 6. `course_enrollments`
  Student course registrations
  - `id` (uuid, PK) - Enrollment ID
  - `student_id` (uuid, FK) - Student profile ID
  - `course_id` (uuid, FK) - Course ID
  - `batch_id` (uuid, FK) - Batch ID
  - `enrolled_at` (timestamptz) - Enrollment timestamp
  - `status` (text) - Status: 'active', 'completed', 'dropped'
  - `grade` (text) - Final grade

  ### 7. `instructors`
  Instructor assignments to courses
  - `id` (uuid, PK) - Assignment ID
  - `instructor_id` (uuid, FK to profiles) - Instructor profile ID
  - `course_id` (uuid, FK) - Course ID
  - `batch_id` (uuid, FK) - Batch ID
  - `assigned_at` (timestamptz) - Assignment timestamp

  ### 8. `lecture_materials`
  Course materials and resources
  - `id` (uuid, PK) - Material ID
  - `course_id` (uuid, FK) - Related course
  - `instructor_id` (uuid, FK to profiles) - Uploaded by instructor
  - `title` (text) - Material title
  - `description` (text) - Material description
  - `file_url` (text) - File storage URL
  - `file_name` (text) - Original file name
  - `file_size` (integer) - File size in bytes
  - `file_type` (text) - MIME type
  - `uploaded_at` (timestamptz) - Upload timestamp

  ### 9. `assignments`
  Course assignments
  - `id` (uuid, PK) - Assignment ID
  - `course_id` (uuid, FK) - Related course
  - `instructor_id` (uuid, FK to profiles) - Created by instructor
  - `title` (text) - Assignment title
  - `description` (text) - Assignment description
  - `due_date` (timestamptz) - Submission deadline
  - `max_score` (integer) - Maximum points
  - `file_url` (text) - Assignment file URL (optional)
  - `created_at` (timestamptz) - Creation timestamp

  ### 10. `assignment_submissions`
  Student assignment submissions
  - `id` (uuid, PK) - Submission ID
  - `assignment_id` (uuid, FK) - Related assignment
  - `student_id` (uuid, FK to profiles) - Submitting student
  - `file_url` (text) - Submission file URL
  - `file_name` (text) - Submitted file name
  - `file_size` (integer) - File size in bytes
  - `comments` (text) - Student comments
  - `submitted_at` (timestamptz) - Submission timestamp
  - `score` (integer) - Awarded score
  - `feedback` (text) - Instructor feedback
  - `graded_at` (timestamptz) - Grading timestamp
  - `graded_by` (uuid, FK to profiles) - Grading instructor
  - `status` (text) - Status: 'submitted', 'graded', 'late'

  ### 11. `payments`
  Student payment records
  - `id` (uuid, PK) - Payment ID
  - `student_id` (uuid, FK to profiles) - Student profile ID
  - `amount` (decimal) - Payment amount
  - `payment_date` (date) - Payment date
  - `payment_slip_url` (text) - Upload payment slip URL
  - `status` (text) - Status: 'pending', 'verified', 'rejected'
  - `verified_by` (uuid, FK to profiles) - Admin who verified
  - `verified_at` (timestamptz) - Verification timestamp
  - `notes` (text) - Admin notes
  - `created_at` (timestamptz) - Record creation timestamp

  ### 12. `notifications`
  System notifications
  - `id` (uuid, PK) - Notification ID
  - `user_id` (uuid, FK to profiles) - Recipient user
  - `type` (text) - Type: 'assignment', 'payment', 'announcement', 'grade'
  - `title` (text) - Notification title
  - `message` (text) - Notification message
  - `link` (text) - Related link (optional)
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Creation timestamp

  ### 13. `applications`
  Program applications from website
  - `id` (uuid, PK) - Application ID
  - `name` (text) - Applicant name
  - `email` (text) - Applicant email
  - `phone` (text) - Contact number
  - `program_id` (uuid, FK) - Applied program
  - `status` (text) - Status: 'pending', 'contacted', 'enrolled', 'rejected'
  - `notes` (text) - Admin notes
  - `created_at` (timestamptz) - Application timestamp

  ### 14. `registrations`
  Online student registrations with payment slips
  - `id` (uuid, PK) - Registration ID
  - `full_name` (text) - Student full name
  - `email` (text) - Student email
  - `phone` (text) - Contact number
  - `program_id` (uuid, FK) - Selected program
  - `address` (text) - Residential address
  - `payment_slip_url` (text) - Payment slip URL
  - `status` (text) - Status: 'pending', 'approved', 'rejected'
  - `processed_by` (uuid, FK to profiles) - Admin who processed
  - `processed_at` (timestamptz) - Processing timestamp
  - `notes` (text) - Admin notes
  - `created_at` (timestamptz) - Registration timestamp

  ## Security - Row Level Security (RLS)

  All tables have RLS enabled with restrictive policies:
  - Students can only view/modify their own data
  - Instructors can manage courses they're assigned to
  - Admins have full access to all data
  - Public tables (applications, registrations) allow inserts from anyone
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE student_status AS ENUM ('active', 'dropout', 'graduated', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'partial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'student',
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration text,
  level text,
  curriculum text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 3. Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  credits integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. Batches table
CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 5. Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  student_id text UNIQUE NOT NULL,
  batch_id uuid REFERENCES batches(id),
  program_id uuid REFERENCES programs(id),
  enrollment_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'active',
  payment_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- 6. Course enrollments table
CREATE TABLE IF NOT EXISTS course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES batches(id),
  enrolled_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  grade text,
  UNIQUE(student_id, course_id, batch_id)
);

-- 7. Instructors table
CREATE TABLE IF NOT EXISTS instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  batch_id uuid REFERENCES batches(id),
  assigned_at timestamptz DEFAULT now(),
  UNIQUE(instructor_id, course_id, batch_id)
);

-- 8. Lecture materials table
CREATE TABLE IF NOT EXISTS lecture_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  file_url text,
  file_name text,
  file_size integer,
  file_type text,
  uploaded_at timestamptz DEFAULT now()
);

-- 9. Assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  due_date timestamptz,
  max_score integer DEFAULT 100,
  file_url text,
  created_at timestamptz DEFAULT now()
);

-- 10. Assignment submissions table
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  file_url text,
  file_name text,
  file_size integer,
  comments text,
  submitted_at timestamptz DEFAULT now(),
  score integer,
  feedback text,
  graded_at timestamptz,
  graded_by uuid REFERENCES profiles(id),
  status text DEFAULT 'submitted',
  UNIQUE(assignment_id, student_id)
);

-- 11. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_date date DEFAULT CURRENT_DATE,
  payment_slip_url text,
  status text DEFAULT 'pending',
  verified_by uuid REFERENCES profiles(id),
  verified_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 12. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 13. Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  program_id uuid REFERENCES programs(id),
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 14. Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  program_id uuid REFERENCES programs(id),
  address text,
  payment_slip_url text,
  status text DEFAULT 'pending',
  processed_by uuid REFERENCES profiles(id),
  processed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecture_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for programs (public read, admin write)
CREATE POLICY "Anyone can view active programs"
  ON programs FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can view all programs"
  ON programs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage programs"
  ON programs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for courses
CREATE POLICY "Authenticated users can view active courses"
  ON courses FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for batches
CREATE POLICY "Authenticated users can view active batches"
  ON batches FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage batches"
  ON batches FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for students
CREATE POLICY "Students can view own record"
  ON students FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins and instructors can view students"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Admins can manage students"
  ON students FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for course_enrollments
CREATE POLICY "Students can view own enrollments"
  ON course_enrollments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Instructors can view their course enrollments"
  ON course_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM instructors
      WHERE instructors.instructor_id = auth.uid()
      AND instructors.course_id = course_enrollments.course_id
    )
  );

CREATE POLICY "Admins can manage enrollments"
  ON course_enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for instructors
CREATE POLICY "Authenticated users can view instructors"
  ON instructors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage instructors"
  ON instructors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for lecture_materials
CREATE POLICY "Enrolled students can view lecture materials"
  ON lecture_materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_enrollments.student_id = auth.uid()
      AND course_enrollments.course_id = lecture_materials.course_id
    )
  );

CREATE POLICY "Instructors can manage their course materials"
  ON lecture_materials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM instructors
      WHERE instructors.instructor_id = auth.uid()
      AND instructors.course_id = lecture_materials.course_id
    )
  );

CREATE POLICY "Admins can manage all materials"
  ON lecture_materials FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for assignments
CREATE POLICY "Enrolled students can view assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_enrollments
      WHERE course_enrollments.student_id = auth.uid()
      AND course_enrollments.course_id = assignments.course_id
    )
  );

CREATE POLICY "Instructors can manage their course assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM instructors
      WHERE instructors.instructor_id = auth.uid()
      AND instructors.course_id = assignments.course_id
    )
  );

CREATE POLICY "Admins can manage all assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for assignment_submissions
CREATE POLICY "Students can view own submissions"
  ON assignment_submissions FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can create own submissions"
  ON assignment_submissions FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update own submissions"
  ON assignment_submissions FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() AND status = 'submitted')
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Instructors can view submissions for their courses"
  ON assignment_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN instructors i ON i.course_id = a.course_id
      WHERE a.id = assignment_submissions.assignment_id
      AND i.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Instructors can grade submissions for their courses"
  ON assignment_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN instructors i ON i.course_id = a.course_id
      WHERE a.id = assignment_submissions.assignment_id
      AND i.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all submissions"
  ON assignment_submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for payments
CREATE POLICY "Students can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can create own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can manage all payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'instructor')
    )
  );

-- RLS Policies for applications (public insert)
CREATE POLICY "Anyone can submit applications"
  ON applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage applications"
  ON applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for registrations (public insert)
CREATE POLICY "Anyone can submit registrations"
  ON registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage registrations"
  ON registrations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
