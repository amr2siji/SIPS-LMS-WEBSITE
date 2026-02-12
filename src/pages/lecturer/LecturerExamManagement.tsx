import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { examService } from '../../services/examService';
import { intakeService } from '../../services/intakeService';
import { lecturerService } from '../../services/lecturerService';

interface Intake {
  id: number;
  intakeName: string;
  programId: number;
}

interface Module {
  id: number;
  moduleCode: string;
  moduleName: string;
  programId: number;
  intakeId: number;
}

interface AssignedModule {
  id: number;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  programId?: number;
  programName?: string;
  intakeId?: number;
  intakeName?: string;
  departmentId?: number;
  departmentName?: string;
  facultyId?: number;
  facultyName?: string;
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

export function LecturerExamManagement() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [assignedModules, setAssignedModules] = useState<AssignedModule[]>([]);
  
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
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 9;
  
  // Dropdown data for filters
  const [filterModules, setFilterModules] = useState<Module[]>([]);
  
  // Form state
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
    loadAssignedModules(); // Load assigned modules first
  }, []);

  // After assigned modules are loaded, load exams
  useEffect(() => {
    if (assignedModules.length > 0) {
      loadExams();
    }
  }, [assignedModules]);

  // Reload exams when filters or pagination change
  useEffect(() => {
    if (!loading && assignedModules.length > 0) {
      loadExams();
    }
  }, [filterModule, filterStatus, searchTerm, currentPage]);

  useEffect(() => {
    if (selectedIntake && assignedModules.length > 0) {
      filterModulesByIntake(selectedIntake);
    }
  }, [selectedIntake]);

  const loadExams = async () => {
    try {
      setLoading(true);
      // Build filters for backend
      const filters: any = {};
      if (filterModule !== 'all') filters.moduleId = Number(filterModule);
      if (filterStatus !== 'all') filters.published = filterStatus === 'published';
      if (searchTerm) filters.searchTerm = searchTerm;

      const response = await examService.getExamsLecturer(currentPage, pageSize, filters);
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

  const filterModulesByIntake = async (intakeId: number | '') => {
    if (!intakeId) {
      setModules([]);
      return;
    }
    
    try {
      // Filter to only show modules that the lecturer is assigned to for this intake
      const filteredModules = assignedModules
        .filter(m => m.intakeId === Number(intakeId))
        .map(m => ({
          id: m.moduleId,
          moduleCode: m.moduleCode,
          moduleName: m.moduleName,
          programId: m.programId || 0,
          intakeId: m.intakeId || 0
        }));
      
      if (filteredModules.length === 0) {
        showErrorNotification(
          'No Assigned Modules',
          'You are not assigned to any modules in this intake. Please contact your administrator.'
        );
      }
      
      setModules(filteredModules);
    } catch (error) {
      console.error('Error filtering modules:', error);
      setModules([]);
    }
  };

  // Load assigned modules for filter dropdown and for exam creation
  const loadAssignedModules = async () => {
    try {
      console.log('🔍 Loading assigned modules...');
      const response = await lecturerService.getMyModules();
      console.log('📦 Raw response:', response);
      
      if (response && response.success && response.data) {
        console.log('✅ Response data:', response.data);
        console.log('📊 Number of assigned modules:', response.data.length);
        
        // Log the first module to see its structure
        if (response.data.length > 0) {
          console.log('🔍 First module structure:', response.data[0]);
          console.log('🔍 First module intakeId:', response.data[0].intakeId);
        }
        
        setAssignedModules(response.data);
        // Convert to Module format for filter dropdown
        const moduleList: Module[] = response.data.map((assignment: AssignedModule) => ({
          id: assignment.moduleId,
          moduleCode: assignment.moduleCode,
          moduleName: assignment.moduleName,
          programId: assignment.programId || 0,
          intakeId: assignment.intakeId || 0
        }));
        setFilterModules(moduleList);
        
        // Load intakes directly from the assigned modules data
        await loadFilteredAcademicStructure(response.data);
      } else {
        console.warn('⚠️ No data in response or response not successful');
        setAssignedModules([]);
        setFilterModules([]);
      }
    } catch (error) {
      console.error('❌ Error loading assigned modules:', error);
      setAssignedModules([]);
      setFilterModules([]);
    }
  };

  // Load assigned intakes from assigned modules
  const loadFilteredAcademicStructure = async (modules: AssignedModule[]) => {
    try {
      console.log('🏫 Loading intakes from modules...');
      console.log('📚 Modules received:', modules);
      
      // Extract unique intake IDs from assigned modules
      const assignedIntakeIds = [...new Set(modules.map(m => m.intakeId).filter(id => id))];

      console.log('🎯 Assigned intake IDs:', assignedIntakeIds);
      console.log('📊 Number of unique intakes:', assignedIntakeIds.length);

      if (assignedIntakeIds.length === 0) {
        console.warn('⚠️ No intake IDs found in assigned modules');
        console.log('🔍 Module intakeIds:', modules.map(m => ({ 
          moduleCode: m.moduleCode, 
          intakeId: m.intakeId 
        })));
        setIntakes([]);
        return;
      }

      // Load all intakes and filter by assigned intake IDs
      const intakesRes = await intakeService.getActiveIntakes();
      console.log('📥 All active intakes response:', intakesRes);
      
      if (intakesRes && intakesRes.success && intakesRes.data) {
        console.log('✅ All active intakes data:', intakesRes.data);
        console.log('📊 Number of active intakes:', intakesRes.data.length);
        
        const filteredIntakes = intakesRes.data.filter((i: any) => 
          assignedIntakeIds.includes(i.id)
        );
        console.log('✨ Filtered intakes:', filteredIntakes);
        console.log('📊 Number of filtered intakes:', filteredIntakes.length);
        setIntakes(filteredIntakes);
      } else {
        console.warn('⚠️ No intakes data in response');
      }
    } catch (error) {
      console.error('❌ Error loading assigned intakes:', error);
      showErrorNotification(
        'Error Loading Data',
        'Failed to load assigned intakes. Please refresh the page.'
      );
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

      const response = await examService.createExamLecturer(examData);
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
      const response = await examService.togglePublishLecturer(examId);
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
          const response = await examService.deleteExamLecturer(examId);
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
    setStep(3); // Go directly to exam details step
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
      const response = await examService.updateExamLecturer(editingExamId, examData);
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
    setExamName('');
    setExamDescription('');
    setExamDate('');
    setExamTime('');
    setDurationMinutes(120);
    setMaxMarks(100);
  };

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
              <h1 className="text-3xl font-bold">My Exams</h1>
              <p className="text-cyan-100 mt-1">Manage exams for your modules</p>
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalElements}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Published</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {exams.filter(e => e.published).length}
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
                  {exams.filter(e => !e.published).length}
                </p>
              </div>
              <EyeOff className="h-8 w-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Page</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">{exams.length}</p>
              </div>
              <FileText className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by exam name or module..."
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
              {filterModules.map(m => (
                <option key={m.id} value={m.id}>{m.moduleCode} - {m.moduleName}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Exams List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No exams found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterModule !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters' 
                  : 'Create your first exam to get started'}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Exam
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.examName}</h3>
                        <p className="text-sm text-blue-600 font-medium">{exam.moduleCode} - {exam.moduleName}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          exam.published
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {exam.published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {exam.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exam.description}</p>
                    )}

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Date: {new Date(exam.examDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Time: {exam.examTime} ({exam.durationMinutes} min)</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Max Marks: {exam.maxMarks}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Intake: {exam.intakeName}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleEditExam(exam)}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleTogglePublish(exam.id, exam.published)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          exam.published
                            ? 'text-gray-600 hover:bg-gray-100'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {exam.published ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
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
                <div className="flex justify-center items-center gap-2">
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
                              ? 'bg-blue-600 text-white'
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isEditMode ? 'Edit Exam' : 'Create New Exam'}
                </h2>
                
                {/* Informational Notice */}
                {!isEditMode && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 text-xl">ℹ️</div>
                      <div>
                        <p className="text-sm text-blue-900 font-medium">Assigned Intake & Module Notice</p>
                        <p className="text-sm text-blue-700 mt-1">
                          You can only create exams for intakes and modules that have been assigned to you. 
                          If you don't see your intake or module in the list, please contact your administrator.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                            step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {s}
                        </div>
                        <div className="text-xs mt-2 text-center font-medium">
                          {s === 1 && 'Intake'}
                          {s === 2 && 'Module'}
                          {s === 3 && 'Exam Details'}
                        </div>
                      </div>
                      {s < 3 && <div className={`h-1 flex-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
                    </div>
                  ))}
                </div>

                {/* Step 1: Intake */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 1: Select Intake</h3>
                    {intakes.length === 0 ? (
                      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-yellow-800 font-medium">No assigned intakes found</p>
                        <p className="text-sm text-yellow-700 mt-2">
                          You are not assigned to any intakes yet. Please contact your administrator.
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedIntake}
                        onChange={(e) => setSelectedIntake(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Select Intake --</option>
                        {intakes.map((intake) => (
                          <option key={intake.id} value={intake.id}>
                            {intake.intakeName}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                {/* Step 2: Module */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 2: Select Module</h3>
                    {modules.length === 0 ? (
                      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-yellow-800 font-medium">No assigned modules found for this intake</p>
                        <p className="text-sm text-yellow-700 mt-2">
                          You are not assigned to any modules in this intake. 
                          Please go back and select a different intake, or contact your administrator.
                        </p>
                      </div>
                    ) : (
                      <select
                        value={selectedModule}
                        onChange={(e) => setSelectedModule(e.target.value ? Number(e.target.value) : '')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={examDescription}
                        onChange={(e) => setExamDescription(e.target.value)}
                        placeholder="Exam description and instructions..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
                        <input
                          type="number"
                          value={maxMarks}
                          onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
