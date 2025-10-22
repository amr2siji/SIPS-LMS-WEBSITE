# Manual Test User Creation Guide

Since the automated setup page requires Supabase Auth configuration, here's how to create test users manually through the Supabase dashboard:

## Step 1: Access Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project: `krgumnweqxgdqtjazntb`
3. Navigate to **Authentication** → **Users** in the left sidebar

## Step 2: Create Admin User

1. Click **"Add User"** button
2. Fill in the form:
   - **Email**: `admin@sips.edu.lk`
   - **Password**: `Admin@123456`
   - **Auto Confirm User**: ✅ **ENABLE THIS** (very important!)
3. Click **"Create User"**
4. **Copy the User ID** that appears (it's a UUID like `550e8400-e29b-41d4-a716-446655440000`)

## Step 3: Create Instructor User

1. Click **"Add User"** button again
2. Fill in the form:
   - **Email**: `instructor@sips.edu.lk`
   - **Password**: `Instructor@123456`
   - **Auto Confirm User**: ✅ **ENABLE THIS**
3. Click **"Create User"**
4. **Copy the User ID**

## Step 4: Create Student User

1. Click **"Add User"** button again
2. Fill in the form:
   - **Email**: `student@sips.edu.lk`
   - **Password**: `Student@123456`
   - **Auto Confirm User**: ✅ **ENABLE THIS**
3. Click **"Create User"**
4. **Copy the User ID**

## Step 5: Insert Profile Data

1. In Supabase Dashboard, go to **Table Editor** → **profiles**
2. Click **"Insert row"** and add:

### Admin Profile:
```
id: [ADMIN_USER_ID from Step 2]
email: admin@sips.edu.lk
full_name: John Admin
role: admin
phone: +94771234567
```

### Instructor Profile:
```
id: [INSTRUCTOR_USER_ID from Step 3]
email: instructor@sips.edu.lk
full_name: Sarah Instructor
role: instructor
phone: +94771234568
```

### Student Profile:
```
id: [STUDENT_USER_ID from Step 4]
email: student@sips.edu.lk
full_name: Michael Student
role: student
phone: +94771234569
```

## Step 6: Create Student Record

1. Go to **Table Editor** → **students**
2. Click **"Insert row"**:
```
id: [STUDENT_USER_ID]
student_id: STU-2024-001
batch_id: 750e8400-e29b-41d4-a716-446655440001
program_id: 550e8400-e29b-41d4-a716-446655440001
enrollment_date: 2024-01-15
status: active
payment_status: paid
```

## Step 7: Enroll Student in Courses

1. Go to **Table Editor** → **course_enrollments**
2. Insert 3 rows:

**Enrollment 1:**
```
student_id: [STUDENT_USER_ID]
course_id: 650e8400-e29b-41d4-a716-446655440001
batch_id: 750e8400-e29b-41d4-a716-446655440001
status: active
```

**Enrollment 2:**
```
student_id: [STUDENT_USER_ID]
course_id: 650e8400-e29b-41d4-a716-446655440002
batch_id: 750e8400-e29b-41d4-a716-446655440001
status: active
```

**Enrollment 3:**
```
student_id: [STUDENT_USER_ID]
course_id: 650e8400-e29b-41d4-a716-446655440003
batch_id: 750e8400-e29b-41d4-a716-446655440001
status: active
```

## Step 8: Assign Instructor to Courses

1. Go to **Table Editor** → **instructors**
2. Insert 2 rows:

**Assignment 1:**
```
instructor_id: [INSTRUCTOR_USER_ID]
course_id: 650e8400-e29b-41d4-a716-446655440001
batch_id: 750e8400-e29b-41d4-a716-446655440001
```

**Assignment 2:**
```
instructor_id: [INSTRUCTOR_USER_ID]
course_id: 650e8400-e29b-41d4-a716-446655440002
batch_id: 750e8400-e29b-41d4-a716-446655440001
```

## Step 9: Create Sample Assignments

1. Go to **Table Editor** → **assignments**
2. Insert 2 rows:

**Assignment 1:**
```
course_id: 650e8400-e29b-41d4-a716-446655440001
instructor_id: [INSTRUCTOR_USER_ID]
title: Business Plan Assignment
description: Create a comprehensive business plan for a startup
due_date: 2024-12-31 23:59:59
max_score: 100
```

**Assignment 2:**
```
course_id: 650e8400-e29b-41d4-a716-446655440002
instructor_id: [INSTRUCTOR_USER_ID]
title: Marketing Strategy Project
description: Develop a marketing strategy for a product launch
due_date: 2024-12-25 23:59:59
max_score: 100
```

## Step 10: Add Student Notification

1. Go to **Table Editor** → **notifications**
2. Insert 1 row:
```
user_id: [STUDENT_USER_ID]
type: announcement
title: Welcome to SIPS
message: Welcome to Steller Institute of Professional Studies!
is_read: false
```

---

## ⚠️ IMPORTANT NOTE

When creating users in Supabase Auth:
- **ALWAYS enable "Auto Confirm User"** checkbox
- This ensures users can login immediately without email verification
- Email verification is disabled for testing purposes

---

## Quick Test After Setup

Once all users are created:

1. Go to: `http://localhost:5173/login`
2. Try logging in with:
   - `admin@sips.edu.lk` / `Admin@123456`
   - `instructor@sips.edu.lk` / `Instructor@123456`
   - `student@sips.edu.lk` / `Student@123456`

All users should now be able to login successfully!

---

## Alternative: SQL Script Method

If you prefer SQL, go to **SQL Editor** in Supabase and run this after creating the Auth users:

```sql
-- Replace these UUIDs with actual user IDs from auth.users
DO $$
DECLARE
  admin_id uuid := '[YOUR_ADMIN_USER_ID]';
  instructor_id uuid := '[YOUR_INSTRUCTOR_USER_ID]';
  student_id uuid := '[YOUR_STUDENT_USER_ID]';
BEGIN
  -- Insert profiles
  INSERT INTO profiles (id, email, full_name, role, phone) VALUES
    (admin_id, 'admin@sips.edu.lk', 'John Admin', 'admin', '+94771234567'),
    (instructor_id, 'instructor@sips.edu.lk', 'Sarah Instructor', 'instructor', '+94771234568'),
    (student_id, 'student@sips.edu.lk', 'Michael Student', 'student', '+94771234569');

  -- Create student record
  INSERT INTO students (id, student_id, batch_id, program_id, enrollment_date, status, payment_status) VALUES
    (student_id, 'STU-2024-001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'active', 'paid');

  -- Enroll student in courses
  INSERT INTO course_enrollments (student_id, course_id, batch_id, status) VALUES
    (student_id, '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'active'),
    (student_id, '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'active'),
    (student_id, '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'active');

  -- Assign instructor to courses
  INSERT INTO instructors (instructor_id, course_id, batch_id) VALUES
    (instructor_id, '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001'),
    (instructor_id, '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001');

  -- Create assignments
  INSERT INTO assignments (course_id, instructor_id, title, description, due_date, max_score) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', instructor_id, 'Business Plan Assignment', 'Create a comprehensive business plan for a startup', '2024-12-31 23:59:59', 100),
    ('650e8400-e29b-41d4-a716-446655440002', instructor_id, 'Marketing Strategy Project', 'Develop a marketing strategy for a product launch', '2024-12-25 23:59:59', 100);

  -- Add notification
  INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
    (student_id, 'announcement', 'Welcome to SIPS', 'Welcome to Steller Institute of Professional Studies!', false);
END $$;
```
