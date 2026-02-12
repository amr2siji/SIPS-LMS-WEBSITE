import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Edit, Trash2, BookOpen, Check, X, Eye, Mail, Phone, GraduationCap, Briefcase, Users } from 'lucide-react';
import { lecturerService, LecturerResponse, LecturerRequest, LecturerModuleAssignmentResponse, LecturerIntakeAssignmentResponse } from '../../services/lecturerService';
import { intakeModuleService } from '../../services/intakeModuleService';

interface IntakeOption {
  id: number;
  intakeName: string;
  programName?: string;
  facultyName?: string;
}

interface ModuleOption {
  id: number;
  moduleCode: string;
  moduleName: string;
}

export function LecturerManagement() {
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState<LecturerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerResponse | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Dropdown data for simplified intake-based assignment
  const [intakes, setIntakes] = useState<IntakeOption[]>([]);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  
  // Lecturer form
  const [lecturerForm, setLecturerForm] = useState<LecturerRequest>({
    nic: '',
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    residentialAddress: '',
    highestQualification: '',
    academicExperienceYears: 0,
    industryExperienceYears: 0,
    password: ''
  });
  
  // Simplified assignment form
  const [assignmentForm, setAssignmentForm] = useState({
    intakeId: '',
    selectedModuleIds: [] as number[],
    academicYear: new Date().getFullYear().toString(),
    notes: ''
  });

  // Lecturer assignments
  const [moduleAssignments, setModuleAssignments] = useState<LecturerModuleAssignmentResponse[]>([]);
  const [intakeAssignments, setIntakeAssignments] = useState<LecturerIntakeAssignmentResponse[]>([]);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lecturerToDelete, setLecturerToDelete] = useState<LecturerResponse | null>(null);

  // Notification
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => setNotification({ show: false, type: 'success', title: '', message: '' }), 4000);
  };

  useEffect(() => {
    loadLecturers();
  }, []);

  // Load modules when intake is selected
  useEffect(() => {
    if (assignmentForm.intakeId) {
      loadModulesForIntake(Number(assignmentForm.intakeId));
    } else {
      setModules([]);
      setAssignmentForm(prev => ({ ...prev, selectedModuleIds: [] }));
    }
  }, [assignmentForm.intakeId]);

  const loadLecturers = async () => {
    try {
      setLoading(true);
      const response = await lecturerService.getAllLecturers();
      if (response.success && response.data) {
        setLecturers(response.data);
      }
    } catch (error) {
      console.error('Error loading lecturers:', error);
      showNotification('error', 'Error', 'Failed to load lecturers');
    } finally {
      setLoading(false);
    }
  };

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
        if (result.data && Array.isArray(result.data)) {
          const mappedIntakes = result.data.map((intake: any) => ({
            id: intake.id,
            intakeName: `${intake.intakeName} - ${intake.programName} (${intake.facultyName})`,
            programName: intake.programName,
            facultyName: intake.facultyName
          }));
          setIntakes(mappedIntakes);
        }
      }
    } catch (error) {
      console.error('Error loading intakes:', error);
      showNotification('error', 'Error', 'Failed to load intakes');
    }
  };

  const loadModulesForIntake = async (intakeId: number) => {
    try {
      const response = await intakeModuleService.getModulesByIntake(intakeId);
      if (response && response.success && response.data) {
        const mappedModules = response.data.map((im: any) => ({
          id: im.moduleId,
          moduleCode: im.moduleCode,
          moduleName: im.moduleName
        }));
        setModules(mappedModules);
      } else {
        setModules([]);
      }
    } catch (error) {
      console.error('Error loading modules for intake:', error);
      setModules([]);
    }
  };

  const loadLecturerAssignments = async (lecturerId: string) => {
    try {
      const [moduleResponse, intakeResponse] = await Promise.all([
        lecturerService.getModuleAssignmentsByLecturer(lecturerId),
        lecturerService.getIntakeAssignmentsByLecturer(lecturerId)
      ]);

      if (moduleResponse.success && moduleResponse.data) {
        setModuleAssignments(moduleResponse.data);
      }

      if (intakeResponse.success && intakeResponse.data) {
        setIntakeAssignments(intakeResponse.data);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lecturerForm.nic || !lecturerForm.firstName || !lecturerForm.lastName || !lecturerForm.email) {
      showNotification('error', 'Validation Error', 'Please fill in all required fields');
      return;
    }

    setProcessing(true);
    try {
      // Format contact number for backend (add +94 if not present)
      const formData = { ...lecturerForm };
      if (formData.contactNumber && !formData.contactNumber.startsWith('+94')) {
        formData.contactNumber = `+94${formData.contactNumber}`;
      }
      
      const response = await lecturerService.createLecturer(formData);
      if (response.success) {
        showNotification('success', 'Success', 'Lecturer created successfully! Login credentials have been sent to their email.');
        setShowCreateModal(false);
        resetLecturerForm();
        loadLecturers();
      } else {
        showNotification('error', 'Error', response.message || 'Failed to create lecturer');
      }
    } catch (error: any) {
      console.error('Error creating lecturer:', error);
      showNotification('error', 'Error', error.message || 'Failed to create lecturer');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecturer) return;

    setProcessing(true);
    try {
      // Format contact number for backend (add +94 if not present)
      const formData = { ...lecturerForm };
      if (formData.contactNumber && !formData.contactNumber.startsWith('+94')) {
        formData.contactNumber = `+94${formData.contactNumber}`;
      }
      
      const response = await lecturerService.updateLecturer(selectedLecturer.id, formData);
      if (response.success) {
        showNotification('success', 'Success', 'Lecturer updated successfully!');
        setShowEditModal(false);
        setSelectedLecturer(null);
        resetLecturerForm();
        loadLecturers();
      } else {
        showNotification('error', 'Error', response.message || 'Failed to update lecturer');
      }
    } catch (error: any) {
      console.error('Error updating lecturer:', error);
      showNotification('error', 'Error', error.message || 'Failed to update lecturer');
    } finally {
      setProcessing(false);
    }
  };

  const confirmDeleteLecturer = (lecturer: LecturerResponse) => {
    setLecturerToDelete(lecturer);
    setShowDeleteModal(true);
  };

  const handleDeleteLecturer = async () => {
    if (!lecturerToDelete) return;

    setProcessing(true);
    try {
      const response = await lecturerService.deleteLecturer(lecturerToDelete.id);
      if (response.success) {
        showNotification('success', 'Success', 'Lecturer deactivated successfully!');
        setShowDeleteModal(false);
        setLecturerToDelete(null);
        loadLecturers();
      } else {
        showNotification('error', 'Error', response.message || 'Failed to deactivate lecturer');
      }
    } catch (error: any) {
      console.error('Error deleting lecturer:', error);
      showNotification('error', 'Error', error.message || 'Failed to delete lecturer');
    } finally {
      setProcessing(false);
    }
  };

  const handleActivateLecturer = async (lecturer: LecturerResponse) => {
    try {
      const response = await lecturerService.activateLecturer(lecturer.id);
      if (response.success) {
        showNotification('success', 'Success', 'Lecturer activated successfully!');
        loadLecturers();
      } else {
        showNotification('error', 'Error', response.message || 'Failed to activate lecturer');
      }
    } catch (error: any) {
      console.error('Error activating lecturer:', error);
      showNotification('error', 'Error', error.message || 'Failed to activate lecturer');
    }
  };

  const handleAssignModules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecturer || !assignmentForm.intakeId || assignmentForm.selectedModuleIds.length === 0) {
      showNotification('error', 'Validation Error', 'Please select an intake and at least one module');
      return;
    }

    setProcessing(true);
    try {
      // Assign each selected module to the lecturer
      let successCount = 0;
      let errorCount = 0;
      
      for (const moduleId of assignmentForm.selectedModuleIds) {
        try {
          const response = await lecturerService.assignLecturerToModule({
            lecturerId: selectedLecturer.id,
            moduleId: moduleId,
            academicYear: assignmentForm.academicYear,
            notes: assignmentForm.notes
          });
          
          if (response.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Error assigning module ${moduleId}:`, error);
        }
      }

      if (successCount > 0) {
        showNotification('success', 'Success', `${successCount} module(s) assigned successfully!${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
        loadLecturerAssignments(selectedLecturer.id);
        resetAssignmentForm();
      } else {
        showNotification('error', 'Error', 'Failed to assign modules');
      }
    } catch (error: any) {
      console.error('Error assigning modules:', error);
      showNotification('error', 'Error', error.message || 'Failed to assign modules');
    } finally {
      setProcessing(false);
    }
  };


  const handleRemoveModuleAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this module assignment?')) return;

    try {
      const response = await lecturerService.removeModuleAssignment(assignmentId);
      if (response.success) {
        showNotification('success', 'Success', 'Module assignment removed!');
        if (selectedLecturer) {
          loadLecturerAssignments(selectedLecturer.id);
        }
      } else {
        showNotification('error', 'Error', response.message || 'Failed to remove assignment');
      }
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      showNotification('error', 'Error', error.message || 'Failed to remove assignment');
    }
  };

  const handleRemoveIntakeAssignment = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to remove this intake assignment?')) return;

    try {
      const response = await lecturerService.removeIntakeAssignment(assignmentId);
      if (response.success) {
        showNotification('success', 'Success', 'Intake assignment removed!');
        if (selectedLecturer) {
          loadLecturerAssignments(selectedLecturer.id);
        }
      } else {
        showNotification('error', 'Error', response.message || 'Failed to remove assignment');
      }
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      showNotification('error', 'Error', error.message || 'Failed to remove assignment');
    }
  };

  const openEditModal = (lecturer: LecturerResponse) => {
    setSelectedLecturer(lecturer);
    
    // Format contact number for display (remove +94 if present)
    let displayContact = lecturer.contactNumber || '';
    if (displayContact.startsWith('+94')) {
      displayContact = displayContact.substring(3);
    }
    
    setLecturerForm({
      nic: lecturer.nic,
      firstName: lecturer.firstName,
      lastName: lecturer.lastName,
      email: lecturer.email,
      contactNumber: displayContact,
      residentialAddress: lecturer.residentialAddress || '',
      highestQualification: lecturer.highestQualification || '',
      academicExperienceYears: lecturer.academicExperienceYears || 0,
      industryExperienceYears: lecturer.industryExperienceYears || 0,
      password: '' // Don't populate password for security
    });
    setShowEditModal(true);
  };

  const openDetailsModal = async (lecturer: LecturerResponse) => {
    setSelectedLecturer(lecturer);
    await loadLecturerAssignments(lecturer.id);
    setShowDetailsModal(true);
  };

  const openAssignModal = (lecturer: LecturerResponse) => {
    setSelectedLecturer(lecturer);
    loadAllIntakes();
    loadLecturerAssignments(lecturer.id);
    resetAssignmentForm();
    setShowAssignModal(true);
  };

  const resetLecturerForm = () => {
    setLecturerForm({
      nic: '',
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      residentialAddress: '',
      highestQualification: '',
      academicExperienceYears: 0,
      industryExperienceYears: 0,
      password: ''
    });
  };

  const resetAssignmentForm = () => {
    setAssignmentForm({
      intakeId: '',
      selectedModuleIds: [],
      academicYear: new Date().getFullYear().toString(),
      notes: ''
    });
    setModules([]);
  };

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = 
      lecturer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.nic?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && lecturer.isActive) ||
      (filterStatus === 'inactive' && !lecturer.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLecturers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLecturers = filteredLecturers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lecturers...</p>
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
            className="flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lecturer Management</h1>
              <p className="text-blue-100 mt-1">Manage lecturers and their assignments</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <UserPlus size={20} />
              Add Lecturer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Lecturers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{lecturers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {lecturers.filter(l => l.isActive).length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {lecturers.filter(l => !l.isActive).length}
                </p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name, email, or NIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Lecturers Grid */}
        {filteredLecturers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No lecturers found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'Create your first lecturer to get started'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentLecturers.map((lecturer) => (
                <div key={lecturer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {lecturer.firstName} {lecturer.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">NIC: {lecturer.nic}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    lecturer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {lecturer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{lecturer.email}</span>
                  </div>
                  {lecturer.contactNumber && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{lecturer.contactNumber}</span>
                    </div>
                  )}
                  {lecturer.highestQualification && (
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <span>{lecturer.highestQualification}</span>
                    </div>
                  )}
                  {(lecturer.academicExperienceYears || lecturer.industryExperienceYears) ? (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span>
                        {lecturer.academicExperienceYears || 0}yr Academic, {lecturer.industryExperienceYears || 0}yr Industry
                      </span>
                    </div>
                  ) : null}
                </div>
                
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openDetailsModal(lecturer)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => openAssignModal(lecturer)}
                    className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <BookOpen size={16} />
                    Assign
                  </button>
                  <button
                    onClick={() => openEditModal(lecturer)}
                    className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  {lecturer.isActive ? (
                    <button
                      onClick={() => confirmDeleteLecturer(lecturer)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivateLecturer(lecturer)}
                      className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Check size={16} />
                    </button>
                  )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && lecturerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Deactivate Lecturer?
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to deactivate <strong>{lecturerToDelete.firstName} {lecturerToDelete.lastName}</strong>? 
                This will mark them as inactive and they will not be able to access the system.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This action will set the lecturer's status to inactive. 
                  You can reactivate them later if needed. Their data and assignments will be preserved.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setLecturerToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteLecturer}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Deactivating...' : 'Yes, Deactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`rounded-lg shadow-lg p-4 max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {notification.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {notification.title}
                </h3>
                <p className={`mt-1 text-sm ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Lecturer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Lecturer</h2>
            </div>
            <form onSubmit={handleCreateLecturer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC *</label>
                  <input
                    type="text"
                    value={lecturerForm.nic}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, nic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={lecturerForm.email}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={lecturerForm.firstName}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lecturerForm.lastName}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                      +94
                    </span>
                    <input
                      type="tel"
                      value={lecturerForm.contactNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setLecturerForm({ ...lecturerForm, contactNumber: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="771234567"
                      maxLength={9}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter 9 digits (e.g., 771234567)</p>
                </div>
                <div className="col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> A temporary password will be automatically generated and sent to the lecturer's email address. 
                      They will be required to change it upon first login.
                    </p>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={lecturerForm.residentialAddress}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, residentialAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={lecturerForm.highestQualification}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, highestQualification: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., PhD, MSc, BSc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Experience (Years)</label>
                  <input
                    type="number"
                    value={lecturerForm.academicExperienceYears}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, academicExperienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry Experience (Years)</label>
                  <input
                    type="number"
                    value={lecturerForm.industryExperienceYears}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, industryExperienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetLecturerForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Creating...' : 'Create Lecturer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lecturer Modal */}
      {showEditModal && selectedLecturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Lecturer</h2>
            </div>
            <form onSubmit={handleUpdateLecturer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC * (Cannot be changed)</label>
                  <input
                    type="text"
                    value={lecturerForm.nic}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Primary key - cannot be modified</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={lecturerForm.email}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={lecturerForm.firstName}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={lecturerForm.lastName}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-lg">
                      +94
                    </span>
                    <input
                      type="tel"
                      value={lecturerForm.contactNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 9);
                        setLecturerForm({ ...lecturerForm, contactNumber: value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="771234567"
                      maxLength={9}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter 9 digits (e.g., 771234567)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={lecturerForm.password}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Leave blank to keep current"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    value={lecturerForm.residentialAddress}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, residentialAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    value={lecturerForm.highestQualification}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, highestQualification: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Experience (Years)</label>
                  <input
                    type="number"
                    value={lecturerForm.academicExperienceYears}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, academicExperienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry Experience (Years)</label>
                  <input
                    type="number"
                    value={lecturerForm.industryExperienceYears}
                    onChange={(e) => setLecturerForm({ ...lecturerForm, industryExperienceYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedLecturer(null);
                    resetLecturerForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Updating...' : 'Update Lecturer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLecturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedLecturer.firstName} {selectedLecturer.lastName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Lecturer Details</p>
            </div>
            <div className="p-6">
              {/* Basic Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">NIC</p>
                    <p className="font-medium">{selectedLecturer.nic}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedLecturer.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Contact Number</p>
                    <p className="font-medium">{selectedLecturer.contactNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                      selectedLecturer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedLecturer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Address</p>
                    <p className="font-medium">{selectedLecturer.residentialAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Qualifications & Experience</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Highest Qualification</p>
                    <p className="font-medium">{selectedLecturer.highestQualification || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Academic Experience</p>
                    <p className="font-medium">{selectedLecturer.academicExperienceYears || 0} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Industry Experience</p>
                    <p className="font-medium">{selectedLecturer.industryExperienceYears || 0} years</p>
                  </div>
                </div>
              </div>

              {/* Module Assignments */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Module Assignments ({moduleAssignments.length})</h3>
                {moduleAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500">No module assignments</p>
                ) : (
                  <div className="space-y-2">
                    {moduleAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{assignment.moduleCode} - {assignment.moduleName}</p>
                          <p className="text-xs text-gray-600">
                            {assignment.programName} • AY {assignment.academicYear}
                          </p>
                          {assignment.notes && <p className="text-xs text-gray-500 mt-1">{assignment.notes}</p>}
                        </div>
                        <button
                          onClick={() => handleRemoveModuleAssignment(assignment.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Intake Assignments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Intake Assignments ({intakeAssignments.length})</h3>
                {intakeAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500">No intake assignments</p>
                ) : (
                  <div className="space-y-2">
                    {intakeAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{assignment.intakeName}</p>
                          <p className="text-xs text-gray-600">
                            Role: {assignment.role || 'N/A'}
                          </p>
                          {assignment.notes && <p className="text-xs text-gray-500 mt-1">{assignment.notes}</p>}
                        </div>
                        <button
                          onClick={() => handleRemoveIntakeAssignment(assignment.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedLecturer(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && selectedLecturer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Assign Modules to {selectedLecturer.firstName} {selectedLecturer.lastName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Select intake and assign modules to the lecturer</p>
            </div>

            <form onSubmit={handleAssignModules} className="p-6 space-y-4">
              {/* Intake Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intake *</label>
                {intakes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading intakes...</p>
                    <p className="text-sm mt-2">If no intakes appear, please create intakes in Intake Management first.</p>
                  </div>
                ) : (
                  <select
                    value={assignmentForm.intakeId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, intakeId: e.target.value, selectedModuleIds: [] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select an intake</option>
                    {intakes.map((intake) => (
                      <option key={intake.id} value={intake.id}>
                        {intake.intakeName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Module Multi-Select */}
              {assignmentForm.intakeId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modules * <span className="text-xs font-normal text-gray-500">(Select multiple)</span>
                  </label>
                  {modules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No modules assigned to this intake yet.</p>
                      <p className="text-sm mt-2">Please assign modules to the intake first in Intake Management.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                      {modules.map((module) => {
                        const isAssigned = moduleAssignments.some(
                          assignment => assignment.moduleId === module.id
                        );
                        return (
                          <label
                            key={module.id}
                            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                              isAssigned ? 'bg-green-50' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={assignmentForm.selectedModuleIds.includes(module.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAssignmentForm({
                                    ...assignmentForm,
                                    selectedModuleIds: [...assignmentForm.selectedModuleIds, module.id]
                                  });
                                } else {
                                  setAssignmentForm({
                                    ...assignmentForm,
                                    selectedModuleIds: assignmentForm.selectedModuleIds.filter(id => id !== module.id)
                                  });
                                }
                              }}
                              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {module.moduleCode} - {module.moduleName}
                              </div>
                              {isAssigned && (
                                <div className="text-xs text-green-600 mt-1 flex items-center">
                                  <Check size={12} className="mr-1" />
                                  Already assigned
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Academic Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                <input
                  type="text"
                  value={assignmentForm.academicYear}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, academicYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2024"
                  required
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={assignmentForm.notes}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedLecturer(null);
                    resetAssignmentForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={processing || assignmentForm.selectedModuleIds.length === 0}
                >
                  {processing ? 'Assigning...' : `Assign ${assignmentForm.selectedModuleIds.length} Module(s)`}
                </button>
              </div>

              {/* Current Module Assignments */}
              {moduleAssignments.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <BookOpen size={16} className="mr-2" />
                    Currently Assigned Modules ({moduleAssignments.length})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {moduleAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {assignment.moduleCode} - {assignment.moduleName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Year: {assignment.academicYear}
                            {assignment.notes && ` • ${assignment.notes}`}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveModuleAssignment(assignment.id)}
                          className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove assignment"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
