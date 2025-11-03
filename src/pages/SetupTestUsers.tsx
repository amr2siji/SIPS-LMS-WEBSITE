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
      email: 'student@sips.edu.lk',
      password: 'Student@123456',
      full_name: 'Michael Student',
      role: 'student',
      phone: '+94771234569',
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
            const { error: studentError } = await (supabase as any).from('students').insert({
              id: authData.user.id,
              student_id: 'STU-2024-001',
              batch_id: '750e8400-e29b-41d4-a716-446655440001',
              program_id: '550e8400-e29b-41d4-a716-446655440001',
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

            await (supabase as any).from('course_enrollments').insert([
              {
                student_id: authData.user.id,
                course_id: '650e8400-e29b-41d4-a716-446655440001',
                batch_id: '750e8400-e29b-41d4-a716-446655440001',
                status: 'active',
              },
              {
                student_id: authData.user.id,
                course_id: '650e8400-e29b-41d4-a716-446655440002',
                batch_id: '750e8400-e29b-41d4-a716-446655440001',
                status: 'active',
              },
              {
                student_id: authData.user.id,
                course_id: '650e8400-e29b-41d4-a716-446655440003',
                batch_id: '750e8400-e29b-41d4-a716-446655440001',
                status: 'active',
              },
            ]);

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
            await (supabase as any).from('instructors').insert([
              {
                instructor_id: authData.user.id,
                course_id: '650e8400-e29b-41d4-a716-446655440001',
                batch_id: '750e8400-e29b-41d4-a716-446655440001',
              },
              {
                instructor_id: authData.user.id,
                course_id: '650e8400-e29b-41d4-a716-446655440002',
                batch_id: '750e8400-e29b-41d4-a716-446655440001',
              },
            ]);

            await (supabase as any).from('assignments').insert([
              {
                course_id: '650e8400-e29b-41d4-a716-446655440001',
                instructor_id: authData.user.id,
                title: 'Business Plan Assignment',
                description: 'Create a comprehensive business plan for a startup',
                due_date: '2024-12-31T23:59:59',
                max_score: 100,
              },
              {
                course_id: '650e8400-e29b-41d4-a716-446655440002',
                instructor_id: authData.user.id,
                title: 'Marketing Strategy Project',
                description: 'Develop a marketing strategy for a product launch',
                due_date: '2024-12-25T23:59:59',
                max_score: 100,
              },
            ]);
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
                <strong>Student:</strong> student@sips.edu.lk / Student@123456
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
              <strong>Note:</strong> This will create 3 test accounts:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Admin user with full system access</li>
              <li>Instructor user with 2 courses assigned</li>
              <li>Student user enrolled in 3 courses</li>
            </ul>
            <p className="mt-4 text-amber-600">
              <strong>Warning:</strong> If users already exist, this will show an error. You
              can safely ignore duplicate user errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
