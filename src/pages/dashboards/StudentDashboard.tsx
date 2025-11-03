import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  BookOpen, FileText, Upload, DollarSign,
  Calendar, CheckCircle, Clock, LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentProgram {
  id: string;
  program_id: string;
  program_name: string;
  program_code: string;
  intake_id: string;
  intake_name: string;
  status: string;
}

interface Module {
  id: string;
  module_code: string;
  module_name: string;
  description: string;
  credit_score: number;
}

interface LectureMaterial {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_marks: number;
  is_published: boolean;
  submitted: boolean;
  marks_obtained: number | null;
}

export function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [studentPrograms, setStudentPrograms] = useState<StudentProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [lectureMaterials, setLectureMaterials] = useState<LectureMaterial[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState({
    totalModules: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    totalMaterials: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      loadStudentPrograms();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedProgram) {
      loadModulesByProgram();
    } else {
      setModules([]);
      setSelectedModule('');
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedModule) {
      loadModuleContent();
    } else {
      setLectureMaterials([]);
      setAssignments([]);
    }
  }, [selectedModule]);

  const loadStudentPrograms = async () => {
    try {
      if (!profile?.id) return;

      // Load student's enrolled programs
      const { data: programs, error } = await supabase
        .from('student_programs')
        .select(`
          id,
          program_id,
          intake_id,
          status,
          programs:program_id (
            id,
            name,
            program_type
          ),
          intakes:intake_id (
            id,
            intake_name
          )
        `)
        .eq('student_id', profile.id)
        .eq('is_active', true);

      if (error) throw error;

      const formattedPrograms: StudentProgram[] = (programs || []).map((p: any) => ({
        id: p.id,
        program_id: p.programs?.id || '',
        program_name: p.programs?.name || 'Unknown Program',
        program_code: p.programs?.program_type || '',
        intake_id: p.intakes?.id || '',
        intake_name: p.intakes?.intake_name || 'Unknown Intake',
        status: p.status,
      }));

      setStudentPrograms(formattedPrograms);

      // Calculate stats
      updateStats();
    } catch (error) {
      console.error('Error loading student programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModulesByProgram = async () => {
    try {
      const selectedProgramData = studentPrograms.find(p => p.program_id === selectedProgram);
      if (!selectedProgramData) return;

      const { data: modulesData, error } = await supabase
        .from('modules')
        .select('*')
        .eq('program_id', selectedProgram)
        .eq('intake_id', selectedProgramData.intake_id)
        .eq('is_active', true)
        .order('module_code');

      if (error) throw error;

      setModules(modulesData || []);
      setStats(prev => ({ ...prev, totalModules: modulesData?.length || 0 }));
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const loadModuleContent = async () => {
    try {
      // Load lecture materials
      const { data: materials, error: materialsError } = await supabase
        .from('lecture_materials')
        .select('*')
        .eq('module_id', selectedModule)
        .order('uploaded_at', { ascending: false });

      if (materialsError) throw materialsError;
      setLectureMaterials(materials || []);

      // Load published assignments for this module
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          description,
          due_date,
          max_marks,
          is_published,
          assignment_submissions!left (
            student_id,
            marks_obtained
          )
        `)
        .eq('module_id', selectedModule)
        .eq('is_published', true)
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      const formattedAssignments: Assignment[] = (assignmentsData || []).map((a: any) => {
        const submission = a.assignment_submissions?.find(
          (s: any) => s.student_id === profile?.id
        );
        return {
          id: a.id,
          title: a.title,
          description: a.description || '',
          due_date: a.due_date,
          max_marks: a.max_marks || 100,
          is_published: a.is_published,
          submitted: !!submission,
          marks_obtained: submission?.marks_obtained || null,
        };
      });

      setAssignments(formattedAssignments);

      // Update stats
      const pending = formattedAssignments.filter(a => !a.submitted).length;
      const completed = formattedAssignments.filter(a => a.submitted).length;
      setStats(prev => ({
        ...prev,
        pendingAssignments: pending,
        completedAssignments: completed,
        totalMaterials: materials?.length || 0,
      }));
    } catch (error) {
      console.error('Error loading module content:', error);
    }
  };

  const updateStats = async () => {
    try {
      // Get all modules across all programs
      const programIds = studentPrograms.map(p => p.program_id);
      const { data: allModules } = await supabase
        .from('modules')
        .select('id')
        .in('program_id', programIds)
        .eq('is_active', true);

      setStats(prev => ({ ...prev, totalModules: allModules?.length || 0 }));
    } catch (error) {
      console.error('Error updating stats:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Modern Header matching Admin Dashboard */}
      <nav className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <img src="/sips.png" alt="SIPS Logo" className="h-14 w-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Student Portal
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile?.full_name}!</h2>
          <p className="text-gray-600">Your learning dashboard - track your progress and access course materials</p>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Programs Card */}
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Enrolled Programs</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{studentPrograms.length}</h3>
                <p className="text-sm text-emerald-600 font-medium">Active enrollment</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                <BookOpen className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Total Modules Card */}
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

          {/* Pending Assignments Card */}
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

          {/* Lecture Materials Card */}
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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Row: Program Selection and Progress Summary */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Program Selection */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Select Your Program</h3>
                {studentPrograms.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No programs enrolled yet.</p>
                ) : (
                  <div className="space-y-3">
                    {studentPrograms.map((program) => (
                      <button
                        key={program.id}
                        onClick={() => {
                          setSelectedProgram(program.program_id);
                          setSelectedModule('');
                        }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedProgram === program.program_id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300 bg-white'
                        }`}
                      >
                        <h4 className="font-bold text-gray-900 mb-1">{program.program_name}</h4>
                        <p className="text-sm text-gray-600">{program.intake_name}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          program.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {program.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Summary */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Progress Summary</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Assignments Completed</span>
                      <span className="font-semibold text-gray-900">
                        {stats.completedAssignments}/{stats.completedAssignments + stats.pendingAssignments}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            stats.completedAssignments + stats.pendingAssignments > 0
                              ? (stats.completedAssignments / (stats.completedAssignments + stats.pendingAssignments)) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Active Modules:</span>
                      <span className="font-semibold text-gray-900">{modules.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Resources Available:</span>
                      <span className="font-semibold text-gray-900">{stats.totalMaterials}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Section - Admin Dashboard Style */}
            <div>
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600 mt-1">Access key student functions</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <button
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <Upload className="text-white" size={24} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      Submit Assignment
                    </h4>
                    <p className="text-sm text-gray-600">Upload your completed assignments</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <button
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <DollarSign className="text-white" size={24} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      Upload Payment
                    </h4>
                    <p className="text-sm text-gray-600">Submit payment proof documents</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <button
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <Calendar className="text-white" size={24} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      View Exam Schedule
                    </h4>
                    <p className="text-sm text-gray-600">Check upcoming exam dates and times</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <button
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <FileText className="text-white" size={24} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      Download Materials
                    </h4>
                    <p className="text-sm text-gray-600">Access lecture notes and resources</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <button
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <CheckCircle className="text-white" size={24} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      View Results
                    </h4>
                    <p className="text-sm text-gray-600">Check your grades and performance</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                <button
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg group-hover:scale-110 transition-transform">
                        <BookOpen className="text-white" size={24} />
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-emerald-700 transition-colors">
                      View Modules
                    </h4>
                    <p className="text-sm text-gray-600">Browse your enrolled course modules</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>

            {/* Module Selection */}
            {selectedProgram && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="text-emerald-700" />
                  Program Modules
                </h3>
                {modules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No modules available for this program.</p>
                ) : (
                  <div className="space-y-3">
                    {modules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => setSelectedModule(module.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedModule === module.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{module.module_name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{module.module_code}</p>
                            {module.description && (
                              <p className="text-sm text-gray-500 mt-2">{module.description}</p>
                            )}
                          </div>
                          <div className="ml-4">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {module.credit_score} Credits
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Module Content - Lecture Materials */}
            {selectedModule && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="text-purple-600" />
                  Lecture Materials
                </h3>
                {lectureMaterials.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No lecture materials available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {lectureMaterials.map((material) => (
                      <div key={material.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{material.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              Uploaded: {new Date(material.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <a
                            href={material.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Module Content - Pending Assignments */}
            {selectedModule && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="text-amber-500" />
                  Pending Assignments
                </h3>
                {assignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No assignments available.</p>
                ) : (
                  <div className="space-y-3">
                    {assignments.filter(a => !a.submitted).map((assignment) => (
                      <div key={assignment.id} className="border border-gray-200 rounded-lg p-4 hover:border-amber-500 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{assignment.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                          </div>
                          <Clock className="text-amber-500" size={24} />
                        </div>
                        <div className="flex justify-between items-center text-sm mt-3">
                          <span className="text-gray-600">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                          <span className="text-amber-600 font-semibold">
                            Max Marks: {assignment.max_marks}
                          </span>
                        </div>
                        <button className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-semibold transition-colors">
                          Submit Assignment
                        </button>
                      </div>
                    ))}
                    {assignments.filter(a => !a.submitted).length === 0 && (
                      <p className="text-green-600 text-center py-8 font-medium">All assignments completed! 🎉</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Completed Assignments */}
            {selectedModule && assignments.filter(a => a.submitted).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" />
                  Completed Assignments
                </h3>
                <div className="space-y-3">
                  {assignments.filter(a => a.submitted).map((assignment) => (
                    <div key={assignment.id} className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
                      <h4 className="font-semibold text-gray-900 text-sm">{assignment.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Submitted: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                      {assignment.marks_obtained !== null && (
                        <p className="text-sm font-bold text-green-600 mt-2">
                          Score: {assignment.marks_obtained}/{assignment.max_marks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
