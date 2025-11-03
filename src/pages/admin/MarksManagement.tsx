import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, Clock, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  marks_obtained: number | null;
  status: string;
  submitted_at: string;
  assignments?: {
    title: string;
    max_marks: number;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  score: number | null;
  status: string;
  created_at: string;
  exams?: {
    exam_name: string;
    max_marks: number;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface OverallScore {
  id: string;
  student_id: string;
  module_id: string;
  assignment_score: number | null;
  exam_score: number | null;
  overall_score: number | null;
  grade: string | null;
  is_finalized: boolean;
  profiles?: {
    full_name: string;
    email: string;
  };
  modules?: {
    module_code: string;
    module_name: string;
  };
}

interface ScoreWeight {
  id: string;
  module_id: string;
  intake_id: string;
  assignments_weight: number;
  exams_weight: number;
  is_published: boolean;
}

export function MarksManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'assignments' | 'exams' | 'overall'>('assignments');
  
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [overallScores, setOverallScores] = useState<OverallScore[]>([]);
  const [scoreWeights, setScoreWeights] = useState<ScoreWeight[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [assignmentWeight, setAssignmentWeight] = useState(40);
  const [examWeight, setExamWeight] = useState(60);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'assignments') {
        await loadAssignmentSubmissions();
      } else if (activeTab === 'exams') {
        await loadExamSubmissions();
      } else {
        await loadOverallScores();
        await loadScoreWeights();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAssignmentSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignments (title, max_marks),
          profiles (full_name, email)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setAssignmentSubmissions(data || []);
    } catch (error) {
      console.error('Error loading assignment submissions:', error);
    }
  };

  const loadExamSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .select(`
          *,
          exams (exam_name, max_marks),
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExamSubmissions(data || []);
    } catch (error) {
      console.error('Error loading exam submissions:', error);
    }
  };

  const loadOverallScores = async () => {
    try {
      const { data, error } = await supabase
        .from('overall_scores')
        .select(`
          *,
          profiles (full_name, email),
          modules (module_code, module_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOverallScores(data || []);
    } catch (error) {
      console.error('Error loading overall scores:', error);
    }
  };

  const loadScoreWeights = async () => {
    try {
      const { data, error } = await supabase
        .from('module_score_weights')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScoreWeights(data || []);
    } catch (error) {
      console.error('Error loading score weights:', error);
    }
  };

  const handleGradeAssignment = async (submissionId: string, marks: number) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('assignment_submissions')
        .update({
          marks_obtained: marks,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', submissionId);

      if (error) throw error;
      loadAssignmentSubmissions();
      alert('Assignment graded successfully!');
    } catch (error) {
      console.error('Error grading assignment:', error);
      alert('Failed to grade assignment');
    }
  };

  const handleGradeExam = async (submissionId: string, score: number) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('exam_submissions')
        .update({
          score: score,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', submissionId);

      if (error) throw error;
      loadExamSubmissions();
      alert('Exam graded successfully!');
    } catch (error) {
      console.error('Error grading exam:', error);
      alert('Failed to grade exam');
    }
  };

  const handleSaveWeights = async () => {
    if (assignmentWeight + examWeight !== 100) {
      alert('Total weight must equal 100%');
      return;
    }

    try {
      const supabaseAny = supabase as any;
      // Note: You'll need to select module and intake in a real implementation
      const { error } = await supabaseAny
        .from('module_score_weights')
        .insert({
          module_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          intake_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          assignments_weight: assignmentWeight,
          exams_weight: examWeight,
          is_published: false
        });

      if (error) throw error;
      
      setShowWeightModal(false);
      loadScoreWeights();
      alert('Score weights saved successfully!');
    } catch (error) {
      console.error('Error saving weights:', error);
      alert('Failed to save weights. Please select a module and intake first.');
    }
  };

  const pendingAssignments = assignmentSubmissions.filter(s => s.status === 'pending');
  const gradedAssignments = assignmentSubmissions.filter(s => s.status === 'graded');
  const pendingExams = examSubmissions.filter(s => s.status === 'pending');
  const gradedExams = examSubmissions.filter(s => s.status === 'graded');

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
              <h1 className="text-3xl font-bold">Marks Management</h1>
              <p className="text-purple-100 mt-1">Manage student grades and scores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'assignments'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="inline-block mr-2" size={20} />
              Assignment Marks
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'exams'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="inline-block mr-2" size={20} />
              Exam Marks
            </button>
            <button
              onClick={() => setActiveTab('overall')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'overall'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="inline-block mr-2" size={20} />
              Overall Scores
            </button>
          </div>
        </div>

        {/* Assignment Marks Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Pending Assignments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-orange-500" size={24} />
                Pending Grading ({pendingAssignments.length})
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : pendingAssignments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending assignments to grade</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingAssignments.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-4 py-3">{submission.profiles?.full_name}</td>
                          <td className="px-4 py-3">{submission.assignments?.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">{submission.assignments?.max_marks}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                const marks = prompt(`Enter marks (0-${submission.assignments?.max_marks}):`);
                                if (marks !== null) {
                                  const marksNum = parseInt(marks);
                                  if (!isNaN(marksNum) && marksNum >= 0 && marksNum <= (submission.assignments?.max_marks || 0)) {
                                    handleGradeAssignment(submission.id, marksNum);
                                  } else {
                                    alert('Invalid marks entered');
                                  }
                                }
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                            >
                              Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Graded Assignments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={24} />
                Graded ({gradedAssignments.length})
              </h3>
              {gradedAssignments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No graded assignments yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {gradedAssignments.map((submission) => {
                        const percentage = submission.assignments?.max_marks
                          ? ((submission.marks_obtained || 0) / submission.assignments.max_marks) * 100
                          : 0;
                        return (
                          <tr key={submission.id}>
                            <td className="px-4 py-3">{submission.profiles?.full_name}</td>
                            <td className="px-4 py-3">{submission.assignments?.title}</td>
                            <td className="px-4 py-3 font-semibold">
                              {submission.marks_obtained}/{submission.assignments?.max_marks}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-sm ${
                                percentage >= 75 ? 'bg-green-100 text-green-800' :
                                percentage >= 50 ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {percentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exam Marks Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            {/* Pending Exams */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-orange-500" size={24} />
                Pending Grading ({pendingExams.length})
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : pendingExams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending exams to grade</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingExams.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-4 py-3">{submission.profiles?.full_name}</td>
                          <td className="px-4 py-3">{submission.exams?.exam_name}</td>
                          <td className="px-4 py-3">{submission.exams?.max_marks}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                const score = prompt(`Enter score (0-${submission.exams?.max_marks}):`);
                                if (score !== null) {
                                  const scoreNum = parseInt(score);
                                  if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= (submission.exams?.max_marks || 0)) {
                                    handleGradeExam(submission.id, scoreNum);
                                  } else {
                                    alert('Invalid score entered');
                                  }
                                }
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                            >
                              Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Graded Exams */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={24} />
                Graded ({gradedExams.length})
              </h3>
              {gradedExams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No graded exams yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {gradedExams.map((submission) => {
                        const percentage = submission.exams?.max_marks
                          ? ((submission.score || 0) / submission.exams.max_marks) * 100
                          : 0;
                        return (
                          <tr key={submission.id}>
                            <td className="px-4 py-3">{submission.profiles?.full_name}</td>
                            <td className="px-4 py-3">{submission.exams?.exam_name}</td>
                            <td className="px-4 py-3 font-semibold">
                              {submission.score}/{submission.exams?.max_marks}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-sm ${
                                percentage >= 75 ? 'bg-green-100 text-green-800' :
                                percentage >= 50 ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {percentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Scores Tab */}
        {activeTab === 'overall' && (
          <div className="space-y-6">
            {/* Score Weights Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="text-purple-600" size={24} />
                  Score Weight Configuration
                </h3>
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Configure Weights
                </button>
              </div>
              {scoreWeights.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No weight configurations yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scoreWeights.map((weight) => (
                    <div key={weight.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          weight.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {weight.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assignments:</span>
                          <span className="font-semibold">{weight.assignments_weight}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Exams:</span>
                          <span className="font-semibold">{weight.exams_weight}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Overall Scores List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Student Overall Scores</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : overallScores.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No overall scores calculated yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {overallScores.map((score) => (
                        <tr key={score.id}>
                          <td className="px-4 py-3">{score.profiles?.full_name}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium">{score.modules?.module_code}</div>
                              <div className="text-gray-500">{score.modules?.module_name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{score.assignment_score?.toFixed(2) || '-'}</td>
                          <td className="px-4 py-3">{score.exam_score?.toFixed(2) || '-'}</td>
                          <td className="px-4 py-3 font-bold">{score.overall_score?.toFixed(2) || '-'}</td>
                          <td className="px-4 py-3">
                            {score.grade && (
                              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                score.grade === 'A' || score.grade === 'A+' ? 'bg-green-100 text-green-800' :
                                score.grade === 'B' || score.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                                score.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {score.grade}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              score.is_finalized ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {score.is_finalized ? 'Finalized' : 'Draft'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weight Configuration Modal */}
        {showWeightModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Configure Score Weights</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignment Weight (%)
                  </label>
                  <input
                    type="number"
                    value={assignmentWeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setAssignmentWeight(val);
                      setExamWeight(100 - val);
                    }}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exam Weight (%)
                  </label>
                  <input
                    type="number"
                    value={examWeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setExamWeight(val);
                      setAssignmentWeight(100 - val);
                    }}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-purple-900">
                    Total: <span className="font-bold">{assignmentWeight + examWeight}%</span>
                    {assignmentWeight + examWeight !== 100 && (
                      <span className="text-red-600 ml-2">(Must equal 100%)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowWeightModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWeights}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Weights
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
