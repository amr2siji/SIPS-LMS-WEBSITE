import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  BookOpen, FileText, Upload, DollarSign, Bell,
  TrendingUp, Calendar, CheckCircle, Clock, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentData {
  student_id: string;
  status: string;
  payment_status: string;
  program_name?: string;
  batch_name?: string;
}

interface CourseEnrollment {
  id: string;
  course_name: string;
  course_code: string;
  status: string;
  grade: string | null;
}

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  course_name: string;
  submitted: boolean;
  score: number | null;
}

export function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [courses, setCourses] = useState<CourseEnrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadStudentData();
    }
  }, [profile]);

  const loadStudentData = async () => {
    try {
      const { data: student } = await supabase
        .from('students')
        .select(`
          student_id,
          status,
          payment_status,
          program:programs(name),
          batch:batches(name)
        `)
        .eq('id', profile?.id)
        .maybeSingle();

      if (student) {
        setStudentData({
          student_id: student.student_id,
          status: student.status,
          payment_status: student.payment_status,
          program_name: student.program?.name,
          batch_name: student.batch?.name,
        });
      }

      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          status,
          grade,
          course:courses(code, name)
        `)
        .eq('student_id', profile?.id);

      if (enrollments) {
        setCourses(enrollments.map(e => ({
          id: e.id,
          course_name: e.course?.name || '',
          course_code: e.course?.code || '',
          status: e.status,
          grade: e.grade,
        })));
      }

      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          due_date,
          course:courses(name),
          submissions:assignment_submissions(score)
        `)
        .in('course_id', enrollments?.map(e => e.course.id) || [])
        .order('due_date', { ascending: true })
        .limit(10);

      if (assignmentsData) {
        setAssignments(assignmentsData.map(a => ({
          id: a.id,
          title: a.title,
          due_date: a.due_date,
          course_name: a.course?.name || '',
          submitted: a.submissions && a.submissions.length > 0,
          score: a.submissions?.[0]?.score || null,
        })));
      }

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile?.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notifs) {
        setNotifications(notifs);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/sips.png" alt="SIPS Logo" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold">Student Portal</h1>
                <p className="text-xs text-emerald-200">{profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile?.full_name}!</h2>
          <p className="text-gray-600">Student ID: {studentData?.student_id}</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="text-emerald-700" size={32} />
              <span className="text-3xl font-bold text-gray-900">{courses.length}</span>
            </div>
            <p className="text-gray-600 font-medium">Enrolled Courses</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-amber-500" size={32} />
              <span className="text-3xl font-bold text-gray-900">{assignments.filter(a => !a.submitted).length}</span>
            </div>
            <p className="text-gray-600 font-medium">Pending Assignments</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-blue-500" size={32} />
              <span className={`text-lg font-bold ${studentData?.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                {studentData?.payment_status?.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Payment Status</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-green-500" size={32} />
              <span className={`text-lg font-bold ${studentData?.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                {studentData?.status?.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 font-medium">Status</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="text-emerald-700" />
                My Courses
              </h3>
              {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No courses enrolled yet.</p>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">{course.course_name}</h4>
                          <p className="text-sm text-gray-600">{course.course_code}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            course.status === 'active' ? 'bg-green-100 text-green-700' :
                            course.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {course.status}
                          </span>
                          {course.grade && (
                            <p className="text-sm text-gray-600 mt-1">Grade: <strong>{course.grade}</strong></p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-amber-500" />
                Upcoming Assignments
              </h3>
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No assignments available.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">{assignment.title}</h4>
                          <p className="text-sm text-gray-600">{assignment.course_name}</p>
                        </div>
                        {assignment.submitted ? (
                          <CheckCircle className="text-green-500" size={24} />
                        ) : (
                          <Clock className="text-amber-500" size={24} />
                        )}
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                        {assignment.score !== null ? (
                          <span className="text-green-600 font-semibold">Score: {assignment.score}</span>
                        ) : (
                          <span className={assignment.submitted ? 'text-blue-600' : 'text-amber-600'}>
                            {assignment.submitted ? 'Submitted' : 'Not Submitted'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="text-blue-500" />
                Notifications
              </h3>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No new notifications.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="border-l-4 border-emerald-500 bg-emerald-50 p-3 rounded">
                      <h4 className="font-semibold text-gray-900 text-sm">{notif.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-emerald-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                  <Upload size={18} />
                  Submit Assignment
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                  <DollarSign size={18} />
                  Upload Payment
                </button>
                <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                  <Calendar size={18} />
                  View Results
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Program Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Program:</span>
                  <span className="font-semibold text-gray-900">{studentData?.program_name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Batch:</span>
                  <span className="font-semibold text-gray-900">{studentData?.batch_name || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
