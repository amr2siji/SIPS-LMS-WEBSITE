# Marks Management Mock Data Setup Guide

## Overview
This guide will help you set up complete test data for the Marks Management system including faculties, departments, programs, intakes, modules, students, assignments, exams, and scores.

## Prerequisites
- Supabase project configured
- Database migrations applied
- LMS website running

## Step-by-Step Setup

### Step 1: Apply the Mock Data Migration

1. Navigate to your Supabase project dashboard
2. Go to SQL Editor
3. Open the file: `supabase/migrations/20251103_marks_management_mock_data.sql`
4. Copy the entire content
5. Paste into Supabase SQL Editor
6. Click "Run" to execute

**What this creates:**
- ✅ 3 Faculties (Business Studies, Engineering, Computing)
- ✅ 7 Departments across all faculties
- ✅ 6 Programs (BBA, Software Engineering, Data Science, etc.)
- ✅ 5 Intakes for different programs
- ✅ 10 Modules with different credit scores
- ✅ 10 Module Score Weights (configured assignment and exam percentages)

### Step 2: Create Test User Accounts

1. Open the LMS website
2. Navigate to: `/setup-test-users`
3. Click the "Create All Test Users" button

**What this creates:**
- ✅ 1 Admin account: `admin@sips.edu.lk`
- ✅ 1 Instructor account: `instructor@sips.edu.lk`
- ✅ 3 Student accounts: `student1@sips.edu.lk`, `student2@sips.edu.lk`, `student3@sips.edu.lk`
- ✅ Student records linked to BBA program (January 2024 intake)
- ✅ 4 Assignments per module (created by instructor)
- ✅ 4 Exams per module (created by instructor)
- ✅ Assignment submissions with random scores (70-95 range)
- ✅ Exam submissions with random scores (65-95 range)
- ✅ Overall scores calculated with final grades (A+ to F scale)

### Step 3: Verify Data Creation

#### Check Faculties & Departments
1. Login as admin: `admin@sips.edu.lk` / `Admin@123456`
2. Navigate to Admin Dashboard
3. Check that faculties and departments appear

#### Check Students
1. Go to Student Management section
2. Verify 3 students are enrolled:
   - Michael Anderson (SIPS-2024-0001)
   - Emily Johnson (SIPS-2024-0002)
   - David Williams (SIPS-2024-0003)

#### Check Marks Management
1. Go to Marks Management page
2. Check the "Overall" tab
3. You should see:
   - Score Weight Configurations for each module
   - Overall Scores table with student scores
   - Grades assigned (A+, A, A-, B+, B, etc.)

## Test Credentials

| Role       | Email                     | Password         |
|------------|---------------------------|------------------|
| Admin      | admin@sips.edu.lk         | Admin@123456     |
| Instructor | instructor@sips.edu.lk    | Instructor@123456|
| Student 1  | student1@sips.edu.lk      | Student@123456   |
| Student 2  | student2@sips.edu.lk      | Student@123456   |
| Student 3  | student3@sips.edu.lk      | Student@123456   |

## Data Structure Created

### Score Weights (Module-Wide)
Each module has configured weights for:
- Assignments: 30-50% (varies by module)
- Exams: 50-70% (varies by module)
- Total: Always 100%

### Student Scores
Each student has:
- **Assignment scores**: Random between 70-95
- **Exam scores**: Random between 65-95
- **Overall score**: Calculated based on module weights
- **Grade**: Automatically assigned based on score:
  - A+ (90-100)
  - A (85-89)
  - A- (80-84)
  - B+ (75-79)
  - B (70-74)
  - B- (65-69)
  - C+ (60-64)
  - C (55-59)
  - C- (50-54)
  - D (45-49)
  - F (0-44)

## Testing Marks Management Features

### 1. Configure Score Weights
- Go to Marks Management → Overall tab
- Click "Configure Weights"
- Select a module and intake
- Set assignment and exam percentages
- Save (must total 100%)

### 2. Set Individual Student Marks
- Go to Overall Scores table
- Click "Set Marks" button for any student
- Enter overall marks (0-100)
- System automatically calculates grade
- Click Save

### 3. View Student Scores
- Login as a student
- Check Dashboard to see your grades
- View individual module scores

## Troubleshooting

### Issue: "Duplicate key value violates unique constraint 'courses_code_key'"
**Solution**: This error is expected if you already have courses in the database. The migration uses `ON CONFLICT DO UPDATE` to handle this. If you see this, it's safe to ignore.

### Issue: "No modules found"
**Solution**: Make sure you ran the migration file first (Step 1) before creating users (Step 2).

### Issue: "Students created but no scores"
**Solution**: Check that:
1. Modules exist for the intake
2. Assignments and exams were created by the instructor
3. The student setup completed without errors

### Issue: Module score weights not showing module names
**Solution**: The interface requires both modules and intakes to be loaded. Refresh the page or check browser console for errors.

## Database Tables Created/Populated

| Table                    | Records Created |
|--------------------------|-----------------|
| faculties                | 3               |
| departments              | 7               |
| programs                 | 6               |
| intakes                  | 5               |
| modules                  | 10              |
| module_score_weights     | 10              |
| profiles                 | 5               |
| students                 | 3               |
| student_programs         | 3               |
| assignments              | 4 per instructor|
| exams                    | 4 per instructor|
| assignment_submissions   | 12 (4 per student)|
| exam_submissions         | 12 (4 per student)|
| overall_scores           | 12 (4 per student)|

## Next Steps

1. **Test the Admin Dashboard**: Review all marks management features
2. **Configure Additional Weights**: Add weights for other modules/intakes
3. **Grade More Students**: Use "Set Marks" to manually grade students
4. **Generate Reports**: Export student grade reports (if feature exists)
5. **Add More Data**: Create additional students, modules, or intakes as needed

## Clean Up (Optional)

If you want to start fresh:

```sql
-- Run this in Supabase SQL Editor to remove all test data
DELETE FROM overall_scores;
DELETE FROM exam_submissions;
DELETE FROM assignment_submissions;
DELETE FROM exams;
DELETE FROM assignments;
DELETE FROM student_programs;
DELETE FROM students WHERE student_id LIKE 'SIPS%';
DELETE FROM profiles WHERE email LIKE '%@sips.edu.lk';
DELETE FROM module_score_weights;
DELETE FROM modules;
DELETE FROM intakes;
DELETE FROM programs WHERE id LIKE '550e8400-e29b-41d4-a716-4466554400%';
DELETE FROM departments;
DELETE FROM faculties;
```

Then run Steps 1 and 2 again to recreate everything.

## Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify all migrations have been applied
4. Ensure Supabase RLS policies allow the operations

---

**Last Updated**: November 3, 2025
