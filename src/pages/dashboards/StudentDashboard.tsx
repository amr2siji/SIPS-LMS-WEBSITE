import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen, FileText, Upload, DollarSign,
  Calendar, CheckCircle, Clock, LogOut, Bell, User, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentDashboardData {
  studentInfo: {
    nic: string;
    fullName: string;
    email: string;
    enrolledPrograms: string[];
  };
  stats: {
    totalModules: number;
    pendingAssignments: number;
    completedAssignments: number;
    totalMaterials: number;
  };
}

export function StudentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (!user?.nic) {
        console.warn('User information not found');
        setLoading(false);
        return;
      }

      // TODO: Replace with real API call when backend is ready
      // For now, use mock data to display dashboard
      console.log('Using mock data for student dashboard - API not implemented yet');
      
      setDashboardData({
        studentInfo: {
          nic: user.nic,
          fullName: user.fullName || 'Student',
          email: '',
          enrolledPrograms: ['Information Technology', 'Business Management']
        },
        stats: {
          totalModules: 8,
          pendingAssignments: 3,
          completedAssignments: 12,
          totalMaterials: 45
        }
      });
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
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

  const stats = dashboardData?.stats || {
    totalModules: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    totalMaterials: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <nav className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <img src="/sips.png" alt="SIPS Logo" className="h-16 w-auto object-contain" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white italic">Student Portal</h1>
                <p className="text-sm md:text-base text-emerald-100">{user?.fullName || user?.nic}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg transition-all font-medium border border-white/20"
                title="Notifications"
              >
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg transition-all font-medium border border-white/20"
                >
                  <User size={18} />
                  <span className="hidden md:inline">Profile</span>
                  <ChevronDown size={16} className={`transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'Student'}</p>
                      <p className="text-xs text-gray-600">{user?.nic}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">Student</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/student/profile');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User size={16} />
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        navigate('/student/settings');
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileText size={16} />
                      Settings
                    </button>
                  </div>
                )}
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.fullName || 'Student'}!</h2>
          <p className="text-gray-600">Your learning dashboard - track your progress and access course materials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Enrolled Programs</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{dashboardData?.studentInfo?.enrolledPrograms?.length || 0}</h3>
                <p className="text-sm text-emerald-600 font-medium">Active enrollment</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                <BookOpen className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Modules</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalModules}</h3>
                <p className="text-sm text-blue-600 font-medium">Active modules</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Assignments</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.pendingAssignments}</h3>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-green-600 font-semibold">{stats.completedAssignments}</span>
                  <span className="text-gray-500">completed</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Lecture Materials</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalMaterials}</h3>
                <p className="text-sm text-purple-600 font-medium">Available resources</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                <Upload className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600 mt-1">Access key student functions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: DollarSign, title: 'Upload Payment', desc: 'Submit payment proof documents', color: 'from-blue-500 to-blue-600', onClick: () => navigate('/student/payments') },
                { icon: Calendar, title: 'View Exam Schedule', desc: 'Check upcoming exam dates', color: 'from-purple-500 to-purple-600', onClick: () => navigate('/student/exam-schedule') },
                { icon: CheckCircle, title: 'View Results', desc: 'Check your grades', color: 'from-green-500 to-green-600', onClick: () => navigate('/student/results') },
              ].map((action, idx) => (
                <button 
                  key={idx} 
                  onClick={action.onClick}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`bg-gradient-to-br ${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                        <action.icon className="text-white" size={24} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600">{action.desc}</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">My Programs</h3>
              {!dashboardData?.studentInfo?.enrolledPrograms || dashboardData.studentInfo.enrolledPrograms.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No programs enrolled yet.</p>
              ) : (
                <div className="space-y-3">
                  {dashboardData.studentInfo.enrolledPrograms.map((programName: string, index: number) => (
                    <div
                      key={index}
                      className="w-full bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 hover:bg-emerald-50 transition-all hover:shadow-md group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                            <BookOpen className="text-white" size={24} />
                          </div>
                          <div className="text-left">
                            <h4 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">{programName}</h4>
                            <p className="text-sm text-gray-600">Active Program</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
