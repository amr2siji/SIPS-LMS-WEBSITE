import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, Edit, Trash2, Eye, X, File, Loader, Calendar, AlertCircle, Upload, Download, Send, CheckCircle } from 'lucide-react';
import { lectureMaterialService, LectureMaterial, LectureMaterialRequest, LectureMaterialStats, FileInfo } from '../../services/lectureMaterialService';
import { lecturerService, LecturerModuleAssignmentResponse } from '../../services/lecturerService';
import { assignmentService } from '../../services/assignmentService';
import { useAuth } from '../../contexts/AuthContext';

export function LecturerMaterialManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<LectureMaterial[]>([]);
  const [myModules, setMyModules] = useState<LecturerModuleAssignmentResponse[]>([]);
  const [stats, setStats] = useState<LectureMaterialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LectureMaterial | null>(null);
  
  // Filter states
  const [filterModule, setFilterModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

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
  
  // Material files view state
  const [showMaterialFilesModal, setShowMaterialFilesModal] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<LectureMaterial | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (user?.nic) {
      loadLecturerModules();
      loadStats();
    }
  }, [user]);

  useEffect(() => {
    if (myModules.length > 0) {
      loadMaterials();
    }
  }, [myModules]);

  // Reload materials when filter changes
  useEffect(() => {
    if (myModules.length > 0) {
      loadMaterials(filterModule);
      setCurrentPage(1); // Reset to first page when filter changes
    }
  }, [filterModule]);

  const loadLecturerModules = async () => {
    try {
      if (!user?.nic) return;
      
      const modulesResponse = await lecturerService.getMyModules();
      if (modulesResponse.success && modulesResponse.data) {
        setMyModules(modulesResponse.data);
      }
    } catch (error) {
      console.error('Error loading lecturer modules:', error);
      showErrorNotification('Error', 'Failed to load your assigned modules');
    }
  };

  const loadMaterials = async (moduleId?: string) => {
    try {
      setLoading(true);
      console.log('Loading materials...');
      let response;
      
      if (moduleId && moduleId !== 'all') {
        // Filter by specific module using API
        response = await lectureMaterialService.getMaterialsByModuleLecturer(
          parseInt(moduleId),
          0,
          1000
        );
      } else {
        // Get all lecturer's materials
        response = await lectureMaterialService.getMyMaterials(0, 1000);
      }
      
      console.log('Materials response:', response);
      if (response.success && response.data) {
        console.log('Materials data:', response.data);
        setMaterials(response.data.content || []);
      } else {
        console.warn('No materials or unsuccessful response:', response);
        setMaterials([]);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
      showErrorNotification('Error', 'Failed to load lecture materials');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await lectureMaterialService.getStatsLecturer();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total file count (max 5)
    if (uploadedFiles.length + files.length > 5) {
      showErrorNotification('File Limit Exceeded', 'You can upload a maximum of 5 files per material');
      return;
    }

    setUploadingFiles(true);

    try {
      const newFiles: FileInfo[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;

        // Update progress
        setUploadProgress(prev => ({ ...prev, [fileName]: 0 }));

        // Upload file
        const uploadResponse = await assignmentService.uploadAssignmentFile(file);
        
        if (uploadResponse.success && uploadResponse.data) {
          newFiles.push({
            fileName: uploadResponse.data.fileName,
            fileUrl: uploadResponse.data.fileUrl,
            fileSize: file.size,
            fileType: file.type
          });

          // Update progress
          setUploadProgress(prev => ({ ...prev, [fileName]: 100 }));
        }
      }

      setUploadedFiles(prev => [...prev, ...newFiles]);
      showSuccessNotification('Success', `${newFiles.length} file(s) uploaded successfully`);
    } catch (error) {
      console.error('Error uploading files:', error);
      showErrorNotification('Upload Failed', 'Failed to upload one or more files');
    } finally {
      setUploadingFiles(false);
      setUploadProgress({});
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewFile = (fileUrl: string, fileName: string) => {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    
    // Ensure the fileUrl is a complete URL
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`;
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
      // For images, show in modal
      setPreviewFileUrl(fullUrl);
      setPreviewFileName(fileName);
      setShowFilePreview(true);
    } else if (['pdf'].includes(fileExtension || '')) {
      // For PDFs, open in new tab
      window.open(fullUrl, '_blank');
    } else {
      // For other files (doc, docx, etc.), trigger download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCreateMaterial = () => {
    setEditingMaterial(null);
    setSelectedModule('');
    setSelectedWeek('');
    setMaterialTitle('');
    setMaterialDescription('');
    setUploadedFiles([]);
    setShowModal(true);
  };

  const handleEditMaterial = (material: LectureMaterial) => {
    setEditingMaterial(material);
    setSelectedModule(material.moduleId.toString());
    setSelectedWeek(material.week?.toString() || '');
    setMaterialTitle(material.title);
    setMaterialDescription(material.description);
    
    // Parse files from JSON string
    try {
      const files = JSON.parse(material.files) as FileInfo[];
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error parsing files:', error);
      setUploadedFiles([]);
    }
    
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedModule || !materialTitle || uploadedFiles.length === 0) {
      showErrorNotification('Validation Error', 'Please fill in all required fields and upload at least one file');
      return;
    }

    const selectedModuleObj = myModules.find(m => m.moduleId.toString() === selectedModule);
    if (!selectedModuleObj) {
      showErrorNotification('Error', 'Selected module not found');
      return;
    }

    const request: LectureMaterialRequest = {
      title: materialTitle,
      description: materialDescription,
      moduleId: parseInt(selectedModule),
      moduleName: selectedModuleObj.moduleCode + ' - ' + selectedModuleObj.moduleName,
      week: parseInt(selectedWeek),
      files: uploadedFiles
    };

    try {
      if (editingMaterial) {
        const response = await lectureMaterialService.updateMaterialLecturer(editingMaterial.id, request);
        if (response.success) {
          showSuccessNotification('Success', 'Material updated successfully');
          loadMaterials(filterModule);
          loadStats();
          setShowModal(false);
        }
      } else {
        const response = await lectureMaterialService.createMaterialLecturer(request);
        if (response.success) {
          showSuccessNotification('Success', 'Material created successfully');
          loadMaterials(filterModule);
          loadStats();
          setShowModal(false);
        }
      }
    } catch (error: any) {
      console.error('Error saving material:', error);
      showErrorNotification('Error', error.response?.data?.message || 'Failed to save material');
    }
  };

  const handleDeleteMaterial = (material: LectureMaterial) => {
    setConfirmationConfig({
      title: 'Delete Material',
      message: `Are you sure you want to delete "${material.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          const response = await lectureMaterialService.deleteMaterialLecturer(material.id);
          if (response.success) {
            showSuccessNotification('Success', 'Material deleted successfully');
            loadMaterials(filterModule);
            loadStats();
          }
        } catch (error) {
          console.error('Error deleting material:', error);
          showErrorNotification('Error', 'Failed to delete material');
        }
        setShowConfirmation(false);
      }
    });
    setShowConfirmation(true);
  };

  const handleTogglePublish = async (material: LectureMaterial) => {
    try {
      const response = await lectureMaterialService.togglePublishLecturer(material.id);
      if (response.success) {
        showSuccessNotification(
          'Success', 
          material.published ? 'Material unpublished successfully' : 'Material published successfully'
        );
        loadMaterials(filterModule);
        loadStats();
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      showErrorNotification('Error', 'Failed to update publish status');
    }
  };

  const handleViewMaterial = (material: LectureMaterial) => {
    setViewingMaterial(material);
    setShowMaterialFilesModal(true);
  };

  const showSuccessNotification = (title: string, message: string) => {
    setNotificationConfig({ type: 'success', title, message });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const showErrorNotification = (title: string, message: string) => {
    setNotificationConfig({ type: 'error', title, message });
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Filter materials only by search term (module filtering is done via API)
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = searchTerm === '' || 
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.moduleName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMaterials = filteredMaterials.slice(startIndex, endIndex);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '🖼️';
    if (['pdf'].includes(ext || '')) return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    if (['ppt', 'pptx'].includes(ext || '')) return '📽️';
    return '📁';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate('/dashboard');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-cyan-100">Lecture Materials</h1>
                <p className="text-cyan-200 mt-1">Manage and share learning resources with your students</p>
              </div>
            </div>
            <button
              onClick={handleCreateMaterial}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span>Add Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Materials</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalMaterials}</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <BookOpen className="text-emerald-600" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.materialsThisMonth}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="text-blue-600" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">This Week</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.materialsThisWeek}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Upload className="text-purple-600" size={28} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Modules</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalModulesWithMaterials}</p>
                </div>
                <div className="bg-amber-100 p-3 rounded-lg">
                  <BookOpen className="text-amber-600" size={28} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Materials
              </label>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Module
              </label>
              <select
                value={filterModule}
                onChange={(e) => {
                  setFilterModule(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
        </div>
      </div>

      {/* Materials Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : currentMaterials.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Materials Found</h3>
            <p className="text-gray-500 mb-6">
              {materials.length === 0
                ? "You haven't created any materials yet. Click 'Add Material' to get started."
                : 'No materials match your current filters.'}
            </p>
            {materials.length === 0 && (
              <button
                onClick={handleCreateMaterial}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center space-x-2"
              >
                <Plus size={20} />
                <span>Create Your First Material</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentMaterials.map((material) => {
                const files = JSON.parse(material.files) as FileInfo[];
                return (
                  <div
                    key={material.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 text-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold line-clamp-2">
                            {material.week ? `Week ${material.week}: ` : ''}{material.title}
                          </h3>
                          <p className="text-emerald-100 text-sm mt-1">{material.moduleName}</p>
                        </div>
                        <BookOpen className="flex-shrink-0 ml-2" size={24} />
                      </div>
                    </div>

                    <div className="p-5">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {material.description || 'No description provided'}
                      </p>

                      {/* Files Info */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {files.length} File{files.length !== 1 ? 's' : ''}
                          </span>
                          <File className="text-gray-400" size={16} />
                        </div>
                        <div className="space-y-1">
                          {files.slice(0, 2).map((file, idx) => (
                            <div key={idx} className="flex items-center text-xs text-gray-600">
                              <span className="mr-2">{getFileIcon(file.fileName)}</span>
                              <span className="truncate flex-1">{file.fileName}</span>
                            </div>
                          ))}
                          {files.length > 2 && (
                            <p className="text-xs text-gray-500 italic">
                              +{files.length - 2} more file{files.length - 2 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center text-xs text-gray-500 mb-4">
                        <Calendar size={14} className="mr-1" />
                        <span>
                          {new Date(material.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between space-x-2 pt-4 border-t">
                        <button
                          onClick={() => handleViewMaterial(material)}
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-1"
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleEditMaterial(material)}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-1"
                        >
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleTogglePublish(material)}
                          className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-1 ${
                            material.published 
                              ? 'bg-green-50 hover:bg-green-100 text-green-600' 
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                          }`}
                          title={material.published ? 'Unpublish' : 'Publish'}
                        >
                          {material.published ? <CheckCircle size={16} /> : <Send size={16} />}
                          <span>{material.published ? 'Published' : 'Publish'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(material)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-1"
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  {editingMaterial ? 'Edit Material' : 'Add New Material'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Module Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a module</option>
                  {myModules.map((module) => (
                    <option key={module.moduleId} value={module.moduleId}>
                      {module.moduleCode} - {module.moduleName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Week Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Week <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select a week</option>
                  {[...Array(15)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Week {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  required
                  placeholder="e.g., Week 5 Lecture Notes"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  rows={4}
                  placeholder="Provide a brief description of this material..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Files <span className="text-red-500">*</span> (Max 5 files)
                </label>
                
                {/* Upload Button */}
                <div className="mb-4">
                  <label className="block">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploadingFiles || uploadedFiles.length >= 5}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      uploadingFiles || uploadedFiles.length >= 5
                        ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}>
                      {uploadingFiles ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader className="animate-spin text-emerald-600" size={24} />
                          <span className="text-gray-600">Uploading files...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto text-emerald-600 mb-2" size={32} />
                          <p className="text-gray-700 font-medium">
                            {uploadedFiles.length >= 5
                              ? 'Maximum files reached (5/5)'
                              : 'Click to upload files'}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {uploadedFiles.length < 5 && `${5 - uploadedFiles.length} more file(s) allowed`}
                          </p>
                          <p className="text-gray-400 text-xs mt-2">
                            Supported: PDF, Word, PowerPoint, Excel, Images
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* Upload Progress */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mb-4 space-y-2">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <div key={fileName} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700 truncate">{fileName}</span>
                          <span className="text-sm text-emerald-600 font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Uploaded Files ({uploadedFiles.length}/5)
                    </p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-200"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="text-2xl">{getFileIcon(file.fileName)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.fileSize)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <button
                            type="button"
                            onClick={() => handlePreviewFile(file.fileUrl, file.fileName)}
                            className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                            title="Preview/Download"
                          >
                            <Download size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFiles || uploadedFiles.length === 0}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingMaterial ? 'Update Material' : 'Create Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {showFilePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full">
            <button
              onClick={() => setShowFilePreview(false)}
              className="absolute top-4 right-4 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">{previewFileName}</h3>
              <img
                src={previewFileUrl}
                alt={previewFileName}
                className="max-w-full max-h-[70vh] mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-red-100 rounded-full p-3">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {confirmationConfig.title}
                </h3>
                <p className="text-gray-600 mb-6">{confirmationConfig.message}</p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmationConfig.onConfirm}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {confirmationConfig.confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Material Files View Modal */}
      {showMaterialFilesModal && viewingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {viewingMaterial.week ? `Week ${viewingMaterial.week}: ` : ''}{viewingMaterial.title}
                  </h2>
                  <p className="text-emerald-100 mt-1">{viewingMaterial.moduleName}</p>
                </div>
                <button
                  onClick={() => {
                    setShowMaterialFilesModal(false);
                    setViewingMaterial(null);
                  }}
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {viewingMaterial.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{viewingMaterial.description}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Files ({JSON.parse(viewingMaterial.files).length})
                </h3>
                <div className="space-y-3">
                  {(() => {
                    try {
                      const files = JSON.parse(viewingMaterial.files) as FileInfo[];
                      return files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 text-2xl">
                              {getFileIcon(file.fileName)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{file.fileName}</p>
                              <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handlePreviewFile(file.fileUrl, file.fileName)}
                              className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                              title="View/Download"
                            >
                              <Eye size={18} />
                            </button>
                            <a
                              href={file.fileUrl.startsWith('http') ? file.fileUrl : `${window.location.origin}${file.fileUrl}`}
                              download={file.fileName}
                              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="Download"
                            >
                              <Download size={18} />
                            </a>
                          </div>
                        </div>
                      ));
                    } catch (error) {
                      return <p className="text-red-500">Error loading files</p>;
                    }
                  })()}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Uploaded by:</span> {viewingMaterial.uploaderRole}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {new Date(viewingMaterial.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div
            className={`rounded-lg shadow-2xl p-4 max-w-md ${
              notificationConfig.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {notificationConfig.type === 'success' ? (
                  <div className="bg-white rounded-full p-1">
                    <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{notificationConfig.title}</h4>
                <p className="text-sm mt-1 opacity-90">{notificationConfig.message}</p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="flex-shrink-0 hover:bg-white/10 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
