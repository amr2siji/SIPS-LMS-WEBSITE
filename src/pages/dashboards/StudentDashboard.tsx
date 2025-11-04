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
  intake_id: string;
  intake_name: string;
  status: string;
}

interface Module {
  id: string;
  module_code: string;
  module_name: string;
  credit_score: number;
}

interface LectureMaterial {
  id: string;
  title: string;
  file_url: string;
  uploaded_at: string;
}

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  max_marks: number;
  submitted: boolean;
  marks_obtained: number | null;
  assignment_file_url?: string;
}

export function StudentDashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [studentPrograms, setStudentPrograms] = useState<StudentProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [moduleMaterials, setModuleMaterials] = useState<{ [key: string]: LectureMaterial[] }>({});
  const [moduleAssignments, setModuleAssignments] = useState<{ [key: string]: Assignment[] }>({});
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
      setExpandedModules(new Set());
    }
  }, [selectedProgram]);

  const toggleModuleExpansion = async (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
      if (!moduleMaterials[moduleId]) {
        await loadModuleContent(moduleId);
      }
    }
    setExpandedModules(newExpanded);
  };

  const loadStudentPrograms = async () => {
    try {
      if (!profile?.id) return;

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
        intake_id: p.intakes?.id || '',
        intake_name: p.intakes?.intake_name || 'Unknown Intake',
        status: p.status,
      }));

      setStudentPrograms(formattedPrograms);
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

  const loadModuleContent = async (moduleId: string) => {
    try {
      const { data: materials, error: materialsError } = await supabase
        .from('lecture_materials')
        .select('*')
        .eq('module_id', moduleId)
        .order('uploaded_at', { ascending: false });

      if (materialsError) throw materialsError;

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          due_date,
          max_marks,
          assignment_file_url,
          assignment_submissions!left (
            student_id,
            marks_obtained
          )
        `)
        .eq('module_id', moduleId)
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
          due_date: a.due_date,
          max_marks: a.max_marks || 100,
          submitted: !!submission,
          marks_obtained: submission?.marks_obtained || null,
          assignment_file_url: a.assignment_file_url,
        };
      });

      setModuleMaterials(prev => ({ ...prev, [moduleId]: materials || [] }));
      setModuleAssignments(prev => ({ ...prev, [moduleId]: formattedAssignments }));

      const allAssignments = Object.values({ ...moduleAssignments, [moduleId]: formattedAssignments }).flat();
      const pending = allAssignments.filter(a => !a.submitted).length;
      const completed = allAssignments.filter(a => a.submitted).length;
      const allMaterials = Object.values({ ...moduleMaterials, [moduleId]: materials || [] }).flat();
      
      setStats(prev => ({
        ...prev,
        pendingAssignments: pending,
        completedAssignments: completed,
        totalMaterials: allMaterials.length,
      }));
    } catch (error) {
      console.error('Error loading module content:', error);
    }
  };

  const updateStats = async () => {
    try {
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
      <nav className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <img src="/sips.png" alt="SIPS Logo" className="h-14 w-12 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-white">Student Portal</h1>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile?.full_name}!</h2>
          <p className="text-gray-600">Your learning dashboard - track your progress and access course materials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                { icon: Upload, title: 'Submit Assignment', desc: 'Upload your completed assignments', color: 'from-emerald-500 to-emerald-600' },
                { icon: DollarSign, title: 'Upload Payment', desc: 'Submit payment proof documents', color: 'from-blue-500 to-blue-600' },
                { icon: Calendar, title: 'View Exam Schedule', desc: 'Check upcoming exam dates', color: 'from-purple-500 to-purple-600' },
                { icon: FileText, title: 'Download Materials', desc: 'Access lecture notes', color: 'from-amber-500 to-amber-600' },
                { icon: CheckCircle, title: 'View Results', desc: 'Check your grades', color: 'from-green-500 to-green-600' },
                { icon: BookOpen, title: 'View Modules', desc: 'Browse course modules', color: 'from-indigo-500 to-indigo-600' },
              ].map((action, idx) => (
                <button key={idx} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 text-left border border-gray-100 hover:border-emerald-200 relative overflow-hidden">
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">My Programs & Modules</h3>
              {studentPrograms.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No programs enrolled yet.</p>
              ) : (
                <div className="space-y-3">
                  {studentPrograms.map((program) => (
                    <div key={program.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setSelectedProgram(selectedProgram === program.program_id ? '' : program.program_id)}
                        className={`w-full text-left p-4 transition-all ${
                          selectedProgram === program.program_id ? 'bg-emerald-50 border-l-4 border-emerald-500' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{program.program_name}</h4>
                            <p className="text-sm text-gray-600">{program.intake_name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${program.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              {program.status}
                            </span>
                            <svg className={`w-5 h-5 text-gray-500 transition-transform ${selectedProgram === program.program_id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {selectedProgram === program.program_id && (
                        <div className="bg-gray-50 p-4 border-t border-gray-200">
                          {modules.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No modules available for this program.</p>
                          ) : (
                            <div className="space-y-2">
                              {modules.map((module) => (
                                <div key={module.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                  <button onClick={() => toggleModuleExpansion(module.id)} className="w-full text-left p-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <BookOpen className="text-emerald-600" size={16} />
                                          <h5 className="font-bold text-gray-900 text-sm">{module.module_name}</h5>
                                        </div>
                                        <p className="text-xs text-gray-600">{module.module_code}</p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-3">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">{module.credit_score} Credits</span>
                                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${expandedModules.has(module.id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </button>

                                  {expandedModules.has(module.id) && (
                                    <div className="border-t border-gray-200 bg-gray-50">
                                      <div className="p-3 border-b border-gray-200">
                                        <h6 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                          <Upload className="text-purple-600" size={14} />
                                          Lecture Materials
                                        </h6>
                                        {!moduleMaterials[module.id] || moduleMaterials[module.id].length === 0 ? (
                                          <p className="text-gray-500 text-xs text-center py-3">No materials available yet.</p>
                                        ) : (
                                          <div className="space-y-2">
                                            {moduleMaterials[module.id].map((material) => (
                                              <div key={material.id} className="bg-white rounded p-2 border border-gray-200 flex justify-between items-center">
                                                <div className="flex-1">
                                                  <h6 className="font-semibold text-gray-900 text-xs">{material.title}</h6>
                                                  <p className="text-xs text-gray-500">{new Date(material.uploaded_at).toLocaleDateString()}</p>
                                                </div>
                                                <a href={material.file_url} target="_blank" rel="noopener noreferrer" className="ml-2 bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-xs font-semibold transition-colors">
                                                  Download
                                                </a>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      <div className="p-3">
                                        <h6 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                                          <FileText className="text-amber-500" size={14} />
                                          Assignments
                                        </h6>
                                        {!moduleAssignments[module.id] || moduleAssignments[module.id].length === 0 ? (
                                          <p className="text-gray-500 text-xs text-center py-3">No assignments available.</p>
                                        ) : (
                                          <div className="space-y-2">
                                            {moduleAssignments[module.id].map((assignment) => (
                                              <div key={assignment.id} className={`bg-white rounded p-2 border-2 ${assignment.submitted ? 'border-green-300 bg-green-50' : 'border-amber-300'}`}>
                                                <div className="flex justify-between items-start">
                                                  <div className="flex-1">
                                                    <div className="flex items-center gap-1 mb-1">
                                                      {assignment.submitted ? <CheckCircle className="text-green-600" size={12} /> : <Clock className="text-amber-600" size={12} />}
                                                      <h6 className="font-semibold text-gray-900 text-xs">{assignment.title}</h6>
                                                    </div>
                                                    <div className="flex gap-2 text-xs">
                                                      <span className="text-gray-600">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                                      <span className="text-gray-600">Max: {assignment.max_marks}</span>
                                                      {assignment.submitted && assignment.marks_obtained !== null && (
                                                        <span className="text-green-600 font-semibold">Score: {assignment.marks_obtained}/{assignment.max_marks}</span>
                                                      )}
                                                    </div>
                                                    {assignment.assignment_file_url && (
                                                      <a
                                                        href={assignment.assignment_file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                                                      >
                                                        <FileText size={12} />
                                                        Download File
                                                      </a>
                                                    )}
                                                  </div>
                                                  {!assignment.submitted && (
                                                    <button className="ml-2 bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded text-xs font-semibold transition-colors">Submit</button>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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
