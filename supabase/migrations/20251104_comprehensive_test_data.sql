-- Comprehensive Test Data for All Admin Pages
-- Run this in Supabase SQL Editor AFTER running 20251103_marks_management_mock_data.sql

-- This creates test data for:
-- ✅ Student Management
-- ✅ Lecturer Management
-- ✅ Application Reviews
-- ✅ Payment Verification
-- ✅ Module Management
-- ✅ Assignment Management
-- ✅ Exam Management
-- ✅ Marks Management
-- ✅ Lecture Material Management

-- Prerequisites: Run 20251103_marks_management_mock_data.sql first
-- That migration creates: faculties, departments, programs, intakes, modules, module_score_weights

BEGIN;

-- ============================================================================
-- LECTURERS (for Lecturer Management page)
-- ============================================================================
INSERT INTO lecturers (id, first_name, last_name, email, contact_number, residential_address, highest_qualification, years_academic_experience, years_industry_experience, is_active, created_at)
VALUES 
  ('10000000-0000-0000-0000-000000000001', 'Dr. Robert', 'Smith', 'robert.smith@sips.edu.lk', '+94771001001', '123 Academic Lane, Colombo 07', 'PhD in Computer Science', 15, 10, true, NOW()),
  ('10000000-0000-0000-0000-000000000002', 'Prof. Jennifer', 'Brown', 'jennifer.brown@sips.edu.lk', '+94771001002', '456 University Road, Colombo 03', 'PhD in Software Engineering', 20, 15, true, NOW()),
  ('10000000-0000-0000-0000-000000000003', 'Dr. Michael', 'Davis', 'michael.davis@sips.edu.lk', '+94771001003', '789 College Street, Nugegoda', 'PhD in Data Science', 12, 8, true, NOW()),
  ('10000000-0000-0000-0000-000000000004', 'Ms. Sarah', 'Wilson', 'sarah.wilson@sips.edu.lk', '+94771001004', '321 Faculty Avenue, Dehiwala', 'MSc in Business Management', 8, 12, true, NOW()),
  ('10000000-0000-0000-0000-000000000005', 'Dr. James', 'Taylor', 'james.taylor@sips.edu.lk', '+94771001005', '654 Teaching Lane, Maharagama', 'PhD in Marketing', 10, 7, true, NOW()),
  ('10000000-0000-0000-0000-000000000006', 'Mr. David', 'Anderson', 'david.anderson@sips.edu.lk', '+94771001006', '987 Institute Road, Moratuwa', 'MSc in Civil Engineering', 6, 15, true, NOW()),
  ('10000000-0000-0000-0000-000000000007', 'Dr. Lisa', 'Martinez', 'lisa.martinez@sips.edu.lk', '+94771001007', '147 Campus Drive, Mount Lavinia', 'PhD in Electrical Engineering', 14, 9, true, NOW()),
  ('10000000-0000-0000-0000-000000000008', 'Prof. William', 'Garcia', 'william.garcia@sips.edu.lk', '+94771001008', '258 Education Street, Kotte', 'PhD in Information Systems', 18, 11, true, NOW()),
  ('10000000-0000-0000-0000-000000000009', 'Ms. Emma', 'Rodriguez', 'emma.rodriguez@sips.edu.lk', '+94771001009', '369 Learning Lane, Battaramulla', 'MSc in Accounting', 7, 10, true, NOW()),
  ('10000000-0000-0000-0000-000000000010', 'Dr. Thomas', 'Lee', 'thomas.lee@sips.edu.lk', '+94771001010', '741 Scholar Road, Rajagiriya', 'PhD in Finance', 11, 13, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- LECTURER ASSIGNMENTS (Link lecturers to modules)
-- ============================================================================
-- Get module and related IDs from the migration data
INSERT INTO lecturer_assignments (lecturer_id, module_id, intake_id, assigned_at, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000001',
  id,
  intake_id,
  NOW(),
  true
FROM modules 
WHERE module_code IN ('BBA101', 'BBA102')
ON CONFLICT DO NOTHING;

INSERT INTO lecturer_assignments (lecturer_id, module_id, intake_id, assigned_at, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000002',
  id,
  intake_id,
  NOW(),
  true
FROM modules 
WHERE module_code IN ('SE101', 'SE102')
ON CONFLICT DO NOTHING;

INSERT INTO lecturer_assignments (lecturer_id, module_id, intake_id, assigned_at, is_active)
SELECT 
  '10000000-0000-0000-0000-000000000003',
  id,
  intake_id,
  NOW(),
  true
FROM modules 
WHERE module_code IN ('DS101', 'DS102')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- STUDENTS (for Student Management page)
-- ============================================================================
-- Create 15 test students with realistic data
INSERT INTO students (
  id, student_id, name_with_initials, nic, date_of_birth, 
  permanent_address, mobile_number, 
  emergency_contact_name, emergency_contact_relationship, emergency_contact_mobile,
  ol_qualifications, al_qualifications, other_qualifications,
  program_id, intake_id, enrollment_date, status, payment_status
)
SELECT 
  gen_random_uuid(),
  'STU2024' || LPAD(seq::text, 4, '0'),
  CASE seq
    WHEN 1 THEN 'K.A. Perera'
    WHEN 2 THEN 'S.M. Silva'
    WHEN 3 THEN 'R.P. Fernando'
    WHEN 4 THEN 'N.T. Jayawardena'
    WHEN 5 THEN 'D.L. Dissanayake'
    WHEN 6 THEN 'A.K. Gunasekara'
    WHEN 7 THEN 'M.S. Rajapaksa'
    WHEN 8 THEN 'P.R. Wickramasinghe'
    WHEN 9 THEN 'T.N. Bandara'
    WHEN 10 THEN 'L.K. Abeysekara'
    WHEN 11 THEN 'W.A. Rathnayake'
    WHEN 12 THEN 'H.M. Kumaratunga'
    WHEN 13 THEN 'G.P. Wijesinghe'
    WHEN 14 THEN 'C.D. Samaraweera'
    WHEN 15 THEN 'J.R. Mendis'
  END,
  '199' || (5 + (seq % 5))::text || '0' || ((seq % 9) + 1)::text || '12345678' || LPAD(seq::text, 2, '0'),
  ('199' || (5 + (seq % 5))::text || '-0' || ((seq % 9) + 1)::text || '-' || LPAD((seq % 28 + 1)::text, 2, '0'))::date,
  seq || ' Station Road, Colombo ' || (seq % 10 + 1)::text,
  '+9477' || LPAD((1000000 + seq)::text, 7, '0'),
  'Parent ' || seq,
  CASE seq % 2 WHEN 0 THEN 'Father' ELSE 'Mother' END,
  '+9471' || LPAD((2000000 + seq)::text, 7, '0'),
  CASE seq % 3
    WHEN 0 THEN '9A'
    WHEN 1 THEN '6A 2B 1C'
    ELSE '7A 1B 1C'
  END,
  CASE seq % 3
    WHEN 0 THEN '3A'
    WHEN 1 THEN '2A 1B'
    ELSE '1A 2B'
  END,
  CASE seq % 5 WHEN 0 THEN 'Diploma in IT' ELSE NULL END,
  (SELECT id FROM programs LIMIT 1 OFFSET (seq % 6)),
  (SELECT id FROM intakes LIMIT 1 OFFSET (seq % 5)),
  ('2024-0' || ((seq % 6) + 1)::text || '-15')::date,
  CASE seq % 10 WHEN 0 THEN 'dropout' ELSE 'active' END,
  CASE seq % 4 WHEN 0 THEN 'pending' ELSE 'paid' END
FROM generate_series(1, 15) AS seq
ON CONFLICT DO NOTHING;

-- ============================================================================
-- APPLICATIONS (for Review Applications page)
-- ============================================================================
INSERT INTO applications (
  name, name_with_initials, email, phone, nic, date_of_birth,
  permanent_address, program_id, ol_qualifications, al_qualifications,
  other_qualifications, status, notes, created_at
)
SELECT 
  CASE seq
    WHEN 1 THEN 'Kasun Indika Perera'
    WHEN 2 THEN 'Saman Mahesh Silva'
    WHEN 3 THEN 'Ruwan Prasanna Fernando'
    WHEN 4 THEN 'Nuwan Tharaka Jayawardena'
    WHEN 5 THEN 'Dilshan Lahiru Dissanayake'
    WHEN 6 THEN 'Anjali Kumari Gunasekara'
    WHEN 7 THEN 'Madhavi Sandamali Rajapaksa'
    WHEN 8 THEN 'Priyanka Rashmini Wickramasinghe'
    WHEN 9 THEN 'Tharindu Nishan Bandara'
    WHEN 10 THEN 'Lakshitha Kavinda Abeysekara'
    WHEN 11 THEN 'Waruna Ashen Rathnayake'
    WHEN 12 THEN 'Hasini Madhushika Kumaratunga'
    WHEN 13 THEN 'Gayani Priyanjali Wijesinghe'
    WHEN 14 THEN 'Chamara Dinesh Samaraweera'
    WHEN 15 THEN 'Janith Ruwantha Mendis'
    WHEN 16 THEN 'Nethmi Ishara Gamage'
    WHEN 17 THEN 'Dinuka Sampath Jayasuriya'
    WHEN 18 THEN 'Kaveesha Lakmali Herath'
    WHEN 19 THEN 'Isuru Dananjaya Pathirana'
    WHEN 20 THEN 'Anusha Madushani Ranasinghe'
  END,
  CASE seq
    WHEN 1 THEN 'K.I. Perera'
    WHEN 2 THEN 'S.M. Silva'
    WHEN 3 THEN 'R.P. Fernando'
    WHEN 4 THEN 'N.T. Jayawardena'
    WHEN 5 THEN 'D.L. Dissanayake'
    WHEN 6 THEN 'A.K. Gunasekara'
    WHEN 7 THEN 'M.S. Rajapaksa'
    WHEN 8 THEN 'P.R. Wickramasinghe'
    WHEN 9 THEN 'T.N. Bandara'
    WHEN 10 THEN 'L.K. Abeysekara'
    WHEN 11 THEN 'W.A. Rathnayake'
    WHEN 12 THEN 'H.M. Kumaratunga'
    WHEN 13 THEN 'G.P. Wijesinghe'
    WHEN 14 THEN 'C.D. Samaraweera'
    WHEN 15 THEN 'J.R. Mendis'
    WHEN 16 THEN 'N.I. Gamage'
    WHEN 17 THEN 'D.S. Jayasuriya'
    WHEN 18 THEN 'K.L. Herath'
    WHEN 19 THEN 'I.D. Pathirana'
    WHEN 20 THEN 'A.M. Ranasinghe'
  END,
  'applicant' || seq || '@test.com',
  '+9477' || LPAD((3000000 + seq)::text, 7, '0'),
  '199' || (6 + (seq % 4))::text || '0' || ((seq % 9) + 1)::text || '12345678' || LPAD(seq::text, 2, '0'),
  ('199' || (6 + (seq % 4))::text || '-0' || ((seq % 9) + 1)::text || '-' || LPAD((seq % 28 + 1)::text, 2, '0'))::date,
  seq || ' Application Road, Kandy ' || (seq % 10 + 1)::text,
  (SELECT id FROM programs LIMIT 1 OFFSET (seq % 6)),
  CASE seq % 4
    WHEN 0 THEN '9A'
    WHEN 1 THEN '6A 2B 1C'
    WHEN 2 THEN '7A 1B 1C'
    ELSE '8A 1C'
  END,
  CASE seq % 4
    WHEN 0 THEN '3A'
    WHEN 1 THEN '2A 1B'
    WHEN 2 THEN '1A 2B'
    ELSE '2A 1C'
  END,
  CASE seq % 5 WHEN 0 THEN 'Certificate in Programming' ELSE NULL END,
  CASE seq % 4
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'approved'
    WHEN 2 THEN 'rejected'
    ELSE 'under_review'
  END,
  CASE seq % 4
    WHEN 2 THEN 'Incomplete documentation'
    ELSE NULL
  END,
  NOW() - (seq || ' days')::interval
FROM generate_series(1, 20) AS seq
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PAYMENTS (for Verify Payments page)
-- ============================================================================
INSERT INTO payments (
  student_id, program_id, intake_id, payment_type, installment_number,
  amount, payment_date, payment_slip_url, status, verified_at, notes
)
SELECT 
  s.id,
  s.program_id,
  s.intake_id,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'complete'
    ELSE 'installment'
  END,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN NULL
    ELSE ((ROW_NUMBER() OVER ()) % 4) + 1
  END,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 500000
    ELSE 125000
  END,
  CURRENT_DATE - ((ROW_NUMBER() OVER ()) || ' days')::interval,
  'https://example.com/receipts/receipt_' || (ROW_NUMBER() OVER ())::text || '.pdf',
  CASE (ROW_NUMBER() OVER ()) % 5
    WHEN 0 THEN 'pending'
    WHEN 1 THEN 'pending'
    WHEN 2 THEN 'verified'
    WHEN 3 THEN 'verified'
    ELSE 'rejected'
  END,
  CASE (ROW_NUMBER() OVER ()) % 5
    WHEN 2 THEN CURRENT_DATE - ((ROW_NUMBER() OVER ()) || ' days')::interval
    WHEN 3 THEN CURRENT_DATE - ((ROW_NUMBER() OVER ()) || ' days')::interval
    ELSE NULL
  END,
  CASE (ROW_NUMBER() OVER ()) % 5
    WHEN 4 THEN 'Invalid payment slip'
    ELSE NULL
  END
FROM students s
LIMIT 20
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ASSIGNMENTS (for Assignment Management page)
-- ============================================================================
INSERT INTO assignments (
  module_id, intake_id, title, description, due_date, max_marks, is_published, assignment_file_url
)
SELECT 
  m.id,
  m.intake_id,
  m.module_name || ' - Assignment ' || seq,
  'Complete the exercises for ' || m.module_name || '. This assignment covers topics from weeks ' || seq || '-' || (seq + 2) || '.',
  (CURRENT_DATE + ((seq * 14) || ' days')::interval)::date,
  100,
  seq <= 2,
  'https://example.com/assignments/' || m.module_code || '_assignment_' || seq || '.pdf'
FROM modules m
CROSS JOIN generate_series(1, 3) AS seq
ON CONFLICT DO NOTHING;

-- ============================================================================
-- EXAMS (for Exam Management page)
-- ============================================================================
INSERT INTO exams (
  module_id, intake_id, exam_name, description, exam_date, exam_time, duration_minutes, max_marks, is_published
)
SELECT 
  m.id,
  m.intake_id,
  m.module_name || ' - ' || CASE seq WHEN 1 THEN 'Mid-Term Exam' ELSE 'Final Exam' END,
  CASE seq 
    WHEN 1 THEN 'Mid-term examination covering the first half of the course'
    ELSE 'Final examination covering all course material'
  END,
  (CURRENT_DATE + ((seq * 60) || ' days')::interval)::date,
  CASE seq WHEN 1 THEN '09:00' ELSE '14:00' END,
  CASE seq WHEN 1 THEN 120 ELSE 180 END,
  100,
  seq = 1
FROM modules m
CROSS JOIN generate_series(1, 2) AS seq
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ASSIGNMENT SUBMISSIONS (for Marks Management)
-- ============================================================================
-- Use existing profiles (student users) for submissions
INSERT INTO assignment_submissions (
  assignment_id, student_id, submission_url, marks_obtained, feedback, submitted_at, graded_at
)
SELECT 
  a.id,
  p.id,
  'https://example.com/submissions/' || p.email || '_assignment_' || a.id || '.pdf',
  60 + ((ROW_NUMBER() OVER ()) % 40),
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'Excellent work! Well structured and comprehensive.'
    WHEN 1 THEN 'Good effort. Consider improving your analysis.'
    ELSE NULL
  END,
  CURRENT_DATE - ((ROW_NUMBER() OVER ()) || ' days')::interval,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN CURRENT_DATE - ((ROW_NUMBER() OVER ()) || ' days')::interval
    WHEN 1 THEN CURRENT_DATE - ((ROW_NUMBER() OVER ()) || ' days')::interval
    ELSE NULL
  END
FROM assignments a
CROSS JOIN (SELECT id, email FROM profiles WHERE role = 'student' LIMIT 3) p
WHERE a.is_published = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- EXAM SUBMISSIONS (for Marks Management)
-- ============================================================================
-- Use existing profiles (student users) for submissions
INSERT INTO exam_submissions (
  exam_id, student_id, score, feedback, graded_at
)
SELECT 
  e.id,
  p.id,
  65 + ((ROW_NUMBER() OVER ()) % 35),
  CASE (ROW_NUMBER() OVER ()) % 4
    WHEN 0 THEN 'Outstanding performance!'
    WHEN 1 THEN 'Very good work.'
    WHEN 2 THEN 'Satisfactory performance.'
    ELSE NULL
  END,
  e.exam_date + '7 days'::interval
FROM exams e
CROSS JOIN (SELECT id FROM profiles WHERE role = 'student' LIMIT 3) p
WHERE e.is_published = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- OVERALL SCORES (for Marks Management)
-- ============================================================================
-- Use existing profiles (student users) for scores
INSERT INTO overall_scores (
  student_id, module_id, intake_id, assignment_score, exam_score, overall_score, grade, is_finalized
)
SELECT 
  p.id,
  m.id,
  m.intake_id,
  70 + ((ROW_NUMBER() OVER ()) % 25),
  75 + ((ROW_NUMBER() OVER ()) % 20),
  73 + ((ROW_NUMBER() OVER ()) % 22),
  CASE 
    WHEN (73 + ((ROW_NUMBER() OVER ()) % 22)) >= 85 THEN 'A'
    WHEN (73 + ((ROW_NUMBER() OVER ()) % 22)) >= 70 THEN 'B'
    WHEN (73 + ((ROW_NUMBER() OVER ()) % 22)) >= 55 THEN 'C'
    ELSE 'D'
  END,
  (ROW_NUMBER() OVER ()) % 2 = 0
FROM modules m
CROSS JOIN (SELECT id FROM profiles WHERE role = 'student' LIMIT 3) p
ON CONFLICT DO NOTHING;

-- ============================================================================
-- LECTURE MATERIALS (for Lecture Material Management)
-- ============================================================================
INSERT INTO lecture_materials (
  title, week_number, course_id, file_type, file_url, description, is_active
)
SELECT 
  'Week ' || seq || ': ' || 
  CASE seq % 8
    WHEN 1 THEN 'Introduction and Fundamentals'
    WHEN 2 THEN 'Core Concepts'
    WHEN 3 THEN 'Advanced Topics Part 1'
    WHEN 4 THEN 'Advanced Topics Part 2'
    WHEN 5 THEN 'Practical Applications'
    WHEN 6 THEN 'Case Studies'
    WHEN 7 THEN 'Review and Practice'
    ELSE 'Exam Preparation'
  END,
  seq,
  c.id,
  CASE (seq + c.id::text::int) % 4
    WHEN 0 THEN 'pdf'
    WHEN 1 THEN 'ppt'
    WHEN 2 THEN 'word'
    ELSE 'excel'
  END,
  'https://example.com/materials/' || c.code || '_week_' || seq || '.pdf',
  'Learning materials for ' || c.name || ' - Week ' || seq,
  true
FROM courses c
CROSS JOIN generate_series(1, 12) AS seq
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Check what was created
SELECT 'Lecturers' as table_name, COUNT(*) as count FROM lecturers
UNION ALL
SELECT 'Lecturer Assignments', COUNT(*) FROM lecturer_assignments
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Applications', COUNT(*) FROM applications
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Assignments', COUNT(*) FROM assignments
UNION ALL
SELECT 'Exams', COUNT(*) FROM exams
UNION ALL
SELECT 'Assignment Submissions', COUNT(*) FROM assignment_submissions
UNION ALL
SELECT 'Exam Submissions', COUNT(*) FROM exam_submissions
UNION ALL
SELECT 'Overall Scores', COUNT(*) FROM overall_scores
UNION ALL
SELECT 'Lecture Materials', COUNT(*) FROM lecture_materials
ORDER BY table_name;

-- Check application status distribution
SELECT status, COUNT(*) as count
FROM applications
GROUP BY status
ORDER BY status;

-- Check payment status distribution
SELECT status, COUNT(*) as count
FROM payments
GROUP BY status
ORDER BY status;

-- Success message
SELECT '🎉 COMPREHENSIVE TEST DATA CREATED SUCCESSFULLY!' as message,
       'All admin pages now have realistic test data!' as note;
