import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, FileText, Upload, Clock, CheckCircle, ArrowLeft, Calendar, Download
} from 'lucide-react';

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
  file_type: string;
  description: string;
  week_number?: number;
}

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  max_marks: number;
  submitted: boolean;
  marks_obtained: number | null;
}

interface WeeklyMaterials {
  [week: number]: LectureMaterial[];
}

export function StudentModules() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programId = searchParams.get('programId');
  const programName = searchParams.get('programName');
  const intakeId = searchParams.get('intakeId');

  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [weeklyMaterials, setWeeklyMaterials] = useState<WeeklyMaterials>({});
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (programId && intakeId) {
      loadModules();
    }
  }, [programId, intakeId]);

  useEffect(() => {
    if (selectedModule) {
      loadModuleContent(selectedModule);
    }
  }, [selectedModule]);

  const loadModules = async () => {
    try {
      setLoading(true);
      if (!programId || !intakeId) return;
      
      const { data: modulesData, error } = await supabase
        .from('modules')
        .select('*')
        .eq('program_id', programId)
        .eq('intake_id', intakeId)
        .eq('is_active', true)
        .order('module_code');

      if (error) throw error;
      setModules(modulesData || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModuleContent = async (moduleId: string) => {
    try {
      // Load lecture materials
      const { data: materials, error: materialsError } = await supabase
        .from('lecture_materials')
        .select('*')
        .eq('module_id', moduleId)
        .order('uploaded_at', { ascending: false });

      if (materialsError) throw materialsError;

      // Group materials by week (if week_number exists, otherwise group as week 1)
      const grouped: WeeklyMaterials = {};
      (materials || []).forEach((material: LectureMaterial) => {
        const week = material.week_number || 1;
        if (!grouped[week]) {
          grouped[week] = [];
        }
        grouped[week].push(material);
      });

      setWeeklyMaterials(grouped);

      // Load assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          title,
          due_date,
          max_marks,
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
        };
      });

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error loading module content:', error);
    }
  };

  const toggleWeek = (weekNumber: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNumber)) {
      newExpanded.delete(weekNumber);
    } else {
      newExpanded.add(weekNumber);
    }
    setExpandedWeeks(newExpanded);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return '📄';
      case 'ppt':
        return '📊';
      case 'word':
        return '📝';
      case 'excel':
        return '📈';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <div className="h-8 w-px bg-white/20"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">{programName}</h1>
                <p className="text-sm text-emerald-100">Course Modules & Materials</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {modules.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Modules Available</h3>
            <p className="text-gray-600">There are no active modules for this program yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Modules Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="text-emerald-600" size={24} />
                  Modules
                </h2>
                <div className="space-y-2">
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedModule === module.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm mb-1">{module.module_name}</h3>
                          <p className="text-xs text-gray-600">{module.module_code}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold ml-2">
                          {module.credit_score}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              {!selectedModule ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                  <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Module</h3>
                  <p className="text-gray-600">Choose a module from the sidebar to view materials and assignments</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Lecture Materials Section */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <Upload size={20} />
                        Lecture Materials
                      </h2>
                      <p className="text-purple-100 mt-1 text-sm">Organized by week</p>
                    </div>

                    <div className="p-6">
                      {Object.keys(weeklyMaterials).length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No materials available yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {Object.keys(weeklyMaterials)
                            .map(Number)
                            .sort((a, b) => a - b)
                            .map((weekNumber) => (
                              <div key={weekNumber} className="border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                  onClick={() => toggleWeek(weekNumber)}
                                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <Calendar className="text-purple-600" size={20} />
                                    <span className="font-bold text-gray-900">Week {weekNumber}</span>
                                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
                                      {weeklyMaterials[weekNumber].length} {weeklyMaterials[weekNumber].length === 1 ? 'file' : 'files'}
                                    </span>
                                  </div>
                                  <svg
                                    className={`w-5 h-5 text-gray-500 transition-transform ${
                                      expandedWeeks.has(weekNumber) ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>

                                {expandedWeeks.has(weekNumber) && (
                                  <div className="bg-white p-4 border-t border-gray-200">
                                    <div className="space-y-2">
                                      {weeklyMaterials[weekNumber].map((material) => (
                                        <div
                                          key={material.id}
                                          className="bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-all hover:shadow-md"
                                        >
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1 flex items-start gap-3">
                                              <span className="text-2xl">{getFileIcon(material.file_type)}</span>
                                              <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 mb-1">{material.title}</h4>
                                                {material.description && (
                                                  <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                                                )}
                                                <p className="text-xs text-gray-500">
                                                  Uploaded: {new Date(material.uploaded_at).toLocaleDateString()}
                                                </p>
                                              </div>
                                            </div>
                                            <div className="ml-4 flex items-center gap-2">
                                              <a
                                                href={material.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                                              >
                                                <FileText size={16} />
                                                View
                                              </a>
                                              <a
                                                href={material.file_url}
                                                download
                                                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md"
                                              >
                                                <Download size={16} />
                                                Download
                                              </a>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignments Section */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-white">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <FileText size={20} />
                        Assignments
                      </h2>
                      <p className="text-amber-100 mt-1 text-sm">Upcoming and submitted work</p>
                    </div>

                    <div className="p-6">
                      {assignments.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No assignments available.</p>
                      ) : (
                        <div className="space-y-3">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className={`rounded-lg p-4 border-2 ${
                                assignment.submitted
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-amber-300 bg-amber-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {assignment.submitted ? (
                                      <CheckCircle className="text-green-600" size={20} />
                                    ) : (
                                      <Clock className="text-amber-600" size={20} />
                                    )}
                                    <h3 className="font-bold text-gray-900">{assignment.title}</h3>
                                  </div>
                                  <div className="flex gap-4 text-sm">
                                    <span className="text-gray-600">
                                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                                    </span>
                                    <span className="text-gray-600">Max: {assignment.max_marks}</span>
                                    {assignment.submitted && assignment.marks_obtained !== null && (
                                      <span className="text-green-600 font-semibold">
                                        Score: {assignment.marks_obtained}/{assignment.max_marks}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {!assignment.submitted && (
                                  <button className="ml-4 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                                    Submit
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
