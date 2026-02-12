import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { examService } from '../../services/examService';
import { facultyService, departmentService, programService } from '../../services/academicStructureService';
import { intakeService } from '../../services/intakeService';
import { intakeModuleService } from '../../services/intakeModuleService';
import { moduleService } from '../../services/moduleService';

interface Faculty {
  id: number;
  name: string;
}

interface Department {
  id: number;
  departmentName: string;
  facultyId: number;
}

interface Program {
  id: number;
  name: string;
  departmentId: number;
}

interface Intake {
  id: number;
  intakeCode: string;
  intakeName: string;
  intakeYear: number;
  intakeMonth: number;
  programId: number;
  programName?: string;
  departmentId?: number;
  departmentName?: string;
  facultyId?: number;
  facultyName?: string;
}

interface Module {
  id: number;
  moduleCode: string;
  moduleName: string;
}

interface Exam {
  id: number;
  examName: string;
  description?: string;
  examDate: string;
  examTime: string;
  durationMinutes: number;
  maxMarks: number;
  published: boolean;
  moduleId: number;
  intakeId: number;
  moduleCode?: string;
  moduleName?: string;
  intakeName?: string;
}

export function ExamManagement() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  
  // Custom notification modal states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    details: [] as string[]
  });

  // Custom confirmation modal states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirm',
    type: 'danger' as 'danger' | 'warning'
  });
  
  // Filter states
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;
  
  // Dropdown data for filters
  const [filterFaculties, setFilterFaculties] = useState<Faculty[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<Department[]>([]);
  const [filterPrograms, setFilterPrograms] = useState<Program[]>([]);
  const [filterModules, setFilterModules] = useState<Module[]>([]);
  
  // Form state - Simplified to 3 steps: Intake → Module → Exam Details
  const [step, setStep] = useState(1);
  const [selectedIntake, setSelectedIntake] = useState<number | ''>('');
  const [selectedModule, setSelectedModule] = useState<number | ''>('');
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [maxMarks, setMaxMarks] = useState(100);

  // Helper functions for custom modals
  const showSuccessNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'success', title, message, details });
    setShowNotification(true);
  };

  const showErrorNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'error', title, message, details });
    setShowNotification(true);
  };

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' = 'danger') => {
    setConfirmationConfig({ title, message, onConfirm, confirmText: 'Confirm', type });
    setShowConfirmation(true);
  };

  useEffect(() => {
    loadExams();
    loadAllIntakes(); // Load all intakes on component mount
    loadFaculties(); // For filters
    loadFilterFaculties();
  }, []);

  // Reload exams when filters or pagination change
  useEffect(() => {
    if (!loading) {
      loadExams();
    }
  }, [filterFaculty, filterDepartment, filterProgram, filterModule, filterStatus, searchTerm, currentPage]);

  // When intake is selected, load modules for that intake
  useEffect(() => {
    if (selectedIntake) {
      loadModulesForIntake(selectedIntake);
    }
  }, [selectedIntake]);

  // Filter useEffects
  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadFilterDepartments(filterFaculty);
    } else {
      setFilterDepartments([]);
      setFilterPrograms([]);
      setFilterModules([]);
    }
  }, [filterFaculty]);

  useEffect(() => {
    if (filterDepartment !== 'all') {
      loadFilterPrograms(filterDepartment);
    } else {
      setFilterPrograms([]);
      setFilterModules([]);
    }
  }, [filterDepartment]);

  useEffect(() => {
    if (filterProgram !== 'all') {
      loadFilterModules(filterProgram);
    } else {
      setFilterModules([]);
    }
  }, [filterProgram]);

  const loadExams = async () => {
    try {
      setLoading(true);
      // Build filters for backend
      const filters: any = {};
      if (filterFaculty !== 'all') filters.facultyId = Number(filterFaculty);
      if (filterDepartment !== 'all') filters.departmentId = Number(filterDepartment);
      if (filterProgram !== 'all') filters.programId = Number(filterProgram);
      if (filterModule !== 'all') filters.moduleId = Number(filterModule);
      if (filterStatus !== 'all') filters.published = filterStatus === 'published';
      if (searchTerm) filters.searchTerm = searchTerm;

      const response = await examService.getExamsAdmin(currentPage, pageSize, filters);
      if (response && response.success && response.data) {
        setExams(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } else {
        setExams([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      setExams([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async () => {
    try {
      const response = await facultyService.getAll();
      if (response && response.success && response.data) {
        setFaculties(response.data);
      } else {
        setFaculties([]);
      }
    } catch (error) {
      console.error('Error loading faculties:', error);
      setFaculties([]);
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
        console.log('Raw intake API response:', result);
        if (result.data && Array.isArray(result.data)) {
          const mappedIntakes = result.data.map((intake: any) => ({
            id: intake.id,
            intakeCode: intake.intakeCode,
            intakeName: intake.intakeName || `Intake ${intake.intakeYear}-${intake.intakeMonth}`,
            intakeYear: intake.intakeYear,
            intakeMonth: intake.intakeMonth,
            programId: intake.programId,
            programName: intake.programName,
            departmentId: intake.departmentId,
            departmentName: intake.departmentName,
            facultyId: intake.facultyId,
            facultyName: intake.facultyName
          }));
          console.log('Mapped intakes for exam creation:', mappedIntakes);
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
  const loadModulesForIntake = async (intakeId: number | '') => {
    if (!intakeId) return;
    try {
      console.log('Loading modules for intake ID:', intakeId);
      const response = await intakeModuleService.getModulesByIntake(Number(intakeId));
      console.log('Modules response from intakeModuleService:', response);
      if (response && response.success && response.data) {
        // Map IntakeModuleDTO to Module interface
        const mappedModules = response.data.map((im: any) => ({
          id: im.moduleId,
          moduleCode: im.moduleCode,
          moduleName: im.moduleName
        }));
        console.log('Mapped modules for exam creation:', mappedModules);
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

  const loadDepartments = async (facultyId: number | '') => {
    if (!facultyId) return;
    try {
      const response = await departmentService.getByFaculty(Number(facultyId));
      if (response && response.success && response.data) {
        setDepartments(response.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    }
  };

  const loadPrograms = async (departmentId: number | '') => {
    if (!departmentId) return;
    try {
      const response = await programService.getAll();
      if (response && response.success && response.data) {
        const filteredPrograms = response.data.filter((p: any) => p.departmentId === Number(departmentId) || p.department_id === Number(departmentId));
        setPrograms(filteredPrograms as any[]);
      } else {
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      setPrograms([]);
    }
  };

  // Filter load functions
  const loadFilterFaculties = async () => {
    try {
      const response = await facultyService.getAll();
      if (response && response.success && response.data) {
        setFilterFaculties(response.data);
      } else {
        setFilterFaculties([]);
      }
    } catch (error) {
      console.error('Error loading filter faculties:', error);
      setFilterFaculties([]);
    }
  };

  const loadFilterDepartments = async (facultyId: string) => {
    try {
      const response = await departmentService.getByFaculty(Number(facultyId));
      if (response && response.success && response.data) {
        setFilterDepartments(response.data);
      } else {
        setFilterDepartments([]);
      }
    } catch (error) {
      console.error('Error loading filter departments:', error);
      setFilterDepartments([]);
    }
  };

  const loadFilterPrograms = async (departmentId: string) => {
    try {
      const response = await programService.getAll();
      if (response && response.success && response.data) {
        const filtered = response.data.filter((p: any) => p.departmentId === Number(departmentId) || p.department_id === Number(departmentId));
        setFilterPrograms(filtered as any[]);
      } else {
        setFilterPrograms([]);
      }
    } catch (error) {
      console.error('Error loading filter programs:', error);
      setFilterPrograms([]);
    }
  };

  const loadFilterModules = async (programId: string) => {
    try {
      // moduleService exposes a paged getModules; get many and filter by program client-side
      const response = await moduleService.getModules(0, 10000);
      if (response && response.success && response.data && response.data.content) {
        const filtered = response.data.content.filter((m: any) => (m.programId === Number(programId) || m.program_id === Number(programId)));
        setFilterModules(filtered as unknown as Module[]);
      } else if (response && response.success && Array.isArray(response.data)) {
        // fallback if service returns an array directly
        const filtered = (response.data as any[]).filter((m: any) => (m.programId === Number(programId) || m.program_id === Number(programId)));
        setFilterModules(filtered as unknown as Module[]);
      } else {
        setFilterModules([]);
      }
    } catch (error) {
      console.error('Error loading filter modules:', error);
      setFilterModules([]);
    }
  };

  const handleCreateExam = async () => {
    if (!examName || !selectedModule || !selectedIntake || !examDate || !examTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const examData = {
        examName,
        description: examDescription,
        moduleId: Number(selectedModule),
        intakeId: Number(selectedIntake),
        examDate,
        examTime,
        durationMinutes,
        maxMarks
      };

      const response = await examService.createExamAdmin(examData);
      if (response && response.success) {
        showSuccessNotification(
          'Exam Created Successfully',
          `"${examName}" has been created and added to the system.`
        );
        resetForm();
        loadExams();
      } else {
        console.error('Create exam failed:', response);
        showErrorNotification('Failed to Create Exam', response?.message || 'An error occurred while creating the exam');
      }
    } catch (error: any) {
      console.error('Error creating exam:', error);
      const errorMessage = error?.message || 'An unexpected error occurred';
      
      // Check if it's a duplicate exam error
      if (errorMessage.includes('exam already exists') || errorMessage.includes('Only one exam per module')) {
        showErrorNotification(
          'Module Limit Reached',
          'This module already has an exam. Only one exam per module is allowed. Please edit the existing exam or delete it before creating a new one.'
        );
      } else {
        showErrorNotification('Failed to Create Exam', errorMessage);
      }
    }
  };

  const handleTogglePublish = async (examId: number, currentStatus: boolean) => {
    try {
      const response = await examService.togglePublishAdmin(examId);
      if (response && response.success) {
        showSuccessNotification(
          'Status Updated',
          `Exam has been ${currentStatus ? 'unpublished' : 'published'} successfully.`
        );
        loadExams();
      } else {
        console.error('Toggle publish failed:', response);
        showErrorNotification('Failed to Update Status', response?.message || 'An error occurred');
      }
    } catch (error: any) {
      console.error('Error toggling publish status:', error);
      showErrorNotification('Failed to Update Status', error?.message || 'An unexpected error occurred');
    }
  };

  const handleDeleteExam = async (examId: number) => {
    const exam = exams.find(e => e.id === examId);
    const examName = exam?.examName || 'this exam';
    
    showConfirmDialog(
      'Delete Exam',
      `Are you sure you want to delete "${examName}"?\n\nThis action cannot be undone and will permanently remove the exam from the system.`,
      async () => {
        try {
          const response = await examService.deleteExamAdmin(examId);
          if (response && response.success) {
            showSuccessNotification(
              'Exam Deleted Successfully',
              `"${examName}" has been permanently removed from the system.`
            );
            loadExams();
          } else {
            console.error('Delete exam failed:', response);
            showErrorNotification('Failed to Delete Exam', response?.message || 'An error occurred while deleting the exam');
          }
        } catch (error: any) {
          console.error('Error deleting exam:', error);
          showErrorNotification('Failed to Delete Exam', error?.message || 'An unexpected error occurred');
        }
      },
      'danger'
    );
  };

  const handleEditExam = (exam: Exam) => {
    // Load the exam data into the form
    setIsEditMode(true);
    setEditingExamId(exam.id);
    setExamName(exam.examName);
    setExamDescription(exam.description || '');
    setExamDate(exam.examDate);
    setExamTime(exam.examTime);
    setDurationMinutes(exam.durationMinutes);
    setMaxMarks(exam.maxMarks);
    setSelectedModule(exam.moduleId);
    setSelectedIntake(exam.intakeId);
    
    // For edit mode, skip the selection steps and go directly to exam details
    // The module and intake are already selected, user can't change them in edit mode
    setStep(6); // Go directly to exam details step
    setShowModal(true);
  };

  const handleUpdateExam = async () => {
    if (!editingExamId) return;
    
    const examData = {
      examName,
      description: examDescription,
      examDate,
      examTime,
      durationMinutes,
      maxMarks,
      moduleId: selectedModule as number,
      intakeId: selectedIntake as number
    };

    try {
      const response = await examService.updateExamAdmin(editingExamId, examData);
      if (response && response.success) {
        showSuccessNotification(
          'Exam Updated Successfully',
          `"${examName}" has been updated.`
        );
        resetForm();
        loadExams();
      } else {
        console.error('Update exam failed:', response);
        showErrorNotification('Failed to Update Exam', response?.message || 'An error occurred while updating the exam');
      }
    } catch (error: any) {
      console.error('Error updating exam:', error);
      showErrorNotification('Failed to Update Exam', error?.message || 'An unexpected error occurred');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingExamId(null);
    setStep(1);
    setSelectedIntake('');
    setSelectedModule('');
    setModules([]); // Clear modules when resetting
    setExamName('');
    setExamDescription('');
    setExamDate('');
    setExamTime('');
    setDurationMinutes(120);
    setMaxMarks(100);
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

  // displayedExams is just exams since filtering is server-side now

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
              <h1 className="text-3xl font-bold">Exam Management</h1>
              <p className="text-cyan-100 mt-1">Create and manage exams for modules</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create Exam
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by exam name or module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <select
                value={filterFaculty}
                onChange={(e) => {
                  setFilterFaculty(e.target.value);
                  setFilterDepartment('all');
                  setFilterProgram('all');
                  setFilterModule('all');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={filterFaculty === 'all'}
              >
                <option value="all">All Departments</option>
                {filterDepartments.map(d => (
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setFilterModule('all');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={filterDepartment === 'all'}
              >
                <option value="all">All Programs</option>
                {filterPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={filterProgram === 'all'}
              >
                <option value="all">All Modules</option>
                {filterModules.map(m => (
                  <option key={m.id} value={m.id}>{m.moduleCode} - {m.moduleName}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                title="Reset all filters"
              >
                <X size={20} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
              <p className="mt-4 text-gray-600">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FileText className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">No exams found. {totalElements > 0 ? 'Try adjusting your filters.' : 'Create your first exam!'}</p>
            </div>
          ) : (
            <>
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{exam.examName}</h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            exam.published
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {exam.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium text-gray-700">Module:</span>
                          <div className="text-xs">{exam.moduleCode} - {exam.moduleName}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Intake:</span>
                          <div className="text-xs">{exam.intakeName}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Date:</span>
                          <div className="text-xs">{new Date(exam.examDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Time:</span>
                          <div className="text-xs">{exam.examTime} ({exam.durationMinutes} min)</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Max Marks:</span>
                          <div className="text-xs">{exam.maxMarks}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button 
                        onClick={() => handleEditExam(exam)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                        title="Edit exam"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(exam.id, exam.published)}
                        className={`${
                          exam.published
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        } p-2 rounded-lg transition-colors`}
                        title={exam.published ? 'Unpublish' : 'Publish'}
                      >
                        {exam.published ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                        title="Delete exam"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-cyan-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Results info */}
              {totalElements > 0 && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} exams
                </div>
              )}
            </>
          )}
        </div>

        {/* Create/Edit Exam Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isEditMode ? 'Edit Exam' : 'Create New Exam'}
                </h2>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            step >= s ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {s}
                        </div>
                        <div className="ml-2 text-sm font-medium text-gray-700">
                          {s === 1 && 'Intake'}
                          {s === 2 && 'Module'}
                          {s === 3 && 'Details'}
                        </div>
                      </div>
                      {s < 3 && (
                        <div className={`flex-1 h-1 mx-4 ${step > s ? 'bg-cyan-600' : 'bg-gray-200'}`}></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Intake Selection */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 1: Select Intake</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose the intake for this exam. Program and faculty information will be shown.
                    </p>
                    {intakes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Loading intakes...</p>
                        <p className="text-sm mt-2">If no intakes appear, please create intakes in Intake Management first.</p>
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedIntake}
                          onChange={(e) => setSelectedIntake(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                          <option value="">-- Select Intake --</option>
                          {intakes.map((intake) => (
                            <option key={intake.id} value={intake.id}>
                              {intake.intakeName} - {intake.programName} ({intake.facultyName})
                            </option>
                          ))}
                        </select>
                        {selectedIntake && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                            {intakes.find(i => i.id === selectedIntake) && (
                              <>
                                <p><strong>Program:</strong> {intakes.find(i => i.id === selectedIntake)?.programName}</p>
                                <p><strong>Department:</strong> {intakes.find(i => i.id === selectedIntake)?.departmentName}</p>
                                <p><strong>Faculty:</strong> {intakes.find(i => i.id === selectedIntake)?.facultyName}</p>
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Step 2: Module Selection */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 2: Select Module</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Select the module for which you want to create this exam.
                    </p>
                    {modules.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No modules assigned to this intake yet.</p>
                        <p className="text-sm mt-2">Please assign modules to the intake first in Intake Management.</p>
                      </div>
                    ) : (
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">-- Select Module --</option>
                        {modules.map((module) => (
                          <option key={module.id} value={module.id}>
                            {module.moduleCode} - {module.moduleName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Step 3: Exam Details */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 3: Exam Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exam Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        placeholder="e.g., Mid-Term Examination"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={examDescription}
                        onChange={(e) => setExamDescription(e.target.value)}
                        placeholder="Exam description and instructions..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={examTime}
                          onChange={(e) => setExamTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Minutes)</label>
                        <input
                          type="number"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                          min="30"
                          step="15"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
                        <input
                          type="number"
                          value={maxMarks}
                          onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex gap-3 mt-8">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && !selectedIntake) ||
                        (step === 2 && !selectedModule)
                      }
                      className="flex-1 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={isEditMode ? handleUpdateExam : handleCreateExam}
                      className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {isEditMode ? 'Update Exam' : 'Create Exam'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom Notification Modal */}
        {showNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[80]">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in">
              <div className={`p-6 rounded-t-lg ${
                notificationConfig.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                notificationConfig.type === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                notificationConfig.type === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-600' :
                'bg-gradient-to-r from-blue-500 to-blue-600'
              } text-white`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {notificationConfig.type === 'success' ? '✅' :
                     notificationConfig.type === 'error' ? '❌' :
                     notificationConfig.type === 'warning' ? '⚠️' : 'ℹ️'}
                  </div>
                  <h3 className="text-xl font-bold">{notificationConfig.title}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 text-base mb-4">{notificationConfig.message}</p>
                
                {notificationConfig.details.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <ul className="space-y-2">
                      {notificationConfig.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className={
                            notificationConfig.type === 'error' ? 'text-red-500' :
                            notificationConfig.type === 'warning' ? 'text-amber-500' :
                            'text-green-500'
                          }>•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => setShowNotification(false)}
                  className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                    notificationConfig.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    notificationConfig.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    notificationConfig.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[80]">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in">
              <div className={`p-6 rounded-t-lg text-white ${
                confirmationConfig.type === 'danger' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-600'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{confirmationConfig.type === 'danger' ? '🗑️' : '⚠️'}</div>
                  <h3 className="text-xl font-bold">{confirmationConfig.title}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-gray-700 text-base mb-6 whitespace-pre-line">{confirmationConfig.message}</p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      confirmationConfig.onConfirm();
                    }}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                      confirmationConfig.type === 'danger'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    {confirmationConfig.confirmText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}