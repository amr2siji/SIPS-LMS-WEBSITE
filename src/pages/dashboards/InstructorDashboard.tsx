import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookOpen, FileText, Users, CheckCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InstructorDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    assignments: 0,
    submissions: 0,
  });

  useEffect(() => {
    if (profile) {
      loadInstructorData();
    }
  }, [profile]);

  const loadInstructorData = async () => {
    try {
      const { data: courses } = await supabase
        .from('instructors')
        .select('course_id')
        .eq('instructor_id', profile?.id);

      const courseIds = courses?.map(c => c.course_id) || [];

      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('student_id')
        .in('course_id', courseIds);

      const { data: assignments } = await supabase
        .from('assignments')
        .select('id')
        .in('course_id', courseIds);

      const assignmentIds = assignments?.map(a => a.id) || [];

      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('id')
        .in('assignment_id', assignmentIds)
        .eq('status', 'submitted');

      setStats({
        courses: courses?.length || 0,
        students: enrollments?.length || 0,
        assignments: assignments?.length || 0,
        submissions: submissions?.length || 0,
      });
    } catch (error) {
      console.error('Error loading instructor data:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/sips.png" alt="SIPS Logo" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold">Instructor Portal</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {profile?.full_name}!</h2>
          <p className="text-gray-600">Instructor Dashboard</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="text-emerald-700" size={32} />
              <span className="text-3xl font-bold text-gray-900">{stats.courses}</span>
            </div>
            <p className="text-gray-600 font-medium">My Courses</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-500" size={32} />
              <span className="text-3xl font-bold text-gray-900">{stats.students}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Students</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-amber-500" size={32} />
              <span className="text-3xl font-bold text-gray-900">{stats.assignments}</span>
            </div>
            <p className="text-gray-600 font-medium">Assignments Created</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-500" size={32} />
              <span className="text-3xl font-bold text-gray-900">{stats.submissions}</span>
            </div>
            <p className="text-gray-600 font-medium">Pending Grading</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors">
                Create New Assignment
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
                Upload Lecture Materials
              </button>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors">
                Grade Submissions
              </button>
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors">
                View Student Performance
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <p className="text-gray-500 text-center py-8">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
