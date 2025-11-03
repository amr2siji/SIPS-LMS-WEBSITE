import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database, BookOpen, GraduationCap, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';

export function SetupMockData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const setupMockData = async () => {
    setLoading(true);
    setResults([]);
    setError('');

    try {
      const supabaseAny = supabase as any;

      // Step 1: Create Faculties
      addResult('Creating faculties...');
      const { data: faculties, error: facultiesError } = await supabaseAny
        .from('faculties')
        .insert([
          { name: 'Faculty of Computing' },
          { name: 'Faculty of Business' },
          { name: 'Faculty of Engineering' },
        ])
        .select();

      if (facultiesError) throw new Error('Faculties: ' + facultiesError.message);
      addResult(`✅ Created ${faculties.length} faculties`);

      // Step 2: Create Departments
      addResult('Creating departments...');
      const { data: departments, error: deptError } = await supabaseAny
        .from('departments')
        .insert([
          { name: 'Computer Science', faculty_id: faculties[0].id },
          { name: 'Information Technology', faculty_id: faculties[0].id },
          { name: 'Software Engineering', faculty_id: faculties[0].id },
          { name: 'Business Management', faculty_id: faculties[1].id },
          { name: 'Accounting & Finance', faculty_id: faculties[1].id },
          { name: 'Civil Engineering', faculty_id: faculties[2].id },
          { name: 'Electrical Engineering', faculty_id: faculties[2].id },
        ])
        .select();

      if (deptError) throw new Error('Departments: ' + deptError.message);
      addResult(`✅ Created ${departments.length} departments`);

      // Step 3: Create Programs
      addResult('Creating programs...');
      const { data: programs, error: progError } = await supabaseAny
        .from('programs')
        .insert([
          {
            name: 'BSc (Hons) in Computer Science',
            department_id: departments[0].id,
            program_type: 'Undergraduate',
            payment_type: 'installment',
            program_amount: 500000,
            duration_months: 48,
            image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
          },
          {
            name: 'MSc in Data Science',
            department_id: departments[0].id,
            program_type: 'Postgraduate',
            payment_type: 'complete',
            program_amount: 750000,
            duration_months: 24,
            image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
          },
          {
            name: 'BIT - Bachelor of Information Technology',
            department_id: departments[1].id,
            program_type: 'Undergraduate',
            payment_type: 'installment',
            program_amount: 450000,
            duration_months: 48,
            image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
          },
          {
            name: 'MBA - Master of Business Administration',
            department_id: departments[3].id,
            program_type: 'Postgraduate',
            payment_type: 'complete',
            program_amount: 800000,
            duration_months: 24,
            image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40',
          },
          {
            name: 'BSc in Software Engineering',
            department_id: departments[2].id,
            program_type: 'Undergraduate',
            payment_type: 'installment',
            program_amount: 520000,
            duration_months: 48,
            image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
          },
          {
            name: 'Diploma in Accounting',
            department_id: departments[4].id,
            program_type: 'Diploma',
            payment_type: 'complete',
            program_amount: 200000,
            duration_months: 12,
            image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
          },
        ])
        .select();

      if (progError) throw new Error('Programs: ' + progError.message);
      addResult(`✅ Created ${programs.length} programs`);

      // Step 3.5: Create Courses (for lecture materials)
      addResult('Creating courses...');
      const courses = [];
      
      // Create courses for each program
      for (const program of programs) {
        if (program.name.includes('Computer Science')) {
          courses.push(
            {
              program_id: program.id,
              code: 'CS101',
              name: 'Introduction to Programming',
              description: 'Fundamental concepts of programming',
              credits: 3,
              is_active: true,
            },
            {
              program_id: program.id,
              code: 'CS102',
              name: 'Data Structures',
              description: 'Essential data structures',
              credits: 4,
              is_active: true,
            },
            {
              program_id: program.id,
              code: 'CS201',
              name: 'Database Systems',
              description: 'Database design and SQL',
              credits: 3,
              is_active: true,
            }
          );
        } else if (program.name.includes('Information Technology')) {
          courses.push(
            {
              program_id: program.id,
              code: 'IT101',
              name: 'Computer Networks',
              description: 'Network fundamentals',
              credits: 3,
              is_active: true,
            },
            {
              program_id: program.id,
              code: 'IT201',
              name: 'Cybersecurity',
              description: 'Information security',
              credits: 3,
              is_active: true,
            }
          );
        } else if (program.name.includes('Software Engineering')) {
          courses.push(
            {
              program_id: program.id,
              code: 'SE101',
              name: 'Software Engineering',
              description: 'SDLC and best practices',
              credits: 3,
              is_active: true,
            }
          );
        }
      }

      const { data: createdCourses, error: courseError } = await supabaseAny
        .from('courses')
        .insert(courses)
        .select();

      if (courseError) throw new Error('Courses: ' + courseError.message);
      addResult(`✅ Created ${createdCourses.length} courses`);

      // Step 4: Create Intakes
      addResult('Creating intakes...');
      const intakes = [];
      for (const program of programs) {
        const programIntakes = [
          {
            program_id: program.id,
            intake_year: 2024,
            intake_month: 1,
          },
          {
            program_id: program.id,
            intake_year: 2024,
            intake_month: 7,
          },
          {
            program_id: program.id,
            intake_year: 2025,
            intake_month: 1,
          },
        ];
        intakes.push(...programIntakes);
      }

      const { data: createdIntakes, error: intakeError } = await supabaseAny
        .from('intakes')
        .insert(intakes)
        .select();

      if (intakeError) throw new Error('Intakes: ' + intakeError.message);
      addResult(`✅ Created ${createdIntakes.length} intakes`);

      // Step 5: Create Modules
      addResult('Creating modules...');
      const modules = [];
      
      // CS Program Modules (using first CS program and its latest intake)
      const csProgram = programs.find((p: any) => p.name.includes('Computer Science'));
      const csIntake = createdIntakes.find((i: any) => i.program_id === csProgram?.id && i.intake_year === 2025);
      
      if (csProgram && csIntake) {
        modules.push(
          {
            program_id: csProgram.id,
            intake_id: csIntake.id,
            module_code: 'CS101',
            module_name: 'Introduction to Programming',
            description: 'Fundamental concepts of programming using Python',
            credit_score: 3,
          },
          {
            program_id: csProgram.id,
            intake_id: csIntake.id,
            module_code: 'CS102',
            module_name: 'Data Structures and Algorithms',
            description: 'Learn essential data structures and algorithmic thinking',
            credit_score: 4,
          },
          {
            program_id: csProgram.id,
            intake_id: csIntake.id,
            module_code: 'CS201',
            module_name: 'Database Management Systems',
            description: 'Relational databases, SQL, and database design',
            credit_score: 3,
          },
          {
            program_id: csProgram.id,
            intake_id: csIntake.id,
            module_code: 'CS301',
            module_name: 'Web Development',
            description: 'Modern web development with React and Node.js',
            credit_score: 4,
          }
        );
      }

      // IT Program Modules
      const itProgram = programs.find((p: any) => p.name.includes('Information Technology'));
      const itIntake = createdIntakes.find((i: any) => i.program_id === itProgram?.id && i.intake_year === 2025);
      
      if (itProgram && itIntake) {
        modules.push(
          {
            program_id: itProgram.id,
            intake_id: itIntake.id,
            module_code: 'IT101',
            module_name: 'Computer Networks',
            description: 'Network fundamentals and protocols',
            credit_score: 3,
          },
          {
            program_id: itProgram.id,
            intake_id: itIntake.id,
            module_code: 'IT201',
            module_name: 'Cybersecurity Basics',
            description: 'Introduction to information security',
            credit_score: 3,
          }
        );
      }

      // Software Engineering Modules
      const seProgram = programs.find((p: any) => p.name.includes('Software Engineering'));
      const seIntake = createdIntakes.find((i: any) => i.program_id === seProgram?.id && i.intake_year === 2025);
      
      if (seProgram && seIntake) {
        modules.push(
          {
            program_id: seProgram.id,
            intake_id: seIntake.id,
            module_code: 'SE101',
            module_name: 'Software Engineering Principles',
            description: 'SDLC, Agile, and best practices',
            credit_score: 3,
          },
          {
            program_id: seProgram.id,
            intake_id: seIntake.id,
            module_code: 'SE201',
            module_name: 'Object-Oriented Programming',
            description: 'OOP concepts with Java',
            credit_score: 4,
          }
        );
      }

      const { data: createdModules, error: moduleError } = await supabaseAny
        .from('modules')
        .insert(modules)
        .select();

      if (moduleError) throw new Error('Modules: ' + moduleError.message);
      addResult(`✅ Created ${createdModules.length} modules`);

      // Step 6: Create Assignments
      addResult('Creating assignments...');
      const assignments = [];

      for (const module of createdModules.slice(0, 6)) {
        assignments.push(
          {
            module_id: module.id,
            intake_id: module.intake_id,
            title: `${module.module_code} - Assignment 1`,
            description: `First assignment for ${module.module_name}. Complete the exercises and submit before the due date.`,
            due_date: '2025-12-15',
            max_marks: 100,
            is_published: true,
            assignment_file_url: 'https://example.com/assignments/sample.pdf',
          },
          {
            module_id: module.id,
            intake_id: module.intake_id,
            title: `${module.module_code} - Assignment 2`,
            description: `Second assignment for ${module.module_name}. This is a group project.`,
            due_date: '2026-01-20',
            max_marks: 100,
            is_published: false,
            assignment_file_url: 'https://example.com/assignments/sample2.pdf',
          }
        );
      }

      const { data: createdAssignments, error: assignmentError } = await supabaseAny
        .from('assignments')
        .insert(assignments)
        .select();

      if (assignmentError) throw new Error('Assignments: ' + assignmentError.message);
      addResult(`✅ Created ${createdAssignments.length} assignments`);

      // Step 7: Create Exams
      addResult('Creating exams...');
      const exams = [];

      for (const module of createdModules.slice(0, 5)) {
        exams.push(
          {
            module_id: module.id,
            intake_id: module.intake_id,
            exam_name: `${module.module_code} - Mid-Term Exam`,
            description: `Mid-term examination for ${module.module_name}`,
            exam_date: '2025-11-25',
            exam_time: '09:00',
            duration_minutes: 120,
            max_marks: 100,
            is_published: true,
          },
          {
            module_id: module.id,
            intake_id: module.intake_id,
            exam_name: `${module.module_code} - Final Exam`,
            description: `Final examination for ${module.module_name}`,
            exam_date: '2026-02-10',
            exam_time: '14:00',
            duration_minutes: 180,
            max_marks: 100,
            is_published: false,
          }
        );
      }

      const { data: createdExams, error: examError } = await supabaseAny
        .from('exams')
        .insert(exams)
        .select();

      if (examError) throw new Error('Exams: ' + examError.message);
      addResult(`✅ Created ${createdExams.length} exams`);

      // Step 8: Create Test Students
      addResult('Creating test students...');
      addResult('⚠️ Note: This creates student records only.');
      addResult('⚠️ To login as students, create auth accounts separately.');
      const students = [];
      const studentPrograms = [];
      let createdStudents: any[] = [];
      let createdStudentPrograms: any[] = [];

      // Create 15 test students (without auth users - simpler for testing)
      for (let i = 1; i <= 15; i++) {
        const randomProgram = programs[Math.floor(Math.random() * programs.length)];
        const randomIntake = createdIntakes.find((intake: any) => intake.program_id === randomProgram.id);
        const randomDepartment = departments.find((d: any) => d.id === randomProgram?.department_id);
        const randomFaculty = faculties.find((f: any) => f.id === randomDepartment?.faculty_id);

        // Generate a UUID for the student (not linked to auth.users)
        const studentId = crypto.randomUUID();
        // Generate unique student ID with timestamp to avoid duplicates
        const timestamp = Date.now().toString().slice(-6);
        const studentNumber = `STU${timestamp}${String(i).padStart(2, '0')}`;

        // Generate valid birth date
        const birthYear = 1998 + (i % 7); // 1998-2004
        const birthMonth = (i % 12) + 1; // 1-12
        const birthDay = (i % 28) + 1; // 1-28 (safe for all months)

        students.push({
          id: studentId,
          student_id: studentNumber,
          name_with_initials: `S. T. Student ${i}`,
          nic: `${1990 + i}12345678${String(i).padStart(2, '0')}`,
          date_of_birth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
          permanent_address: `${i} Test Street, Colombo ${i % 10}`,
          mobile_number: `07712345${100 + i}`,
          emergency_contact_name: `Parent ${i}`,
          emergency_contact_relationship: i % 2 === 0 ? 'Father' : 'Mother',
          emergency_contact_mobile: `07798765${100 + i}`,
          ol_qualifications: `6A 2B 1C`,
          al_qualifications: `2A 1B`,
          other_qualifications: i % 3 === 0 ? 'Diploma in IT' : null,
          program_id: randomProgram?.id,
          faculty_id: randomFaculty?.id,
          department_id: randomDepartment?.id,
          intake_id: randomIntake?.id,
          batch_id: null,
          enrollment_date: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
          status: i % 4 === 0 ? 'dropout' : 'active',
          payment_status: i % 3 === 0 ? 'pending' : 'paid',
        });

        studentPrograms.push({
          student_id: studentId,
          program_id: randomProgram?.id,
          intake_id: randomIntake?.id,
          enrollment_date: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
          status: i % 4 === 0 ? 'dropout' : 'active',
        });
      }

      // Create students directly (FK constraint will be temporarily violated but data is for testing)
      const { data: studentsData, error: studentsError } = await supabaseAny
        .from('students')
        .insert(students)
        .select();

      if (studentsError) {
        addResult(`⚠️ Students creation failed: ${studentsError.message}`);
        addResult(`⚠️ This is likely due to FK constraint on profiles table.`);
        addResult(`⚠️ Consider disabling the constraint temporarily or creating via SQL.`);
        throw new Error('Students: ' + studentsError.message);
      }
      
      createdStudents = studentsData || [];
      addResult(`✅ Created ${createdStudents.length} students`);

      // Create student programs
      const { data: studentProgramsData, error: spError } = await supabaseAny
        .from('student_programs')
        .insert(studentPrograms)
        .select();

      if (spError) throw new Error('Student Programs: ' + spError.message);
      createdStudentPrograms = studentProgramsData || [];
      addResult(`✅ Enrolled ${createdStudentPrograms.length} students in programs`);

      // Step 9: Create Test Lecturers
      addResult('Creating test lecturers...');
      const lecturers = [];

      for (let i = 1; i <= 10; i++) {
        lecturers.push({
          first_name: `Lecturer`,
          last_name: `Name ${i}`,
          email: `lecturer${i}@test.com`,
          contact_number: `07756789${100 + i}`,
          residential_address: `${i} Academic Avenue, Colombo ${i % 10}`,
          highest_qualification: i % 2 === 0 ? 'PhD in Computer Science' : 'MSc in Information Technology',
          years_academic_experience: 5 + (i % 10),
          years_industry_experience: 3 + (i % 8),
          is_active: true,
        });
      }

      const { data: createdLecturers, error: lecturersError } = await supabaseAny
        .from('lecturers')
        .insert(lecturers)
        .select();

      if (lecturersError) throw new Error('Lecturers: ' + lecturersError.message);
      addResult(`✅ Created ${createdLecturers.length} lecturers`);

      // Step 10: Assign Lecturers to Modules
      addResult('Assigning lecturers to modules...');
      const lecturerAssignments = [];

      for (let i = 0; i < createdModules.length; i++) {
        const lecturer = createdLecturers[i % createdLecturers.length];
        const module = createdModules[i];
        const program = programs.find((p: any) => p.id === module.program_id);
        const department = departments.find((d: any) => d.id === program?.department_id);
        const faculty = faculties.find((f: any) => f.id === department?.faculty_id);

        lecturerAssignments.push({
          lecturer_id: lecturer.id,
          module_id: module.id,
          intake_id: module.intake_id,
          program_id: module.program_id,
          department_id: department?.id,
          faculty_id: faculty?.id,
          assigned_at: '2024-09-01',
          is_active: true,
        });
      }

      const { data: createdLecturerAssignments, error: laError } = await supabaseAny
        .from('lecturer_assignments')
        .insert(lecturerAssignments)
        .select();

      if (laError) throw new Error('Lecturer Assignments: ' + laError.message);
      addResult(`✅ Created ${createdLecturerAssignments.length} lecturer assignments`);

      // Step 11: Create Test Applications
      addResult('Creating test applications...');
      const applications = [];

      for (let i = 1; i <= 20; i++) {
        const randomProgram = programs[Math.floor(Math.random() * programs.length)];
        
        const statuses = ['pending', 'approved', 'rejected', 'under_review'];
        const status = statuses[i % statuses.length];

        // Generate valid birth year and date
        const birthYear = 1995 + (i % 8); // 1995-2002
        const birthMonth = (i % 12) + 1; // 1-12
        const birthDay = (i % 28) + 1; // 1-28 (safe for all months)

        applications.push({
          name: `Applicant Full Name ${i}`,
          name_with_initials: `A. F. Name ${i}`,
          email: `applicant${i}@test.com`,
          phone: `07787654${100 + i}`,
          nic: `${birthYear}12345678${String(i).padStart(2, '0')}`,
          date_of_birth: `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`,
          permanent_address: `${i} Application Road, Kandy ${i % 10}`,
          program_id: randomProgram?.id,
          ol_qualifications: `${5 + (i % 3)}A ${2 + (i % 2)}B 1C`,
          al_qualifications: `${1 + (i % 2)}A ${1 + (i % 2)}B`,
          other_qualifications: i % 4 === 0 ? 'Certificate in Programming' : null,
          status: status,
          notes: status === 'rejected' ? 'Incomplete documentation' : null,
        });
      }

      const { data: createdApplications, error: applicationsError } = await supabaseAny
        .from('applications')
        .insert(applications)
        .select();

      if (applicationsError) throw new Error('Applications: ' + applicationsError.message);
      addResult(`✅ Created ${createdApplications.length} applications`);

      // Step 12: Create Test Payments
      addResult('Creating test payments...');
      const payments = [];

      for (const student of createdStudents.slice(0, 12)) {
        const studentProgram = createdStudentPrograms.find((sp: any) => sp.student_id === student.id);
        const program = programs.find((p: any) => p.id === studentProgram?.program_id);
        
        if (program && studentProgram) {
          const paymentStatuses = ['pending', 'verified', 'rejected'];
          const status = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
          
          const paymentAmount = program.program_amount || 100000;
          const isInstallment = program.payment_type === 'installment';

          payments.push({
            student_id: student.id,
            program_id: program.id,
            intake_id: studentProgram.intake_id,
            payment_type: isInstallment ? 'installment' : 'complete',
            installment_number: isInstallment ? Math.floor(Math.random() * 4) + 1 : null,
            amount: isInstallment ? paymentAmount / 4 : paymentAmount,
            payment_date: `2024-${String((payments.length % 12) + 1).padStart(2, '0')}-15`,
            payment_slip_url: `https://example.com/receipts/receipt_${payments.length + 1}.pdf`,
            status: status,
            verified_at: status === 'verified' ? `2024-${String((payments.length % 12) + 1).padStart(2, '0')}-17` : null,
            notes: status === 'rejected' ? 'Invalid payment slip' : null,
          });
        }
      }

      const { data: createdPayments, error: paymentsError } = await supabaseAny
        .from('payments')
        .insert(payments)
        .select();

      if (paymentsError) throw new Error('Payments: ' + paymentsError.message);
      addResult(`✅ Created ${createdPayments.length} payments`);

      // Step 13: Create Assignment Submissions
      addResult('Creating assignment submissions...');
      const assignmentSubmissions = [];

      for (const student of createdStudents.slice(0, 8)) {
        const studentProgram = createdStudentPrograms.find((sp: any) => sp.student_id === student.id);
        const relevantAssignments = createdAssignments.filter((a: any) => a.intake_id === studentProgram?.intake_id).slice(0, 3);

        for (const assignment of relevantAssignments) {
          assignmentSubmissions.push({
            assignment_id: assignment.id,
            student_id: student.id,
            intake_id: assignment.intake_id,
            submission_date: `2024-12-${String(10 + assignmentSubmissions.length).padStart(2, '0')}`,
            submission_file_url: `https://example.com/submissions/student_${student.id}_assignment_${assignment.id}.pdf`,
            marks_obtained: Math.floor(Math.random() * 40) + 60, // 60-100
            feedback: assignmentSubmissions.length % 2 === 0 ? 'Good work! Well structured.' : null,
            graded_at: assignmentSubmissions.length % 2 === 0 ? `2024-12-${String(15 + assignmentSubmissions.length).padStart(2, '0')}` : null,
          });
        }
      }

      const { data: createdAssignmentSubmissions, error: asError } = await supabaseAny
        .from('assignment_submissions')
        .insert(assignmentSubmissions)
        .select();

      if (asError) throw new Error('Assignment Submissions: ' + asError.message);
      addResult(`✅ Created ${createdAssignmentSubmissions.length} assignment submissions`);

      // Step 14: Create Exam Submissions
      addResult('Creating exam submissions...');
      const examSubmissions = [];

      for (const student of createdStudents.slice(0, 8)) {
        const studentProgram = createdStudentPrograms.find((sp: any) => sp.student_id === student.id);
        const relevantExams = createdExams.filter((e: any) => e.intake_id === studentProgram?.intake_id && e.is_published).slice(0, 2);

        for (const exam of relevantExams) {
          examSubmissions.push({
            exam_id: exam.id,
            student_id: student.id,
            intake_id: exam.intake_id,
            submission_date: `2025-11-${String(25 + examSubmissions.length).padStart(2, '0')}`,
            marks_obtained: Math.floor(Math.random() * 35) + 65, // 65-100
            feedback: examSubmissions.length % 3 === 0 ? 'Excellent performance!' : null,
            graded_at: `2025-11-${String(28 + examSubmissions.length).padStart(2, '0')}`,
          });
        }
      }

      const { data: createdExamSubmissions, error: esError } = await supabaseAny
        .from('exam_submissions')
        .insert(examSubmissions)
        .select();

      if (esError) throw new Error('Exam Submissions: ' + esError.message);
      addResult(`✅ Created ${createdExamSubmissions.length} exam submissions`);

      // Step 15: Create Module Score Weights and Overall Scores
      addResult('Creating score weights and overall scores...');
      const scoreWeights = [];
      const overallScores = [];

      for (const module of createdModules) {
        scoreWeights.push({
          module_id: module.id,
          intake_id: module.intake_id,
          assignments_weight: 30,
          exams_weight: 70,
          is_published: true,
        });
      }

      const { data: createdScoreWeights, error: swError } = await supabaseAny
        .from('module_score_weights')
        .insert(scoreWeights)
        .select();

      if (swError) throw new Error('Score Weights: ' + swError.message);
      addResult(`✅ Created ${createdScoreWeights.length} score weight configurations`);

      // Create overall scores for students who have submissions
      for (const student of createdStudents.slice(0, 8)) {
        const studentProgram = createdStudentPrograms.find((sp: any) => sp.student_id === student.id);
        const relevantModules = createdModules.filter((m: any) => m.intake_id === studentProgram?.intake_id).slice(0, 3);

        for (const module of relevantModules) {
          const assignmentScore = Math.floor(Math.random() * 20) + 70; // 70-90
          const examScore = Math.floor(Math.random() * 20) + 75; // 75-95
          const overallScore = Math.round(assignmentScore * 0.3 + examScore * 0.7);

          overallScores.push({
            student_id: student.id,
            module_id: module.id,
            intake_id: module.intake_id,
            assignment_score: assignmentScore,
            exam_score: examScore,
            overall_score: overallScore,
            grade: overallScore >= 85 ? 'A' : overallScore >= 70 ? 'B' : overallScore >= 55 ? 'C' : 'D',
            is_finalized: true,
          });
        }
      }

      const { data: createdOverallScores, error: osError } = await supabaseAny
        .from('overall_scores')
        .insert(overallScores)
        .select();

      if (osError) throw new Error('Overall Scores: ' + osError.message);
      addResult(`✅ Created ${createdOverallScores.length} overall score records`);

      // Step 16: Create Lecture Materials
      addResult('Creating lecture materials...');
      const lectureMaterials = [];
      const fileTypes = ['pdf', 'ppt', 'word', 'excel'];
      const materialTitles = [
        'Introduction to the Course',
        'Fundamentals and Core Concepts',
        'Advanced Topics',
        'Practical Examples',
        'Case Studies',
        'Review and Practice Problems',
        'Mid-term Preparation',
        'Final Exam Preparation'
      ];

      // Use createdCourses instead of createdModules
      for (const course of createdCourses.slice(0, 6)) {
        const weeksToCreate = Math.min(8, 15); // Create 8 weeks of materials per course
        
        for (let week = 1; week <= weeksToCreate; week++) {
          const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
          const title = `Week ${week}: ${materialTitles[week - 1] || 'Course Material'}`;
          
          lectureMaterials.push({
            title: title,
            week_number: week,
            course_id: course.id,
            file_type: fileType,
            file_url: `https://example.com/materials/${course.code}_week${week}.${fileType}`,
            description: `Learning materials for ${course.name} - Week ${week}`,
            is_active: Math.random() > 0.1, // 90% active
          });
        }
      }

      const { data: createdMaterials, error: materialsError } = await supabaseAny
        .from('lecture_materials')
        .insert(lectureMaterials)
        .select();

      if (materialsError) throw new Error('Lecture Materials: ' + materialsError.message);
      addResult(`✅ Created ${createdMaterials.length} lecture materials`);

      addResult('');
      addResult('🎉 COMPREHENSIVE Mock Data Setup Completed Successfully!');
      addResult('');
      addResult('📊 Complete Summary:');
      addResult(`- ${faculties.length} Faculties`);
      addResult(`- ${departments.length} Departments`);
      addResult(`- ${programs.length} Programs`);
      addResult(`- ${createdCourses.length} Courses`);
      addResult(`- ${createdIntakes.length} Intakes`);
      addResult(`- ${createdModules.length} Modules`);
      addResult(`- ${createdStudents.length} Students`);
      addResult(`- ${createdStudentPrograms.length} Student Enrollments`);
      addResult(`- ${createdLecturers.length} Lecturers`);
      addResult(`- ${createdLecturerAssignments.length} Lecturer Assignments`);
      addResult(`- ${createdApplications.length} Applications`);
      addResult(`- ${createdPayments.length} Payments`);
      addResult(`- ${createdAssignments.length} Assignments`);
      addResult(`- ${createdAssignmentSubmissions.length} Assignment Submissions`);
      addResult(`- ${createdExams.length} Exams`);
      addResult(`- ${createdExamSubmissions.length} Exam Submissions`);
      addResult(`- ${createdScoreWeights.length} Score Weight Configurations`);
      addResult(`- ${createdOverallScores.length} Overall Score Records`);
      addResult(`- ${createdMaterials.length} Lecture Materials`);
      addResult('');
      addResult('✨ All admin dashboard pages now have test data!');
      addResult('📝 You can now test: Student Management, Lecturer Management,');
      addResult('   Application Reviews, Payment Verification, Module/Assignment/');
      addResult('   Exam Management, Marks Management, and Lecture Material Management!');

    } catch (err: any) {
      console.error('Error setting up mock data:', err);
      setError(err.message || 'An error occurred while setting up mock data');
      addResult('');
      addResult('❌ Error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const clearMockData = async () => {
    if (!confirm('Are you sure you want to delete all mock data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setResults([]);
    setError('');

    try {
      addResult('Deleting mock data...');

      // Delete in reverse order due to foreign key constraints
      await supabase.from('lecture_materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted lecture materials');

      await supabase.from('overall_scores').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted overall scores');

      await supabase.from('module_score_weights').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted module score weights');

      await supabase.from('exam_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted exam submissions');

      await supabase.from('exams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted exams');

      await supabase.from('assignment_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted assignment submissions');

      await supabase.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted assignments');

      await supabase.from('lecturer_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted lecturer assignments');

      await supabase.from('lecturers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted lecturers');

      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted payments');

      await supabase.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted applications');

      await supabase.from('student_programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted student programs');

      await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted students');

      // Delete student profiles (role = 'student')
      await supabase.from('profiles').delete().eq('role', 'student');
      addResult('✅ Deleted student profiles');

      await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted modules');

      await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted courses');

      await supabase.from('intakes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted intakes');

      await supabase.from('programs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted programs');

      await supabase.from('departments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted departments');

      await supabase.from('faculties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      addResult('✅ Deleted faculties');

      addResult('');
      addResult('🗑️ All mock data cleared successfully!');

    } catch (err: any) {
      console.error('Error clearing mock data:', err);
      setError(err.message || 'An error occurred while clearing mock data');
      addResult('');
      addResult('❌ Error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <Database className="mx-auto text-emerald-700 mb-4" size={64} />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mock Data Setup</h1>
            <p className="text-gray-600">
              Set up comprehensive test data for the LMS system
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <GraduationCap className="mx-auto text-emerald-700 mb-2" size={32} />
              <div className="text-sm font-semibold text-gray-700">Students</div>
              <div className="text-xs text-gray-500">15 students</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <BookOpen className="mx-auto text-blue-700 mb-2" size={32} />
              <div className="text-sm font-semibold text-gray-700">Programs</div>
              <div className="text-xs text-gray-500">6 programs</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Calendar className="mx-auto text-purple-700 mb-2" size={32} />
              <div className="text-sm font-semibold text-gray-700">Applications</div>
              <div className="text-xs text-gray-500">20 applications</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <FileText className="mx-auto text-amber-700 mb-2" size={32} />
              <div className="text-sm font-semibold text-gray-700">Lecturers</div>
              <div className="text-xs text-gray-500">10 lecturers</div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">📚 What will be created:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div>✓ 3 Faculties & 7 Departments</div>
              <div>✓ 6 Programs & 18 Intakes</div>
              <div>✓ 8 Modules with course content</div>
              <div>✓ 15 Test Students with enrollments</div>
              <div>✓ 10 Lecturers with assignments</div>
              <div>✓ 20 Student Applications (various statuses)</div>
              <div>✓ 12+ Payment records (pending/approved)</div>
              <div>✓ 12 Assignments & 10 Exams</div>
              <div>✓ Assignment & Exam Submissions</div>
              <div>✓ Overall Scores & Grade Reports</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={setupMockData}
              disabled={loading}
              className="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Setup Mock Data</span>
                </>
              )}
            </button>
            <button
              onClick={clearMockData}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={20} />
              <span>Clear All Data</span>
            </button>
          </div>

          {/* Results Display */}
          {results.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <FileText size={20} />
                Setup Log
              </h3>
              <div className="font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`${
                      result.startsWith('✅')
                        ? 'text-green-400'
                        : result.startsWith('❌')
                        ? 'text-red-400'
                        : result.startsWith('🎉')
                        ? 'text-yellow-400 font-bold'
                        : result.startsWith('-')
                        ? 'text-blue-400'
                        : 'text-gray-300'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center gap-2">
                <XCircle className="text-red-500" size={20} />
                <p className="text-red-700 font-semibold">Error</p>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-emerald-700 hover:text-emerald-600 font-semibold"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
