-- Add Mock Lecture Materials and Assignments for Student Portal Testing
-- This script adds sample data for lecture materials and assignments across different modules

-- ============================================
-- CLEANUP EXISTING MOCK DATA (for re-runs)
-- ============================================
-- Delete existing mock submissions, assignments, and materials to prevent duplicates
DELETE FROM assignment_submissions WHERE submission_url LIKE '%/lms-files/submissions/%';
DELETE FROM assignments WHERE description LIKE '%Download the assignment file from the course materials section%' 
   OR description LIKE '%Submit as PDF document%'
   OR description LIKE '%Include objectives and methodology%';
DELETE FROM lecture_materials WHERE file_url LIKE '%/lms-files/lecture-materials/%';

-- ============================================
-- LECTURE MATERIALS MOCK DATA
-- ============================================

-- Get some module IDs to use (lecture_materials uses module_id)
DO $$
DECLARE
  v_module_ids UUID[];
  v_instructor_id UUID;
BEGIN
  -- Get first instructor ID
  SELECT id INTO v_instructor_id FROM profiles WHERE role = 'instructor' LIMIT 1;
  
  -- Get array of module IDs
  SELECT ARRAY_AGG(id) INTO v_module_ids FROM modules WHERE is_active = true LIMIT 10;

  -- Insert lecture materials for different modules
  -- Materials for Module 1
  IF array_length(v_module_ids, 1) >= 1 THEN
    INSERT INTO lecture_materials (module_id, week_number, title, file_type, file_url, description, uploaded_by, uploaded_at) VALUES
    (v_module_ids[1], 1, 'Introduction to the Subject - Week 1', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/intro_week1.pdf', 'Overview of course content, learning outcomes, and expectations', v_instructor_id, NOW() - INTERVAL '30 days'),
    (v_module_ids[1], 1, 'Chapter 1: Fundamentals', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/chapter1_fundamentals.pdf', 'Basic concepts and foundational knowledge', v_instructor_id, NOW() - INTERVAL '28 days'),
    (v_module_ids[1], 2, 'Week 2 Lecture Slides', 'ppt', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/week2_slides.pptx', 'PowerPoint presentation covering key topics', v_instructor_id, NOW() - INTERVAL '23 days'),
    (v_module_ids[1], 3, 'Supplementary Reading Material', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/supplementary_reading.pdf', 'Additional resources for deeper understanding', v_instructor_id, NOW() - INTERVAL '20 days'),
    (v_module_ids[1], 4, 'Tutorial Exercises - Set 1', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/tutorial_set1.pdf', 'Practice problems and exercises', v_instructor_id, NOW() - INTERVAL '18 days');
  END IF;

  -- Materials for Module 2
  IF array_length(v_module_ids, 1) >= 2 THEN
    INSERT INTO lecture_materials (module_id, week_number, title, file_type, file_url, description, uploaded_by, uploaded_at) VALUES
    (v_module_ids[2], 1, 'Course Overview and Syllabus', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/syllabus.pdf', 'Complete course syllabus and schedule', v_instructor_id, NOW() - INTERVAL '25 days'),
    (v_module_ids[2], 2, 'Week 3 Lecture Notes', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/week3_notes.pdf', 'Detailed lecture notes with examples', v_instructor_id, NOW() - INTERVAL '15 days'),
    (v_module_ids[2], 3, 'Lab Exercise 1', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/lab_exercise1.pdf', 'Hands-on practical exercises', v_instructor_id, NOW() - INTERVAL '12 days'),
    (v_module_ids[2], 4, 'Video Lecture Recording - Part 1', 'word', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/video_lecture_part1.mp4', 'Recorded lecture session for review', v_instructor_id, NOW() - INTERVAL '10 days');
  END IF;

  -- Materials for Module 3
  IF array_length(v_module_ids, 1) >= 3 THEN
    INSERT INTO lecture_materials (module_id, week_number, title, file_type, file_url, description, uploaded_by, uploaded_at) VALUES
    (v_module_ids[3], 4, 'Mid-term Study Guide', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/midterm_study_guide.pdf', 'Comprehensive guide for mid-term preparation', v_instructor_id, NOW() - INTERVAL '14 days'),
    (v_module_ids[3], 5, 'Case Study Analysis', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/case_study.pdf', 'Real-world case study for analysis', v_instructor_id, NOW() - INTERVAL '8 days'),
    (v_module_ids[3], 5, 'Week 5 Presentation Slides', 'ppt', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/week5_presentation.pptx', 'Lecture slides with diagrams', v_instructor_id, NOW() - INTERVAL '5 days');
  END IF;

  -- Materials for Module 4
  IF array_length(v_module_ids, 1) >= 4 THEN
    INSERT INTO lecture_materials (module_id, week_number, title, file_type, file_url, description, uploaded_by, uploaded_at) VALUES
    (v_module_ids[4], 6, 'Chapter 5: Advanced Topics', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/chapter5_advanced.pdf', 'Advanced concepts and techniques', v_instructor_id, NOW() - INTERVAL '7 days'),
    (v_module_ids[4], 7, 'Reference Materials', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/reference_materials.pdf', 'Additional reference documents', v_instructor_id, NOW() - INTERVAL '3 days'),
    (v_module_ids[4], 8, 'Tutorial Video Series', 'excel', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/tutorial_video.mp4', 'Step-by-step tutorial videos', v_instructor_id, NOW() - INTERVAL '2 days');
  END IF;

  -- Materials for Module 5
  IF array_length(v_module_ids, 1) >= 5 THEN
    INSERT INTO lecture_materials (module_id, week_number, title, file_type, file_url, description, uploaded_by, uploaded_at) VALUES
    (v_module_ids[5], 2, 'Introduction to Advanced Concepts', 'pdf', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/advanced_intro.pdf', 'Getting started with advanced topics', v_instructor_id, NOW() - INTERVAL '16 days'),
    (v_module_ids[5], 3, 'Practical Examples', 'ppt', 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/lecture-materials/practical_examples.pptx', 'Real-world application examples', v_instructor_id, NOW() - INTERVAL '11 days');
  END IF;

END $$;

-- ============================================
-- ASSIGNMENTS MOCK DATA
-- ============================================

DO $$
DECLARE
  v_module_ids UUID[];
  v_instructor_id UUID;
BEGIN
  -- Get first instructor (lecturer) ID
  SELECT id INTO v_instructor_id FROM profiles WHERE role = 'instructor' LIMIT 1;
  
  -- Get array of module IDs
  SELECT ARRAY_AGG(id) INTO v_module_ids FROM modules WHERE is_active = true LIMIT 10;

  -- Insert assignments for different modules (assignments table has: module_id, created_by)
  -- Note: assignment_file_url doesn't exist, submissions use submission_url
  -- Assignments for Module 1
  IF array_length(v_module_ids, 1) >= 1 THEN
    INSERT INTO assignments (
      module_id, 
      title, 
      description, 
      due_date, 
      max_marks, 
      is_published, 
      created_at
    ) VALUES
    (v_module_ids[1], 'Assignment 1: Fundamentals Quiz', 'Complete the quiz covering basic concepts from Week 1-2. Download the assignment file from the course materials section.', NOW() - INTERVAL '5 days', 20, true, NOW() - INTERVAL '15 days'),
    (v_module_ids[1], 'Assignment 2: Research Paper', 'Write a 2000-word research paper on the given topic. Submit as PDF document.', NOW() + INTERVAL '7 days', 30, true, NOW() - INTERVAL '10 days'),
    (v_module_ids[1], 'Assignment 3: Group Project Proposal', 'Submit a project proposal with your team (3-5 members). Include objectives and methodology.', NOW() + INTERVAL '14 days', 25, true, NOW() - INTERVAL '5 days');
  END IF;

  -- Assignments for Module 2
  IF array_length(v_module_ids, 1) >= 2 THEN
    INSERT INTO assignments (
      module_id, 
      title, 
      description, 
      due_date, 
      max_marks, 
      is_published, 
      created_at
    ) VALUES
    (v_module_ids[2], 'Lab Assignment 1: Practical Exercises', 'Complete the lab exercises and submit your report in Word or PDF format.', NOW() + INTERVAL '3 days', 15, true, NOW() - INTERVAL '8 days'),
    (v_module_ids[2], 'Mid-term Project', 'Individual project covering topics from Week 1-6. Include code and documentation.', NOW() + INTERVAL '21 days', 40, true, NOW() - INTERVAL '12 days'),
    (v_module_ids[2], 'Case Study Analysis Report', 'Analyze the provided case study and submit findings with recommendations.', NOW() + INTERVAL '10 days', 25, true, NOW() - INTERVAL '6 days');
  END IF;

  -- Assignments for Module 3
  IF array_length(v_module_ids, 1) >= 3 THEN
    INSERT INTO assignments (
      module_id, 
      title, 
      description, 
      due_date, 
      max_marks, 
      is_published, 
      created_at
    ) VALUES
    (v_module_ids[3], 'Assignment 4: Problem Set', 'Solve all problems in the attached worksheet. Show all working steps.', NOW() + INTERVAL '5 days', 20, true, NOW() - INTERVAL '7 days'),
    (v_module_ids[3], 'Presentation Assignment', 'Create a 10-minute presentation on your chosen topic with slides.', NOW() + INTERVAL '18 days', 30, true, NOW() - INTERVAL '4 days'),
    (v_module_ids[3], 'Final Project Outline', 'Submit detailed outline for your final project including timeline and resources needed.', NOW() + INTERVAL '12 days', 15, true, NOW() - INTERVAL '3 days');
  END IF;

  -- Assignments for Module 4
  IF array_length(v_module_ids, 1) >= 4 THEN
    INSERT INTO assignments (
      module_id, 
      title, 
      description, 
      due_date, 
      max_marks, 
      is_published, 
      created_at
    ) VALUES
    (v_module_ids[4], 'Weekly Quiz 1', 'Online quiz covering Week 1 material. Multiple choice and short answer questions.', NOW() - INTERVAL '2 days', 10, true, NOW() - INTERVAL '9 days'),
    (v_module_ids[4], 'Essay Assignment', 'Write a critical essay (1500 words minimum) on the assigned topic.', NOW() + INTERVAL '15 days', 35, true, NOW() - INTERVAL '5 days'),
    (v_module_ids[4], 'Practical Lab Test', 'Complete the practical test during lab session. Hands-on assessment.', NOW() + INTERVAL '8 days', 20, true, NOW() - INTERVAL '2 days');
  END IF;

  -- Assignments for Module 5
  IF array_length(v_module_ids, 1) >= 5 THEN
    INSERT INTO assignments (
      module_id, 
      title, 
      description, 
      due_date, 
      max_marks, 
      is_published, 
      created_at
    ) VALUES
    (v_module_ids[5], 'Literature Review', 'Review and summarize 5 recent research papers related to course topics.', NOW() + INTERVAL '20 days', 25, true, NOW() - INTERVAL '6 days'),
    (v_module_ids[5], 'Group Discussion Participation', 'Active participation in online discussion forum. Weekly contributions required.', NOW() + INTERVAL '25 days', 10, true, NOW() - INTERVAL '8 days');
  END IF;

END $$;

-- Add some sample assignment submissions (some completed, some pending)
DO $$
DECLARE
  v_student_ids UUID[];
  v_assignment_ids UUID[];
BEGIN
  -- Get student IDs
  SELECT ARRAY_AGG(id) INTO v_student_ids FROM profiles WHERE role = 'student' LIMIT 5;
  
  -- Get assignment IDs
  SELECT ARRAY_AGG(id) INTO v_assignment_ids FROM assignments LIMIT 10;

  -- Create some submissions for testing (mix of submitted and pending)
  -- Note: assignment_submissions uses submission_url (not submission_file_url)
  -- Using ON CONFLICT DO NOTHING to prevent duplicate key errors
  IF array_length(v_student_ids, 1) >= 1 AND array_length(v_assignment_ids, 1) >= 1 THEN
    -- Student 1 has submitted some assignments
    INSERT INTO assignment_submissions (assignment_id, student_id, submission_url, submitted_at, marks_obtained, feedback, graded_at, status) VALUES
    (v_assignment_ids[1], v_student_ids[1], 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/submissions/student1_assignment1.pdf', NOW() - INTERVAL '3 days', 18, 'Good work! Well structured response.', NOW() - INTERVAL '1 day', 'graded'),
    (v_assignment_ids[4], v_student_ids[1], 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/submissions/student1_assignment4.pdf', NOW() - INTERVAL '5 days', 13, 'Needs improvement in some areas.', NOW() - INTERVAL '2 days', 'graded')
    ON CONFLICT (assignment_id, student_id) DO NOTHING;
  END IF;

  IF array_length(v_student_ids, 1) >= 2 AND array_length(v_assignment_ids, 1) >= 2 THEN
    -- Student 2 has different submissions
    INSERT INTO assignment_submissions (assignment_id, student_id, submission_url, submitted_at, marks_obtained, feedback, graded_at, status) VALUES
    (v_assignment_ids[1], v_student_ids[2], 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/submissions/student2_assignment1.pdf', NOW() - INTERVAL '4 days', 20, 'Excellent work!', NOW() - INTERVAL '1 day', 'graded'),
    (v_assignment_ids[7], v_student_ids[2], 'https://krgumnweqxgdqtjazntb.supabase.co/storage/v1/object/public/lms-files/submissions/student2_assignment7.pdf', NOW() - INTERVAL '1 day', NULL, NULL, NULL, 'pending')
    ON CONFLICT (assignment_id, student_id) DO NOTHING;
  END IF;

END $$;

-- Display summary
DO $$
DECLARE
  v_material_count INTEGER;
  v_assignment_count INTEGER;
  v_submission_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_material_count FROM lecture_materials;
  SELECT COUNT(*) INTO v_assignment_count FROM assignments;
  SELECT COUNT(*) INTO v_submission_count FROM assignment_submissions;
  
  RAISE NOTICE 'Mock Data Summary:';
  RAISE NOTICE '  - Lecture Materials: %', v_material_count;
  RAISE NOTICE '  - Assignments: %', v_assignment_count;
  RAISE NOTICE '  - Assignment Submissions: %', v_submission_count;
END $$;
