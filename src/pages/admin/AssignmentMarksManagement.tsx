import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Eye, CheckCircle, Clock, Award } from 'lucide-react';
import { adminService } from '../../services/adminService';

interface AssignmentSubmission {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  maxMarks: number;
  studentNic: string;
  studentName: string;
  studentEmail: string;
  submissionUrl: string;
  submissionName: string;
  submittedAt: string;
  marksObtained: number | null;
  status: string;
  feedback: string | null;
  isLate: boolean;
  gradedBy: string | null;
  gradedAt: string | null;
  moduleCode: string;
  moduleName: string;
  moduleId: number;
}

export function AssignmentMarksManagement() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<AssignmentSubmission[]>([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, SUBMITTED, GRADED
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Grading modal
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  // Get unique modules for filter
  const uniqueModules = Array.from(
    new Set(submissions.map(s => `${s.moduleId}:${s.moduleCode} - ${s.moduleName}`))
  );

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [submissions, statusFilter, moduleFilter, searchTerm]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(
        `${API_BASE_URL}/api/admin/assignments/submissions/pending`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSubmissions(result.data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Module filter
    if (moduleFilter !== 'all') {
      const moduleId = parseInt(moduleFilter.split(':')[0]);
      filtered = filtered.filter(s => s.moduleId === moduleId);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.studentName.toLowerCase().includes(term) ||
        s.studentEmail.toLowerCase().includes(term) ||
        s.assignmentTitle.toLowerCase().includes(term) ||
        s.moduleCode.toLowerCase().includes(term)
      );
    }

    setFilteredSubmissions(filtered);
  };

  const openGradeModal = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setMarks(submission.marksObtained?.toString() || '');
    setFeedback(submission.feedback || '');
    setShowGradeModal(true);
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    const marksValue = parseInt(marks);
    if (isNaN(marksValue) || marksValue < 0 || marksValue > selectedSubmission.maxMarks) {
      alert(`Marks must be between 0 and ${selectedSubmission.maxMarks}`);
      return;
    }

    try {
      setGrading(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(
        `${API_BASE_URL}/api/admin/assignments/submissions/${selectedSubmission.id}/grade`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            marksObtained: marksValue,
            feedback: feedback
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to grade submission');
      }

      alert('Assignment graded successfully!');
      setShowGradeModal(false);
      setSelectedSubmission(null);
      setMarks('');
      setFeedback('');
      
      // Reload submissions
      loadSubmissions();
    } catch (error) {
      console.error('Error grading submission:', error);
      alert('Failed to grade assignment');
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (status === 'GRADED') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
          <CheckCircle className="inline-block mr-1" size={14} />
          Graded
        </span>
      );
    }
    if (isLate) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
          <Clock className="inline-block mr-1" size={14} />
          Late Submission
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <Clock className="inline-block mr-1" size={14} />
        Pending Review
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-8 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
              <Award size={32} />
              Assignment Marks Management
            </h1>
            <p className="text-emerald-100">Review and grade student assignment submissions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Student name, email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="SUBMITTED">Pending Review</option>
                <option value="GRADED">Graded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Module</label>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Modules</option>
                {uniqueModules.map(module => (
                  <option key={module} value={module}>{module.split(':')[1]}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadSubmissions}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{submissions.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Review</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {submissions.filter(s => s.status === 'SUBMITTED').length}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="text-amber-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Graded</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {submissions.filter(s => s.status === 'GRADED').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No submissions found
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{submission.studentName}</div>
                          <div className="text-sm text-gray-600">{submission.studentEmail}</div>
                          <div className="text-xs text-gray-500 mt-1">{submission.studentNic}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{submission.assignmentTitle}</div>
                        <div className="text-sm text-gray-600">Max: {submission.maxMarks} marks</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{submission.moduleCode}</div>
                        <div className="text-sm text-gray-600">{submission.moduleName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(submission.submittedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(submission.status, submission.isLate)}
                      </td>
                      <td className="px-6 py-4">
                        {submission.marksObtained !== null ? (
                          <span className="text-lg font-bold text-emerald-600">
                            {submission.marksObtained}/{submission.maxMarks}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not graded</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${submission.submissionUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View Submission"
                          >
                            <Eye size={18} />
                          </a>
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${submission.submissionUrl}`}
                            download
                            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Download Submission"
                          >
                            <Download size={18} />
                          </a>
                          <button
                            onClick={() => openGradeModal(submission)}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                            title={submission.status === 'GRADED' ? 'Update Marks' : 'Grade Assignment'}
                          >
                            <Award size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grade Modal */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
              <h2 className="text-2xl font-bold">Grade Assignment</h2>
              <p className="text-emerald-100 mt-1">{selectedSubmission.assignmentTitle}</p>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Student</p>
                    <p className="font-semibold text-gray-900">{selectedSubmission.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Module</p>
                    <p className="font-semibold text-gray-900">{selectedSubmission.moduleCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Submitted</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Max Marks</p>
                    <p className="font-semibold text-gray-900">{selectedSubmission.maxMarks}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marks Obtained *
                </label>
                <input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  min="0"
                  max={selectedSubmission.maxMarks}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
                  placeholder="Enter marks"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a value between 0 and {selectedSubmission.maxMarks}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter feedback for the student..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowGradeModal(false);
                    setSelectedSubmission(null);
                    setMarks('');
                    setFeedback('');
                  }}
                  disabled={grading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGradeSubmission}
                  disabled={!marks || grading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {grading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Award size={18} />
                      Save Grade
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
