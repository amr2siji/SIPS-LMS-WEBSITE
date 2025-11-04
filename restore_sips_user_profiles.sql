-- Restore Missing Profiles for SIPS Users
-- Run this in Supabase SQL Editor

-- First, check all existing auth users to see what we have
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
ORDER BY created_at;

-- Add profile for admin@sips.edu.lk (only if auth user exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@sips.edu.lk'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Add profile for admins@sips.edu.lk (only if auth user exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin User 2',
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admins@sips.edu.lk'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Add profile for instructor@sips.edu.lk (only if auth user exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Instructor',
  'instructor',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'instructor@sips.edu.lk'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Add profile for students@sips.edu.lk (only if auth user exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Student User',
  'student',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'students@sips.edu.lk'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Add profile for student1@sips.edu.lk (only if auth user exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Student 1',
  'student',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'student1@sips.edu.lk'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Add profile for student2@sips.edu.lk (only if auth user exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Student 2',
  'student',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'student2@sips.edu.lk'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Add profile for student3@sips.edu.lk (only if auth user exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Student 3',
  'student',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'student3@sips.edu.lk'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify all SIPS profiles exist
SELECT p.id, p.email, p.full_name, p.role, au.email as auth_email
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email LIKE '%@sips.edu.lk'
ORDER BY p.role, p.email;

-- Summary of profiles created/updated
SELECT 
  'Total SIPS Profiles' as description,
  COUNT(*) as count
FROM profiles
WHERE email LIKE '%@sips.edu.lk'
UNION ALL
SELECT 
  'Admin Profiles',
  COUNT(*)
FROM profiles
WHERE email LIKE '%@sips.edu.lk' AND role = 'admin'
UNION ALL
SELECT 
  'Instructor Profiles',
  COUNT(*)
FROM profiles
WHERE email LIKE '%@sips.edu.lk' AND role = 'instructor'
UNION ALL
SELECT 
  'Student Profiles',
  COUNT(*)
FROM profiles
WHERE email LIKE '%@sips.edu.lk' AND role = 'student';

-- Check for any orphaned SIPS auth users (have auth but no profile)
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.email LIKE '%@sips.edu.lk'
  AND p.id IS NULL;
