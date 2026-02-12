import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, Edit, Trash2, Eye, X, File, Loader, Calendar, AlertCircle } from 'lucide-react';
import { assignmentService, AssignmentResponse, AssignmentCreateRequest, AssignmentUpdateRequest } from '../../services/assignmentService';
import { lecturerService, LecturerModuleAssignmentResponse } from '../../services/lecturerService';
import { useAuth } from '../../contexts/AuthContext';

export function LecturerAssignmentManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [myModules, setMyModules] = useState<LecturerModuleAssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentResponse | null>(null);
  
  // Filter states
  const [filterModule, setFilterModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [selectedModule, setSelectedModule] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [uploading, setUploading] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'success' as 'success' | 'error',
    title: '',
    message: ''
  });

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm'
  });

  // File preview state
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (user?.nic) {
      loadLecturerModules();
    }
  }, [user]);

  useEffect(() => {
    if (myModules.length > 0) {
      loadAssignments();
    }
  }, [myModules]);

  const loadLecturerModules = async () => {
    try {
      if (!user?.nic) return;
      
      // Get current lecturer's modules (no admin access needed)
      const modulesResponse = await lecturerService.getMyModules();
      if (modulesResponse.success && modulesResponse.data) {
        setMyModules(modulesResponse.data);
      }
    } catch (error) {
      console.error('Error loading lecturer modules:', error);
      showErrorNotification('Error', 'Failed to load your assigned modules');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      // Get all assignments for the modules I teach
      const moduleIds = myModules.map(m => m.moduleId);
      const allAssignments: AssignmentResponse[] = [];

      for (const moduleId of moduleIds) {
        const response = await assignmentService.getAssignmentsByModuleForLecturer(moduleId);
        if (response.success && response.data) {
          allAssignments.push(...response.data);
        }
      }

      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      showErrorNotification('Error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const showSuccessNotification = (title: string, message: string) => {
    setNotificationConfig({ type: 'success', title, message });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const showErrorNotification = (title: string, message: string) => {
    setNotificationConfig({ type: 'error', title, message });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  const showConfirmationModal = (title: string, message: string, onConfirm: () => void, confirmText: string = 'Confirm') => {
    setConfirmationConfig({ title, message, onConfirm, confirmText });
    setShowConfirmation(true);
  };

  const handleFileUpload = async (file?: File) => {
    const fileToUpload = file || assignmentFile;
    if (!fileToUpload) return;

    try {
      setUploading(true);
      const response = await assignmentService.uploadAssignmentFile(fileToUpload);
      console.log('📤 File upload response:', response);
      if (response.success && response.data) {
        console.log('✅ File uploaded - URL:', response.data.fileUrl, 'Name:', response.data.fileName);
        setAttachmentUrl(response.data.fileUrl);
        setAttachmentName(response.data.fileName);
        showSuccessNotification('File Uploaded', `${fileToUpload.name} uploaded successfully!`);
      } else {
        console.error('❌ File upload failed:', response.message);
        showErrorNotification('Upload Failed', response.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showErrorNotification('Upload Error', 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAssignmentFile(file);
      setAttachmentUrl(''); // Reset URL when new file selected
      // Auto-upload immediately after selection
      await handleFileUpload(file);
    }
  };

  const handlePreviewFile = (fileUrl: string, fileName: string) => {
    const fileExtension = fileName.toLowerCase().split('.').pop();
    
    if (fileExtension === 'jpg' || fileExtension === 'jpeg' || fileExtension === 'png' || fileExtension === 'gif') {
      // Preview image in modal
      setPreviewFileUrl(fileUrl);
      setPreviewFileName(fileName);
      setShowFilePreview(true);
    } else if (fileExtension === 'pdf') {
      // Download PDF
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Download other file types
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedModule || !assignmentTitle || !dueDate) {
      showErrorNotification('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      const request: AssignmentCreateRequest = {
        moduleId: Number(selectedModule),
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: new Date(dueDate).toISOString().split('T')[0],
        maxMarks: maxMarks,
        attachmentUrl: attachmentUrl || undefined,
        attachmentName: attachmentName || undefined,
        isPublished: true
      };

      const response = await assignmentService.createAssignmentForLecturer(request);
      
      if (response.success) {
        showSuccessNotification('Success', 'Assignment created successfully');
        resetForm();
        setShowModal(false);
        loadAssignments();
      } else {
        showErrorNotification('Error', response.message || 'Failed to create assignment');
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      const errorMessage = error.message || 'Failed to create assignment';
      
      // Check if it's a duplicate assignment error
      if (errorMessage.includes('assignment already exists') || errorMessage.includes('Only one assignment per module')) {
        showErrorNotification(
          'Module Limit Reached', 
          'This module already has an assignment. Only one assignment per module is allowed. Please edit the existing assignment or delete it before creating a new one.'
        );
      } else {
        showErrorNotification('Error', errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment || !assignmentTitle || !dueDate) {
      showErrorNotification('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      const request: AssignmentUpdateRequest = {
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: new Date(dueDate).toISOString().split('T')[0],
        maxMarks: maxMarks,
        attachmentUrl: attachmentUrl || undefined,
        attachmentName: attachmentName || undefined,
        isPublished: true
      };

      const response = await assignmentService.updateAssignmentForLecturer(editingAssignment.id, request);
      
      if (response.success) {
        showSuccessNotification('Success', 'Assignment updated successfully');
        resetForm();
        setShowModal(false);
        loadAssignments();
      } else {
        showErrorNotification('Error', response.message || 'Failed to update assignment');
      }
    } catch (error: any) {
      console.error('Error updating assignment:', error);
      showErrorNotification('Error', error.message || 'Failed to update assignment');
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteAssignment = (assignment: AssignmentResponse) => {
    showConfirmationModal(
      'Delete Assignment',
      `Are you sure you want to delete "${assignment.title}"? This action cannot be undone.`,
      () => handleDeleteAssignment(assignment.id),
      'Yes, Delete'
    );
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    try {
      const response = await assignmentService.deleteAssignmentForLecturer(assignmentId);
      if (response.success) {
        showSuccessNotification('Success', 'Assignment deleted successfully');
        loadAssignments();
      } else {
        showErrorNotification('Error', response.message || 'Failed to delete assignment');
      }
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      showErrorNotification('Error', error.message || 'Failed to delete assignment');
    } finally {
      setShowConfirmation(false);
    }
  };

  const handleToggleStatus = async (assignment: AssignmentResponse) => {
    showConfirmationModal(
      `${assignment.isPublished ? 'Unpublish' : 'Publish'} Assignment`,
      `Are you sure you want to ${assignment.isPublished ? 'unpublish' : 'publish'} this assignment?`,
      async () => {
        try {
          const response = await assignmentService.updatePublishStatusForLecturer(assignment.id, !assignment.isPublished);
          if (response.success) {
            showSuccessNotification('Success', `Assignment ${assignment.isPublished ? 'unpublished' : 'published'} successfully`);
            loadAssignments();
          } else {
            showErrorNotification('Error', response.message || 'Failed to update assignment status');
          }
        } catch (error: any) {
          console.error('Error toggling status:', error);
          showErrorNotification('Error', error.message || 'Failed to update assignment status');
        } finally {
          setShowConfirmation(false);
        }
      },
      assignment.isPublished ? 'Unpublish' : 'Publish'
    );
  };

  const openEditModal = (assignment: AssignmentResponse) => {
    setEditingAssignment(assignment);
    setSelectedModule(assignment.moduleId?.toString() || '');
    setAssignmentTitle(assignment.title);
    setAssignmentDescription(assignment.description || '');
    setDueDate(assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '');
    setMaxMarks(assignment.maxMarks);
    setAttachmentUrl(assignment.attachmentUrl || '');
    setAttachmentName(assignment.attachmentName || '');
    setAssignmentFile(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingAssignment(null);
    setSelectedModule('');
    setAssignmentTitle('');
    setAssignmentDescription('');
    setDueDate('');
    setMaxMarks(100);
    setAttachmentUrl('');
    setAttachmentName('');
    setAssignmentFile(null);
  };

  // Filter and pagination logic
  const filteredAssignments = assignments.filter(assignment => {
    const matchesModule = filterModule === 'all' || assignment.moduleId?.toString() === filterModule;
    const matchesSearch = 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.moduleCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.moduleName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesModule && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterModule, searchTerm]);

  const getModuleName = (moduleId: number) => {
    const module = myModules.find(m => m.moduleId === moduleId);
    return module ? `${module.moduleCode} - ${module.moduleName}` : 'Unknown Module';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <h1 className="text-3xl font-bold">My Assignments</h1>
              <p className="text-cyan-100 mt-1">Manage assignments for your modules</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* My Modules Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Modules</h2>
          {myModules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No modules assigned yet</p>
              <p className="text-sm text-gray-500 mt-1">Please contact admin to assign modules to you</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myModules.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{module.moduleCode}</h3>
                      <p className="text-sm text-gray-600 mt-1">{module.moduleName}</p>
                      {module.programName && (
                        <p className="text-xs text-gray-500 mt-2">{module.programName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        {assignments.filter(a => a.moduleId === module.moduleId).length}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{assignments.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {assignments.filter(a => a.isPublished).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unpublished</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {assignments.filter(a => !a.isPublished).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Modules</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{myModules.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Modules</option>
              {myModules.map((module) => (
                <option key={module.moduleId} value={module.moduleId}>
                  {module.moduleCode} - {module.moduleName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignments Grid */}
        {currentAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterModule !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first assignment to get started'}
            </p>
            {myModules.length > 0 && (
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Assignment
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentAssignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                      <p className="text-sm text-blue-600 font-medium">{getModuleName(assignment.moduleId || 0)}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      assignment.isPublished 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {assignment.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
                  )}

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span>Max Marks: {assignment.maxMarks}</span>
                    </div>
                    {assignment.attachmentUrl && (
                      <div className="flex items-center justify-between text-blue-600">
                        <div className="flex items-center">
                          <File className="h-4 w-4 mr-2" />
                          <span>File attached</span>
                        </div>
                        <button
                          onClick={() => handlePreviewFile(assignment.attachmentUrl!, assignment.attachmentName || 'file')}
                          className="flex items-center gap-1 text-xs hover:text-blue-700"
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(assignment)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(assignment)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        assignment.isPublished
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {assignment.isPublished ? <Eye size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => confirmDeleteAssignment(assignment)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module *</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!!editingAssignment}
                >
                  <option value="">Select Module</option>
                  {myModules.map((module) => (
                    <option key={module.moduleId} value={module.moduleId}>
                      {module.moduleCode} - {module.moduleName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter assignment title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter assignment description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks *</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignment File (Optional)</label>
                {uploading ? (
                  <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                    <Loader className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
                    <span className="text-sm text-blue-700">Uploading file...</span>
                  </div>
                ) : attachmentUrl ? (
                  <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">✅ {assignmentFile?.name || attachmentName || 'File uploaded successfully'}</span>
                    </div>
                    <button
                      onClick={() => {
                        setAttachmentUrl('');
                        setAttachmentName('');
                        setAssignmentFile(null);
                      }}
                      className="text-red-600 hover:text-red-700"
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                  disabled={uploading}
                />
                <p className="text-xs text-gray-500 mt-1">File will be uploaded automatically after selection</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={uploading}
              >
                {uploading ? 'Saving...' : editingAssignment ? 'Update Assignment' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                {confirmationConfig.title}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                {confirmationConfig.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmationConfig.onConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {confirmationConfig.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in max-w-md">
          <div className={`rounded-lg shadow-lg p-4 ${
            notificationConfig.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${
                notificationConfig.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {notificationConfig.type === 'success' ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${
                  notificationConfig.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notificationConfig.title}
                </h3>
                <p className={`mt-1 text-sm ${
                  notificationConfig.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notificationConfig.message}
                </p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="ml-4 flex-shrink-0"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{previewFileName}</h3>
              <button
                onClick={() => setShowFilePreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <img
                src={previewFileUrl}
                alt={previewFileName}
                className="max-w-full h-auto mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
