import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, FileText, DollarSign, LogOut, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    dropoutStudents: 0,
    totalCourses: 0,
    totalPrograms: 0,
    pendingApplications: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (profile) {
      loadAdminStats();
    }
  }, [profile]);

  const loadAdminStats = async () => {
    try {
      const { data: students } = await supabase
        .from('students')
        .select('status');

      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('is_active', true);

      const { data: programs } = await supabase
        .from('programs')
        .select('id')
        .eq('is_active', true);

      const { data: applications } = await supabase
        .from('applications')
        .select('id')
        .eq('status', 'pending');

      const { data: payments } = await supabase
        .from('payments')
        .select('id')
        .eq('status', 'pending');

      const activeStudents = students?.filter((s: any) => s.status === 'active').length || 0;
      const dropoutStudents = students?.filter((s: any) => s.status === 'dropout').length || 0;

      setStats({
        totalStudents: students?.length || 0,
        activeStudents,
        dropoutStudents,
        totalCourses: courses?.length || 0,
        totalPrograms: programs?.length || 0,
        pendingApplications: applications?.length || 0,
        pendingPayments: payments?.length || 0,
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const quickActions = [
    {
      title: 'Student Management',
      description: 'Manage student records and enrollments',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      path: '/admin/manage-students',
      badge: null
    },
    {
      title: 'Review Applications',
      description: 'Process new student applications',
      icon: FileText,
      color: 'from-amber-500 to-amber-600',
      path: '/admin/review-applications',
      badge: stats.pendingApplications
    },
    {
      title: 'Verify Payments',
      description: 'Review and approve payment proofs',
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      path: '/admin/verify-payments',
      badge: stats.pendingPayments
    },
    {
      title: 'Module Management',
      description: 'Create and manage course modules',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600',
      path: '/admin/module-management',
      badge: null
    },
    {
      title: 'Assignment Management',
      description: 'Create and track assignments',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      path: '/admin/assignment-management',
      badge: null
    },
    {
      title: 'Exam Management',
      description: 'Schedule and manage examinations',
      icon: BookOpen,
      color: 'from-cyan-500 to-cyan-600',
      path: '/admin/exam-management',
      badge: null
    },
    {
      title: 'Marks Management',
      description: 'Grade assignments and exams',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      path: '/admin/marks-management',
      badge: null
    },
    {
      title: 'Lecturer Management',
      description: 'Manage faculty and instructors',
      icon: Users,
      color: 'from-violet-500 to-violet-600',
      path: '/admin/lecturer-management',
      badge: null
    },
    {
      title: 'Lecture Material Management',
      description: 'Upload and manage course materials',
      icon: BookOpen,
      color: 'from-emerald-500 to-emerald-600',
      path: '/admin/lecture-material-management',
      badge: null
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Modern Header with Emerald Theme */}
      <nav className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <img src="/sips.png" alt="SIPS Logo" className="h-14 w-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Admin Portal
                </h1>
                <p className="text-sm text-emerald-100">{profile?.full_name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-lg transition-all font-medium border border-white/20"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Welcome back! Here's what's happening with your LMS today.</p>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Students Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalStudents}</h3>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-green-600 font-semibold">{stats.activeStudents}</span>
                  <span className="text-gray-500">active</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Active Courses Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Active Courses</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalCourses}</h3>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-blue-600 font-semibold">{stats.totalPrograms}</span>
                  <span className="text-gray-500">programs</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <BookOpen className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Pending Applications Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Applications</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.pendingApplications}</h3>
                <p className="text-sm text-amber-600 font-medium">Requires review</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Payments</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.pendingPayments}</h3>
                <p className="text-sm text-green-600 font-medium">To verify</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600 mt-1">Access key administrative functions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => navigate(action.path)}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`bg-gradient-to-br ${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                      <action.icon className="text-white" size={24} />
                    </div>
                    {action.badge !== null && action.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ))}

            {/* Setup Mock Data */}
            <button
              onClick={() => navigate('/setup-mock-data')}
              className="group bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border-2 border-dashed border-gray-300 hover:border-gray-400 relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-gray-700 p-3 rounded-lg group-hover:scale-110 transition-transform">
                    <FileText className="text-white" size={24} />
                  </div>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">
                  🔧 Setup Mock Data
                </h4>
                <p className="text-sm text-gray-600">For testing purposes</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
