import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Book, ArrowLeft, Calendar, X, AlertTriangle } from 'lucide-react';

// Import API services
import { moduleService } from '../../services/moduleService';
import { academicStructureService } from '../../services/academicStructureService';

// Types
interface Module {
  id: number;
  moduleCode: string;
  moduleName: string;
  description?: string;
  creditScore: number;
  facultyName: string;
  departmentName: string;
  programName: string;
  isActive: boolean;
}

interface Faculty {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Program {
  id: number;
  name: string;
}

const ModuleManagement: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [step, setStep] = useState(1);
  const [editingModule, setEditingModule] = useState<any>(null);

  // Form state
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [creditScore, setCreditScore] = useState(3);

  // Dropdown data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);

  // Delete confirmation
  const [moduleToToggle, setModuleToToggle] = useState<{
    id: string;
    currentStatus: boolean;
    name: string;
  } | null>(null);

  // Custom notification modal states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    details: [] as string[]
  });

  // Helper functions for custom modals
  const showSuccessNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'success', title, message, details });
    setShowNotification(true);
  };

  const showErrorNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'error', title, message, details });
    setShowNotification(true);
  };

  // Load initial data
  useEffect(() => {
    loadModules();
    loadFaculties();
  }, []);

  // Load modules with pagination
  const loadModules = async (page = 0, search = '') => {
    try {
      setLoading(true);
      const response = await moduleService.searchModules({
        page,
        size: 12,
        search: search || searchTerm,
        isActive: true, // Only load active modules
        sortBy: 'moduleName',
        sortDirection: 'asc'
      });

      if (response.success && response.data) {
        const moduleData = response.data.content || [];
        console.log('Raw module data from API:', moduleData);
        console.log('Number of modules:', moduleData.length);
        
        // Map the response to match our Module interface
        const mappedModules = moduleData.map((module: any) => ({
          id: module.id,
          moduleCode: module.moduleCode,
          moduleName: module.moduleName,
          description: module.description,
          creditScore: module.creditScore,
          facultyName: module.facultyName,
          departmentName: module.departmentName,
          programName: module.programName,
          isActive: module.isActive
        }));
        console.log('Mapped modules:', mappedModules);
        setModules(mappedModules);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
        setCurrentPage(page || 0);
        console.log('State updated - modules count:', mappedModules.length, 'totalElements:', response.data.totalElements);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      showErrorNotification('Loading Failed', 'Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  // Load dropdown data
  const loadFaculties = async () => {
    try {
      const response = await academicStructureService.faculty.getDropdownOptions();
      if (response.success && response.data) {
        setFaculties(response.data);
      }
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadDepartments = async (facultyId: number) => {
    try {
      const response = await academicStructureService.department.getDropdownOptionsByFaculty(facultyId);
      if (response.success && response.data) {
        setDepartments(response.data);
        // Reset dependent selections
        setSelectedDepartment('');
        setSelectedProgram('');
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadPrograms = async (facultyId: number, departmentId: number) => {
    try {
      const response = await academicStructureService.program.getDropdownOptions(facultyId, departmentId);
      if (response.success && response.data) {
        setPrograms(response.data);
        // Reset dependent selections
        setSelectedProgram('');
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  // Module CRUD operations
  const handleCreateModule = async () => {
    if (!moduleCode || !moduleName || !selectedFaculty || !selectedDepartment || !selectedProgram) {
      showErrorNotification('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const moduleData = {
        moduleCode: moduleCode.toUpperCase(),
        moduleName: moduleName,
        description: moduleDescription,
        creditScore: creditScore,
        facultyId: parseInt(selectedFaculty),
        departmentId: parseInt(selectedDepartment),
        programId: parseInt(selectedProgram)
      };

      const response = await moduleService.createModule(moduleData);
      
      if (response.success && response.data) {
        showSuccessNotification(
          'Module Created Successfully!',
          `Module "${response.data.moduleCode} - ${response.data.moduleName}" has been created successfully.`,
          [
            `Faculty: ${response.data.facultyName}`,
            `Department: ${response.data.departmentName}`,
            `Program: ${response.data.programName}`
          ]
        );
        setShowModal(false);
        resetForm();
        await loadModules(currentPage, searchTerm);
      } else {
        showErrorNotification('Creation Failed', response.message || 'Failed to create module');
      }
    } catch (error: any) {
      console.error('Error creating module:', error);
      showErrorNotification('Error', 'Failed to create module. Please try again.');
    }
  };

  const handleEditModule = async () => {
    if (!editingModule || !moduleCode || !moduleName) {
      showErrorNotification('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const updateData = {
        moduleCode: moduleCode.toUpperCase(),
        moduleName: moduleName,
        description: moduleDescription,
        creditScore: creditScore,
        facultyId: editingModule.facultyId,
        departmentId: editingModule.departmentId,
        programId: editingModule.programId,
        isActive: editingModule.isActive
      };

      const response = await moduleService.updateModule(editingModule.id, updateData);
      
      if (response.success && response.data) {
        showSuccessNotification(
          'Module Updated Successfully!',
          `Module "${response.data.moduleCode} - ${response.data.moduleName}" has been updated successfully.`
        );
        setShowModal(false);
        resetForm();
        await loadModules(currentPage, searchTerm);
      } else {
        showErrorNotification('Update Failed', response.message || 'Failed to update module');
      }
    } catch (error: any) {
      console.error('Error updating module:', error);
      showErrorNotification('Error', 'Failed to update module. Please try again.');
    }
  };

  const confirmDeleteModule = (module: any) => {
    setModuleToToggle({
      id: module.id.toString(),
      currentStatus: module.isActive,
      name: module.moduleName
    });
    setShowConfirmModal(true);
  };

  const handleDeleteModule = async () => {
    if (!moduleToToggle) return;

    try {
      console.log('Deleting module:', moduleToToggle.id, 'Current page:', currentPage, 'Search term:', searchTerm);
      const response = await moduleService.deleteModule(parseInt(moduleToToggle.id));
      
      if (response.success) {
        console.log('Module deleted, reloading...');
        showSuccessNotification(
          'Module Deleted Successfully!',
          `Module "${moduleToToggle.name}" has been deleted successfully.`
        );
        setShowConfirmModal(false);
        setModuleToToggle(null);
        // Reload current page
        await loadModules(currentPage, searchTerm);
        console.log('Reload completed');
      } else {
        showErrorNotification('Deletion Failed', response.message || 'Failed to delete module');
      }
    } catch (error: any) {
      console.error('Error deleting module:', error);
      showErrorNotification('Error', 'Failed to delete module. Please try again.');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setStep(1);
    setSelectedFaculty('');
    setSelectedDepartment('');
    setSelectedProgram('');
    setModuleCode('');
    setModuleName('');
    setModuleDescription('');
    setCreditScore(3);
    setEditingModule(null);
  };

  const openEditModal = (module: any) => {
    setEditingModule(module);
    setModuleCode(module.moduleCode);
    setModuleName(module.moduleName);
    setModuleDescription(module.description || '');
    setCreditScore(module.creditScore);
    setShowModal(true);
    setStep(5); // Skip to module info step for editing
  };

  // Step navigation
  const handleNextStep = () => {
    if (step === 1 && selectedFaculty) {
      setStep(2);
      loadDepartments(parseInt(selectedFaculty));
    } else if (step === 2 && selectedDepartment) {
      setStep(3);
      loadPrograms(parseInt(selectedFaculty), parseInt(selectedDepartment));
    } else if (step === 3 && selectedProgram) {
      setStep(4);  // Go directly to module information (previously step 5)
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    if (editingModule) {
      handleEditModule();
    } else {
      handleCreateModule();
    }
  };

  // Page change handler
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      loadModules(newPage, searchTerm);
    }
  };

  // Search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    loadModules(0, searchTerm);
  };

  // Filter modules based on status
  const filteredModules = modules.filter(module => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && module.isActive) ||
      (filterStatus === 'inactive' && !module.isActive);
    return matchesStatus;
  });

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
              <h1 className="text-3xl font-bold">Module Management</h1>
              <p className="text-blue-200 mt-1">Create and manage academic modules</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Module
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{modules.filter(m => m.isActive).length}</div>
                <div className="text-gray-600">Active Modules</div>
              </div>
              <Book className="text-blue-500" size={40} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{modules.filter(m => !m.isActive).length}</div>
                <div className="text-gray-600">Inactive Modules</div>
              </div>
              <Book className="text-gray-500" size={40} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalElements}</div>
                <div className="text-gray-600">Total Modules</div>
              </div>
              <Book className="text-emerald-500" size={40} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by module name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modules</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Modules List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              <p className="mt-4 text-gray-600">Loading modules...</p>
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">No modules found</p>
            </div>
          ) : (
            filteredModules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-2 ${module.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{module.moduleCode}</h3>
                      <p className="text-sm text-gray-500">{module.programName}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${module.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {module.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">{module.moduleName}</h4>
                  
                  {module.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{module.creditScore} Credits</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <p><span className="font-medium">Faculty:</span> {module.facultyName}</p>
                    <p><span className="font-medium">Department:</span> {module.departmentName}</p>
                    <p><span className="font-medium">Program:</span> {module.programName}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <button
                      onClick={() => openEditModal(module)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDeleteModule(module)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Previous
            </button>
            <span className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingModule ? 'Edit Module' : 'Create New Module'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Step Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4].map((stepNum) => (
                    <div key={stepNum} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepNum ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {stepNum}
                      </div>
                      {stepNum < 4 && (
                        <div className={`w-24 h-1 ml-2 ${step > stepNum ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Faculty</span>
                  <span>Department</span>
                  <span>Program</span>
                  <span>Module Info</span>
                </div>
              </div>

              {/* Step Content */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Step 1: Select Faculty</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Faculty *</label>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id.toString()}>{faculty.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Step 2: Select Department</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id.toString()}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Step 3: Select Program</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Program *</label>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Program</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id.toString()}>{program.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">Step 4: Module Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Module Code *</label>
                    <input
                      type="text"
                      value={moduleCode}
                      onChange={(e) => {
                        // Remove spaces and convert to uppercase, allow only A-Z, 0-9, underscore, hyphen
                        const sanitized = e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
                        setModuleCode(sanitized);
                      }}
                      placeholder="e.g., CS101"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Only uppercase letters, numbers, underscore, and hyphen (no spaces)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Module Name *</label>
                    <input
                      type="text"
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      placeholder="e.g., Introduction to Computer Science"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={moduleDescription}
                      onChange={(e) => setModuleDescription(e.target.value)}
                      rows={4}
                      placeholder="Module description..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Credit Score *</label>
                    <select
                      value={creditScore}
                      onChange={(e) => setCreditScore(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                        <option key={score} value={score}>{score} Credit{score !== 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 flex justify-between gap-3 border-t border-gray-200">
              <button
                onClick={handlePreviousStep}
                disabled={step === 1}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Previous
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                
                {step < 4 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={
                      (step === 1 && !selectedFaculty) ||
                      (step === 2 && !selectedDepartment) ||
                      (step === 3 && !selectedProgram)
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={!moduleCode || !moduleName}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    {editingModule ? 'Update Module' : 'Create Module'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && moduleToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Delete Module</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "<span className="font-semibold text-gray-800">{moduleToToggle.name}</span>"?
                This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteModule}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Delete Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error/Warning Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className={`flex items-center justify-center mx-auto w-12 h-12 rounded-full mb-4 ${
                notificationConfig.type === 'success' ? 'bg-green-100' :
                notificationConfig.type === 'error' ? 'bg-red-100' :
                'bg-yellow-100'
              }`}>
                {notificationConfig.type === 'success' && (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
                {notificationConfig.type === 'error' && (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                )}
                {notificationConfig.type === 'warning' && (
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                {notificationConfig.title}
              </h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                {notificationConfig.message}
              </p>
              {notificationConfig.details && notificationConfig.details.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <ul className="text-sm text-gray-700 space-y-1">
                    {notificationConfig.details.map((detail: string, index: number) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowNotification(false)}
                  className={`px-6 py-2 rounded-lg transition-colors text-white ${
                    notificationConfig.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                    notificationConfig.type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ModuleManagement };