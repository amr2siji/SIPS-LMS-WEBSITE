import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, Edit, Trash2, Eye, EyeOff, X, File, Loader } from 'lucide-react';
import { assignmentService, AssignmentResponse, AssignmentCreateRequest, AssignmentUpdateRequest } from '../../services/assignmentService';
import { academicStructureService } from '../../services/academicStructureService';
import { intakeService } from '../../services/intakeService';
import { intakeModuleService } from '../../services/intakeModuleService';
import { moduleService } from '../../services/moduleService';
import { PaginatedResponse } from '../../services/apiService';

interface SelectOption {
  id: number;
  name: string;
}

export function AssignmentManagement() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [faculties, setFaculties] = useState<SelectOption[]>([]);
  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [programs, setPrograms] = useState<SelectOption[]>([]);
  const [intakes, setIntakes] = useState<SelectOption[]>([]);
  const [modules, setModules] = useState<SelectOption[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentResponse | null>(null);
  
  // Filter states
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown data for filters
  const [filterFaculties, setFilterFaculties] = useState<SelectOption[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<SelectOption[]>([]);
  const [filterPrograms, setFilterPrograms] = useState<SelectOption[]>([]);
  const [filterModules, setFilterModules] = useState<SelectOption[]>([]);
  
  // Form state - Simplified to 3 steps: Intake → Module → Assignment Details
  const [step, setStep] = useState(1);
  const [selectedIntake, setSelectedIntake] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [assignmentFileUrl, setAssignmentFileUrl] = useState('');
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    details: [] as string[]
  });

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    type: 'danger' as 'danger' | 'warning'
  });

  // File preview state
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState('');
  const [previewFileName, setPreviewFileName] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;

  // Show notification helper
  const showSuccessNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'success', title, message, details });
    setShowNotification(true);
  };

  const showErrorNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'error', title, message, details });
    setShowNotification(true);
  };

  const showConfirmationModal = (title: string, message: string, onConfirm: () => void, confirmText: string = 'Confirm', type: 'danger' | 'warning' = 'danger') => {
    setConfirmationConfig({ title, message, onConfirm, confirmText, type });
    setShowConfirmation(true);
  };

  useEffect(() => {
    loadFaculties(); // Still needed for filters
    loadAllIntakes(); // Load all intakes for Step 1
    loadAssignments();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [currentPage, searchTerm, filterFaculty, filterDepartment, filterProgram, filterModule, filterStatus]);

  // When intake is selected, load modules for that intake
  useEffect(() => {
    if (selectedIntake && selectedIntake !== '') {
      loadModulesForIntake(Number(selectedIntake));
    } else {
      setModules([]);
    }
  }, [selectedIntake]);

  // Filter cascading
  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadFilterDepartments(Number(filterFaculty));
    } else {
      setFilterDepartments([]);
      setFilterPrograms([]);
      setFilterModules([]);
    }
  }, [filterFaculty]);

  useEffect(() => {
    if (filterDepartment !== 'all') {
      loadFilterPrograms(Number(filterDepartment));
    } else {
      setFilterPrograms([]);
      setFilterModules([]);
    }
  }, [filterDepartment]);

  useEffect(() => {
    if (filterProgram !== 'all') {
      loadFilterIntakes(Number(filterProgram));
    } else {
      setFilterModules([]);
    }
  }, [filterProgram]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentService.searchAssignments({
        search: searchTerm,
        facultyId: filterFaculty !== 'all' ? Number(filterFaculty) : undefined,
        departmentId: filterDepartment !== 'all' ? Number(filterDepartment) : undefined,
        programId: filterProgram !== 'all' ? Number(filterProgram) : undefined,
        moduleId: filterModule !== 'all' ? Number(filterModule) : undefined,
        isPublished: filterStatus === 'all' ? undefined : filterStatus === 'published',
        page: currentPage,
        size: pageSize,
        sortBy: 'dueDate',
        sortDirection: 'desc'
      });

      if (response.success && response.data) {
        const paginatedData = response.data as PaginatedResponse<AssignmentResponse>;
        const assignmentsList = paginatedData.content || [];
        console.log('📋 Loaded assignments:', assignmentsList);
        console.log('🔍 First assignment data:', assignmentsList[0]);
        setAssignments(assignmentsList);
        setTotalElements(paginatedData.totalElements || 0);
        setTotalPages(paginatedData.totalPages || 0);
      } else {
        // If API call fails, set empty array
        setAssignments([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      // Set empty array on error so UI still renders
      setAssignments([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async () => {
    try {
      const response = await academicStructureService.faculty.getAll();
      if (response.success && response.data) {
        const options = response.data.map((f: any) => ({ id: f.id, name: f.name }));
        setFaculties(options);
        setFilterFaculties(options);
      } else {
        setFaculties([]);
        setFilterFaculties([]);
      }
    } catch (error) {
      console.error('Error loading faculties:', error);
      setFaculties([]);
      setFilterFaculties([]);
    }
  };

  // Load all intakes for Step 1 selection
  const loadAllIntakes = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/intakes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Raw intake API response for assignments:', result);
        if (result.data && Array.isArray(result.data)) {
          const mappedIntakes = result.data.map((intake: any) => ({
            id: intake.id,
            name: `${intake.intakeName} - ${intake.programName} (${intake.facultyName})`,
            intakeCode: intake.intakeCode,
            intakeName: intake.intakeName,
            programName: intake.programName,
            facultyName: intake.facultyName
          }));
          console.log('Mapped intakes for assignment creation:', mappedIntakes);
          setIntakes(mappedIntakes);
        } else {
          console.warn('No intakes data in response');
          setIntakes([]);
        }
      } else {
        console.error('Failed to load intakes:', response.status);
        setIntakes([]);
      }
    } catch (error) {
      console.error('Error loading all intakes:', error);
      setIntakes([]);
    }
  };

  // Load modules assigned to selected intake using intakeModuleService
  const loadModulesForIntake = async (intakeId: number) => {
    try {
      console.log('Loading modules for intake ID:', intakeId);
      const response = await intakeModuleService.getModulesByIntake(intakeId);
      console.log('Modules response from intakeModuleService:', response);
      if (response && response.success && response.data) {
        // Map IntakeModuleDTO to SelectOption interface
        const mappedModules = response.data.map((im: any) => ({
          id: im.moduleId,
          name: `${im.moduleCode} - ${im.moduleName}`
        }));
        console.log('Mapped modules for assignment creation:', mappedModules);
        setModules(mappedModules);
      } else {
        console.warn('No modules found for intake:', intakeId);
        setModules([]);
      }
    } catch (error) {
      console.error('Error loading modules for intake:', error);
      setModules([]);
    }
  };

  const loadDepartments = async (facultyId: number) => {
    try {
      const response = await academicStructureService.department.getByFaculty(facultyId);
      if (response.success && response.data) {
        setDepartments(response.data.map((d: any) => ({ id: d.id, name: d.departmentName })));
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    }
  };

  const loadPrograms = async (departmentId: number) => {
    try {
      // Get programs by department - we need to use faculty id too
      const response = await academicStructureService.program.getAll();
      if (response.success && response.data) {
        const filtered = response.data.filter((p: any) => p.departmentId === departmentId);
        setPrograms(filtered.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      setPrograms([]);
    }
  };

  const loadIntakes = async (programId: number) => {
    try {
      console.log('Loading intakes for program:', programId);
      const response = await intakeService.getIntakesByProgram(programId);
      console.log('Intakes response:', response);
      if (response.success && response.data) {
        console.log('Intakes data:', response.data);
        const mappedIntakes = response.data.map((i: any) => ({ 
          id: i.id, 
          name: i.intakeName || `${i.intakeCode}` 
        }));
        console.log('Mapped intakes:', mappedIntakes);
        setIntakes(mappedIntakes);
      } else {
        console.warn('Intakes response not successful or no data');
        setIntakes([]);
      }
    } catch (error) {
      console.error('Error loading intakes:', error);
      setIntakes([]);
    }
  };

  const loadModules = async (programId: number, intakeId: number) => {
    try {
      // Load modules by program (intake filtering might be done on backend)
      const response = await moduleService.getModulesByProgram(programId);
      if (response.success && response.data) {
        setModules(response.data.map((m: any) => ({ id: m.id, name: `${m.moduleCode} - ${m.moduleName}` })));
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      setModules([]);
    }
  };

  const loadFilterDepartments = async (facultyId: number) => {
    try {
      const response = await academicStructureService.department.getByFaculty(facultyId);
      if (response.success && response.data) {
        setFilterDepartments(response.data.map((d: any) => ({ id: d.id, name: d.departmentName })));
      }
    } catch (error) {
      console.error('Error loading filter departments:', error);
      setFilterDepartments([]);
    }
  };

  const loadFilterPrograms = async (departmentId: number) => {
    try {
      const response = await academicStructureService.program.getAll();
      if (response.success && response.data) {
        const filtered = response.data.filter((p: any) => p.departmentId === departmentId);
        setFilterPrograms(filtered.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error('Error loading filter programs:', error);
      setFilterPrograms([]);
    }
  };

  const loadFilterIntakes = async (programId: number) => {
    try {
      const response = await moduleService.getModulesByProgram(programId);
      if (response.success && response.data) {
        setFilterModules(response.data.map((m: any) => ({ id: m.id, name: `${m.moduleCode} - ${m.moduleName}` })));
      }
    } catch (error) {
      console.error('Error loading filter modules:', error);
      setFilterModules([]);
    }
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
        setAssignmentFileUrl(response.data.fileUrl);
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
      setAssignmentFileUrl(''); // Reset URL when new file selected
      // Auto-upload immediately after selection
      await handleFileUpload(file);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedModule || !assignmentTitle || !dueDate) {
      showErrorNotification('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      console.log('📝 Creating assignment with attachment:', {
        fileUrl: assignmentFileUrl,
        fileName: assignmentFile?.name,
        hasFile: !!assignmentFile
      });
      
      const createRequest: AssignmentCreateRequest = {
        moduleId: Number(selectedModule),
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: dueDate,
        maxMarks: maxMarks,
        attachmentUrl: assignmentFileUrl || undefined,
        attachmentName: assignmentFile?.name || undefined,
        isPublished: false
      };

      console.log('🚀 Sending create request:', createRequest);

      const response = await assignmentService.createAssignment(createRequest);
      console.log('✅ Create response:', response);
      
      if (response.success) {
        const moduleName = modules.find(m => m.id.toString() === selectedModule)?.name || 'N/A';
        showSuccessNotification('Assignment Created', 'The assignment has been created successfully!', [
          `Title: ${assignmentTitle}`,
          `Module: ${moduleName}`,
          `Due Date: ${dueDate}`
        ]);
        resetForm();
        loadAssignments();
      } else {
        showErrorNotification('Creation Failed', response.message || 'Failed to create assignment');
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      const errorMessage = error?.message || 'Failed to create assignment. Please try again.';
      
      // Check if it's a duplicate assignment error
      if (errorMessage.includes('assignment already exists') || errorMessage.includes('Only one assignment per module')) {
        showErrorNotification(
          'Module Limit Reached',
          'This module already has an assignment. Only one assignment per module is allowed. Please edit the existing assignment or delete it before creating a new one.'
        );
      } else {
        showErrorNotification('Error', errorMessage);
      }
    }
  };

  const handleUpdateAssignment = async () => {
    if (!editingAssignment || !assignmentTitle || !dueDate) {
      showErrorNotification('Validation Error', 'Please fill all required fields');
      return;
    }

    try {
      const updateRequest: AssignmentUpdateRequest = {
        title: assignmentTitle,
        description: assignmentDescription,
        dueDate: dueDate,
        maxMarks: maxMarks,
        attachmentUrl: assignmentFileUrl,
        attachmentName: assignmentFile?.name,
        isPublished: editingAssignment.isPublished
      };

      const response = await assignmentService.updateAssignment(editingAssignment.id, updateRequest);
      if (response.success) {
        showSuccessNotification('Assignment Updated', 'The assignment has been updated successfully!', [
          `Title: ${assignmentTitle}`,
          `Due Date: ${dueDate}`
        ]);
        resetForm();
        loadAssignments();
      } else {
        showErrorNotification('Update Failed', response.message || 'Failed to update assignment');
      }
    } catch (error) {
      console.error('Error updating assignment:', error);
      showErrorNotification('Error', 'Failed to update assignment. Please try again.');
    }
  };

  const handleTogglePublish = async (assignment: AssignmentResponse) => {
    try {
      const response = await assignmentService.updatePublishStatus(assignment.id, !assignment.isPublished);
      if (response.success) {
        showSuccessNotification(
          'Status Updated',
          `Assignment has been ${!assignment.isPublished ? 'published' : 'unpublished'} successfully!`,
          [`Assignment: ${assignment.title}`]
        );
        loadAssignments();
      } else {
        showErrorNotification('Update Failed', response.message || 'Failed to update publish status');
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      showErrorNotification('Error', 'Failed to update publish status. Please try again.');
    }
  };

  const handleDeleteAssignment = async (assignment: AssignmentResponse) => {
    showConfirmationModal(
      'Delete Assignment',
      `Are you sure you want to delete this assignment?\n\nTitle: ${assignment.title}\nModule: ${assignment.moduleName}\n\nThis action cannot be undone.`,
      async () => {
        try {
          const response = await assignmentService.deleteAssignment(assignment.id);
          if (response.success) {
            showSuccessNotification('Assignment Deleted', 'The assignment has been deleted successfully!', [
              `Title: ${assignment.title}`
            ]);
            loadAssignments();
          } else {
            showErrorNotification('Delete Failed', response.message || 'Failed to delete assignment');
          }
        } catch (error) {
          console.error('Error deleting assignment:', error);
          showErrorNotification('Error', 'Failed to delete assignment. Please try again.');
        }
        setShowConfirmation(false);
      },
      'Delete',
      'danger'
    );
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
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccessNotification('Download Started', `Downloading ${fileName}...`);
    } else {
      // Download other file types
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSuccessNotification('Download Started', `Downloading ${fileName}...`);
    }
  };

  const openEditModal = (assignment: AssignmentResponse) => {
    setEditingAssignment(assignment);
    setAssignmentTitle(assignment.title);
    setAssignmentDescription(assignment.description || '');
    setDueDate(assignment.dueDate);
    setMaxMarks(assignment.maxMarks);
    setAssignmentFileUrl(assignment.attachmentUrl || '');
    setShowModal(true);
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingAssignment(null);
    setStep(1);
    setSelectedIntake('');
    setSelectedModule('');
    setModules([]); // Clear modules when resetting
    setAssignmentTitle('');
    setAssignmentDescription('');
    setDueDate('');
    setMaxMarks(100);
    setAssignmentFileUrl('');
    setAssignmentFile(null);
    setUploading(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterProgram('all');
    setFilterModule('all');
    setFilterStatus('all');
    setCurrentPage(0);
  };

  if (loading && currentPage === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
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
            className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Assignment Management</h1>
              <p className="text-blue-100 mt-1">Create and manage assignments for modules</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalElements}</p>
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
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {assignments.filter(a => !a.isPublished).length}
                </p>
              </div>
              <EyeOff className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {assignments.filter(a => {
                    const daysUntilDue = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return daysUntilDue <= 7 && daysUntilDue >= 0;
                  }).length}
                </p>
              </div>
              <File className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent lg:col-span-2"
            />
            <select
              value={filterFaculty}
              onChange={(e) => {
                setFilterFaculty(e.target.value);
                setFilterDepartment('all');
                setFilterProgram('all');
                setFilterModule('all');
                setCurrentPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Faculties</option>
              {filterFaculties.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => {
                setFilterDepartment(e.target.value);
                setFilterProgram('all');
                setFilterModule('all');
                setCurrentPage(0);
              }}
              disabled={filterFaculty === 'all'}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="all">All Departments</option>
              {filterDepartments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={filterProgram}
              onChange={(e) => {
                setFilterProgram(e.target.value);
                setFilterModule('all');
                setCurrentPage(0);
              }}
              disabled={filterDepartment === 'all'}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="all">All Programs</option>
              {filterPrograms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Assignments Grid */}
        {assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600">
              {searchTerm || filterFaculty !== 'all' ? 'Try adjusting your filters' : 'Create your first assignment to get started'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                      <p className="text-sm text-gray-600">
                        {assignment.moduleCode} - {assignment.moduleName}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      assignment.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {assignment.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  
                  {assignment.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{assignment.description}</p>
                  )}
                  
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Marks:</span>
                      <span className="font-medium">{assignment.maxMarks}</span>
                    </div>
                    
                    {/* Attachment Section - Always show for debugging */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {assignment.attachmentName && assignment.attachmentUrl ? (
                        <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                          <div className="flex items-center text-blue-700 flex-1 min-w-0">
                            <File className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-xs truncate">{assignment.attachmentName}</span>
                          </div>
                          <button
                            onClick={() => {
                              console.log('Preview clicked:', assignment.attachmentUrl, assignment.attachmentName);
                              handlePreviewFile(assignment.attachmentUrl!, assignment.attachmentName!);
                            }}
                            className="ml-2 px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors flex-shrink-0"
                          >
                            {assignment.attachmentName.toLowerCase().endsWith('.pdf') ? '📥 Download' : '👁️ Preview'}
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          No attachment uploaded
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(assignment)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleTogglePublish(assignment)}
                      className={`flex-1 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        assignment.isPublished
                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {assignment.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span>{assignment.isPublished ? 'Unpublish' : 'Publish'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment)}
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
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              
              {!editingAssignment && (
                <div className="mt-4 flex items-center justify-between">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex items-center flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {s}
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-700">
                          {s === 1 && 'Intake'}
                          {s === 2 && 'Module'}
                          {s === 3 && 'Details'}
                        </div>
                      </div>
                      {s < 3 && <div className={`flex-1 h-1 mx-4 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Step 1: Intake Selection */}
              {!editingAssignment && step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Step 1: Select Intake</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose the intake for this assignment. Program and faculty information will be shown.
                  </p>
                  {intakes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Loading intakes...</p>
                      <p className="text-sm mt-2">If no intakes appear, please create intakes in Intake Management first.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Intake *</label>
                      <select
                        value={selectedIntake}
                        onChange={(e) => {
                          setSelectedIntake(e.target.value);
                          setSelectedModule('');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Intake</option>
                        {intakes.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Module Selection */}
              {!editingAssignment && step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Step 2: Select Module</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the module for which you want to create this assignment.
                  </p>
                  {modules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No modules assigned to this intake yet.</p>
                      <p className="text-sm mt-2">Please assign modules to the intake first in Intake Management.</p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Module *</label>
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select Module</option>
                        {modules.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Assignment Details */}
              {(editingAssignment || step === 3) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">
                    {editingAssignment ? 'Edit Assignment Details' : 'Step 4: Assignment Details'}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <input
                      type="text"
                      value={assignmentTitle}
                      onChange={(e) => setAssignmentTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={assignmentDescription}
                      onChange={(e) => setAssignmentDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks *</label>
                      <input
                        type="number"
                        min="1"
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(Number(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assignment File (Optional)</label>
                    {uploading ? (
                      <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                        <Loader className="h-5 w-5 text-blue-600 mr-2 animate-spin" />
                        <span className="text-sm text-blue-700">Uploading file...</span>
                      </div>
                    ) : assignmentFileUrl ? (
                      <div className="mb-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <File className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-700">✅ {assignmentFile?.name || 'File uploaded successfully'}</span>
                        </div>
                        <button
                          onClick={() => {
                            setAssignmentFileUrl('');
                            setAssignmentFile(null);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : null}
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                      disabled={uploading}
                    />
                    <p className="mt-1 text-xs text-gray-500">File will be uploaded automatically after selection</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <div>
                {!editingAssignment && step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {!editingAssignment && step < 3 ? (
                  <button
                    onClick={() => {
                      if (step === 1 && !selectedIntake) {
                        alert('Please select an Intake');
                        return;
                      }
                      if (step === 2 && !selectedModule) {
                        alert('Please select a Module');
                        return;
                      }
                      setStep(step + 1);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingAssignment ? 'Update Assignment' : 'Create Assignment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
            <div className={`p-6 rounded-t-lg ${
              notificationConfig.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
              notificationConfig.type === 'error' ? 'bg-gradient-to-r from-red-500 to-pink-600' :
              notificationConfig.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
              'bg-gradient-to-r from-blue-500 to-cyan-600'
            }`}>
              <div className="flex items-center gap-3 text-white">
                <span className="text-3xl">
                  {notificationConfig.type === 'success' && '🎉'}
                  {notificationConfig.type === 'error' && '❌'}
                  {notificationConfig.type === 'warning' && '⚠️'}
                  {notificationConfig.type === 'info' && 'ℹ️'}
                </span>
                <h3 className="text-xl font-bold">{notificationConfig.title}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4 whitespace-pre-line">{notificationConfig.message}</p>
              {notificationConfig.details && notificationConfig.details.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-4">
                  {notificationConfig.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setShowNotification(false)}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
                  notificationConfig.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' :
                  notificationConfig.type === 'error' ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700' :
                  notificationConfig.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' :
                  'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
                }`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[80]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
            <div className={`p-6 rounded-t-lg ${
              confirmationConfig.type === 'danger' 
                ? 'bg-gradient-to-r from-red-500 to-pink-600' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600'
            }`}>
              <div className="flex items-center gap-3 text-white">
                <span className="text-3xl">
                  {confirmationConfig.type === 'danger' ? '🗑️' : '⚠️'}
                </span>
                <h3 className="text-xl font-bold">{confirmationConfig.title}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6 whitespace-pre-line">{confirmationConfig.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmationConfig.onConfirm}
                  className={`flex-1 py-2 px-4 font-semibold text-white rounded-lg transition-colors ${
                    confirmationConfig.type === 'danger'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                      : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                  }`}
                >
                  {confirmationConfig.confirmText}
                </button>
              </div>
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

