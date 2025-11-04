-- Add All Missing Test User Profiles
-- Run this in Supabase SQL Editor

-- IMPORTANT: This only adds profiles for EXISTING auth users
-- If you don't have auth users yet, use the /setup-test-users page instead!

-- First, check existing auth users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Add missing profiles for test users (only if auth user exists)
-- This will insert profiles if they don't exist, or update them if they do

-- Admin User (only if exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Instructor User (only if exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'John Instructor',
  'instructor',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'instructor@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Student 1 (only if exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Alice Student',
  'student',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'student1@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Student 2 (only if exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Bob Student',
  'student',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'student2@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Student 3 (only if exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  id,
  email,
  'Charlie Student',
  'student',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'student3@test.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify all profiles were created
SELECT p.id, p.email, p.full_name, p.role, au.email as auth_email
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email IN (
  'admin@test.com',
  'instructor@test.com',
  'student1@test.com',
  'student2@test.com',
  'student3@test.com'
)
ORDER BY p.role, p.email;

-- Check for any orphaned auth users (have auth but no profile)
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
