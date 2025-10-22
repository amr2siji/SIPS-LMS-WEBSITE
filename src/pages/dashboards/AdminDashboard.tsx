import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, BookOpen, FileText, DollarSign, TrendingUp, TrendingDown, LogOut } from 'lucide-react';
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

      const activeStudents = students?.filter(s => s.status === 'active').length || 0;
      const dropoutStudents = students?.filter(s => s.status === 'dropout').length || 0;

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/sips.png" alt="SIPS Logo" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold">Admin Portal</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">System Overview and Management</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-emerald-700" size={32} />
              <span className="text-3xl font-bold text-gray-900">{stats.totalStudents}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Students</p>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-green-600">{stats.activeStudents} Active</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="text-blue-500" size={32} />
              <span className="text-3xl font-bold text-gray-900">{stats.totalCourses}</span>
            </div>
            <p className="text-gray-600 font-medium">Active Courses</p>
            <p className="text-sm text-gray-500 mt-2">{stats.totalPrograms} Programs</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-amber-500" size={32} />
              <span className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</span>
            </div>
            <p className="text-gray-600 font-medium">Pending Applications</p>
            <p className="text-sm text-amber-600 mt-2">Requires Review</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="text-green-500" size={32} />
              <span className="text-3xl font-bold text-gray-900">{stats.pendingPayments}</span>
            </div>
            <p className="text-gray-600 font-medium">Pending Payments</p>
            <p className="text-sm text-green-600 mt-2">To Verify</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-500" />
              Student Analytics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-700">Active Students</span>
                <span className="font-bold text-green-600">{stats.activeStudents}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-gray-700">Dropout Students</span>
                <span className="font-bold text-red-600">{stats.dropoutStudents}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-700">Retention Rate</span>
                <span className="font-bold text-blue-600">
                  {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors text-left px-4">
                Manage Students
              </button>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors text-left px-4">
                Manage Courses & Programs
              </button>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors text-left px-4">
                Review Applications
              </button>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors text-left px-4">
                Verify Payments
              </button>
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors text-left px-4">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
