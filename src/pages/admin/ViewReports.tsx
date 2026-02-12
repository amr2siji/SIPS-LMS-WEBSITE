import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign, BookOpen, Download, Calendar } from 'lucide-react';

export function ViewReports() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalRevenue: 0,
    totalCourses: 0,
    pendingApplications: 0,
    monthlyEnrollments: [] as { month: string; count: number }[],
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Using dummy data (Supabase removed)
      // const { data: students } = await supabase
      //   .from('students')
      //   .select('status, enrollment_date');

      // const { data: payments } = await supabase
      //   .from('payments')
      //   .select('amount, status')
      //   .eq('status', 'verified');

      // const { data: courses } = await supabase
      //   .from('courses')
      //   .select('id')
      //   .eq('is_active', true);

      // const { data: applications } = await supabase
      //   .from('applications')
      //   .select('id')
      //   .eq('status', 'pending');

      // Dummy data for demonstration
      const students = null;
      const payments = null;
      const courses = null;
      const applications = null;

      // Use dummy values since no backend API exists yet
      const totalRevenue = 150000;
      const activeStudents = 45;

      setStats({
        totalStudents: 62,
        activeStudents,
        totalRevenue,
        totalCourses: 8,
        pendingApplications: 12,
        monthlyEnrollments: [],
      });
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-purple-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Reports & Analytics</h1>
              <p className="text-purple-100 mt-1">Comprehensive insights and performance data</p>
            </div>
            <button className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
              <Download size={20} />
              Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <Users size={32} />
                  <div className="text-3xl font-bold">{stats.totalStudents}</div>
                </div>
                <div className="text-emerald-100">Total Students</div>
                <div className="mt-2 text-sm text-emerald-100">
                  {stats.activeStudents} Active
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen size={32} />
                  <div className="text-3xl font-bold">{stats.totalCourses}</div>
                </div>
                <div className="text-blue-100">Active Courses</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign size={32} />
                  <div className="text-3xl font-bold">LKR {(stats.totalRevenue / 1000).toFixed(0)}K</div>
                </div>
                <div className="text-green-100">Total Revenue</div>
              </div>

              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 size={32} />
                  <div className="text-3xl font-bold">{stats.pendingApplications}</div>
                </div>
                <div className="text-amber-100">Pending Applications</div>
              </div>
            </div>

            {/* Report Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Student Analytics */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" />
                  Student Performance Analytics
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Retention Rate</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {stats.totalStudents > 0 ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-emerald-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${stats.totalStudents > 0 ? (stats.activeStudents / stats.totalStudents) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total Enrollments</span>
                      <span className="text-xl font-bold text-blue-600">{stats.totalStudents}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Active Students</span>
                      <span className="text-xl font-bold text-green-600">{stats.activeStudents}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="text-green-600" />
                  Financial Summary
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-600">
                        LKR {stats.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Average per Student</span>
                      <span className="text-xl font-bold text-blue-600">
                        LKR {stats.totalStudents > 0 ? Math.round(stats.totalRevenue / stats.totalStudents).toLocaleString() : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Reports */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-left">
                  <Calendar className="text-emerald-600 mb-2" size={24} />
                  <div className="font-semibold text-gray-900">Monthly Enrollment Report</div>
                  <div className="text-sm text-gray-600 mt-1">Student enrollment trends</div>
                </button>
                
                <button className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
                  <BookOpen className="text-blue-600 mb-2" size={24} />
                  <div className="font-semibold text-gray-900">Course Performance</div>
                  <div className="text-sm text-gray-600 mt-1">Course completion rates</div>
                </button>
                
                <button className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
                  <DollarSign className="text-green-600 mb-2" size={24} />
                  <div className="font-semibold text-gray-900">Revenue Analysis</div>
                  <div className="text-sm text-gray-600 mt-1">Financial breakdown</div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
