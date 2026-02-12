import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, BookOpen, GraduationCap, Plus, Edit2, Trash2, X, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import academicStructureService from '../../services/academicStructureService';
import type { Faculty, Department, Program } from '../../services/academicStructureService';

export function ManageAcademicStructure() {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Modal states
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);

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

  // Form states for Faculty
  const [facultyForm, setFacultyForm] = useState({
    id: null as number | null,
    name: '',
    description: ''
  });

  // Form states for Department (with multi-select)
  const [departmentForms, setDepartmentForms] = useState([
    { name: '', description: '', facultyId: '' }
  ]);

  // Form states for Program (with multi-select)
  const [programForms, setProgramForms] = useState([
    { name: '', duration: '', description: '', departmentId: '', facultyId: '' }
  ]);

  // Expanded states for tree view
  const [expandedFaculties, setExpandedFaculties] = useState<Set<number>>(new Set());
  const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  // Helper functions for custom modals
  const showSuccessNotification = (title: string, message: string, details: string[] = []) => {
    setNotificationConfig({ type: 'success', title, message, details });
    setShowNotification(true);
  };

  const showErrorNotification = (title: string, message: string) => {
    setNotificationConfig({ type: 'error', title, message, details: [] });
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

  const loadData = async () => {
    setLoading(true);
    try {
      const [facultiesRes, departmentsRes, programsRes] = await Promise.all([
        academicStructureService.faculty.getAll(),
        academicStructureService.department.getAll(),
        academicStructureService.program.getAll()
      ]);

      console.log('Faculties Response:', facultiesRes);
      console.log('Departments Response:', departmentsRes);
      console.log('Programs Response:', programsRes);

      if (facultiesRes.success) {
        setFaculties(facultiesRes.data);
        console.log('Faculties set:', facultiesRes.data);
      } else {
        console.error('Failed to load faculties:', facultiesRes.message);
      }
      
      if (departmentsRes.success) {
        setDepartments(departmentsRes.data);
        console.log('Departments set:', departmentsRes.data);
      } else {
        console.error('Failed to load departments:', departmentsRes.message);
      }
      
      if (programsRes.success) {
        setPrograms(programsRes.data);
        console.log('Programs set:', programsRes.data);
      } else {
        console.error('Failed to load programs:', programsRes.message);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      showErrorNotification('Failed to Load Data', error.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Faculty CRUD
  const handleCreateOrUpdateFaculty = async () => {
    if (!facultyForm.name.trim()) {
      showErrorNotification('Validation Error', 'Please enter faculty name');
      return;
    }

    setProcessing(true);
    try {
      if (facultyForm.id) {
        // Update
        const result = await academicStructureService.faculty.update(facultyForm.id, {
          name: facultyForm.name,
          description: facultyForm.description
        });
        
        if (result.success) {
          showSuccessNotification(
            'Faculty Updated Successfully!',
            `Faculty "${facultyForm.name}" has been updated.`
          );
        }
      } else {
        // Create
        const result = await academicStructureService.faculty.create({
          name: facultyForm.name,
          description: facultyForm.description
        });
        
        if (result.success) {
          showSuccessNotification(
            'Faculty Created Successfully!',
            `New faculty "${facultyForm.name}" has been added to the system.`
          );
        }
      }

      setShowFacultyModal(false);
      setFacultyForm({ id: null, name: '', description: '' });
      loadData();
    } catch (error: any) {
      console.error('Error saving faculty:', error);
      showErrorNotification('Failed to Save Faculty', error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteFaculty = async (id: number) => {
    const faculty = faculties.find(f => f.id === id);
    
    showConfirmDialog(
      'Delete Faculty?',
      `Are you sure you want to delete "${faculty?.name}"?\n\nThis will also affect all associated departments and programs.`,
      async () => {
        setProcessing(true);
        try {
          const result = await academicStructureService.faculty.delete(id);
          if (result.success) {
            showSuccessNotification(
              'Faculty Deleted Successfully!',
              `Faculty "${faculty?.name}" has been removed from the system.`
            );
            loadData();
          }
        } catch (error: any) {
          console.error('Error deleting faculty:', error);
          showErrorNotification('Failed to Delete Faculty', error.message);
        } finally {
          setProcessing(false);
        }
      },
      'danger'
    );
  };

  // Department CRUD (Multi-create support)
  const handleCreateDepartments = async () => {
    const validForms = departmentForms.filter(f => f.name.trim() && f.facultyId);
    
    if (validForms.length === 0) {
      showErrorNotification('Validation Error', 'Please fill in at least one department with name and faculty');
      return;
    }

    setProcessing(true);
    try {
      // Create each department individually
      const promises = validForms.map(f => 
        academicStructureService.department.create({
          departmentName: f.name,
          facultyId: parseInt(f.facultyId),
          description: f.description
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;

      if (successCount === validForms.length) {
        showSuccessNotification(
          'Departments Created Successfully!',
          `${successCount} department(s) have been added to the system.`,
          validForms.map(f => f.name)
        );
      } else {
        showWarningNotification(
          'Partial Success',
          `${successCount} out of ${validForms.length} department(s) were created.`
        );
      }

      setShowDepartmentModal(false);
      setDepartmentForms([{ name: '', description: '', facultyId: '' }]);
      loadData();
    } catch (error: any) {
      console.error('Error creating departments:', error);
      showErrorNotification('Failed to Create Departments', error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    const department = departments.find(d => d.id === id);
    
    showConfirmDialog(
      'Delete Department?',
      `Are you sure you want to delete "${department?.departmentName}"?\n\nThis will also affect all associated programs.`,
      async () => {
        setProcessing(true);
        try {
          const result = await academicStructureService.department.delete(id);
          if (result.success) {
            showSuccessNotification(
              'Department Deleted Successfully!',
              `Department "${department?.departmentName}" has been removed from the system.`
            );
            loadData();
          }
        } catch (error: any) {
          console.error('Error deleting department:', error);
          showErrorNotification('Failed to Delete Department', error.message);
        } finally {
          setProcessing(false);
        }
      },
      'danger'
    );
  };

  // Program CRUD (Multi-create support)
  const handleCreatePrograms = async () => {
    const validForms = programForms.filter(f => f.name.trim() && f.departmentId);
    
    if (validForms.length === 0) {
      showErrorNotification('Validation Error', 'Please fill in at least one program with name and department');
      return;
    }

    setProcessing(true);
    try {
      // Create each program individually
      const promises = validForms.map(f => 
        academicStructureService.program.create({
          name: f.name,
          facultyId: parseInt(f.facultyId),
          departmentId: parseInt(f.departmentId),
          durationMonths: parseInt(f.duration),
          description: f.description
        })
      );

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;

      if (successCount === validForms.length) {
        showSuccessNotification(
          'Programs Created Successfully!',
          `${successCount} program(s) have been added to the system.`,
          validForms.map(f => `${f.name} (${f.duration} months)`)
        );
      } else {
        showWarningNotification(
          'Partial Success',
          `${successCount} out of ${validForms.length} program(s) were created.`
        );
      }

      setShowProgramModal(false);
      setProgramForms([{ name: '', duration: '', description: '', departmentId: '', facultyId: '' }]);
      loadData();
    } catch (error: any) {
      console.error('Error creating programs:', error);
      showErrorNotification('Failed to Create Programs', error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProgram = async (id: number) => {
    const program = programs.find(p => p.id === id);
    
    showConfirmDialog(
      'Delete Program?',
      `Are you sure you want to delete "${program?.name}"?\n\nThis action cannot be undone.`,
      async () => {
        setProcessing(true);
        try {
          const result = await academicStructureService.program.delete(id);
          if (result.success) {
            showSuccessNotification(
              'Program Deleted Successfully!',
              `Program "${program?.name}" has been removed from the system.`
            );
            loadData();
          }
        } catch (error: any) {
          console.error('Error deleting program:', error);
          showErrorNotification('Failed to Delete Program', error.message);
        } finally {
          setProcessing(false);
        }
      },
      'danger'
    );
  };

  // Helper functions
  const addDepartmentForm = () => {
    setDepartmentForms([...departmentForms, { name: '', description: '', facultyId: '' }]);
  };

  const removeDepartmentForm = (index: number) => {
    if (departmentForms.length > 1) {
      setDepartmentForms(departmentForms.filter((_, i) => i !== index));
    }
  };

  const addProgramForm = () => {
    setProgramForms([...programForms, { name: '', duration: '', description: '', departmentId: '', facultyId: '' }]);
  };

  const removeProgramForm = (index: number) => {
    if (programForms.length > 1) {
      setProgramForms(programForms.filter((_, i) => i !== index));
    }
  };

  const toggleFaculty = (id: number) => {
    const newExpanded = new Set(expandedFaculties);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFaculties(newExpanded);
  };

  const toggleDepartment = (id: number) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDepartments(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading academic structure...</p>
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
            className="flex items-center gap-2 text-emerald-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Academic Structure Management</h1>
              <p className="text-emerald-200 mt-1">Manage faculties, departments, and programs</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFacultyForm({ id: null, name: '', description: '' });
                  setShowFacultyModal(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Faculty
              </button>
              <button
                onClick={() => {
                  setDepartmentForms([{ name: '', description: '', facultyId: '' }]);
                  setShowDepartmentModal(true);
                }}
                className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Department
              </button>
              <button
                onClick={() => {
                  setProgramForms([{ name: '', duration: '', description: '', departmentId: '', facultyId: '' }]);
                  setShowProgramModal(true);
                }}
                className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Program
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
            <div className="flex items-center justify-between mb-2">
              <Building2 size={32} className="text-emerald-600" />
              <span className="text-3xl font-bold text-gray-900">{faculties.length}</span>
            </div>
            <div className="text-gray-600 font-medium">Faculties</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <BookOpen size={32} className="text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{departments.length}</span>
            </div>
            <div className="text-gray-600 font-medium">Departments</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <GraduationCap size={32} className="text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{programs.length}</span>
            </div>
            <div className="text-gray-600 font-medium">Programs</div>
          </div>
        </div>

        {/* Tree View of Academic Structure */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Building2 className="text-emerald-600" size={24} />
            Academic Structure Tree
          </h2>

          {faculties.length === 0 ? (
            <div className="text-center py-16">
              <Building2 size={64} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No faculties created yet</p>
              <p className="text-gray-400 text-sm">Click "Add Faculty" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faculties.map(faculty => {
                const facultyDepts = departments.filter(d => d.facultyId === faculty.id);
                const isExpanded = expandedFaculties.has(faculty.id);

                return (
                  <div key={faculty.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Faculty Row */}
                    <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleFaculty(faculty.id)}
                          className="text-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          {isExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                        </button>
                        <Building2 className="text-emerald-600" size={24} />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg">{faculty.name}</h3>
                          {faculty.description && (
                            <p className="text-gray-600 text-sm">{faculty.description}</p>
                          )}
                          <p className="text-emerald-700 text-sm font-medium mt-1">
                            {facultyDepts.length} department(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Pre-fill faculty for new department
                            setDepartmentForms([{ name: '', description: '', facultyId: faculty.id.toString() }]);
                            setShowDepartmentModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Add Department to this Faculty"
                        >
                          <Plus size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setFacultyForm({
                              id: faculty.id,
                              name: faculty.name,
                              description: faculty.description || ''
                            });
                            setShowFacultyModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Faculty"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteFaculty(faculty.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Faculty"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Departments */}
                    {isExpanded && (
                      <div className="bg-white">
                        {facultyDepts.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-sm mb-3">No departments in this faculty</p>
                            <button
                              onClick={() => {
                                setDepartmentForms([{ name: '', description: '', facultyId: faculty.id.toString() }]);
                                setShowDepartmentModal(true);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                            >
                              <Plus size={16} />
                              Add Department
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {facultyDepts.map(dept => {
                              const deptPrograms = programs.filter(p => p.departmentId === dept.id);
                              const isDeptExpanded = expandedDepartments.has(dept.id);

                              return (
                                <div key={dept.id}>
                                  {/* Department Row */}
                                  <div className="bg-blue-50 p-4 flex items-center justify-between ml-8">
                                    <div className="flex items-center gap-3 flex-1">
                                      <button
                                        onClick={() => toggleDepartment(dept.id)}
                                        className="text-blue-600 hover:text-blue-700 transition-colors"
                                      >
                                        {isDeptExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                      </button>
                                      <BookOpen className="text-blue-600" size={20} />
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800">{dept.departmentName}</h4>
                                        {dept.description && (
                                          <p className="text-gray-600 text-sm">{dept.description}</p>
                                        )}
                                        <p className="text-blue-700 text-sm font-medium mt-1">
                                          {deptPrograms.length} program(s)
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          // Pre-fill faculty and department for new program
                                          setProgramForms([{ 
                                            name: '', 
                                            duration: '', 
                                            description: '', 
                                            departmentId: dept.id.toString(),
                                            facultyId: faculty.id.toString()
                                          }]);
                                          setShowProgramModal(true);
                                        }}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Add Program to this Department"
                                      >
                                        <Plus size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteDepartment(dept.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Department"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Programs */}
                                  {isDeptExpanded && (
                                    <div className="bg-gray-50 ml-16">
                                      {deptPrograms.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                          <GraduationCap size={24} className="text-gray-300 mx-auto mb-2" />
                                          <p className="text-sm mb-3">No programs in this department</p>
                                          <button
                                            onClick={() => {
                                              setProgramForms([{ 
                                                name: '', 
                                                duration: '', 
                                                description: '', 
                                                departmentId: dept.id.toString(),
                                                facultyId: faculty.id.toString()
                                              }]);
                                              setShowProgramModal(true);
                                            }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
                                          >
                                            <Plus size={16} />
                                            Add Program
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="divide-y divide-gray-200">
                                          {deptPrograms.map(program => (
                                            <div key={program.id} className="p-4 flex items-center justify-between hover:bg-purple-50 transition-colors">
                                              <div className="flex items-center gap-3 flex-1">
                                                <GraduationCap className="text-purple-600" size={20} />
                                                <div className="flex-1">
                                                  <h5 className="font-medium text-gray-800">{program.name}</h5>
                                                  {program.durationMonths && (
                                                    <p className="text-gray-600 text-sm">Duration: {program.durationMonths} months</p>
                                                  )}
                                                  {program.description && (
                                                    <p className="text-gray-500 text-sm">{program.description}</p>
                                                  )}
                                                </div>
                                              </div>
                                              <button
                                                onClick={() => handleDeleteProgram(program.id)}
                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete Program"
                                              >
                                                <Trash2 size={16} />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Faculty Modal */}
      {showFacultyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 size={24} />
                {facultyForm.id ? 'Edit Faculty' : 'Create New Faculty'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Faculty Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={facultyForm.name}
                  onChange={(e) => setFacultyForm({...facultyForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="e.g., Faculty of Engineering"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={facultyForm.description}
                  onChange={(e) => setFacultyForm({...facultyForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Brief description of the faculty"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowFacultyModal(false);
                    setFacultyForm({ id: null, name: '', description: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrUpdateFaculty}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:bg-gray-400 font-semibold transition-all disabled:cursor-not-allowed"
                >
                  {processing ? 'Saving...' : (facultyForm.id ? 'Update' : 'Create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Modal (Multi-create) */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookOpen size={24} />
                Create New Department(s)
              </h2>
              <p className="text-blue-100 text-sm mt-1">Add one or multiple departments at once</p>
            </div>

            <div className="p-6 space-y-4">
              {departmentForms.map((form, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                  {departmentForms.length > 1 && (
                    <button
                      onClick={() => removeDepartmentForm(index)}
                      className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove this department"
                    >
                      <X size={20} />
                    </button>
                  )}

                  <h3 className="font-semibold text-gray-700 mb-4">Department {index + 1}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          const newForms = [...departmentForms];
                          newForms[index].name = e.target.value;
                          setDepartmentForms(newForms);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Computer Science"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Faculty <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.facultyId}
                        onChange={(e) => {
                          const newForms = [...departmentForms];
                          newForms[index].facultyId = e.target.value;
                          setDepartmentForms(newForms);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Faculty</option>
                        {faculties.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => {
                          const newForms = [...departmentForms];
                          newForms[index].description = e.target.value;
                          setDepartmentForms(newForms);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Brief description of the department"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addDepartmentForm}
                className="w-full px-6 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 font-semibold text-blue-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another Department
              </button>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowDepartmentModal(false);
                    setDepartmentForms([{ name: '', description: '', facultyId: '' }]);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDepartments}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-gray-400 font-semibold transition-all disabled:cursor-not-allowed"
                >
                  {processing ? 'Creating...' : `Create ${departmentForms.filter(f => f.name.trim() && f.facultyId).length} Department(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Program Modal (Multi-create) */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-lg">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <GraduationCap size={24} />
                Create New Program(s)
              </h2>
              <p className="text-purple-100 text-sm mt-1">Add one or multiple programs at once</p>
            </div>

            <div className="p-6 space-y-4">
              {programForms.map((form, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                  {programForms.length > 1 && (
                    <button
                      onClick={() => removeProgramForm(index)}
                      className="absolute top-2 right-2 p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove this program"
                    >
                      <X size={20} />
                    </button>
                  )}

                  <h3 className="font-semibold text-gray-700 mb-4">Program {index + 1}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Program Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => {
                          const newForms = [...programForms];
                          newForms[index].name = e.target.value;
                          setProgramForms(newForms);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., BSc Computer Science"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Faculty <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.facultyId}
                        onChange={(e) => {
                          const newForms = [...programForms];
                          newForms[index].facultyId = e.target.value;
                          newForms[index].departmentId = ''; // Reset department when faculty changes
                          setProgramForms(newForms);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select Faculty</option>
                        {faculties.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.departmentId}
                        onChange={(e) => {
                          const newForms = [...programForms];
                          newForms[index].departmentId = e.target.value;
                          setProgramForms(newForms);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        disabled={!form.facultyId}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments
                          .filter(d => !form.facultyId || d.facultyId === parseInt(form.facultyId))
                          .map(d => (
                            <option key={d.id} value={d.id}>
                              {d.departmentName}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Duration (Months) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={form.duration}
                        onChange={(e) => {
                          const newForms = [...programForms];
                          newForms[index].duration = e.target.value;
                          setProgramForms(newForms);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="e.g., 48"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) => {
                          const newForms = [...programForms];
                          newForms[index].description = e.target.value;
                          setProgramForms(newForms);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="Brief description of the program"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addProgramForm}
                className="w-full px-6 py-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 font-semibold text-purple-600 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another Program
              </button>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowProgramModal(false);
                    setProgramForms([{ name: '', duration: '', description: '', departmentId: '', facultyId: '' }]);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePrograms}
                  disabled={processing}
                  className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:bg-gray-400 font-semibold transition-all disabled:cursor-not-allowed"
                >
                  {processing ? 'Creating...' : `Create ${programForms.filter(f => f.name.trim() && f.departmentId).length} Program(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                        <span className="text-green-500">•</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full animate-scale-in">
            <div className={`p-6 rounded-t-lg text-white ${
              confirmationConfig.type === 'danger' 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : 'bg-gradient-to-r from-amber-500 to-orange-600'
            }`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl">🗑️</div>
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
  );
}
