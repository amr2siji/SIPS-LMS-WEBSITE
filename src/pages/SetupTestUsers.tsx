import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function SetupTestUsers() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState('');

  const testUsers = [
    {
      email: 'admin@sips.edu.lk',
      password: 'Admin@123456',
      full_name: 'John Admin',
      role: 'admin',
      phone: '+94771234567',
    },
    {
      email: 'instructor@sips.edu.lk',
      password: 'Instructor@123456',
      full_name: 'Sarah Instructor',
      role: 'instructor',
      phone: '+94771234568',
    },
    {
      email: 'student1@sips.edu.lk',
      password: 'Student@123456',
      full_name: 'Michael Anderson',
      role: 'student',
      phone: '+94771234569',
    },
    {
      email: 'student2@sips.edu.lk',
      password: 'Student@123456',
      full_name: 'Emily Johnson',
      role: 'student',
      phone: '+94771234570',
    },
    {
      email: 'student3@sips.edu.lk',
      password: 'Student@123456',
      full_name: 'David Williams',
      role: 'student',
      phone: '+94771234571',
    },
  ];

  const createTestUsers = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    const newResults: any[] = [];

    try {
      for (const user of testUsers) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              data: {
                full_name: user.full_name,
              },
            },
          });

          if (authError) {
            newResults.push({
              email: user.email,
              success: false,
              message: authError.message,
            });
            continue;
          }

          if (!authData.user) {
            newResults.push({
              email: user.email,
              success: false,
              message: 'User creation failed',
            });
            continue;
          }

          const { error: profileError } = await (supabase as any).from('profiles').insert({
            id: authData.user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            phone: user.phone,
          });

          if (profileError) {
            newResults.push({
              email: user.email,
              success: false,
              message: `Profile error: ${profileError.message}`,
            });
            continue;
          }

          if (user.role === 'student') {
            // Get the latest intake IDs from database
            const { data: intakeData } = await supabase
              .from('intakes')
              .select('id, program_id')
              .eq('intake_year', 2024)
              .eq('intake_month', 1)
              .limit(1)
              .single();

            const intakeId = (intakeData as any)?.id || 'c10e8400-e29b-41d4-a716-446655440001';
            const programId = (intakeData as any)?.program_id || '550e8400-e29b-41d4-a716-446655440011';

            // Create student number
            const studentNumber = `SIPS-2024-${String(testUsers.filter(u => u.role === 'student').indexOf(user) + 1).padStart(4, '0')}`;

            const { error: studentError } = await (supabase as any).from('students').insert({
              id: authData.user.id,
              student_id: studentNumber,
              program_id: programId,
              intake_id: intakeId,
              faculty_id: 'a10e8400-e29b-41d4-a716-446655440001',
              department_id: 'b10e8400-e29b-41d4-a716-446655440001',
              enrollment_date: '2024-01-15',
              status: 'active',
              payment_status: 'paid',
            });

            if (studentError) {
              newResults.push({
                email: user.email,
                success: false,
                message: `Student record error: ${studentError.message}`,
              });
              continue;
            }

            // Enroll in student_programs
            await (supabase as any).from('student_programs').insert({
              student_id: authData.user.id,
              program_id: programId,
              intake_id: intakeId,
              enrollment_date: '2024-01-15',
              status: 'active',
            });

            // Get modules for this intake
            const { data: modules } = await supabase
              .from('modules')
              .select('id')
              .eq('intake_id', intakeId)
              .limit(4);

            if (modules && modules.length > 0) {
              // Create assignments for student
              const { data: assignments } = await supabase
                .from('assignments')
                .select('id, max_marks')
                .eq('intake_id', intakeId)
                .limit(4);

              if (assignments && assignments.length > 0) {
                // Create assignment submissions with scores
                const assignmentSubmissions = (assignments as any[]).map((assignment: any, index: number) => ({
                  assignment_id: assignment.id,
                  student_id: authData.user!.id,
                  score: 70 + (index * 5) + Math.floor(Math.random() * 10), // Random scores 70-95
                  feedback: 'Good work! Keep it up.',
                  graded_at: new Date().toISOString(),
                  status: 'graded',
                }));

                await (supabase as any).from('assignment_submissions').insert(assignmentSubmissions);
              }

              // Create exam submissions with scores
              const { data: exams } = await supabase
                .from('exams')
                .select('id, max_marks')
                .eq('intake_id', intakeId)
                .limit(4);

              if (exams && exams.length > 0) {
                const examSubmissions = (exams as any[]).map((exam: any, index: number) => ({
                  exam_id: exam.id,
                  student_id: authData.user!.id,
                  score: 65 + (index * 7) + Math.floor(Math.random() * 12), // Random scores 65-95
                  graded_at: new Date().toISOString(),
                  status: 'graded',
                }));

                await (supabase as any).from('exam_submissions').insert(examSubmissions);
              }

              // Create overall scores
              for (const module of modules as any[]) {
                const assignmentAvg = 75 + Math.floor(Math.random() * 15);
                const examAvg = 70 + Math.floor(Math.random() * 20);
                const overall = Math.round((assignmentAvg * 0.4) + (examAvg * 0.6));
                
                let grade = 'F';
                if (overall >= 90) grade = 'A+';
                else if (overall >= 85) grade = 'A';
                else if (overall >= 80) grade = 'A-';
                else if (overall >= 75) grade = 'B+';
                else if (overall >= 70) grade = 'B';
                else if (overall >= 65) grade = 'B-';
                else if (overall >= 60) grade = 'C+';
                else if (overall >= 55) grade = 'C';
                else if (overall >= 50) grade = 'C-';
                else if (overall >= 45) grade = 'D';

                await (supabase as any).from('overall_scores').insert({
                  student_id: authData.user!.id,
                  module_id: module.id,
                  intake_id: intakeId,
                  assignment_score: assignmentAvg,
                  exam_score: examAvg,
                  overall_score: overall,
                  grade: grade,
                  is_finalized: true,
                  finalized_at: new Date().toISOString(),
                });
              }
            }

            // Create notifications
            await (supabase as any).from('notifications').insert([
              {
                user_id: authData.user.id,
                type: 'announcement',
                title: 'Welcome to SIPS',
                message: 'Welcome to Steller Institute of Professional Studies!',
                is_read: false,
              },
            ]);
          }

          if (user.role === 'instructor') {
            // Get the latest intake data
            const { data: intakeData } = await supabase
              .from('intakes')
              .select('id, program_id')
              .eq('intake_year', 2024)
              .eq('intake_month', 1)
              .limit(1)
              .single();

            const intakeId = (intakeData as any)?.id || 'c10e8400-e29b-41d4-a716-446655440001';

            // Get modules for this intake
            const { data: modules } = await supabase
              .from('modules')
              .select('id, module_code, module_name')
              .eq('intake_id', intakeId)
              .limit(4);

            if (modules && modules.length > 0) {
              // Create assignments for each module
              for (const module of modules as any[]) {
                await (supabase as any).from('assignments').insert({
                  module_id: module.id,
                  intake_id: intakeId,
                  faculty_id: 'a10e8400-e29b-41d4-a716-446655440001',
                  department_id: 'b10e8400-e29b-41d4-a716-446655440001',
                  program_id: '550e8400-e29b-41d4-a716-446655440011',
                  instructor_id: authData.user!.id,
                  title: `${module.module_code} Assignment`,
                  description: `Complete assignment for ${module.module_name}`,
                  due_date: '2024-12-31',
                  max_marks: 100,
                  is_published: true,
                  published_at: new Date().toISOString(),
                });

                // Create exam for each module
                await (supabase as any).from('exams').insert({
                  module_id: module.id,
                  intake_id: intakeId,
                  faculty_id: 'a10e8400-e29b-41d4-a716-446655440001',
                  department_id: 'b10e8400-e29b-41d4-a716-446655440001',
                  program_id: '550e8400-e29b-41d4-a716-446655440011',
                  instructor_id: authData.user!.id,
                  exam_name: `${module.module_code} Final Exam`,
                  description: `Final examination for ${module.module_name}`,
                  exam_date: '2024-12-20',
                  exam_time: '09:00 AM',
                  duration_minutes: 180,
                  max_marks: 100,
                  is_published: true,
                  published_at: new Date().toISOString(),
                });
              }
            }
          }

          newResults.push({
            email: user.email,
            role: user.role,
            success: true,
            message: 'Created successfully',
          });
        } catch (err: any) {
          newResults.push({
            email: user.email,
            success: false,
            message: err.message,
          });
        }
      }

      setResults(newResults);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Setup Test Users for SIPS LMS
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-bold text-blue-900 mb-2">Test Credentials</h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Admin:</strong> admin@sips.edu.lk / Admin@123456
              </div>
              <div>
                <strong>Instructor:</strong> instructor@sips.edu.lk / Instructor@123456
              </div>
              <div>
                <strong>Students:</strong>
                <ul className="ml-4 mt-1">
                  <li>student1@sips.edu.lk / Student@123456 (Michael Anderson)</li>
                  <li>student2@sips.edu.lk / Student@123456 (Emily Johnson)</li>
                  <li>student3@sips.edu.lk / Student@123456 (David Williams)</li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
              <AlertCircle className="inline mr-2" size={20} />
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mb-6 space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="text-green-600" size={20} />
                    ) : (
                      <AlertCircle className="text-red-600" size={20} />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">
                        {result.email} {result.role && `(${result.role})`}
                      </div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={createTestUsers}
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Creating Test Users...' : 'Create All Test Users'}
          </button>

          <div className="mt-6 text-sm text-gray-600">
            <p className="mb-2">
              <strong>Note:</strong> This will create 5 test accounts with complete marks management data:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>1 Admin user with full system access</li>
              <li>1 Instructor user with 4 modules, assignments, and exams</li>
              <li>3 Student users with:
                <ul className="ml-6 mt-1 space-y-1">
                  <li>• Enrollment in BBA program (January 2024 intake)</li>
                  <li>• 4 modules with score weights configured</li>
                  <li>• Assignment submissions with grades</li>
                  <li>• Exam submissions with grades</li>
                  <li>• Overall scores calculated with final grades</li>
                </ul>
              </li>
            </ul>
            <p className="mt-4 text-amber-600">
              <strong>Warning:</strong> Make sure you have run the migration <code className="bg-amber-100 px-1 rounded">20251103_marks_management_mock_data.sql</code> first to create faculties, departments, programs, intakes, and modules.
            </p>
            <p className="mt-2 text-amber-600">
              If users already exist, this will show an error. You can safely ignore duplicate user errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
