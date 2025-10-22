# SIPS LMS Test Credentials

## Quick Setup Instructions

### Step 1: Create Test Users
Navigate to: `http://localhost:5173/setup-test-users`

Click the "Create All Test Users" button. This will automatically create all test accounts with sample data.

---

## Test User Credentials

### 1. ADMIN ACCOUNT
```
Email:    admin@sips.edu.lk
Password: Admin@123456
Role:     Administrator
```

**Admin Dashboard Features:**
- View system statistics (total students, courses, programs)
- Student analytics (active/dropout rates)
- Manage pending applications
- Verify payment slips
- Full system access

---

### 2. INSTRUCTOR ACCOUNT
```
Email:    instructor@sips.edu.lk
Password: Instructor@123456
Role:     Instructor
```

**Instructor Dashboard Features:**
- View assigned courses (2 courses in Business Administration)
- See total students enrolled
- Create and manage assignments
- Upload lecture materials
- Grade student submissions

**Assigned Courses:**
- BUS101: Introduction to Business
- BUS201: Marketing Principles

---

### 3. STUDENT ACCOUNT
```
Email:    student@sips.edu.lk
Password: Student@123456
Role:     Student
Student ID: STU-2024-001
```

**Student Dashboard Features:**
- View enrolled courses (3 courses)
- Check assignment deadlines
- Submit assignments
- View grades and results
- Upload payment slips
- Check payment status
- View notifications

**Enrolled Courses:**
- BUS101: Introduction to Business
- BUS201: Marketing Principles
- BUS301: Financial Management

**Student Details:**
- Program: Business Administration
- Batch: BA-2024-A
- Status: Active
- Payment Status: Paid

---

## How to Test

### Testing Student Portal:
1. Login with student credentials
2. You'll see the student dashboard with:
   - 3 enrolled courses
   - Assignment list
   - Payment status (Paid)
   - Active status
   - Notifications

### Testing Instructor Portal:
1. Login with instructor credentials
2. You'll see the instructor dashboard with:
   - 2 assigned courses
   - Student count
   - Created assignments
   - Quick actions for assignment creation

### Testing Admin Portal:
1. Login with admin credentials
2. You'll see the admin dashboard with:
   - Total students count
   - Active/dropout student analytics
   - Pending applications
   - Payment verification queue
   - System management tools

---

## Sample Data Included

### Programs (5 total):
- Business Administration (Bachelor, 4 years)
- Engineering Technology (Bachelor, 4 years)
- Healthcare Management (Diploma, 3 years)
- Information Systems (Bachelor, 4 years)
- Applied Sciences (Bachelor, 3 years)

### Courses (10 total):
- 4 Business courses
- 3 Engineering courses
- 3 Information Systems courses

### Batches (3 total):
- BA-2024-A (Business Administration)
- ENG-2024-A (Engineering Technology)
- IT-2024-A (Information Systems)

### Assignments (2 created by instructor):
1. Business Plan Assignment (Due: Dec 31, 2024)
2. Marketing Strategy Project (Due: Dec 25, 2024)

---

## Testing Public Website

Access these pages without login:
- Homepage: `http://localhost:5173/`
- Programmes: `http://localhost:5173/programmes`
- Student Life: `http://localhost:5173/student-life`
- About Us: `http://localhost:5173/about`
- Apply Now: `http://localhost:5173/apply`
- Register Online: `http://localhost:5173/register`

---

## Troubleshooting

### If users already exist:
The setup page will show which users were created successfully and which failed. Duplicate email errors are normal if you run the setup twice.

### If you need to reset:
1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Delete the test users
4. Run the setup page again

### If login fails:
- Ensure you're using the correct email and password
- Check that the setup page ran successfully
- Verify in Supabase dashboard that users were created

---

## Next Steps After Testing

Once you've tested all user roles:
1. Create your own admin account
2. Add real programs and courses
3. Set up actual instructor accounts
4. Process real student registrations
5. Configure email notifications
6. Set up file storage for assignments
