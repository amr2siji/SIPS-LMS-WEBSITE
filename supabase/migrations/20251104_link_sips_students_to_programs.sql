-- Link SIPS Student Profiles to Student Records and Programs
-- Run this in Supabase SQL Editor AFTER running:
-- 1. restore_sips_user_profiles.sql
-- 2. 20251103_marks_management_mock_data.sql

-- This creates student records and program enrollments for your SIPS student users

BEGIN;

-- ============================================================================
-- CREATE STUDENT RECORDS for SIPS student users
-- ============================================================================
-- Insert student records that link to profiles
INSERT INTO students (
  id, -- Use the same ID as the profile for easy linking
  student_id,
  name_with_initials,
  nic,
  date_of_birth,
  permanent_address,
  mobile_number,
  emergency_contact_name,
  emergency_contact_relationship,
  emergency_contact_mobile,
  ol_qualifications,
  al_qualifications,
  other_qualifications,
  program_id,
  intake_id,
  enrollment_date,
  status,
  payment_status
)
SELECT 
  p.id, -- Same ID as profile
  'SIPS' || SUBSTRING(p.email FROM 1 FOR 8), -- Generate student ID from email
  CASE 
    WHEN p.email = 'students@sips.edu.lk' THEN 'S. User'
    WHEN p.email = 'student1@sips.edu.lk' THEN 'S.1. Student'
    WHEN p.email = 'student2@sips.edu.lk' THEN 'S.2. Student'
    WHEN p.email = 'student3@sips.edu.lk' THEN 'S.3. Student'
    ELSE 'Student User'
  END,
  '199812345678' || (ROW_NUMBER() OVER ())::text, -- Dummy NIC
  '1998-05-15'::date,
  (ROW_NUMBER() OVER ())::text || ' Student Road, Colombo 07',
  '+94771234567',
  'Parent Name',
  'Father',
  '+94712345678',
  '9A',
  '3A',
  NULL,
  (SELECT id FROM programs LIMIT 1), -- Enroll in first program
  (SELECT id FROM intakes LIMIT 1),  -- First intake
  CURRENT_DATE - INTERVAL '6 months', -- Enrolled 6 months ago
  'active',
  'paid'
FROM profiles p
WHERE p.role = 'student' 
  AND p.email LIKE '%@sips.edu.lk'
  AND NOT EXISTS (SELECT 1 FROM students s WHERE s.id = p.id)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CREATE STUDENT PROGRAM ENROLLMENTS (Multiple programs per student)
-- ============================================================================
-- Enroll each student in multiple programs for testing
INSERT INTO student_programs (
  student_id,
  program_id,
  intake_id,
  enrollment_date,
  status,
  is_active
)
SELECT 
  p.id as student_id,
  pr.id as program_id,
  i.id as intake_id,
  CURRENT_DATE - ((ROW_NUMBER() OVER ()) * INTERVAL '1 month'),
  'active',
  true
FROM profiles p
CROSS JOIN (
  SELECT id FROM programs LIMIT 3 -- Enroll in first 3 programs
) pr
CROSS JOIN (
  SELECT id FROM intakes LIMIT 1 -- Use first intake for each
) i
WHERE p.role = 'student' 
  AND p.email LIKE '%@sips.edu.lk'
ON CONFLICT (student_id, program_id, intake_id) DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check created student records
SELECT 
  s.id,
  s.student_id,
  s.name_with_initials,
  p.email,
  p.full_name,
  s.status as student_status,
  s.payment_status
FROM students s
INNER JOIN profiles p ON s.id = p.id
WHERE p.role = 'student' AND p.email LIKE '%@sips.edu.lk';

-- Check program enrollments
SELECT 
  sp.id,
  p.email,
  p.full_name,
  pr.name as program_name,
  i.intake_name,
  sp.status,
  sp.enrollment_date
FROM student_programs sp
INNER JOIN students s ON sp.student_id = s.id
INNER JOIN profiles p ON s.id = p.id
INNER JOIN programs pr ON sp.program_id = pr.id
LEFT JOIN intakes i ON sp.intake_id = i.id
WHERE p.email LIKE '%@sips.edu.lk';

-- Success message
SELECT 
  '✅ Student records and enrollments created!' as message,
  COUNT(*) as student_count
FROM students
WHERE id IN (SELECT id FROM profiles WHERE role = 'student' AND email LIKE '%@sips.edu.lk');
