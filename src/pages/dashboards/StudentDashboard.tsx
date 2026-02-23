import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  BookOpen, FileText, Upload, DollarSign,
  Calendar, CheckCircle, Clock, LogOut, User, ChevronDown, ChevronUp, Layers, FileCheck, ClipboardList, ExternalLink, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { studentProgramService, StudentProgram, StudentDashboardStats, StudentModule, StudentLectureMaterial, StudentAssignment, StudentExam } from '../../services/studentProgramService';
import { NotificationBell } from '../../components/NotificationBell';

interface StudentDashboardData {
  studentInfo: {
    nic: string;
    fullName: string;
    email: string;
    enrolledPrograms: StudentProgram[];
  };
  stats: {
    totalModules: number;
    pendingAssignments: number;
    completedAssignments: number;
    totalMaterials: number;
  };
}

interface ProgramModules {
  [programId: number]: {
    modules: StudentModule[];
    loading: boolean;
  };
}

interface ModuleContent {
  materials?: StudentLectureMaterial[];
  assignments?: StudentAssignment[];
  exams?: StudentExam[];
  loading?: boolean;
}

interface ModuleContents {
  [moduleId: number]: ModuleContent;
}

export function StudentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<number>>(new Set());
  const [programModules, setProgramModules] = useState<ProgramModules>({});
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [moduleContents, setModuleContents] = useState<ModuleContents>({});

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

      // Load programs and stats from API
      const [programsResult, statsResult] = await Promise.all([
        studentProgramService.getMyPrograms(),
        studentProgramService.getDashboardStats()
      ]);

      if (programsResult.success && statsResult.success) {
        setDashboardData({
          studentInfo: {
            nic: user.nic,
            fullName: user.fullName || 'Student',
            email: '',
            enrolledPrograms: programsResult.data || []
          },
          stats: {
            totalModules: statsResult.data?.totalModules || 0,
            pendingAssignments: statsResult.data?.pendingAssignments || 0,
            completedAssignments: statsResult.data?.completedAssignments || 0,
            totalMaterials: statsResult.data?.totalMaterials || 0
          }
        });
      } else {
        console.error('Error loading dashboard data:', programsResult.message, statsResult.message);
        // Set empty data on error
        setDashboardData({
          studentInfo: {
            nic: user.nic,
            fullName: user.fullName || 'Student',
            email: '',
            enrolledPrograms: []
          },
          stats: {
            totalModules: 0,
            pendingAssignments: 0,
            completedAssignments: 0,
            totalMaterials: 0
          }
        });
      }
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      // Set empty data on error
      setDashboardData({
        studentInfo: {
          nic: user?.nic || '',
          fullName: user?.fullName || 'Student',
          email: '',
          enrolledPrograms: []
        },
        stats: {
          totalModules: 0,
          pendingAssignments: 0,
          completedAssignments: 0,
          totalMaterials: 0
        }
      });
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleProgramExpansion = async (programId: number) => {
    const newExpanded = new Set(expandedPrograms);
    
    if (newExpanded.has(programId)) {
      // Collapse
      newExpanded.delete(programId);
    } else {
      // Expand and load modules if not already loaded
      newExpanded.add(programId);
      
      if (!programModules[programId]) {
        setProgramModules(prev => ({
          ...prev,
          [programId]: { modules: [], loading: true }
        }));
        
        try {
          const result = await studentProgramService.getProgramModules(programId);
          if (result.success) {
            setProgramModules(prev => ({
              ...prev,
              [programId]: { modules: result.data || [], loading: false }
            }));
          } else {
            setProgramModules(prev => ({
              ...prev,
              [programId]: { modules: [], loading: false }
            }));
          }
        } catch (error) {
          console.error('Error loading modules:', error);
          setProgramModules(prev => ({
            ...prev,
            [programId]: { modules: [], loading: false }
          }));
        }
      }
    }
    
    setExpandedPrograms(newExpanded);
  };

  const toggleModuleExpansion = async (moduleId: number) => {
    const newExpanded = new Set(expandedModules);
    
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
      
      if (!moduleContents[moduleId]) {
        setModuleContents(prev => ({
          ...prev,
          [moduleId]: { loading: true }
        }));
        
        try {
          const [materialsResult, assignmentsResult, examsResult] = await Promise.all([
            studentProgramService.getModuleMaterials(moduleId),
            studentProgramService.getModuleAssignments(moduleId),
            studentProgramService.getModuleExams(moduleId)
          ]);
          
          setModuleContents(prev => ({
            ...prev,
            [moduleId]: {
              materials: materialsResult.success ? materialsResult.data : [],
              assignments: assignmentsResult.success ? assignmentsResult.data : [],
              exams: examsResult.success ? examsResult.data : [],
              loading: false
            }
          }));
        } catch (error) {
          console.error('Error loading module content:', error);
          setModuleContents(prev => ({
            ...prev,
            [moduleId]: {
              materials: [],
              assignments: [],
              exams: [],
              loading: false
            }
          }));
        }
      }
    }
    
    setExpandedModules(newExpanded);
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
              <NotificationBell />
              
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
                  {dashboardData.studentInfo.enrolledPrograms.map((program: StudentProgram, index: number) => {
                    const isExpanded = expandedPrograms.has(program.id);
                    const moduleData = programModules[program.id];
                    
                    return (
                      <div
                        key={program.id || index}
                        className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-emerald-300 transition-all hover:shadow-md"
                      >
                        {/* Program Header - Clickable */}
                        <div
                          onClick={() => toggleProgramExpansion(program.id)}
                          className="p-5 cursor-pointer hover:bg-emerald-50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg">
                                <BookOpen className="text-white" size={24} />
                              </div>
                              <div className="text-left flex-1">
                                <h4 className="font-bold text-gray-900 mb-1">{program.programName}</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                  <span>{program.facultyName}</span>
                                  {program.intakeName && (
                                    <>
                                      <span>•</span>
                                      <span className="text-emerald-600 font-medium">{program.intakeName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                program.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {program.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="text-gray-400" size={20} />
                              ) : (
                                <ChevronDown className="text-gray-400" size={20} />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content - Modules */}
                        {isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50 p-5">
                            {/* Quick Navigation Banner */}
                            <div className="mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg overflow-hidden">
                              <div className="p-5 flex items-center justify-between">
                                <div className="text-white">
                                  <h5 className="font-bold text-lg mb-1 flex items-center gap-2">
                                    <BookOpen size={22} />
                                    Access Full Course Content
                                  </h5>
                                  <p className="text-emerald-50 text-sm">
                                    View materials, submit assignments, and track your progress
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/student/modules?programId=${program.id}&programName=${encodeURIComponent(program.programName)}&intakeId=${program.intakeId || ''}`);
                                  }}
                                  className="px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg font-bold transition-all shadow-md hover:shadow-xl flex items-center gap-2"
                                >
                                  <ExternalLink size={18} />
                                  Open Modules
                                </button>
                              </div>
                            </div>
                            
                            {moduleData?.loading ? (
                              <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                                <p className="text-gray-600 mt-2">Loading modules...</p>
                              </div>
                            ) : moduleData?.modules && moduleData.modules.length > 0 ? (
                              <div className="space-y-3">
                                <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Layers size={18} />
                                  Modules ({moduleData.modules.length})
                                </h5>
                                <div className="grid gap-3">
                                  {moduleData.modules.map((module: StudentModule) => {
                                    const isModuleExpanded = expandedModules.has(module.id);
                                    const contentData = moduleContents[module.id];
                                    
                                    return (
                                    <div
                                      key={module.id}
                                      className="bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors overflow-hidden"
                                    >
                                      {/* Module Header - Clickable */}
                                      <div 
                                        onClick={() => toggleModuleExpansion(module.id)}
                                        className="p-4 cursor-pointer hover:bg-emerald-50 transition-colors"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex-1">
                                            <h6 className="font-semibold text-gray-900">{module.moduleName}</h6>
                                            {module.moduleCode && (
                                              <p className="text-xs text-gray-500 mt-1">{module.moduleCode}</p>
                                            )}
                                            {module.description && (
                                              <p className="text-sm text-gray-600 mt-2">{module.description}</p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 ml-3">
                                            {module.creditScore && (
                                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                {module.creditScore} Credits
                                              </span>
                                            )}
                                            {isModuleExpanded ? (
                                              <ChevronUp className="text-gray-400" size={18} />
                                            ) : (
                                              <ChevronDown className="text-gray-400" size={18} />
                                            )}
                                          </div>
                                        </div>
                                        
                                        {/* Module Stats */}
                                        <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                                          <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <FileText size={16} className="text-blue-500" />
                                            <span>{module.totalMaterials || 0} Materials</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <ClipboardList size={16} className="text-orange-500" />
                                            <span>{module.totalAssignments || 0} Assignments</span>
                                          </div>
                                          <div className="flex items-center gap-1 text-sm text-gray-600">
                                            <FileCheck size={16} className="text-green-500" />
                                            <span>{module.totalExams || 0} Exams</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Expanded Module Content */}
                                      {isModuleExpanded && (
                                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                                          {contentData?.loading ? (
                                            <div className="text-center py-6">
                                              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                                              <p className="text-gray-600 text-sm mt-2">Loading content...</p>
                                            </div>
                                          ) : (
                                            <div className="space-y-4">
                                              {/* Summary Cards Only - Simple View */}
                                              <div className="grid grid-cols-3 gap-3">
                                                {/* Materials Summary */}
                                                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
                                                  <FileText className="mx-auto text-blue-600 mb-2" size={32} />
                                                  <p className="text-2xl font-bold text-gray-900">
                                                    {contentData?.materials?.length || 0}
                                                  </p>
                                                  <p className="text-sm text-gray-600 font-medium">Materials</p>
                                                </div>

                                                {/* Assignments Summary */}
                                                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 text-center">
                                                  <ClipboardList className="mx-auto text-amber-600 mb-2" size={32} />
                                                  <p className="text-2xl font-bold text-gray-900">
                                                    {contentData?.assignments?.length || 0}
                                                  </p>
                                                  <p className="text-sm text-gray-600 font-medium">Assignments</p>
                                                </div>

                                                {/* Exams Summary */}
                                                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                                                  <FileCheck className="mx-auto text-green-600 mb-2" size={32} />
                                                  <p className="text-2xl font-bold text-gray-900">
                                                    {contentData?.exams?.length || 0}
                                                  </p>
                                                  <p className="text-sm text-gray-600 font-medium">Exams</p>
                                                </div>
                                              </div>

                                              {/* Pending Assignments Alert */}
                                              {contentData?.assignments && contentData.assignments.filter(a => a.submissionStatus === 'PENDING').length > 0 && (
                                                <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-4">
                                                  <div className="flex items-center gap-3">
                                                    <Clock className="text-amber-600" size={24} />
                                                    <div className="flex-1">
                                                      <p className="font-bold text-amber-900">
                                                        {contentData.assignments.filter(a => a.submissionStatus === 'PENDING').length} Pending Assignment{contentData.assignments.filter(a => a.submissionStatus === 'PENDING').length !== 1 ? 's' : ''}
                                                      </p>
                                                      <p className="text-sm text-amber-700">
                                                        Click "Open Modules" above to view details and submit your work
                                                      </p>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}

                                              {/* No Content Message */}
                                              {(!contentData?.materials || contentData.materials.length === 0) &&
                                               (!contentData?.assignments || contentData.assignments.length === 0) &&
                                               (!contentData?.exams || contentData.exams.length === 0) && (
                                                <p className="text-gray-500 text-center py-6 text-sm">
                                                  No content available for this module yet.
                                                </p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-center py-4">No modules available for this program.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}
