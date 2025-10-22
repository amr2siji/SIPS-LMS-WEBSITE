# Test User Credentials for SIPS LMS

## Important: Creating Test Users

Since user accounts must be created through Supabase Auth, you have two options:

### Option 1: Manual Creation via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add User" and create the following test accounts
4. After creating each user in Auth, you need to manually insert their profile

### Option 2: Use the Registration System
Use the application's registration flow (not yet fully automated for testing)

---

## Test User Credentials

### 1. ADMIN USER
- **Email**: admin@sips.edu.lk
- **Password**: Admin@123456
- **Full Name**: John Admin
- **Role**: admin

### 2. INSTRUCTOR USER
- **Email**: instructor@sips.edu.lk
- **Password**: Instructor@123456
- **Full Name**: Sarah Instructor
- **Role**: instructor

### 3. STUDENT USER
- **Email**: student@sips.edu.lk
- **Password**: Student@123456
- **Full Name**: Michael Student
- **Role**: student
- **Student ID**: STU-2024-001
- **Program**: Business Administration
- **Batch**: BA-2024-A

---

## Quick Setup SQL (Run after creating Auth users)

After creating the users in Supabase Auth dashboard, run these SQL commands to set up their profiles and data:

```sql
-- Replace the UUIDs below with actual user IDs from auth.users table

-- Insert Admin Profile
INSERT INTO profiles (id, email, full_name, role, phone) VALUES
  ('[ADMIN_USER_ID]', 'admin@sips.edu.lk', 'John Admin', 'admin', '+94771234567');

-- Insert Instructor Profile
INSERT INTO profiles (id, email, full_name, role, phone) VALUES
  ('[INSTRUCTOR_USER_ID]', 'instructor@sips.edu.lk', 'Sarah Instructor', 'instructor', '+94771234568');

-- Insert Student Profile
INSERT INTO profiles (id, email, full_name, role, phone) VALUES
  ('[STUDENT_USER_ID]', 'student@sips.edu.lk', 'Michael Student', 'student', '+94771234569');

-- Create Student Record
INSERT INTO students (id, student_id, batch_id, program_id, enrollment_date, status, payment_status) VALUES
  ('[STUDENT_USER_ID]', 'STU-2024-001', '750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15', 'active', 'paid');

-- Enroll Student in Courses
INSERT INTO course_enrollments (student_id, course_id, batch_id, status) VALUES
  ('[STUDENT_USER_ID]', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'active'),
  ('[STUDENT_USER_ID]', '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001', 'active'),
  ('[STUDENT_USER_ID]', '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'active');

-- Assign Instructor to Courses
INSERT INTO instructors (instructor_id, course_id, batch_id) VALUES
  ('[INSTRUCTOR_USER_ID]', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001'),
  ('[INSTRUCTOR_USER_ID]', '650e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440001');

-- Create Sample Assignments
INSERT INTO assignments (course_id, instructor_id, title, description, due_date, max_score) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '[INSTRUCTOR_USER_ID]', 'Business Plan Assignment', 'Create a comprehensive business plan for a startup', '2024-12-31 23:59:59', 100),
  ('650e8400-e29b-41d4-a716-446655440002', '[INSTRUCTOR_USER_ID]', 'Marketing Strategy Project', 'Develop a marketing strategy for a product launch', '2024-12-25 23:59:59', 100);

-- Create Sample Notifications for Student
INSERT INTO notifications (user_id, type, title, message, is_read) VALUES
  ('[STUDENT_USER_ID]', 'assignment', 'New Assignment Posted', 'A new assignment has been posted in Business Plan course', false),
  ('[STUDENT_USER_ID]', 'announcement', 'Welcome to SIPS', 'Welcome to Steller Institute of Professional Studies!', false);
```

---

## Automated Setup Script

I'll create a helper script to make this easier...
