-- =====================================================
-- ALLOW MOCK DATA CREATION
-- This migration removes FK constraints to allow creation 
-- of test data without auth.users
-- Date: November 2, 2025
-- =====================================================

-- Drop the FK constraint on students table
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_id_fkey;

-- Drop the FK constraint on payments table for student_id
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_student_id_fkey;

-- Students and payments tables no longer require profiles/auth.users
-- This allows creating test students and payments for development/testing

-- Note: In production, you may want to re-enable these constraints
-- ALTER TABLE students ADD CONSTRAINT students_id_fkey 
--   FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE;
-- ALTER TABLE payments ADD CONSTRAINT payments_student_id_fkey 
--   FOREIGN KEY (student_id) REFERENCES profiles(id) ON DELETE CASCADE;
