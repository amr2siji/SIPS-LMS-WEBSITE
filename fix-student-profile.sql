-- Fix missing student profile
-- Run this in Supabase SQL Editor

INSERT INTO profiles (id, email, full_name, role, phone, avatar_url)
VALUES (
  '78fee4a8-8e0c-4288-a023-13aace906067',
  'student@test.com',
  'Test Student',
  'student',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET 
  role = 'student',
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;
