import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookOpen, FileText, Users, CheckCircle, LogOut, GraduationCap, ClipboardCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function InstructorDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalModules: 0,
    totalStudents: 0,
    totalAssignments: 0,
    totalExams: 0,
    pendingSubmissions: 0,
  });

  useEffect(() => {
    if (profile) {
      loadInstructorData();
    }
  }, [profile]);

  const loadInstructorData = async () => {
    try {
      if (!profile?.id) return;

      // Get lecturer's assigned modules
      const { data: lecturerAssignments } = await supabase
        .from('lecturer_assignments')
        .select('module_id, intake_id')
        .eq('lecturer_id', profile.id);

      const moduleIds = lecturerAssignments?.map((la: any) => la.module_id) || [];
      const intakeIds = lecturerAssignments?.map((la: any) => la.intake_id) || [];

      // Get total students enrolled in instructor's intakes
      const { data: studentPrograms } = await supabase
        .from('student_programs')
        .select('student_id')
        .in('intake_id', intakeIds);

      // Get assignments for instructor's modules
      const { data: assignments } = await supabase
        .from('assignments')
        .select('id')
        .in('module_id', moduleIds);

      // Get exams for instructor's modules
      const { data: exams } = await supabase
        .from('exams')
        .select('id')
        .in('module_id', moduleIds);

      const assignmentIds = assignments?.map((a: any) => a.id) || [];

      // Get pending assignment submissions
      const { data: pendingAssignments } = await supabase
        .from('assignment_submissions')
        .select('id')
        .in('assignment_id', assignmentIds)
        .is('graded_at', null);

      setStats({
        totalModules: moduleIds.length || 0,
        totalStudents: studentPrograms?.length || 0,
        totalAssignments: assignments?.length || 0,
        totalExams: exams?.length || 0,
        pendingSubmissions: pendingAssignments?.length || 0,
      });
    } catch (error) {
      console.error('Error loading instructor data:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const quickActions = [
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
      icon: ClipboardCheck,
      color: 'from-purple-500 to-purple-600',
      path: '/admin/marks-management',
      badge: stats.pendingSubmissions
    },
    {
      title: 'Students Management',
      description: 'View and manage student records',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      path: '/admin/manage-students',
      badge: null
    },
    {
      title: 'Lecture Material Management',
      description: 'Upload and manage course materials',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600',
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
              <img src="/sips.png" alt="SIPS Logo" className="h-16 w-auto object-contain" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white italic">
                  Instructor Portal
                </h1>
                <p className="text-sm md:text-base text-emerald-100">{profile?.full_name}</p>
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
          <p className="text-gray-600">Welcome back! Here's your teaching overview today.</p>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Modules Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">My Modules</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalModules}</h3>
                <p className="text-sm text-emerald-600 font-medium">Teaching</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                <GraduationCap className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Total Students Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalStudents}</h3>
                <p className="text-sm text-blue-600 font-medium">Enrolled</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Total Assignments Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Assignments</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalAssignments}</h3>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-teal-600 font-semibold">{stats.totalExams}</span>
                  <span className="text-gray-500">exams</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Pending Grading Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Grading</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.pendingSubmissions}</h3>
                <p className="text-sm text-amber-600 font-medium">To review</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600 mt-1">Access key teaching functions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
          </div>
        </div>
      </div>
    </div>
  );
}
