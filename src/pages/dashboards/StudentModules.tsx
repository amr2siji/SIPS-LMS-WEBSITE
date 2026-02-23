import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen, FileText, Upload, Clock, CheckCircle, ArrowLeft, Calendar, Download, Eye
} from 'lucide-react';

interface Module {
  id: number;
  moduleCode: string;
  moduleName: string;
  creditScore: number;
  description?: string;
  facultyName?: string;
  departmentName?: string;
  programName?: string;
  intakeName?: string;
}

interface FileInfo {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

interface LectureMaterial {
  id: string;
  title: string;
  description: string;
  week?: number;
  files: FileInfo[];
  uploadedBy?: string;
  createdAt?: string;
}

interface Assignment {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  due_date: string;
  max_marks: number;
  submitted: boolean;
  marks_obtained: number | null;
  attachmentFileUrl?: string;
  attachmentFileName?: string;
  submissionFileUrl?: string;
  submissionFileName?: string;
  submittedAt?: string;
}

interface WeeklyMaterials {
  [week: number]: LectureMaterial[];
}

export function StudentModules() {
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
  
  // Assignment submission states
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({ show: false, type: 'success', title: '', message: '' });

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => setNotification({ show: false, type: 'success', title: '', message: '' }), 4000);
  };

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
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(
        `${API_BASE_URL}/api/student/programs/${programId}/modules`,
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
      const modulesData = result.data || [];
      setModules(modulesData);
      
      // Auto-select the first module if available and no module is currently selected
      if (modulesData.length > 0 && !selectedModule) {
        setSelectedModule(modulesData[0].id.toString());
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModuleContent = async (moduleId: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      // Load lecture materials
      const materialsResponse = await fetch(
        `${API_BASE_URL}/api/student/modules/${moduleId}/materials`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!materialsResponse.ok) {
        throw new Error(`HTTP error! status: ${materialsResponse.status}`);
      }

      const materialsResult = await materialsResponse.json();
      const materials = materialsResult.data || [];

      // Group materials by week (if week exists, otherwise group as week 1)
      const grouped: WeeklyMaterials = {};
      materials.forEach((material: LectureMaterial) => {
        const week = material.week || 1;
        if (!grouped[week]) {
          grouped[week] = [];
        }
        grouped[week].push(material);
      });

      setWeeklyMaterials(grouped);

      // Load assignments
      const assignmentsResponse = await fetch(
        `${API_BASE_URL}/api/student/modules/${moduleId}/assignments`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!assignmentsResponse.ok) {
        throw new Error(`HTTP error! status: ${assignmentsResponse.status}`);
      }

      const assignmentsResult = await assignmentsResponse.json();
      const assignmentsData = assignmentsResult.data || [];

      const formattedAssignments: Assignment[] = assignmentsData.map((a: any) => {
        return {
          id: a.id,
          title: a.title,
          description: a.description,
          instructions: a.instructions,
          due_date: a.dueDate || a.due_date,
          max_marks: a.maxMarks || a.max_marks || 100,
          submitted: a.hasSubmitted || a.submitted || false,
          marks_obtained: a.marksObtained || a.marks_obtained || null,
          attachmentFileUrl: a.attachmentUrl || a.attachmentFileUrl || a.attachment_file_url,
          attachmentFileName: a.attachmentName || a.attachmentFileName || a.attachment_file_name,
          submissionFileUrl: a.submissionUrl || a.submissionFileUrl || a.submission_file_url,
          submissionFileName: a.submissionName || a.submissionFileName || a.submission_file_name,
          submittedAt: a.submittedAt || a.submitted_at,
        };
      });

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error loading module content:', error);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!submissionFile || !selectedAssignment) return;

    try {
      setSubmitting(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      // Upload file first
      const formData = new FormData();
      formData.append('file', submissionFile);

      const uploadResponse = await fetch(
        `${API_BASE_URL}/api/student/assignments/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      const uploadResult = await uploadResponse.json();
      const fileUrl = uploadResult.data.fileUrl;
      const originalFilename = uploadResult.data.originalFilename;

      // Submit assignment
      const submitResponse = await fetch(
        `${API_BASE_URL}/api/student/assignments/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            assignmentId: selectedAssignment.id,
            submissionFileUrl: fileUrl,
            submissionFileName: originalFilename
          })
        }
      );

      if (!submitResponse.ok) {
        throw new Error('Assignment submission failed');
      }

      showNotification('success', 'Assignment Submitted', `"${selectedAssignment?.title}" has been submitted successfully!`);
      setShowSubmitModal(false);
      setSubmissionFile(null);
      setSelectedAssignment(null);

      // Reload module content to update assignment status
      if (selectedModule) {
        loadModuleContent(selectedModule);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showNotification('error', 'Submission Failed', 'Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const viewFile = async (fileUrl: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');
      
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_BASE_URL}${fileUrl}`;
      
      const response = await fetch(fullUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      // Clean up the blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Error viewing file:', error);
      showNotification('error', 'File Error', 'Failed to open file. Please try again.');
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

      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-[100] max-w-sm w-full shadow-lg rounded-lg p-4 flex items-start gap-3 transition-all duration-300 ${
          notification.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`text-xl ${notification.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
            {notification.type === 'success' ? '✅' : '❌'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
              {notification.title}
            </p>
            <p className={`text-sm mt-0.5 ${notification.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(n => ({ ...n, show: false }))}
            className={`text-lg leading-none ${notification.type === 'success' ? 'text-emerald-400 hover:text-emerald-600' : 'text-red-400 hover:text-red-600'}`}
          >
            ×
          </button>
        </div>
      )}

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
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 pb-3 border-b-2 border-emerald-500">
                  <BookOpen className="text-emerald-600" size={24} />
                  My Modules
                </h2>
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module.id.toString())}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-[1.02] ${
                        selectedModule === module.id.toString()
                          ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-sm mb-1 line-clamp-2 ${
                            selectedModule === module.id.toString() ? 'text-emerald-900' : 'text-gray-900'
                          }`}>
                            {module.moduleName}
                          </h3>
                          <p className={`text-xs ${
                            selectedModule === module.id.toString() ? 'text-emerald-700' : 'text-gray-600'
                          }`}>
                            {module.moduleCode}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          selectedModule === module.id.toString()
                            ? 'bg-emerald-500 text-white'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {module.creditScore} Credits
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
                <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100">
                  <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="text-emerald-600" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Your Modules</h3>
                  <p className="text-gray-600 mb-2">Select a module from the sidebar to view:</p>
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      📚 Lecture Materials
                    </span>
                    <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      📝 Assignments
                    </span>
                  </div>
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
                                          <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">{material.title}</h4>
                                            {material.description && (
                                              <p className="text-sm text-gray-600 mb-2">{material.description}</p>
                                            )}
                                            {material.createdAt && (
                                              <p className="text-xs text-gray-500 mb-3">
                                                Uploaded: {new Date(material.createdAt).toLocaleDateString()}
                                              </p>
                                            )}
                                            
                                            {/* Files list */}
                                            <div className="space-y-2 mt-3">
                                              {material.files.map((file, idx) => (
                                                <div key={idx} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                                                  <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                                                    <div>
                                                      <p className="font-medium text-gray-900 text-sm">{file.fileName}</p>
                                                      <p className="text-xs text-gray-500">
                                                        {(file.fileSize / 1024).toFixed(2)} KB
                                                      </p>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <a
                                                      href={file.fileUrl}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                                                    >
                                                      <FileText size={14} />
                                                      View
                                                    </a>
                                                    <a
                                                      href={file.fileUrl}
                                                      download
                                                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm hover:shadow-md"
                                                    >
                                                      <Download size={14} />
                                                      Download
                                                    </a>
                                                  </div>
                                                </div>
                                              ))}
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
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-5 text-white">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText size={24} />
                        Assignments
                      </h2>
                      <p className="text-emerald-100 mt-1">Complete and submit your assignments below</p>
                    </div>

                    <div className="p-6">
                      {assignments.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="text-gray-400" size={40} />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">No Assignments Yet</h3>
                          <p className="text-gray-500">There are no assignments available for this module at the moment.</p>
                          <p className="text-gray-400 text-sm mt-1">Check back later for new assignments.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className={`rounded-xl border-2 shadow-sm hover:shadow-md transition-all ${
                                assignment.submitted
                                  ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                                  : 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50'
                              }`}
                            >
                              {/* Assignment Card */}
                              <div className="p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-start gap-3 flex-1">
                                    {assignment.submitted ? (
                                      <div className="bg-green-500 p-2 rounded-lg">
                                        <CheckCircle className="text-white" size={24} />
                                      </div>
                                    ) : (
                                      <div className="bg-emerald-500 p-2 rounded-lg">
                                        <Clock className="text-white" size={24} />
                                      </div>
                                    )}
                                    <div className="flex-1">
                                      <h3 className="font-bold text-gray-900 text-lg mb-1">{assignment.title}</h3>
                                      <div className="flex flex-wrap gap-3 text-sm">
                                        <span className="text-gray-600 flex items-center gap-1">
                                          <Calendar size={14} />
                                          Due: {new Date(assignment.due_date).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </span>
                                        <span className="text-gray-600">
                                          📊 {assignment.max_marks} marks
                                        </span>
                                        {assignment.submitted && assignment.marks_obtained !== null && (
                                          <span className="text-green-700 font-bold">
                                            ✅ Score: {assignment.marks_obtained}/{assignment.max_marks}
                                          </span>
                                        )}
                                        {assignment.submitted && assignment.marks_obtained === null && (
                                          <span className="text-blue-600 font-semibold">
                                            ⏳ Awaiting Grade
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {assignment.submitted ? (
                                    <span className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold text-sm shadow-sm">
                                      Completed
                                    </span>
                                  ) : (
                                    <span className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-sm shadow-sm">
                                      Pending
                                    </span>
                                  )}
                                </div>

                                {/* Description & Instructions (Always Visible) */}
                                <div className="space-y-3 mb-4">
                                  {assignment.description && (
                                    <div className="bg-white/80 p-4 rounded-lg border border-gray-200">
                                      <p className="text-xs font-bold text-gray-600 mb-2">📄 DESCRIPTION</p>
                                      <p className="text-gray-700 text-sm leading-relaxed">{assignment.description}</p>
                                    </div>
                                  )}

                                  {assignment.instructions && (
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                      <p className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1">
                                        📝 INSTRUCTIONS
                                      </p>
                                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                                        {assignment.instructions}
                                      </pre>
                                    </div>
                                  )}
                                  
                                  {/* Assignment File Info */}
                                  {assignment.attachmentFileName && (
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                      <div className="flex items-center gap-2 text-sm">
                                        <FileText size={16} className="text-purple-600" />
                                        <span className="text-purple-900 font-medium">
                                          Assignment File: <span className="font-bold">{assignment.attachmentFileName}</span>
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                  {assignment.attachmentFileUrl && (
                                    <button
                                      onClick={() => viewFile(assignment.attachmentFileUrl!)}
                                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md text-sm"
                                    >
                                      <Download size={16} />
                                      Download Assignment File
                                    </button>
                                  )}
                                  
                                  {!assignment.submitted && (
                                    <button 
                                      onClick={() => openSubmitModal(assignment)}
                                      className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-bold transition-all shadow-md hover:shadow-lg text-sm"
                                    >
                                      <Upload size={18} />
                                      Submit Assignment
                                    </button>
                                  )}
                                  
                                  {assignment.submitted && assignment.submissionFileUrl && (
                                    <div className="flex gap-2 flex-1">
                                      <button
                                        onClick={() => viewFile(assignment.submissionFileUrl!)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md text-sm"
                                      >
                                        <Eye size={16} />
                                        View Submission
                                      </button>
                                      <button
                                        onClick={() => viewFile(assignment.submissionFileUrl!)}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-sm hover:shadow-md text-sm"
                                      >
                                        <Download size={16} />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Submitted Indicator with Details */}
                                {assignment.submitted && (
                                  <div className="mt-4 pt-4 border-t border-green-200">
                                    <div className="bg-green-50 rounded-lg p-4 space-y-3">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="text-green-600" size={20} />
                                        <p className="text-sm font-bold text-green-800">
                                          Assignment Submitted Successfully!
                                        </p>
                                      </div>
                                      
                                      {assignment.submittedAt && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                          <Clock size={16} className="text-gray-500" />
                                          <span>Submitted on: {new Date(assignment.submittedAt).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}</span>
                                        </div>
                                      )}
                                      
                                      {assignment.submissionFileName && (
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                          <FileText size={16} className="text-gray-500" />
                                          <span>File: <span className="font-semibold">{assignment.submissionFileName}</span></span>
                                        </div>
                                      )}
                                      
                                      {assignment.marks_obtained === null ? (
                                        <div className="bg-blue-100 border border-blue-200 rounded-md p-3 mt-2">
                                          <p className="text-sm font-medium text-blue-800">
                                            ⏳ Your submission is being reviewed. Marks will be available once graded.
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="bg-green-100 border border-green-200 rounded-md p-3 mt-2">
                                          <p className="text-sm font-bold text-green-800">
                                            ✅ Graded: {assignment.marks_obtained}/{assignment.max_marks} marks
                                            {assignment.max_marks > 0 && (
                                              <span className="ml-2">
                                                ({((assignment.marks_obtained / assignment.max_marks) * 100).toFixed(1)}%)
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
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

      {/* Assignment Submission Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Upload size={28} />
                Submit Assignment
              </h2>
              <p className="text-emerald-100 mt-2 text-lg font-semibold">{selectedAssignment.title}</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  📅 Due: {new Date(selectedAssignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  📊 {selectedAssignment.max_marks} marks
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* File Upload Section */}
              <div>
                <label className="block text-lg font-bold text-gray-900 mb-4">
                  📤 Upload Your Submission *
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-emerald-400 transition-colors bg-gray-50">
                  <div className="text-center mb-4">
                    <Upload className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-700 font-semibold mb-1">
                      Choose a file or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      All file types accepted • Maximum 50 MB
                    </p>
                  </div>
                  
                  <input
                    type="file"
                    onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-700 
                      file:mr-4 file:py-3 file:px-6 
                      file:rounded-lg file:border-0 
                      file:text-sm file:font-bold
                      file:bg-emerald-500
                      file:text-white
                      hover:file:bg-emerald-600
                      file:cursor-pointer file:transition-colors
                      cursor-pointer"
                  />
                </div>

                {/* File Preview */}
                {submissionFile && (
                  <div className="mt-4 bg-green-50 border-2 border-green-300 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                      <div className="flex-1">
                        <p className="font-bold text-green-900 mb-2">File Selected</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700">
                            <span className="font-semibold">Name:</span> {submissionFile.name}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-semibold">Size:</span> {(submissionFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {submissionFile.type && (
                            <p className="text-gray-700">
                              <span className="font-semibold">Type:</span> {submissionFile.type}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!submissionFile && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-sm">
                    <span>⚠️</span>
                    <p className="text-yellow-800">Please select a file to continue</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSubmissionFile(null);
                    setSelectedAssignment(null);
                  }}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={!submissionFile || submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Submit Assignment
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
