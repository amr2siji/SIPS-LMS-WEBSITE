import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Edit, Phone, MapPin, FileText, X, GraduationCap, BookOpen, UserCheck, Trash2, Plus, AlertCircle } from 'lucide-react';
import { studentManagementService, StudentData } from '../../services/studentManagementService';
import academicStructureService from '../../services/academicStructureService';
import type { FacultyDropdownOption, DepartmentDropdownOption, ProgramDropdownOption } from '../../services/academicStructureService';

interface Student extends StudentData {
  // Backend API returns these fields
  // Keep UI compatible with existing structure
}

interface Intake {
  id: string | number;
  intake_name: string;
  intake_year: number;
  intake_month: number;
  program_id: string | number;
  program_name?: string; // Program name from API
  department_id?: string | number;
  department_name?: string;
  faculty_id?: string | number;
  faculty_name?: string;
}

export function ManageStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterIntake, setFilterIntake] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
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

  // View details modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingNic, setEditingNic] = useState<string | null>(null);
  
  // Statistics from API
  const [statistics, setStatistics] = useState({
    activeStudents: 0,
    graduatedStudents: 0,
    inactiveStudents: 0,
    suspendedStudents: 0,
    totalStudents: 0
  });

  // Pagination state (for future pagination UI implementation)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [totalElements, setTotalElements] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  
  // Dropdown data
  const [faculties, setFaculties] = useState<FacultyDropdownOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentDropdownOption[]>([]);
  const [programs, setPrograms] = useState<ProgramDropdownOption[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [allIntakes, setAllIntakes] = useState<Intake[]>([]); // All intakes for simplified enrollment
  
  // Create student form
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    nameWithInitials: '',
    nic: '',
    dateOfBirth: '',
    email: '',
    permanentAddress: '',
    mobileNumber: '',
    emergencyContactName: '',
    emergencyRelationship: '',
    emergencyContactMobile: '',
    olQualifications: '',
    alQualifications: '',
    otherQualifications: '',
    programIds: [] as number[],
    facultyIds: [] as number[],
    studentStatus: 'ACTIVE'
  });

  // Temporary state for dropdown selections
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedIntakeId, setSelectedIntakeId] = useState<string[]>([]);
  const [showIntakeSelector, setShowIntakeSelector] = useState(false);
  
  // State for multiple program selections
  const [selectedPrograms, setSelectedPrograms] = useState<Array<{
    id: number;
    name: string;
    facultyId: number;
    departmentId: number;
    intakeId?: number;
    intakeName?: string;
  }>>([]);

  // File uploads
  const [studentFiles, setStudentFiles] = useState({
    nicDocument: null as File | null,
    birthCertificate: null as File | null,
    qualificationCertificate: null as File | null,
    paymentSlip: null as File | null
  });

  // Clear form function
  const clearStudentForm = () => {
    setNewStudent({
      fullName: '',
      nameWithInitials: '',
      nic: '',
      dateOfBirth: '',
      email: '',
      permanentAddress: '',
      mobileNumber: '',
      emergencyContactName: '',
      emergencyRelationship: '',
      emergencyContactMobile: '',
      olQualifications: '',
      alQualifications: '',
      otherQualifications: '',
      programIds: [],
      facultyIds: [],
      studentStatus: 'ACTIVE'
    });
    setSelectedFacultyId('');
    setSelectedDepartmentId('');
    setSelectedProgramId('');
    setSelectedIntakeId([]);
    setSelectedPrograms([]);
    setDepartments([]);
    setPrograms([]);
    setIntakes([]);
    setStudentFiles({
      nicDocument: null,
      birthCertificate: null,
      qualificationCertificate: null,
      paymentSlip: null
    });
  };

  useEffect(() => {
    loadStudents();
    loadStatistics();
    loadFaculties();
    loadAllPrograms(); // Load all programs for intake selection
    loadAllIntakes(); // Load all intakes for simplified enrollment
  }, []); // Only load once on mount

  // Reload students when filters change
  useEffect(() => {
    loadStudents();
  }, [filterStatus, filterFaculty, filterDepartment, filterProgram, filterIntake]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadDepartmentsByFaculty(filterFaculty);
    } else {
      setDepartments([]);
      setPrograms([]);
    }
  }, [filterFaculty]);

  useEffect(() => {
    if (filterDepartment !== 'all' && filterFaculty !== 'all') {
      loadProgramsByDepartment(filterFaculty, filterDepartment);
    } else {
      setPrograms([]);
      setIntakes([]);
    }
  }, [filterDepartment, filterFaculty]);

  useEffect(() => {
    if (filterProgram !== 'all') {
      loadIntakesByProgram(filterProgram);
    } else {
      setIntakes([]);
    }
  }, [filterProgram]);

  useEffect(() => {
    if (selectedProgramId) {
      console.log('Loading intakes for program:', selectedProgramId);
      loadIntakesByProgram(selectedProgramId);
    } else {
      setIntakes([]);
    }
  }, [selectedProgramId]);

  // Helper functions for custom modals
  const showSuccessNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'success', title, message, details });
    setShowNotification(true);
  };

  const showErrorNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'error', title, message, details });
    setShowNotification(true);
  };

  const showWarningNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'warning', title, message, details });
    setShowNotification(true);
  };

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' = 'danger') => {
    setConfirmationConfig({ title, message, onConfirm, confirmText: 'Confirm', type });
    setShowConfirmation(true);
  };

  // Helper function to format date from array or string
  const formatDateOfBirth = (dob: string | number[] | undefined): string => {
    if (!dob) return 'N/A';
    if (Array.isArray(dob)) {
      const [year, month, day] = dob;
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString();
    }
    return new Date(dob).toLocaleDateString();
  };

  const loadStatistics = async () => {
    try {
      const result = await studentManagementService.getStatistics();
      if (result.success && result.data) {
        setStatistics(result.data);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters
      const facultyIds = filterFaculty !== 'all' ? [parseInt(filterFaculty)] : undefined;
      const departmentIds = filterDepartment !== 'all' ? [parseInt(filterDepartment)] : undefined;
      const programIds = filterProgram !== 'all' ? [parseInt(filterProgram)] : undefined;
      const intakeIds = filterIntake !== 'all' ? [parseInt(filterIntake)] : undefined;
      
      const result = await studentManagementService.getStudents({
        status: filterStatus !== 'all' ? filterStatus.toUpperCase() : undefined,
        facultyIds,
        departmentIds,
        programIds,
        intakeIds,
        page: currentPage,
        size: pageSize,
        sortBy: 'fullName',
        sortDirection: 'ASC'
      });

      if (result.success && result.data) {
        setStudents(result.data.content);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setIsSearchMode(false); // We're in filter mode
      }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm || searchTerm.trim() === '') {
      alert('Please enter a search term (name, NIC, or mobile number)');
      return;
    }

    try {
      setLoading(true);
      const result = await studentManagementService.searchStudents(searchTerm, currentPage, pageSize);

      if (result.success && result.data) {
        setStudents(result.data.content);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setIsSearchMode(true); // We're in search mode
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error searching students:', error);
      alert('Failed to search students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async () => {
    try {
      const result = await academicStructureService.faculty.getDropdownOptions();
      if (result.success) {
        setFaculties(result.data);
      }
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadDepartmentsByFaculty = async (facultyId: string) => {
    try {
      const result = await academicStructureService.department.getDropdownOptionsByFaculty(parseInt(facultyId));
      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadProgramsByDepartment = async (facultyId: string, departmentId: string) => {
    try {
      const result = await academicStructureService.program.getDropdownOptions(
        parseInt(facultyId), 
        parseInt(departmentId)
      );
      if (result.success) {
        setPrograms(result.data);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadIntakesByProgram = async (programId: string) => {
    console.log('loadIntakesByProgram called with programId:', programId);
    try {
      const token = localStorage.getItem('jwt_token');
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/admin/intakes/program/${programId}`;
      console.log('Fetching intakes from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Intake API response status:', response.status);

      if (!response.ok) {
        console.error('Failed to load intakes, status:', response.status);
        setIntakes([]);
        return;
      }

      const result = await response.json();
      console.log('Intake API result:', result);
      
      if (result.data && Array.isArray(result.data)) {
        // Map IntakeDTO to the format expected by the UI
        const mappedIntakes = result.data.map((intake: any) => ({
          id: intake.id.toString(),
          intake_name: intake.intakeName || intake.intakeCode,
          intake_year: intake.startDate ? new Date(intake.startDate).getFullYear() : new Date().getFullYear(),
          intake_month: intake.startDate ? new Date(intake.startDate).getMonth() + 1 : 1,
          program_id: programId
        }));
        console.log('Mapped intakes:', mappedIntakes);
        setIntakes(mappedIntakes);
      } else {
        console.log('No intakes data in response');
        setIntakes([]);
      }
    } catch (error) {
      console.error('Error loading intakes:', error);
      setIntakes([]);
    }
  };

  // Load all programs (for simplified intake enrollment)
  const loadAllPrograms = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/programs/dropdown`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && Array.isArray(result.data)) {
          setPrograms(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading all programs:', error);
    }
  };

  // Load all intakes (for simplified intake enrollment)
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
          // Map IntakeDTO to expected format with all necessary fields
          const mappedIntakes = result.data.map((intake: any) => ({
            id: intake.id,
            intake_name: intake.intakeName || `Intake ${intake.intakeYear}-${intake.intakeMonth}`,
            intake_year: intake.intakeYear,
            intake_month: intake.intakeMonth,
            program_id: intake.programId,
            program_name: intake.programName, // Add program name from API
            department_id: intake.departmentId,
            department_name: intake.departmentName, // Add department name from API
            faculty_id: intake.facultyId,
            faculty_name: intake.facultyName // Add faculty name from API
          }));
          console.log('Loaded intakes:', mappedIntakes);
          setAllIntakes(mappedIntakes);
        }
      }
    } catch (error) {
      console.error('Error loading all intakes:', error);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Detailed validation with specific missing fields
    const missingFields: string[] = [];
    if (!newStudent.nameWithInitials?.trim()) missingFields.push('Name with Initials');
    if (!newStudent.nic?.trim()) missingFields.push('NIC');
    if (!newStudent.email?.trim()) missingFields.push('Email');
    if (!newStudent.mobileNumber?.trim()) missingFields.push('Mobile Number');
    if (!newStudent.permanentAddress?.trim()) missingFields.push('Permanent Address');
    if (selectedPrograms.length === 0) missingFields.push('At least one Program');
    
    if (missingFields.length > 0) {
      showErrorNotification(
        'Required Fields Missing',
        'Please fill in the following required fields:',
        missingFields
      );
      return;
    }

    setProcessing(true);
    try {
      // Add +94 prefix to mobile numbers if not already present
      const formatMobileNumber = (number: string) => {
        if (!number) return '';
        const cleaned = number.replace(/\D/g, ''); // Remove non-digits
        if (cleaned.startsWith('94')) return `+${cleaned}`;
        if (cleaned.startsWith('0')) return `+94${cleaned.substring(1)}`;
        return `+94${cleaned}`;
      };

      const result = await studentManagementService.createStudent(
        {
          fullName: newStudent.fullName || newStudent.nameWithInitials,
          nameWithInitials: newStudent.nameWithInitials,
          nic: newStudent.nic,
          dateOfBirth: newStudent.dateOfBirth || undefined,
          mobileNumber: formatMobileNumber(newStudent.mobileNumber),
          email: newStudent.email,
          permanentAddress: newStudent.permanentAddress,
          emergencyContactName: newStudent.emergencyContactName || undefined,
          emergencyRelationship: newStudent.emergencyRelationship || undefined,
          emergencyContactMobile: newStudent.emergencyContactMobile ? formatMobileNumber(newStudent.emergencyContactMobile) : undefined,
          olQualifications: newStudent.olQualifications || undefined,
          alQualifications: newStudent.alQualifications || undefined,
          otherQualifications: newStudent.otherQualifications || undefined,
          facultyIds: newStudent.facultyIds,
          programIds: newStudent.programIds,
          intakeIds: selectedPrograms.map(p => p.intakeId || null),
          studentStatus: newStudent.studentStatus
        },
        {
          nicDocument: studentFiles.nicDocument || undefined,
          birthCertificate: studentFiles.birthCertificate || undefined,
          qualificationCertificate: studentFiles.qualificationCertificate || undefined,
          paymentSlip: studentFiles.paymentSlip || undefined
        }
      );

      if (result.success) {
        showSuccessNotification(
          'Student Created Successfully!',
          `Student "${newStudent.nameWithInitials}" has been added to the system.`,
          ['Password has been sent to: ' + newStudent.email, 'NIC: ' + newStudent.nic]
        );
        setShowCreateModal(false);
        clearStudentForm(); // Clear form only on success
        loadStudents();
        loadStatistics();
      } else {
        showErrorNotification('Failed to Create Student', result.message);
      }
    } catch (error: any) {
      console.error('Error creating student:', error);
      showErrorNotification('Failed to Create Student', error.message || 'Unknown error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteStudent = async (nic: string, studentName: string) => {
    showConfirmDialog(
      'Delete Student?',
      `Are you sure you want to permanently delete "${studentName}"?\n\nThis action cannot be undone. All student data and enrollments will be deleted.`,
      async () => {
        try {
          const result = await studentManagementService.deleteStudent(nic);
          if (result.success) {
            showSuccessNotification(
              'Student Deleted Successfully!',
              `"${studentName}" has been permanently removed from the system.`
            );
            loadStudents(); // Refresh the list
            loadStatistics(); // Update statistics
          } else {
            showErrorNotification('Failed to Delete Student', result.message);
          }
        } catch (error: any) {
          console.error('Error deleting student:', error);
          showErrorNotification('Failed to Delete Student', error.message || 'Please try again');
        }
      },
      'danger'
    );
  };

  const handleChangeStatus = async (nic: string, studentName: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPOUT') => {
    showConfirmDialog(
      'Change Student Status?',
      `Are you sure you want to change "${studentName}"'s status to ${newStatus}?`,
      async () => {
        try {
          const result = await studentManagementService.changeStudentStatus(nic, newStatus);
          if (result.success) {
            showSuccessNotification(
              'Status Changed Successfully!',
              `"${studentName}"'s status has been updated to ${newStatus}.`
            );
            loadStudents(); // Refresh the list
            loadStatistics(); // Update statistics
          } else {
            showErrorNotification('Failed to Change Status', result.message);
          }
        } catch (error: any) {
          console.error('Error changing status:', error);
          showErrorNotification('Failed to Change Status', error.message || 'Please try again');
        }
      },
      'warning'
    );
  };

  const handleViewDetails = async (nic: string) => {
    try {
      const result = await studentManagementService.getStudentByNic(nic);
      if (result.success && result.data) {
        setViewingStudent(result.data);
        setShowViewModal(true);
      } else {
        showErrorNotification('Failed to Load Student', result.message);
      }
    } catch (error: any) {
      console.error('Error loading student:', error);
      showErrorNotification('Failed to Load Student', error.message || 'Unknown error');
    }
  };

  const handleEditStudent = async (nic: string) => {
    try {
      const result = await studentManagementService.getStudentByNic(nic);
      if (result.success && result.data) {
        const student = result.data;
        
        // Extract IDs from the new API response structure (programs now includes full enrollment details)
        const facultyIds = student.faculties?.map(f => f.id) || [];
        const departmentIds = student.departments?.map(d => d.id) || [];
        const programIds = student.programs?.map(p => p.programId) || [];
        
        // Load faculties first to get the full structure
        await loadFaculties();
        
        // Build selected programs array with intake information from backend
        const enrolledPrograms = student.programs?.map(p => ({
          id: p.programId,
          name: p.programName,
          facultyId: p.facultyId || facultyIds[0] || 0,
          departmentId: p.departmentId || departmentIds[0] || 0,
          intakeId: p.intakeId || undefined,
          intakeName: p.intakeName || undefined
        })) || [];
        
        // Convert date of birth from array format [year, month, day] to YYYY-MM-DD string
        let dateOfBirthStr = '';
        if (student.dateOfBirth) {
          if (Array.isArray(student.dateOfBirth)) {
            const [year, month, day] = student.dateOfBirth;
            dateOfBirthStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          } else {
            dateOfBirthStr = student.dateOfBirth;
          }
        }
        
        // Populate form with existing data
        setNewStudent({
          fullName: student.fullName,
          nameWithInitials: student.nameWithInitials,
          nic: student.nic,
          dateOfBirth: dateOfBirthStr,
          email: student.email,
          permanentAddress: student.permanentAddress,
          mobileNumber: student.mobileNumber.replace('+94', '0'), // Convert back to local format
          emergencyContactName: student.emergencyContactName || '',
          emergencyRelationship: student.emergencyRelationship || '',
          emergencyContactMobile: student.emergencyContactMobile ? student.emergencyContactMobile.replace('+94', '0') : '',
          olQualifications: student.olQualifications || '',
          alQualifications: student.alQualifications || '',
          otherQualifications: student.otherQualifications || '',
          programIds: programIds,
          facultyIds: facultyIds,
          studentStatus: student.studentStatus
        });
        
        // Set selected programs array
        setSelectedPrograms(enrolledPrograms);
        
        // Set selected IDs for dropdowns (cleared for adding new programs)
        setSelectedFacultyId('');
        setSelectedDepartmentId('');
        setSelectedProgramId('');
        
        setIsEditMode(true);
        setEditingNic(nic);
        setShowCreateModal(true);
      } else {
        showErrorNotification('Failed to Load Student', result.message);
      }
    } catch (error: any) {
      console.error('Error loading student for edit:', error);
      showErrorNotification('Failed to Load Student', error.message || 'Unknown error');
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNic || !newStudent.nameWithInitials || !newStudent.email) {
      showErrorNotification('Validation Error', 'Please fill in required fields');
      return;
    }

    setProcessing(true);
    try {
      const formatMobileNumber = (number: string) => {
        if (!number) return '';
        const cleaned = number.replace(/\D/g, '');
        if (cleaned.startsWith('94')) return `+${cleaned}`;
        if (cleaned.startsWith('0')) return `+94${cleaned.substring(1)}`;
        return `+94${cleaned}`;
      };

      const result = await studentManagementService.updateStudent(
        editingNic,
        {
          fullName: newStudent.fullName || newStudent.nameWithInitials,
          nameWithInitials: newStudent.nameWithInitials,
          dateOfBirth: newStudent.dateOfBirth || undefined,
          mobileNumber: formatMobileNumber(newStudent.mobileNumber),
          email: newStudent.email,
          permanentAddress: newStudent.permanentAddress,
          emergencyContactName: newStudent.emergencyContactName || undefined,
          emergencyRelationship: newStudent.emergencyRelationship || undefined,
          emergencyContactMobile: newStudent.emergencyContactMobile ? formatMobileNumber(newStudent.emergencyContactMobile) : undefined,
          olQualifications: newStudent.olQualifications || undefined,
          alQualifications: newStudent.alQualifications || undefined,
          otherQualifications: newStudent.otherQualifications || undefined,
          facultyIds: newStudent.facultyIds,
          programIds: newStudent.programIds,
          intakeIds: selectedPrograms.map(p => p.intakeId || null),
          studentStatus: newStudent.studentStatus
        },
        {
          nicDocument: studentFiles.nicDocument || undefined,
          birthCertificate: studentFiles.birthCertificate || undefined,
          qualificationCertificate: studentFiles.qualificationCertificate || undefined,
          paymentSlip: studentFiles.paymentSlip || undefined
        }
      );

      if (result.success) {
        showSuccessNotification(
          'Student Updated Successfully!',
          `Student "${newStudent.nameWithInitials}" has been updated.`
        );
        setShowCreateModal(false);
        setIsEditMode(false);
        setEditingNic(null);
        clearStudentForm();
        loadStudents();
        loadStatistics();
      } else {
        showErrorNotification('Failed to Update Student', result.message);
      }
    } catch (error: any) {
      console.error('Error updating student:', error);
      showErrorNotification('Failed to Update Student', error.message || 'Unknown error');
    } finally {
      setProcessing(false);
    }
  };

  // Helper function to add a program to selected programs
  const addProgramToSelection = (facultyId: number, departmentId: number, programId: number, programName: string, intakeId?: number, intakeName?: string) => {
    // Check if program already selected
    if (selectedPrograms.find(p => p.id === programId)) {
      showErrorNotification('Program Already Selected', 'This program is already in the list');
      return;
    }
    
    const newProgram = {
      id: programId,
      name: programName,
      facultyId: facultyId,
      departmentId: departmentId,
      intakeId: intakeId,
      intakeName: intakeName
    };
    
    const updatedPrograms = [...selectedPrograms, newProgram];
    setSelectedPrograms(updatedPrograms);
    
    // Update newStudent state with programIds and unique facultyIds
    const programIds = updatedPrograms.map(p => p.id);
    const facultyIds = Array.from(new Set(updatedPrograms.map(p => p.facultyId)));
    
    setNewStudent(prev => ({
      ...prev,
      programIds: programIds,
      facultyIds: facultyIds
    }));
    
    showSuccessNotification('Program Added', `${programName} has been added${intakeName ? ` with intake: ${intakeName}` : ''}`);
  };

  // Helper function to remove a program from selected programs
  const removeProgramFromSelection = (programId: number) => {
    const updatedPrograms = selectedPrograms.filter(p => p.id !== programId);
    setSelectedPrograms(updatedPrograms);
    
    // Update newStudent state with programIds and unique facultyIds
    const programIds = updatedPrograms.map(p => p.id);
    const facultyIds = Array.from(new Set(updatedPrograms.map(p => p.facultyId)));
    
    setNewStudent(prev => ({
      ...prev,
      programIds: programIds,
      facultyIds: facultyIds
    }));
    
    const programName = selectedPrograms.find(p => p.id === programId)?.name || 'Program';
    showSuccessNotification('Program Removed', `${programName} has been removed`);
  };

  // Since filtering is done on backend, we don't need frontend filtering
  // Just use the students from API directly
  const filteredStudents = students;

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterProgram('all');
    setFilterIntake('all');
    setCurrentPage(0);
    setIsSearchMode(false);
    loadStudents(); // Reload with no filters
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      graduated: 'bg-blue-100 text-blue-800 border-blue-200',
      dropout: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return styles[statusLower as keyof typeof styles] || styles.inactive;
  };

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
              <h1 className="text-3xl font-bold">Manage Students</h1>
              <p className="text-emerald-200 mt-1">View and manage all student records</p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <UserPlus size={20} />
              Add New Student
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="text-2xl font-bold text-gray-900">{statistics.activeStudents}</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">{statistics.graduatedStudents}</div>
            <div className="text-gray-600">Graduated</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="text-2xl font-bold text-gray-900">{statistics.inactiveStudents}</div>
            <div className="text-gray-600">Inactive</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="text-2xl font-bold text-gray-900">{statistics.suspendedStudents}</div>
            <div className="text-gray-600">Suspended</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Box with Button */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, NIC, or mobile number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
              >
                <Search size={20} />
                Search
              </button>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterFaculty}
                onChange={(e) => {
                  setFilterFaculty(e.target.value);
                  setFilterDepartment('all');
                  setFilterProgram('all');
                  setFilterIntake('all');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Faculties</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => {
                  setFilterDepartment(e.target.value);
                  setFilterProgram('all');
                  setFilterIntake('all');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={filterFaculty === 'all'}
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <select
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setFilterIntake('all');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={filterDepartment === 'all'}
              >
                <option value="all">All Programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterIntake}
                onChange={(e) => setFilterIntake(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={filterProgram === 'all'}
              >
                <option value="all">All Intakes</option>
                {intakes.map(intake => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthName = monthNames[intake.intake_month - 1];
                  return (
                    <option key={intake.id} value={intake.id}>
                      {intake.intake_name} ({monthName} {intake.intake_year})
                    </option>
                  );
                })}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="graduated">Graduated</option>
                <option value="dropout">Dropout</option>
              </select>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                title="Reset all filters"
              >
                <X size={20} />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700"></div>
                <p className="mt-4 text-gray-600">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No students found</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programme</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualifications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.nic} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.nic || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.nameWithInitials || 'N/A'}</div>
                        <div className="text-xs text-gray-500">DOB: {formatDateOfBirth(student.dateOfBirth)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {student.programs && student.programs.length > 0 
                            ? student.programs.map(p => p.programName).join(', ') 
                            : 'Not Assigned'}
                        </div>
                        {student.programs && student.programs.length > 1 && (
                          <div className="text-xs text-emerald-600 mt-1">{student.programs.length} programs</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            {student.mobileNumber || 'N/A'}
                          </div>
                          {student.permanentAddress && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 truncate max-w-xs">
                              <MapPin size={12} />
                              {student.permanentAddress}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          {student.alQualifications && <div>A/L: {student.alQualifications}</div>}
                          {student.olQualifications && <div>O/L: {student.olQualifications}</div>}
                          {!student.alQualifications && !student.olQualifications && 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={student.studentStatus}
                          onChange={(e) => {
                            const newStatus = e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPOUT';
                            if (newStatus !== student.studentStatus) {
                              handleChangeStatus(student.nic, student.nameWithInitials, newStatus);
                            }
                          }}
                          className={`px-3 py-1 text-xs leading-5 font-semibold rounded-full border cursor-pointer transition-all ${getStatusBadge(student.studentStatus)}`}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                          <option value="GRADUATED">Graduated</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewDetails(student.nic)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            onClick={() => handleEditStudent(student.nic)}
                            className="text-emerald-600 hover:text-emerald-800 transition-colors p-2 hover:bg-emerald-50 rounded"
                            title="Edit Student"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student.nic, student.nameWithInitials)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded"
                            title="Delete Student"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Student Modal - Modern Enhanced UI */}
        {showCreateModal && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setShowCreateModal(false)}></div>
            
            {/* Modal Container */}
            <div className="fixed inset-0 z-[70] overflow-y-auto">
              <div className="flex min-h-full items-start justify-center p-4 pt-20 pb-20">
                <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {isEditMode ? 'Edit Student' : 'Add New Student'}
                        </h2>
                        <p className="text-emerald-100 text-sm mt-1">
                          {isEditMode ? 'Update student information below' : 'Fill in the student information below'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // Close modal and clear form
                          setShowCreateModal(false);
                          setIsEditMode(false);
                          setEditingNic(null);
                          clearStudentForm();
                        }}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        type="button"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={isEditMode ? handleUpdateStudent : handleCreateStudent} className="p-6 space-y-6">
                {/* Personal Information Section */}
                <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-emerald-600 p-2 rounded-lg">
                      <UserCheck className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Name with Initials <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newStudent.nameWithInitials}
                        onChange={(e) => setNewStudent({...newStudent, nameWithInitials: e.target.value, fullName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., K.M.S. Perera"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        NIC <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newStudent.nic}
                        onChange={(e) => setNewStudent({...newStudent, nic: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., 199912345678"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., student@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={newStudent.dateOfBirth}
                        onChange={(e) => setNewStudent({...newStudent, dateOfBirth: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number <span className="text-red-500">*</span></label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-700 font-semibold">
                          +94
                        </span>
                        <input
                          type="tel"
                          value={newStudent.mobileNumber}
                          onChange={(e) => {
                            // Allow only digits and limit length
                            const value = e.target.value.replace(/\D/g, '');
                            setNewStudent({...newStudent, mobileNumber: value});
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          placeholder="771234567"
                          maxLength={9}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Enter number without leading 0 (e.g., 771234567)</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Address <span className="text-red-500">*</span></label>
                      <textarea
                        value={newStudent.permanentAddress}
                        onChange={(e) => setNewStudent({...newStudent, permanentAddress: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                        placeholder="Enter full address"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="bg-gradient-to-br from-amber-50 to-white p-6 rounded-xl border border-amber-100">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-amber-600 p-2 rounded-lg">
                      <Phone className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={newStudent.emergencyContactName}
                        onChange={(e) => setNewStudent({...newStudent, emergencyContactName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="e.g., R.M. Perera"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={newStudent.emergencyRelationship}
                        onChange={(e) => setNewStudent({...newStudent, emergencyRelationship: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="e.g., Father"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Mobile</label>
                      <div className="flex">
                        <span className="inline-flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-gray-700 font-semibold">
                          +94
                        </span>
                        <input
                          type="tel"
                          value={newStudent.emergencyContactMobile}
                          onChange={(e) => {
                            // Allow only digits and limit length
                            const value = e.target.value.replace(/\D/g, '');
                            setNewStudent({...newStudent, emergencyContactMobile: value});
                          }}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="771234567"
                          maxLength={9}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Enter number without leading 0 (e.g., 771234567)</p>
                    </div>
                  </div>
                </div>

                {/* Educational Qualifications Section */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <GraduationCap className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Educational Qualifications</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">O/L Qualifications</label>
                      <input
                        type="text"
                        value={newStudent.olQualifications}
                        onChange={(e) => setNewStudent({...newStudent, olQualifications: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., 9 Passes including Mathematics & English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">A/L Qualifications</label>
                      <input
                        type="text"
                        value={newStudent.alQualifications}
                        onChange={(e) => setNewStudent({...newStudent, alQualifications: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Commerce Stream - 3 Passes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Other Qualifications</label>
                      <input
                        type="text"
                        value={newStudent.otherQualifications}
                        onChange={(e) => setNewStudent({...newStudent, otherQualifications: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Diploma, Certificates"
                      />
                    </div>
                  </div>
                </div>

                {/* Program Enrollment Section - Simplified to Intake-Only */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <BookOpen className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Intake Enrollment</h3>
                  </div>

                  {/* Display Selected Intakes */}
                  {selectedPrograms.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Enrolled Intakes
                      </label>
                      <div className="space-y-3">
                        {selectedPrograms.map(program => (
                          <div
                            key={program.id}
                            className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <span className="text-sm font-bold text-purple-900 block">
                                  {program.intakeName || program.name}
                                </span>
                                <span className="text-xs text-purple-700 mt-1 block">
                                  Program: {program.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeProgramFromSelection(program.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full p-1.5 transition-colors ml-2"
                                title="Remove intake"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Intake Interface - Simplified */}
                  <div className="border-t border-purple-200 pt-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Add New Intake <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowIntakeSelector(!showIntakeSelector)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm text-left flex items-center justify-between bg-white hover:bg-gray-50"
                        >
                          <span className="text-gray-700">
                            {allIntakes.length === 0 
                              ? 'Loading intakes...' 
                              : 'Click to select intakes'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {/* Intake Multi-Selector Dropdown */}
                        {showIntakeSelector && allIntakes.length > 0 && (
                          <div className="absolute z-50 mt-2 w-full bg-white border border-purple-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                            <div className="sticky top-0 bg-purple-50 border-b border-purple-200 px-4 py-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-purple-900 text-sm">Select Intakes to Enroll</h4>
                                <button
                                  type="button"
                                  onClick={() => setShowIntakeSelector(false)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            </div>
                            <div className="p-2 space-y-1">
                              {allIntakes.map(intake => {
                                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                const monthName = monthNames[intake.intake_month - 1];
                                const isAlreadySelected = selectedPrograms.some(p => p.intakeId === intake.id);
                                
                                return (
                                  <label
                                    key={intake.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                      isAlreadySelected 
                                        ? 'bg-purple-100 border-2 border-purple-500 opacity-50 cursor-not-allowed' 
                                        : 'bg-gray-50 border border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isAlreadySelected}
                                      disabled={isAlreadySelected}
                                      onChange={() => {
                                        if (!isAlreadySelected && intake.program_id && intake.faculty_id && intake.department_id) {
                                          addProgramToSelection(
                                            Number(intake.faculty_id),
                                            Number(intake.department_id),
                                            Number(intake.program_id),
                                            intake.program_name || 'Unknown Program',
                                            Number(intake.id),
                                            intake.intake_name
                                          );
                                        }
                                      }}
                                      className="mt-0.5 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900 text-sm">
                                        {intake.intake_name}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                                        <div>📅 {monthName} {intake.intake_year}</div>
                                        <div className="text-purple-700">Program: {intake.program_name || 'Unknown Program'}</div>
                                        <div className="text-gray-600">Faculty: {intake.faculty_name || 'Unknown Faculty'}</div>
                                      </div>
                                      {isAlreadySelected && (
                                        <div className="text-xs text-green-600 mt-1 font-semibold">
                                          ✓ Already enrolled
                                        </div>
                                      )}
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3">
                              <button
                                type="button"
                                onClick={() => setShowIntakeSelector(false)}
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Click the button above to select multiple intakes. Faculty, Department, and Program are automatically assigned based on each intake.
                    </p>
                    {selectedPrograms.length === 0 && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={16} />
                        At least one intake must be selected
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditMode(false);
                      setEditingNic(null);
                      clearStudentForm();
                    }}
                    className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all hover:border-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-400 font-semibold transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {isEditMode ? 'Updating...' : 'Creating Student...'}
                      </span>
                    ) : (
                      isEditMode ? 'Update Student' : 'Create Student'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </>
        )}

        {/* View Details Modal */}
        {showViewModal && viewingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[75]">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{viewingStudent.nameWithInitials}</h3>
                    <p className="text-blue-100 text-sm mt-1">Student Details</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingStudent(null);
                    }}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Full Name</label>
                    <p className="text-gray-900">{viewingStudent.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">NIC</label>
                    <p className="text-gray-900">{viewingStudent.nic}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-900">{viewingStudent.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Mobile</label>
                    <p className="text-gray-900">{viewingStudent.mobileNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Date of Birth</label>
                    <p className="text-gray-900">{formatDateOfBirth(viewingStudent.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Status</label>
                    <p className="text-gray-900">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingStudent.studentStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        viewingStudent.studentStatus === 'GRADUATED' ? 'bg-blue-100 text-blue-800' :
                        viewingStudent.studentStatus === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                        viewingStudent.studentStatus === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {viewingStudent.studentStatus}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Permanent Address</label>
                  <p className="text-gray-900">{viewingStudent.permanentAddress}</p>
                </div>

                {viewingStudent.emergencyContactName && (
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Name</label>
                        <p className="text-gray-900">{viewingStudent.emergencyContactName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Relationship</label>
                        <p className="text-gray-900">{viewingStudent.emergencyRelationship}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Mobile</label>
                        <p className="text-gray-900">{viewingStudent.emergencyContactMobile}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Academic Information</h4>
                  <div className="space-y-2">
                    {viewingStudent.faculties && viewingStudent.faculties.length > 0 && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Faculties</label>
                        <p className="text-gray-900">{viewingStudent.faculties.map(f => f.name).join(', ')}</p>
                      </div>
                    )}
                    {viewingStudent.departments && viewingStudent.departments.length > 0 && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Departments</label>
                        <p className="text-gray-900">{viewingStudent.departments.map(d => d.name).join(', ')}</p>
                      </div>
                    )}
                    {viewingStudent.programs && viewingStudent.programs.length > 0 && (
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Programs & Intakes</label>
                        <div className="space-y-1">
                          {viewingStudent.programs.map((p, idx) => (
                            <p key={idx} className="text-gray-900">
                              {p.programName}
                              {p.intakeName && <span className="text-emerald-600 text-sm ml-2">({p.intakeName})</span>}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {(viewingStudent.olQualifications || viewingStudent.alQualifications || viewingStudent.otherQualifications) && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Qualifications</h4>
                    <div className="space-y-2">
                      {viewingStudent.olQualifications && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">O/L</label>
                          <p className="text-gray-900">{viewingStudent.olQualifications}</p>
                        </div>
                      )}
                      {viewingStudent.alQualifications && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">A/L</label>
                          <p className="text-gray-900">{viewingStudent.alQualifications}</p>
                        </div>
                      )}
                      {viewingStudent.otherQualifications && (
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Other</label>
                          <p className="text-gray-900">{viewingStudent.otherQualifications}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingStudent(null);
                  }}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                >
                  Close
                </button>
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
