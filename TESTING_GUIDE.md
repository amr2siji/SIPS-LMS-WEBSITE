# SIPS LMS Testing Guide

## Quick Start

### 1. Start the Development Server
```bash
npm run dev
```
The application will be available at: `http://localhost:5173`

### 2. Setup Test Users (IMPORTANT - DO THIS FIRST!)
Navigate to: `http://localhost:5173/setup-test-users`

Click "Create All Test Users" button. Wait for all users to be created successfully.

### 3. Login and Test
Go to: `http://localhost:5173/login`

Use any of these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@sips.edu.lk | Admin@123456 |
| **Instructor** | instructor@sips.edu.lk | Instructor@123456 |
| **Student** | student@sips.edu.lk | Student@123456 |

---

## What to Test

### Public Website (No Login Required)

✅ **Homepage** - `/`
- Hero section with programs
- Mission, Vision, Values
- Academic quality section
- Call-to-action buttons

✅ **Programmes Page** - `/programmes`
- Browse 5 sample programs
- Filter by degree level
- Search functionality
- Program details cards

✅ **Student Life** - `/student-life`
- Campus activities
- Upcoming events
- Student organizations
- Value additions

✅ **About Us** - `/about`
- Mission, Vision, Values details
- Journey timeline
- Academic quality
- Partner information

✅ **Apply Now** - `/apply`
- Application form
- Program selection
- Form submission

✅ **Register Online** - `/register`
- Student registration form
- Payment slip upload
- All required fields

---

### Student Portal (Login as: student@sips.edu.lk)

✅ **Dashboard Overview**
- Student ID: STU-2024-001
- View enrolled courses (3 courses)
- Assignment status
- Payment status (Paid)
- Notifications

✅ **Course Information**
- BUS101: Introduction to Business
- BUS201: Marketing Principles
- BUS301: Financial Management

✅ **Assignments**
- View upcoming assignments
- Submission status
- Due dates
- Grades (when graded)

✅ **Quick Actions**
- Submit Assignment button
- Upload Payment button
- View Results button

✅ **Program Info**
- Program: Business Administration
- Batch: BA-2024-A
- Status: Active

---

### Instructor Portal (Login as: instructor@sips.edu.lk)

✅ **Dashboard Overview**
- View assigned courses (2 courses)
- Total students enrolled
- Created assignments (2)
- Pending submissions to grade

✅ **Assigned Courses**
- BUS101: Introduction to Business
- BUS201: Marketing Principles

✅ **Quick Actions**
- Create New Assignment
- Upload Lecture Materials
- Grade Submissions
- View Student Performance

✅ **Assignments Created**
1. Business Plan Assignment
2. Marketing Strategy Project

---

### Admin Portal (Login as: admin@sips.edu.lk)

✅ **Dashboard Overview**
- Total students count
- Active students
- Dropout students
- Total courses and programs
- Pending applications
- Pending payments

✅ **Student Analytics**
- Active students count
- Dropout students count
- Retention rate percentage

✅ **Quick Actions**
- Manage Students
- Manage Courses & Programs
- Review Applications
- Verify Payments
- View Reports

✅ **System Statistics**
- Real-time data from database
- Enrollment tracking
- Payment verification queue
- Application processing

---

## Testing Workflows

### Complete Student Journey

1. **Visit Public Website**
   - Browse programmes
   - Read about SIPS
   - Submit application via "Apply Now"

2. **Register Online**
   - Fill registration form
   - Upload payment slip
   - Submit registration

3. **Admin Processes Registration**
   - Login as admin
   - Review pending application
   - Verify payment slip
   - Approve registration
   - Create student account

4. **Student Accesses Portal**
   - Login with credentials
   - View enrolled courses
   - Check assignments
   - Submit assignments
   - View grades

### Complete Instructor Workflow

1. **Login to Instructor Portal**
   - View assigned courses
   - See enrolled students

2. **Create Assignment**
   - Set title and description
   - Set due date
   - Upload assignment file (optional)

3. **Grade Submissions**
   - View student submissions
   - Provide feedback
   - Assign grades

4. **Upload Materials**
   - Share lecture notes
   - Upload course resources
   - Organize by topic

### Complete Admin Workflow

1. **System Overview**
   - Check student statistics
   - Monitor enrollment trends
   - Review dropout rates

2. **Process Applications**
   - Review pending applications
   - Contact applicants
   - Approve/reject applications

3. **Manage Payments**
   - Verify payment slips
   - Update payment status
   - Generate payment reports

4. **System Management**
   - Add new programs
   - Create courses
   - Assign instructors
   - Manage batches

---

## Database Features to Test

### ✅ Row Level Security (RLS)
- Students can only see their own data
- Instructors can see their assigned courses
- Admins can see everything

### ✅ Role-Based Access
- Dashboard routes based on role
- Proper permissions for each action
- Secure data access

### ✅ Relationships
- Students linked to programs and batches
- Courses linked to programs
- Assignments linked to courses
- Submissions linked to students and assignments

### ✅ Real-time Data
- Notifications
- Assignment updates
- Grade postings

---

## Known Sample Data

### Programs (5)
1. Business Administration
2. Engineering Technology
3. Healthcare Management
4. Information Systems
5. Applied Sciences

### Courses (10)
- Business: BUS101, BUS201, BUS301, BUS401
- Engineering: ENG101, ENG201, ENG301
- IT: IT101, IT201, IT301

### Users (3)
- 1 Admin
- 1 Instructor
- 1 Student

### Assignments (2)
- Business Plan Assignment
- Marketing Strategy Project

---

## Troubleshooting

### Issue: Login not working
**Solution:**
- Ensure test users were created via `/setup-test-users`
- Check credentials match exactly
- Verify email confirmation is disabled in Supabase

### Issue: Dashboard shows "Loading..."
**Solution:**
- Check network tab for API errors
- Verify Supabase credentials in `.env`
- Ensure database migrations ran successfully

### Issue: No data showing in dashboard
**Solution:**
- Run the test user setup again
- Check that sample data migration completed
- Verify RLS policies allow data access

### Issue: "User already exists" error
**Solution:**
- This is normal if running setup twice
- Users are already created and ready to use
- Just login with existing credentials

---

## Next Steps After Testing

1. ✅ Verify all user roles work correctly
2. ✅ Test all public pages load properly
3. ✅ Confirm database queries work
4. ✅ Check responsive design on mobile
5. ✅ Test form submissions
6. ✅ Verify file uploads work
7. ✅ Test notification system
8. ✅ Review analytics accuracy

Once testing is complete, you can:
- Remove test users
- Add production data
- Configure email notifications
- Set up file storage
- Deploy to production
