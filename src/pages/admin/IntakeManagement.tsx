import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Calendar, ArrowLeft, X, AlertTriangle, Book, Plus, Edit } from 'lucide-react';

// Import API services
import { intakeService, Intake } from '../../services/intakeService';
import { intakeModuleService, IntakeModuleDTO } from '../../services/intakeModuleService';
import { moduleService, ModuleResponse } from '../../services/moduleService';
import { 
  academicStructureService, 
  FacultyDropdownOption, 
  DepartmentDropdownOption, 
  ProgramDropdownOption 
} from '../../services/academicStructureService';

interface IntakeWithModuleCount extends Intake {
  moduleCount: number;
}

const IntakeManagement: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [intakes, setIntakes] = useState<IntakeWithModuleCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCreateEditModal, setShowCreateEditModal] = useState(false);
  const [selectedIntakeForAssignment, setSelectedIntakeForAssignment] = useState<Intake | null>(null);
  const [editingIntake, setEditingIntake] = useState<Intake | null>(null);

  // Module assignment state
  const [availableModules, setAvailableModules] = useState<ModuleResponse[]>([]);
  const [assignedModules, setAssignedModules] = useState<IntakeModuleDTO[]>([]);
  const [selectedModules, setSelectedModules] = useState<number[]>([]);

  // Delete confirmation
  const [intakeToDelete, setIntakeToDelete] = useState<Intake | null>(null);

  // Academic structure dropdowns
  const [faculties, setFaculties] = useState<FacultyDropdownOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentDropdownOption[]>([]);
  const [programs, setPrograms] = useState<ProgramDropdownOption[]>([]);
  
  // Form state for create/edit intake
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [intakeYear, setIntakeYear] = useState(new Date().getFullYear());
  const [intakeMonth, setIntakeMonth] = useState(1);
  const [generatedIntakeName, setGeneratedIntakeName] = useState('');

  // Constants
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    details: [] as string[]
  });

  // Helper functions for notifications
  const showSuccessNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'success', title, message, details });
    setShowNotification(true);
  };

  const showErrorNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'error', title, message, details });
    setShowNotification(true);
  };

  // Generate intake name when program, year, or month changes
  useEffect(() => {
    if (selectedProgramId && intakeYear && intakeMonth) {
      const program = programs.find(p => p.id === parseInt(selectedProgramId));
      if (program) {
        const name = `${MONTH_NAMES[intakeMonth - 1]} ${intakeYear} - ${program.name}`;
        setGeneratedIntakeName(name);
      }
    } else {
      setGeneratedIntakeName('');
    }
  }, [selectedProgramId, intakeYear, intakeMonth, programs]);

  // Load initial data
  useEffect(() => {
    loadIntakes();
    loadFaculties();
  }, []);

  // Load faculties
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

  // Load departments by faculty
  const loadDepartmentsByFaculty = async (facultyId: number) => {
    try {
      const response = await academicStructureService.department.getDropdownOptionsByFaculty(facultyId);
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  // Load programs by department
  const loadProgramsByDepartment = async (departmentId: number) => {
    try {
      // program.getDropdownOptions requires both facultyId and departmentId
      if (selectedFacultyId) {
        const response = await academicStructureService.program.getDropdownOptions(
          parseInt(selectedFacultyId), 
          departmentId
        );
        if (response.success && response.data) {
          setPrograms(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  // Handle faculty change
  const handleFacultyChange = (facultyId: string) => {
    setSelectedFacultyId(facultyId);
    setSelectedDepartmentId('');
    setSelectedProgramId('');
    setDepartments([]);
    setPrograms([]);
    if (facultyId) {
      loadDepartmentsByFaculty(parseInt(facultyId));
    }
  };

  // Handle department change
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartmentId(departmentId);
    setSelectedProgramId('');
    setPrograms([]);
    if (departmentId) {
      loadProgramsByDepartment(parseInt(departmentId));
    }
  };

  // Load initial data
  useEffect(() => {
    loadIntakes();
  }, []);

  // Load intakes
  const loadIntakes = async () => {
    try {
      setLoading(true);
      const response = await intakeService.getActiveIntakes();

      if (response.success && response.data) {
        // Load module count for each intake
        const intakesWithCounts = await Promise.all(
          response.data.map(async (intake) => {
            const countResponse = await intakeModuleService.getModuleCount(intake.id);
            return {
              ...intake,
              moduleCount: countResponse.success && countResponse.data ? countResponse.data : 0
            };
          })
        );
        setIntakes(intakesWithCounts);
      }
    } catch (error) {
      console.error('Error loading intakes:', error);
      showErrorNotification('Loading Failed', 'Failed to load intakes');
    } finally {
      setLoading(false);
    }
  };

  // Load modules for assignment
  const loadModulesForAssignment = async (programId: number) => {
    try {
      // Load active modules for the specific program
      const response = await moduleService.searchModules({
        page: 0,
        size: 1000,
        programId: programId,
        isActive: true,
        sortBy: 'moduleName',
        sortDirection: 'asc'
      });
      if (response.success && response.data && response.data.content) {
        setAvailableModules(response.data.content);
      }
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  // Load assigned modules
  const loadAssignedModules = async (intakeId: number) => {
    try {
      const response = await intakeModuleService.getModulesByIntake(intakeId);
      if (response.success && response.data) {
        setAssignedModules(response.data);
      }
    } catch (error) {
      console.error('Error loading assigned modules:', error);
    }
  };

  // Open create intake modal
  const openCreateModal = async () => {
    setEditingIntake(null);
    resetIntakeForm();
    setShowCreateEditModal(true);
  };

  // Open edit intake modal
  const openEditModal = async (intake: Intake) => {
    console.log('Opening edit modal for intake:', intake);
    setEditingIntake(intake);
    setSelectedProgramId(intake.programId.toString());
    setIntakeYear(intake.intakeYear);
    setIntakeMonth(intake.intakeMonth);
    
    // Load academic structure hierarchy
    if (intake.facultyId) {
      setSelectedFacultyId(intake.facultyId.toString());
      await loadDepartmentsByFaculty(intake.facultyId);
    }
    if (intake.departmentId) {
      setSelectedDepartmentId(intake.departmentId.toString());
      await loadProgramsByDepartment(intake.departmentId);
    }
    
    // Show the modal
    setShowCreateEditModal(true);
    console.log('Edit modal state set to true');
  };

  // Reset intake form
  const resetIntakeForm = () => {
    setSelectedFacultyId('');
    setSelectedDepartmentId('');
    setSelectedProgramId('');
    setIntakeYear(new Date().getFullYear());
    setIntakeMonth(1);
    setGeneratedIntakeName('');
    setDepartments([]);
    setPrograms([]);
  };

  // Handle create/edit submit
  const handleSubmitIntake = async () => {
    // Validation
    if (!selectedProgramId || !intakeYear || !intakeMonth) {
      showErrorNotification('Validation Error', 'Please fill all required fields');
      return;
    }

    const intakeData = {
      programId: parseInt(selectedProgramId),
      intakeYear,
      intakeMonth
    };

    try {
      let response;
      if (editingIntake) {
        response = await intakeService.updateIntake(editingIntake.id, intakeData);
      } else {
        response = await intakeService.createIntake(intakeData);
      }

      if (response.success) {
        showSuccessNotification(
          editingIntake ? 'Intake Updated!' : 'Intake Created!',
          editingIntake ? 'Intake updated successfully' : 'New intake created successfully'
        );
        setShowCreateEditModal(false);
        resetIntakeForm();
        await loadIntakes();
      } else {
        showErrorNotification(
          editingIntake ? 'Update Failed' : 'Creation Failed',
          response.message || 'Failed to save intake'
        );
      }
    } catch (error) {
      console.error('Error saving intake:', error);
      showErrorNotification('Error', 'Failed to save intake. Please try again.');
    }
  };

  // Open assign modules modal
  const openAssignModal = async (intake: Intake) => {
    setSelectedIntakeForAssignment(intake);
    // Load modules for the intake's program
    await loadModulesForAssignment(intake.programId);
    await loadAssignedModules(intake.id);
    setSelectedModules([]);
    setShowAssignModal(true);
  };

  // Handle module selection toggle
  const toggleModuleSelection = (moduleId: number) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Assign selected modules to intake
  const handleAssignModules = async () => {
    if (!selectedIntakeForAssignment || selectedModules.length === 0) {
      showErrorNotification('Validation Error', 'Please select at least one module');
      return;
    }

    try {
      const response = await intakeModuleService.assignModulesToIntake({
        intakeId: selectedIntakeForAssignment.id,
        moduleIds: selectedModules
      });

      if (response.success) {
        showSuccessNotification(
          'Modules Assigned Successfully!',
          `${selectedModules.length} module(s) assigned to ${selectedIntakeForAssignment.intakeName}`
        );
        setShowAssignModal(false);
        await loadIntakes(); // Reload to update counts
      } else {
        showErrorNotification('Assignment Failed', response.message || 'Failed to assign modules');
      }
    } catch (error) {
      console.error('Error assigning modules:', error);
      showErrorNotification('Error', 'Failed to assign modules. Please try again.');
    }
  };

  // Remove module from intake
  const handleRemoveModule = async (intakeId: number, moduleId: number) => {
    try {
      const response = await intakeModuleService.removeModuleFromIntake(intakeId, moduleId);

      if (response.success) {
        showSuccessNotification('Module Removed', 'Module removed from intake successfully');
        await loadAssignedModules(intakeId);
        await loadIntakes(); // Reload to update counts
      } else {
        showErrorNotification('Removal Failed', response.message || 'Failed to remove module');
      }
    } catch (error) {
      console.error('Error removing module:', error);
      showErrorNotification('Error', 'Failed to remove module. Please try again.');
    }
  };

  // Confirm delete intake
  const confirmDeleteIntake = (intake: Intake) => {
    setIntakeToDelete(intake);
    setShowConfirmModal(true);
  };

  // Handle delete intake
  const handleDeleteIntake = async () => {
    if (!intakeToDelete) return;

    try {
      // First remove all modules from intake
      await intakeModuleService.removeAllModulesFromIntake(intakeToDelete.id);
      
      // Then delete the intake
      const response = await intakeService.deleteIntake(intakeToDelete.id);
      
      if (response.success) {
        showSuccessNotification(
          'Intake Deleted',
          `Intake "${intakeToDelete.intakeName}" has been deleted successfully.`
        );
      } else {
        showSuccessNotification(
          'Intake Modules Removed',
          `All modules removed from ${intakeToDelete.intakeName}, but intake deletion encountered an issue.`
        );
      }
      
      setShowConfirmModal(false);
      setIntakeToDelete(null);
      await loadIntakes();
    } catch (error) {
      console.error('Error deleting intake:', error);
      showErrorNotification('Error', 'Failed to delete intake. Please try again.');
    }
  };

  // Filter intakes
  const filteredIntakes = intakes.filter(intake =>
    intake.intakeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (intake.programName && intake.programName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (intake.facultyName && intake.facultyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (intake.departmentName && intake.departmentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-emerald-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Intake Management</h1>
              <p className="text-emerald-200 mt-1">Create and manage intakes, assign modules</p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add New Intake
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by intake name, code, or program..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Intakes Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading intakes...</p>
          </div>
        ) : filteredIntakes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Intakes Found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No intakes match your search.' : 'Get started by creating your first intake.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntakes.map((intake) => (
              <div key={intake.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{intake.intakeName}</h3>
                    <p className="text-sm text-gray-500">
                      {intake.programName} • {MONTH_NAMES[intake.intakeMonth - 1]} {intake.intakeYear}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    intake.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {intake.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-sm text-gray-600 space-y-2 mb-4">
                  {intake.facultyName && (
                    <p><span className="font-medium">Faculty:</span> {intake.facultyName}</p>
                  )}
                  {intake.departmentName && (
                    <p><span className="font-medium">Department:</span> {intake.departmentName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Book className="text-emerald-600" size={16} />
                    <span className="font-medium text-emerald-700">{intake.moduleCount} modules assigned</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(intake)}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-600 p-2 rounded-lg transition-colors"
                    title="Edit Intake"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => openAssignModal(intake)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Book size={16} />
                    Assign Modules
                  </button>
                  <button
                    onClick={() => confirmDeleteIntake(intake)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                    title="Delete Intake"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Intake Modal */}
      {showCreateEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingIntake ? 'Edit Intake' : 'Create New Intake'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateEditModal(false);
                  resetIntakeForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Faculty Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faculty <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedFacultyId}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select Faculty --</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={!selectedFacultyId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  disabled={!selectedDepartmentId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                >
                  <option value="">-- Select Program --</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year and Month Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={intakeYear}
                    onChange={(e) => setIntakeYear(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Array.from({ length: 31 }, (_, i) => 2020 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={intakeMonth}
                    onChange={(e) => setIntakeMonth(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {MONTH_NAMES.map((month, index) => (
                      <option key={index + 1} value={index + 1}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generated Intake Name (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Generated Intake Name
                </label>
                <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  {generatedIntakeName || 'Select program, year, and month to generate name'}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateEditModal(false);
                    resetIntakeForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitIntake}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                >
                  {editingIntake ? 'Update Intake' : 'Create Intake'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modules Modal */}
      {showAssignModal && selectedIntakeForAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-gray-800">
                Assign Modules to {selectedIntakeForAssignment.intakeName}
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Currently Assigned Modules */}
              {assignedModules.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Currently Assigned Modules ({assignedModules.length})</h4>
                  <div className="space-y-2">
                    {assignedModules.map((module) => (
                      <div key={module.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                        <div>
                          <p className="font-medium text-gray-800">{module.moduleCode}</p>
                          <p className="text-sm text-gray-600">{module.moduleName}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveModule(selectedIntakeForAssignment.id, module.moduleId)}
                          className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Modules */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Available Modules ({availableModules.filter(m => !assignedModules.find(am => am.moduleId === m.id)).length})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableModules
                    .filter(module => !assignedModules.find(am => am.moduleId === module.id))
                    .map((module) => (
                      <label
                        key={module.id}
                        className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(module.id)}
                          onChange={() => toggleModuleSelection(module.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{module.moduleCode}</p>
                          <p className="text-sm text-gray-600">{module.moduleName}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {module.creditScore} credits
                          </p>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-6 flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowAssignModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleAssignModules}
                disabled={selectedModules.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Assign {selectedModules.length} Module{selectedModules.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {showConfirmModal && intakeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4 mx-auto">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Remove All Modules</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to remove all modules from "<span className="font-semibold text-gray-800">{intakeToDelete.intakeName}</span>"?
                This will remove all module assignments.
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
                onClick={handleDeleteIntake}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Remove All Modules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Notification Modal */}
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
              </div>
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">{notificationConfig.title}</h3>
              <p className="text-sm text-gray-600 text-center mb-4">{notificationConfig.message}</p>
              {notificationConfig.details.length > 0 && (
                <ul className="text-sm text-gray-600 mb-4">
                  {notificationConfig.details.map((detail, index) => (
                    <li key={index}>• {detail}</li>
                  ))}
                </ul>
              )}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowNotification(false)}
                  className={`px-6 py-2 rounded-lg text-white font-medium ${
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

export default IntakeManagement;
