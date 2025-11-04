import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, BookOpen, TrendingUp, Download } from 'lucide-react';

interface ModuleResult {
  module_id: string;
  module_code: string;
  module_name: string;
  credit_score: number;
  program_id: string;
  program_name: string;
  department_id: string;
  department_name: string;
  faculty_name: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string;
  gpa: number;
}

export function StudentResults() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<ModuleResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalModules: 0,
    averagePercentage: 0,
    overallGrade: '',
    cgpa: 0,
  });

  useEffect(() => {
    if (profile) {
      loadResults();
    }
  }, [profile]);

  const loadResults = async () => {
    try {
      setLoading(true);

      if (!profile?.id) {
        setLoading(false);
        return;
      }

      // Get student's enrolled programs
      const { data: studentPrograms, error: programsError } = await supabase
        .from('student_programs')
        .select('program_id, intake_id')
        .eq('student_id', profile.id)
        .eq('is_active', true);

      if (programsError) throw programsError;

      if (!studentPrograms || studentPrograms.length === 0) {
        setLoading(false);
        return;
      }

      // Get all modules for enrolled programs
      const programIds = studentPrograms.map((p: any) => p.program_id);
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select(`
          id,
          module_code,
          module_name,
          credit_score,
          program_id,
          programs:program_id (
            id,
            name,
            department_id,
            departments:department_id (
              id,
              name,
              faculty_id,
              faculties:faculty_id (
                name
              )
            )
          )
        `)
        .in('program_id', programIds)
        .eq('is_active', true);

      if (modulesError) throw modulesError;

      // Get all assignments and submissions for these modules
      const moduleIds = (modules || []).map((m: any) => m.id);
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select(`
          id,
          module_id,
          max_marks,
          assignment_submissions (
            student_id,
            marks_obtained
          )
        `)
        .in('module_id', moduleIds)
        .eq('is_published', true);

      if (assignmentsError) throw assignmentsError;

      // Calculate results for each module
      const moduleResults: ModuleResult[] = [];
      
      for (const module of (modules || [])) {
        const moduleAssignments = (assignments || []).filter((a: any) => a.module_id === (module as any).id);
        const totalMarks = moduleAssignments.reduce((sum: number, a: any) => sum + (a.max_marks || 0), 0);
        
        let obtainedMarks = 0;
        let completedAssignments = 0;

        for (const assignment of moduleAssignments) {
          const submission = (assignment as any).assignment_submissions?.find(
            (s: any) => s.student_id === profile?.id
          );
          if (submission && submission.marks_obtained !== null) {
            obtainedMarks += submission.marks_obtained;
            completedAssignments++;
          }
        }

        // Only include modules with at least one graded assignment
        if (completedAssignments > 0 && totalMarks > 0) {
          const percentage = (obtainedMarks / totalMarks) * 100;
          const { grade, gpa } = calculateGrade(percentage);

          moduleResults.push({
            module_id: (module as any).id,
            module_code: (module as any).module_code,
            module_name: (module as any).module_name,
            credit_score: (module as any).credit_score,
            program_id: (module as any).programs?.id || '',
            program_name: (module as any).programs?.name || 'Unknown Program',
            department_id: (module as any).programs?.departments?.id || '',
            department_name: (module as any).programs?.departments?.name || 'Unknown Department',
            faculty_name: (module as any).programs?.departments?.faculties?.name || 'Unknown Faculty',
            total_marks: totalMarks,
            obtained_marks: obtainedMarks,
            percentage: percentage,
            grade: grade,
            gpa: gpa,
          });
        }
      }

      // Calculate overall statistics
      if (moduleResults.length > 0) {
        const totalPercentage = moduleResults.reduce((sum, r) => sum + r.percentage, 0);
        const averagePercentage = totalPercentage / moduleResults.length;
        const { grade: overallGrade } = calculateGrade(averagePercentage);
        
        // Calculate CGPA (weighted by credit scores)
        const totalCredits = moduleResults.reduce((sum, r) => sum + r.credit_score, 0);
        const weightedGPA = moduleResults.reduce((sum, r) => sum + (r.gpa * r.credit_score), 0);
        const cgpa = totalCredits > 0 ? weightedGPA / totalCredits : 0;

        setOverallStats({
          totalModules: moduleResults.length,
          averagePercentage: averagePercentage,
          overallGrade: overallGrade,
          cgpa: cgpa,
        });
      }

      setResults(moduleResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (percentage: number): { grade: string; gpa: number } => {
    if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
    if (percentage >= 85) return { grade: 'A', gpa: 4.0 };
    if (percentage >= 80) return { grade: 'A-', gpa: 3.7 };
    if (percentage >= 75) return { grade: 'B+', gpa: 3.3 };
    if (percentage >= 70) return { grade: 'B', gpa: 3.0 };
    if (percentage >= 65) return { grade: 'B-', gpa: 2.7 };
    if (percentage >= 60) return { grade: 'C+', gpa: 2.3 };
    if (percentage >= 55) return { grade: 'C', gpa: 2.0 };
    if (percentage >= 50) return { grade: 'C-', gpa: 1.7 };
    if (percentage >= 45) return { grade: 'D', gpa: 1.0 };
    return { grade: 'F', gpa: 0.0 };
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800 border-green-300';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (grade.startsWith('D')) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Group results by department and program
  const groupedResults = results.reduce((acc, result) => {
    const deptKey = result.department_name;
    if (!acc[deptKey]) {
      acc[deptKey] = {
        department_name: result.department_name,
        faculty_name: result.faculty_name,
        programs: {}
      };
    }
    const progKey = result.program_name;
    if (!acc[deptKey].programs[progKey]) {
      acc[deptKey].programs[progKey] = [];
    }
    acc[deptKey].programs[progKey].push(result);
    return acc;
  }, {} as Record<string, any>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
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
                <h1 className="text-2xl font-bold text-white">Academic Results</h1>
                <p className="text-sm text-emerald-100">View your grades and performance</p>
              </div>
            </div>
            <button
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all font-medium border border-white/20"
            >
              <Download size={18} />
              Export PDF
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Statistics */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed Modules</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{overallStats.totalModules}</h3>
                  <p className="text-sm text-emerald-600 font-medium">Graded courses</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-xl">
                  <BookOpen className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{overallStats.averagePercentage.toFixed(1)}%</h3>
                  <p className="text-sm text-blue-600 font-medium">Overall percentage</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                  <TrendingUp className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">Overall Grade</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{overallStats.overallGrade}</h3>
                  <p className="text-sm text-purple-600 font-medium">Letter grade</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl">
                  <Award className="text-white" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">CGPA</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{overallStats.cgpa.toFixed(2)}</h3>
                  <p className="text-sm text-amber-600 font-medium">Cumulative GPA</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-xl">
                  <Award className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        {results.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
            <Award className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-600">You don't have any graded assignments yet. Results will appear here once your assignments are evaluated.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedResults).map((deptName) => {
              const deptData = groupedResults[deptName];
              return (
                <div key={deptName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Department Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
                    <h2 className="text-lg font-bold">{deptName}</h2>
                    <p className="text-indigo-100 text-sm">{deptData.faculty_name}</p>
                  </div>

                  {/* Programs */}
                  <div className="p-6">
                    {Object.keys(deptData.programs).map((programName) => {
                      const programResults = deptData.programs[programName];
                      const programAvg = programResults.reduce((sum: number, r: ModuleResult) => sum + r.percentage, 0) / programResults.length;
                      const { grade: programGrade } = calculateGrade(programAvg);

                      return (
                        <div key={programName} className="mb-6 last:mb-0">
                          {/* Program Header */}
                          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{programName}</h3>
                              <p className="text-sm text-gray-600">{programResults.length} module(s)</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-1">Program Average</div>
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-gray-900">{programAvg.toFixed(1)}%</span>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold border-2 ${getGradeColor(programGrade)}`}>
                                  {programGrade}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Modules Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Module Code</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Module Name</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Credits</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Marks</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Percentage</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Grade</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">GPA</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {programResults.map((result: ModuleResult) => (
                                  <tr key={result.module_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-4 text-sm font-medium text-gray-900">{result.module_code}</td>
                                    <td className="px-4 py-4 text-sm text-gray-900">{result.module_name}</td>
                                    <td className="px-4 py-4 text-sm text-center">
                                      <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                                        {result.credit_score}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-center text-gray-900">
                                      <span className="font-semibold">{result.obtained_marks}</span>
                                      <span className="text-gray-500"> / {result.total_marks}</span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-center">
                                      <span className="font-bold text-gray-900">{result.percentage.toFixed(1)}%</span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-center">
                                      <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-bold border-2 ${getGradeColor(result.grade)}`}>
                                        {result.grade}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-center">
                                      <span className="font-bold text-gray-900">{result.gpa.toFixed(2)}</span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grade Legend */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Grading Scale</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-11 gap-3">
              {[
                { grade: 'A+', range: '90-100', gpa: '4.0' },
                { grade: 'A', range: '85-89', gpa: '4.0' },
                { grade: 'A-', range: '80-84', gpa: '3.7' },
                { grade: 'B+', range: '75-79', gpa: '3.3' },
                { grade: 'B', range: '70-74', gpa: '3.0' },
                { grade: 'B-', range: '65-69', gpa: '2.7' },
                { grade: 'C+', range: '60-64', gpa: '2.3' },
                { grade: 'C', range: '55-59', gpa: '2.0' },
                { grade: 'C-', range: '50-54', gpa: '1.7' },
                { grade: 'D', range: '45-49', gpa: '1.0' },
                { grade: 'F', range: '0-44', gpa: '0.0' },
              ].map((item) => (
                <div key={item.grade} className={`p-3 rounded-lg border-2 ${getGradeColor(item.grade)} text-center`}>
                  <div className="font-bold text-lg mb-1">{item.grade}</div>
                  <div className="text-xs">{item.range}%</div>
                  <div className="text-xs font-semibold mt-1">GPA: {item.gpa}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
