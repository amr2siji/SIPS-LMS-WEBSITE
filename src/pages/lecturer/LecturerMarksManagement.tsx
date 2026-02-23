import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, BookOpen, Award, Edit, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AssignmentSubmission {
  id: number;
  studentNic: string;
  studentName: string;
  studentEmail: string;
  assignmentId: number;
  assignmentTitle: string;
  maxMarks: number;
  marksObtained: number | null;
  status: string;
  submittedAt: string;
  feedback: string | null;
  submissionUrl: string | null;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
}

interface ExamSubmission {
  id: number;
  studentNic: string;
  studentName: string;
  studentEmail: string;
  examId: number;
  examName: string;
  maxMarks: number;
  score: number | null;
  status: string;
  submittedAt: string;
  feedback: string | null;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
}

interface OverallScore {
  studentNic: string;
  studentName: string;
  studentEmail: string;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  assignmentScore: number | null;
  examScore: number | null;
  overallScore: number | null;
  grade: string | null;
  isPublished: boolean;
}

export function LecturerMarksManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assignments' | 'exams' | 'overall'>('assignments');
  
  const [assignedIntakes, setAssignedIntakes] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [overallScores, setOverallScores] = useState<OverallScore[]>([]);
  
  // Filter states
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal states
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [gradeType, setGradeType] = useState<'assignment' | 'exam'>('assignment');
  const [marksInput, setMarksInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [showOverallModal, setShowOverallModal] = useState(false);
  const [selectedOverallScore, setSelectedOverallScore] = useState<OverallScore | null>(null);
  const [overallMarksInput, setOverallMarksInput] = useState('');
  
  // Publish/Unpublish modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish');
  const [publishModuleId, setPublishModuleId] = useState('');
  
  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({ show: false, type: 'success', message: '' });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadIntakesAndModules(),
        loadAssignmentSubmissions(),
        loadExamSubmissions(),
        loadOverallScores()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('error', 'Failed to load marks management data');
    } finally {
      setLoading(false);
    }
  };

  const loadIntakesAndModules = async () => {
    const token = localStorage.getItem('jwt_token');

    // Get assigned intakes
    const intakesResponse = await fetch(`${API_BASE_URL}/api/lecturer/marks/assigned-intakes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (intakesResponse.ok) {
      const intakesResult = await intakesResponse.json();
      if (intakesResult.statusCode === '000' && intakesResult.data) {
        setAssignedIntakes(intakesResult.data);
      }
    }

    // Get assigned modules
    const modulesResponse = await fetch(`${API_BASE_URL}/api/lecturer/marks/assigned-modules`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (modulesResponse.ok) {
      const modulesResult = await modulesResponse.json();
      if (modulesResult.statusCode === '000' && modulesResult.data) {
        setModules(modulesResult.data);
      }
    }
  };

  const loadAssignmentSubmissions = async () => {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`${API_BASE_URL}/api/lecturer/marks/assignments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.statusCode === '000' && result.data) {
        setAssignmentSubmissions(result.data);
      }
    }
  };

  const loadExamSubmissions = async () => {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`${API_BASE_URL}/api/lecturer/marks/exams`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.statusCode === '000' && result.data) {
        setExamSubmissions(result.data);
      }
    }
  };

  const loadOverallScores = async () => {
    const token = localStorage.getItem('jwt_token');
    const url = selectedModule !== 'all' 
      ? `${API_BASE_URL}/api/lecturer/marks/overall?moduleId=${selectedModule}`
      : `${API_BASE_URL}/api/lecturer/marks/overall`;
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const result = await response.json();
      if (result.statusCode === '000' && result.data) {
        setOverallScores(result.data);
      }
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !marksInput) {
      showNotification('error', 'Please enter marks');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      
      let response;
      
      // For exams without submission ID, use the direct grading endpoint
      if (gradeType === 'exam' && !selectedSubmission.id) {
        response = await fetch(`${API_BASE_URL}/api/lecturer/marks/exams/grade`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            examId: selectedSubmission.examId,
            studentNic: selectedSubmission.studentNic,
            marks: parseFloat(marksInput),
            feedback: feedbackInput || null
          })
        });
      } else {
        // For assignments or exams with existing submissions, use the update endpoint
        const endpoint = gradeType === 'assignment' 
          ? `${API_BASE_URL}/api/lecturer/marks/assignments/${selectedSubmission.id}`
          : `${API_BASE_URL}/api/lecturer/marks/exams/${selectedSubmission.id}`;

        response = await fetch(endpoint, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            marks: parseFloat(marksInput),
            feedback: feedbackInput || null
          })
        });
      }

      if (response.ok) {
        showNotification('success', `${gradeType === 'assignment' ? 'Assignment' : 'Exam'} graded successfully`);
        setShowGradeModal(false);
        setMarksInput('');
        setFeedbackInput('');
        setSelectedSubmission(null);
        
        // Reload data
        if (gradeType === 'assignment') {
          await loadAssignmentSubmissions();
        } else {
          await loadExamSubmissions();
        }
        await loadOverallScores();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Failed to grade submission');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      showNotification('error', 'Failed to grade submission');
    }
  };

  const handleSetOverallScore = async () => {
    if (!selectedOverallScore || !overallMarksInput) {
      showNotification('error', 'Please enter overall marks');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/api/lecturer/marks/overall`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentNic: selectedOverallScore.studentNic,
          moduleId: selectedOverallScore.moduleId,
          overallScore: parseFloat(overallMarksInput)
        })
      });

      if (response.ok) {
        showNotification('success', 'Overall score set successfully');
        setShowOverallModal(false);
        setOverallMarksInput('');
        setSelectedOverallScore(null);
        await loadOverallScores();
      } else {
        const error = await response.json();
        showNotification('error', error.message || 'Failed to set overall score');
      }
    } catch (error) {
      console.error('Error setting overall score:', error);
      showNotification('error', 'Failed to set overall score');
    }
  };

  const handlePublish = async (moduleId: number) => {
    if (!assignedIntakes[0]?.id) {
      showNotification('error', 'No intake assigned');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        showNotification('error', 'Please login again');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/lecturer/marks/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moduleId: moduleId,
          intakeId: assignedIntakes[0].id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to publish results');
      }

      const result = await response.json();
      const count = result.data?.publishedCount || 0;
      
      showNotification('success', `Successfully published ${count} result(s)!`);
      setShowPublishModal(false);
      setPublishModuleId('');
      await loadOverallScores();
    } catch (error: any) {
      console.error('Error publishing results:', error);
      showNotification('error', error.message || 'Failed to publish results');
    }
  };

  const handleUnpublish = async (moduleId: number) => {
    if (!assignedIntakes[0]?.id) {
      showNotification('error', 'No intake assigned');
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      
      if (!token) {
        showNotification('error', 'Please login again');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/lecturer/marks/unpublish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          moduleId: moduleId,
          intakeId: assignedIntakes[0].id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unpublish results');
      }

      const result = await response.json();
      const count = result.data?.unpublishedCount || 0;
      
      showNotification('success', `Successfully unpublished ${count} result(s)!`);
      setShowPublishModal(false);
      setPublishModuleId('');
      await loadOverallScores();
    } catch (error: any) {
      console.error('Error unpublishing results:', error);
      showNotification('error', error.message || 'Failed to unpublish results');
    }
  };

  const handlePublishAction = async () => {
    if (!publishModuleId) {
      showNotification('error', 'Please select a module');
      return;
    }

    if (publishAction === 'publish') {
      await handlePublish(parseInt(publishModuleId));
    } else {
      await handleUnpublish(parseInt(publishModuleId));
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: 'success', message: '' });
    }, 5000);
  };

  const openGradeModal = (submission: any, type: 'assignment' | 'exam') => {
    setSelectedSubmission(submission);
    setGradeType(type);
    setMarksInput(type === 'assignment' ? (submission.marksObtained?.toString() || '') : (submission.score?.toString() || ''));
    setFeedbackInput(submission.feedback || '');
    setShowGradeModal(true);
  };

  const openOverallModal = (score: OverallScore) => {
    setSelectedOverallScore(score);
    setOverallMarksInput(score.overallScore?.toString() || '');
    setShowOverallModal(true);
  };

  // Filter functions
  const filterSubmissions = (submissions: any[]) => {
    return submissions.filter(sub => {
      const matchesModule = selectedModule === 'all' || sub.moduleId.toString() === selectedModule;
      const matchesSearch = searchTerm === '' || 
        sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.studentNic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || sub.status.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesModule && matchesSearch && matchesStatus;
    });
  };

  const filteredAssignments = filterSubmissions(assignmentSubmissions);
  const filteredExams = filterSubmissions(examSubmissions);
  const filteredOverall = overallScores.filter(score => {
    const matchesModule = selectedModule === 'all' || score.moduleId.toString() === selectedModule;
    const matchesSearch = searchTerm === '' || 
      score.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      score.studentNic.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesModule && matchesSearch;
  });

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade === 'D') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
          {notification.type === 'success' ? <Check size={20} /> : <X size={20} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-cyan-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Marks Management</h1>
              <p className="text-cyan-100 mt-1">Grade assignments, exams, and manage overall scores for your assigned intake</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading marks management data...</p>
          </div>
        ) : (
          <>
            {/* Intake Info Banner */}
            {assignedIntakes.length > 0 && (
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-4 mb-6 text-white">
                <p className="text-sm font-medium">Your Assigned Intake</p>
                <p className="text-lg font-bold">{assignedIntakes[0].intakeName} - {assignedIntakes[0].intakeYear}</p>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                  <select
                    value={selectedModule}
                    onChange={(e) => {
                      setSelectedModule(e.target.value);
                      if (activeTab === 'overall') {
                        loadOverallScores();
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Modules</option>
                    {modules.map(module => (
                      <option key={module.id} value={module.id}>
                        {module.moduleCode} - {module.moduleName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name or NIC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {activeTab !== 'overall' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="submitted">Pending</option>
                      <option value="graded">Graded</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'assignments'
                        ? 'border-b-2 border-purple-600 text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FileText size={18} />
                      Assignment Marks ({filteredAssignments.length})
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('exams')}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'exams'
                        ? 'border-b-2 border-purple-600 text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen size={18} />
                      Exam Marks ({filteredExams.length})
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab('overall')}
                    className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'overall'
                        ? 'border-b-2 border-purple-600 text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Award size={18} />
                      Overall Scores ({filteredOverall.length})
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Assignment Marks Tab */}
                {activeTab === 'assignments' && (
                  <div className="overflow-x-auto">
                    {filteredAssignments.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>No assignment submissions found</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Assignment</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Module</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Marks</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAssignments.map((submission) => (
                            <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">{submission.studentName}</p>
                                  <p className="text-sm text-gray-500">{submission.studentNic}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-gray-900">{submission.assignmentTitle}</p>
                                <p className="text-sm text-gray-500">Max: {submission.maxMarks}</p>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-sm text-gray-600">{submission.moduleCode}</p>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-semibold text-gray-900">
                                  {submission.marksObtained !== null ? submission.marksObtained : '-'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  submission.status === 'GRADED' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submission.status === 'GRADED' ? 'Graded' : 'Pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => openGradeModal(submission, 'assignment')}
                                  className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1"
                                >
                                  <Edit size={18} />
                                  <span className="text-sm">Grade</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Exam Marks Tab */}
                {activeTab === 'exams' && (
                  <div className="overflow-x-auto">
                    {filteredExams.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>No exam submissions found</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Exam</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Module</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Score</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredExams.map((submission, idx) => (
                            <tr key={submission.id != null ? `exam-${submission.id}` : `exam-pending-${submission.examId}-${submission.studentNic}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-medium text-gray-900">{submission.studentName}</p>
                                  <p className="text-sm text-gray-500">{submission.studentNic}</p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-gray-900">{submission.examName}</p>
                                <p className="text-sm text-gray-500">Max: {submission.maxMarks}</p>
                              </td>
                              <td className="py-3 px-4">
                                <p className="text-sm text-gray-600">{submission.moduleCode}</p>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className="font-semibold text-gray-900">
                                  {submission.score !== null ? submission.score : '-'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  submission.status === 'GRADED' 
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submission.status === 'GRADED' ? 'Graded' : 'Pending'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  onClick={() => openGradeModal(submission, 'exam')}
                                  className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1"
                                >
                                  <Edit size={18} />
                                  <span className="text-sm">Grade</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Overall Scores Tab */}
                {activeTab === 'overall' && (
                  <div>
                    {/* Publish/Unpublish Button */}
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900">Student Overall Scores</h3>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowPublishModal(true);
                            setPublishAction('publish');
                            setPublishModuleId(selectedModule !== 'all' ? selectedModule : '');
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <Check size={18} />
                          Publish Results
                        </button>
                        <button
                          onClick={() => {
                            setShowPublishModal(true);
                            setPublishAction('unpublish');
                            setPublishModuleId(selectedModule !== 'all' ? selectedModule : '');
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          <X size={18} />
                          Unpublish Results
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      {filteredOverall.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Award size={48} className="mx-auto mb-4 text-gray-400" />
                          <p>No overall scores found</p>
                          <p className="text-sm mt-2">Select a specific module or grade some submissions first</p>
                        </div>
                      ) : (
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Student</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Module</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Assignment</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Exam</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Overall</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Grade</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOverall.map((score, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="font-medium text-gray-900">{score.studentName}</p>
                                    <p className="text-sm text-gray-500">{score.studentNic}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <p className="text-sm text-gray-900">{score.moduleCode}</p>
                                  <p className="text-xs text-gray-500">{score.moduleName}</p>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-gray-900 font-medium">
                                    {score.assignmentScore !== null ? score.assignmentScore.toFixed(1) : '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-gray-900 font-medium">
                                    {score.examScore !== null ? score.examScore.toFixed(1) : '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-lg font-bold text-purple-600">
                                    {score.overallScore !== null ? score.overallScore.toFixed(1) : '-'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {score.grade ? (
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(score.grade)}`}>
                                      {score.grade}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    score.isPublished 
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {score.isPublished ? 'Published' : 'Draft'}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => openOverallModal(score)}
                                    className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                                  >
                                    Set Score
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Grade {gradeType === 'assignment' ? 'Assignment' : 'Exam'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-medium text-gray-900">{selectedSubmission.studentName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  {gradeType === 'assignment' ? 'Assignment' : 'Exam'}
                </p>
                <p className="font-medium text-gray-900">
                  {gradeType === 'assignment' ? selectedSubmission.assignmentTitle : selectedSubmission.examName}
                </p>
                <p className="text-sm text-gray-500">Max Marks: {gradeType === 'assignment' ? selectedSubmission.maxMarks : selectedSubmission.maxMarks}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks Obtained *
                </label>
                <input
                  type="number"
                  value={marksInput}
                  onChange={(e) => setMarksInput(e.target.value)}
                  min="0"
                  max={gradeType === 'assignment' ? selectedSubmission.maxMarks : selectedSubmission.maxMarks}
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter marks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter feedback for student"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowGradeModal(false);
                  setMarksInput('');
                  setFeedbackInput('');
                  setSelectedSubmission(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGradeSubmission}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Save Marks
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overall Score Modal */}
      {showOverallModal && selectedOverallScore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Set Overall Score</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-medium text-gray-900">{selectedOverallScore.studentName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Module</p>
                <p className="font-medium text-gray-900">{selectedOverallScore.moduleCode} - {selectedOverallScore.moduleName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Assignment Score</p>
                  <p className="font-medium text-gray-900">
                    {selectedOverallScore.assignmentScore !== null ? selectedOverallScore.assignmentScore.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exam Score</p>
                  <p className="font-medium text-gray-900">
                    {selectedOverallScore.examScore !== null ? selectedOverallScore.examScore.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Score (Out of 100) *
                </label>
                <input
                  type="number"
                  value={overallMarksInput}
                  onChange={(e) => setOverallMarksInput(e.target.value)}
                  min="0"
                  max="100"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter overall score"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowOverallModal(false);
                  setOverallMarksInput('');
                  setSelectedOverallScore(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetOverallScore}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Save Score
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Publish/Unpublish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {publishAction === 'publish' ? 'Publish Results' : 'Unpublish Results'}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  {publishAction === 'publish' 
                    ? '✅ This will make the results visible to students. They will be able to see their grades for the selected module.'
                    : '⚠️ This will hide the published results from students. They will no longer be able to see their grades for the selected module.'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Module *
                </label>
                <select
                  value={publishModuleId}
                  onChange={(e) => setPublishModuleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>
                      {module.moduleCode} - {module.moduleName}
                    </option>
                  ))}
                </select>
              </div>

              {assignedIntakes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Intake</p>
                  <p className="font-medium text-gray-900">
                    {assignedIntakes[0].intakeName} - {assignedIntakes[0].intakeYear}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setPublishModuleId('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                  publishAction === 'publish'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {publishAction === 'publish' ? 'Publish' : 'Unpublish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
