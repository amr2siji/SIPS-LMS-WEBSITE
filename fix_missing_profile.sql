-- Fix Missing Profile for Existing User
-- Run this in Supabase SQL Editor to create the missing profile

-- Check what email this user has
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '9a175013-4098-4562-92f4-57839e19f335';

-- Create the missing profile using the actual user ID
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  'Admin User', -- Change this to your preferred name
  'admin',      -- Change to: 'admin', 'instructor', or 'student'
  NOW(),
  NOW()
FROM auth.users au
WHERE au.id = '9a175013-4098-4562-92f4-57839e19f335'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify the profile was created
SELECT * FROM profiles WHERE id = '9a175013-4098-4562-92f4-57839e19f335';
