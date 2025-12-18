import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Mail, Phone, GraduationCap, Briefcase, MapPin, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Lecturer {
  id: string;
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  residential_address?: string;
  highest_qualification?: string;
  years_academic_experience?: number;
  years_industry_experience?: number;
  availability_schedule?: any;
  is_active: boolean;
  lecturer_assignments?: Array<{
    id: string;
    program_id: string;
    module_id: string;
    programs: {
      name: string;
    } | null;
    modules: {
      module_name: string;
    } | null;
  }>;
}

interface Faculty {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  faculty_id: string;
}

interface Program {
  id: string;
  name: string;
  department_id: string;
}

interface Intake {
  id: string;
  intake_name: string;
  intake_year: number;
  intake_month: number;
  program_id: string;
}

interface Module {
  id: string;
  module_code: string;
  module_name: string;
  program_id: string;
  department_id: string;
  faculty_id: string;
  intake_id?: string;
  programs?: {
    name: string;
  };
  departments?: {
    name: string;
  };
  faculties?: {
    name: string;
  };
  intakes?: {
    intake_name: string;
    intake_year: number;
    intake_month: number;
  };
}

export function LecturerManagement() {
  const navigate = useNavigate();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterQualification, setFilterQualification] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);
  const [processing, setProcessing] = useState(false);
  
  // Dropdown data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  
  // Filter dropdown data
  const [filterFaculties, setFilterFaculties] = useState<Faculty[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<Department[]>([]);
  
  // Selected modules for assignment
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  
  // Create lecturer form
  const [newLecturer, setNewLecturer] = useState({
    first_name: '',
    last_name: '',
    contact_number: '',
    email: '',
    residential_address: '',
    highest_qualification: '',
    years_academic_experience: 0,
    years_industry_experience: 0,
    is_active: true
  });
  
  // Assignment form
  const [assignment, setAssignment] = useState({
    faculty_id: '',
    department_id: '',
    program_id: '',
    module_id: '',
    intake_id: ''
  });
  
  // Module search for assignment
  const [moduleSearchTerm, setModuleSearchTerm] = useState('');

  useEffect(() => {
    loadLecturers();
    loadFaculties();
    loadFilterFaculties();
    loadAllModules();
  }, []);

  useEffect(() => {
    if (assignment.faculty_id) {
      loadDepartmentsByFaculty(assignment.faculty_id);
    } else {
      setDepartments([]);
      setPrograms([]);
    }
  }, [assignment.faculty_id]);

  useEffect(() => {
    if (assignment.department_id) {
      loadProgramsByDepartment(assignment.department_id);
    } else {
      setPrograms([]);
    }
  }, [assignment.department_id]);

  useEffect(() => {
    if (assignment.program_id) {
      loadIntakesByProgram(assignment.program_id);
    } else {
      setIntakes([]);
    }
  }, [assignment.program_id]);

  // Filter useEffects
  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadFilterDepartments(filterFaculty);
    } else {
      setFilterDepartments([]);
    }
  }, [filterFaculty]);

  const loadFaculties = async () => {
    try {
      const { data } = await supabase
        .from('faculties')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      setFaculties(data || []);
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadDepartmentsByFaculty = async (facultyId: string) => {
    try {
      const { data } = await supabase
        .from('departments')
        .select('id, name, faculty_id')
        .eq('faculty_id', facultyId)
        .eq('is_active', true)
        .order('name');
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadProgramsByDepartment = async (departmentId: string) => {
    try {
      const { data } = await supabase
        .from('programs')
        .select('id, name, department_id')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('name');
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadIntakesByProgram = async (programId: string) => {
    try {
      const { data } = await supabase
        .from('intakes')
        .select('id, intake_name, intake_year, intake_month, program_id')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('intake_year', { ascending: false })
        .order('intake_month', { ascending: false });
      setIntakes(data || []);
    } catch (error) {
      console.error('Error loading intakes:', error);
    }
  };

  const loadAllModules = async () => {
    try {
      const { data } = await supabase
        .from('modules')
        .select(`
          id,
          module_code,
          module_name,
          program_id,
          department_id,
          faculty_id,
          intake_id,
          programs (name),
          departments (name),
          faculties (name),
          intakes (intake_name, intake_year, intake_month)
        `)
        .eq('is_active', true)
        .order('module_code');
      setAllModules(data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  // Filter load functions
  const loadFilterFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFilterFaculties(data || []);
    } catch (error) {
      console.error('Error loading filter faculties:', error);
    }
  };

  const loadFilterDepartments = async (facultyId: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, faculty_id')
        .eq('faculty_id', facultyId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFilterDepartments(data || []);
    } catch (error) {
      console.error('Error loading filter departments:', error);
    }
  };

  const loadLecturers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lecturers')
        .select(`
          *,
          lecturer_assignments (
            id,
            program_id,
            module_id,
            programs (
              name
            ),
            modules (
              module_name
            )
          )
        `)
        .order('first_name');

      if (error) throw error;
      setLecturers(data || []);
    } catch (error) {
      console.error('Error loading lecturers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLecturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecturer.first_name || !newLecturer.last_name || !newLecturer.email) {
      alert('Please fill in required fields: First Name, Last Name, and Email');
      return;
    }

    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      
      const { error } = await supabaseAny
        .from('lecturers')
        .insert({
          ...newLecturer,
          id: crypto.randomUUID()
        });

      if (error) throw error;

      alert('Lecturer created successfully!');
      setShowCreateModal(false);
      setNewLecturer({
        first_name: '',
        last_name: '',
        contact_number: '',
        email: '',
        residential_address: '',
        highest_qualification: '',
        years_academic_experience: 0,
        years_industry_experience: 0,
        is_active: true
      });
      loadLecturers();
    } catch (error: any) {
      console.error('Error creating lecturer:', error);
      alert('Failed to create lecturer: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecturer || selectedModules.length === 0) {
      alert('Please select at least one module');
      return;
    }

    setProcessing(true);
    try {
      // Create assignments for all selected modules
      const supabaseAny = supabase as any;
      const assignments = selectedModules.map((moduleId: string) => {
        const module = allModules.find(m => m.id === moduleId);
        return {
          id: crypto.randomUUID(),
          lecturer_id: selectedLecturer.id,
          faculty_id: module?.faculty_id,
          department_id: module?.department_id,
          program_id: module?.program_id,
          module_id: moduleId,
          intake_id: assignment.intake_id || null
        };
      });

      const { error } = await supabaseAny
        .from('lecturer_assignments')
        .insert(assignments);

      if (error) throw error;

      alert(`Successfully assigned ${selectedModules.length} module(s) to the lecturer!`);
      setShowAssignModal(false);
      setAssignment({
        faculty_id: '',
        department_id: '',
        program_id: '',
        module_id: '',
        intake_id: ''
      });
      setSelectedModules([]);
      setModuleSearchTerm('');
      setSelectedLecturer(null);
      loadLecturers();
    } catch (error: any) {
      console.error('Error assigning modules:', error);
      alert('Failed to assign modules: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleActive = async (lecturer: Lecturer) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('lecturers')
        .update({ is_active: !lecturer.is_active })
        .eq('id', lecturer.id);

      if (error) throw error;
      loadLecturers();
    } catch (error) {
      console.error('Error toggling lecturer status:', error);
      alert('Failed to update lecturer status');
    }
  };

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAllModules = () => {
    const filtered = getFilteredModules();
    setSelectedModules(filtered.map(m => m.id));
  };

  const handleDeselectAllModules = () => {
    setSelectedModules([]);
  };

  const getFilteredModules = () => {
    let filtered = allModules;

    if (assignment.faculty_id) {
      filtered = filtered.filter(m => m.faculty_id === assignment.faculty_id);
    }
    if (assignment.department_id) {
      filtered = filtered.filter(m => m.department_id === assignment.department_id);
    }
    if (assignment.program_id) {
      filtered = filtered.filter(m => m.program_id === assignment.program_id);
    }
    if (assignment.intake_id) {
      filtered = filtered.filter(m => m.intake_id === assignment.intake_id);
    }
    if (moduleSearchTerm) {
      filtered = filtered.filter(m => 
        m.module_code.toLowerCase().includes(moduleSearchTerm.toLowerCase()) ||
        m.module_name.toLowerCase().includes(moduleSearchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredLecturers = lecturers.filter(lecturer => {
    const matchesSearch = 
      lecturer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecturer.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && lecturer.is_active) ||
      (filterStatus === 'inactive' && !lecturer.is_active);
    
    const matchesQualification = filterQualification === 'all' || 
      lecturer.highest_qualification?.toLowerCase().includes(filterQualification.toLowerCase());
    
    // Check if lecturer is assigned to faculty/department
    const matchesFaculty = filterFaculty === 'all' || 
      filterDepartments.some(d => d.id === filterDepartment && d.faculty_id === filterFaculty);
    
    const matchesDepartment = filterDepartment === 'all' || true; // Simplified for now
    
    return matchesSearch && matchesStatus && matchesQualification && matchesFaculty && matchesDepartment;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterQualification('all');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-purple-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lecturer Management</h1>
              <p className="text-purple-100 mt-1">Manage lecturers and their module assignments</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <UserPlus size={20} />
              Add New Lecturer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="text-2xl font-bold text-gray-900">{lecturers.filter(l => l.is_active).length}</div>
            <div className="text-gray-600">Active Lecturers</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="text-2xl font-bold text-gray-900">{lecturers.filter(l => !l.is_active).length}</div>
            <div className="text-gray-600">Inactive</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
            <div className="text-2xl font-bold text-gray-900">{lecturers.reduce((sum, l) => sum + (l.lecturer_assignments?.length || 0), 0)}</div>
            <div className="text-gray-600">Total Assignments</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <select
                value={filterFaculty}
                onChange={(e) => {
                  setFilterFaculty(e.target.value);
                  setFilterDepartment('all');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Faculties</option>
                {filterFaculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={filterFaculty === 'all'}
              >
                <option value="all">All Departments</option>
                {filterDepartments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterQualification}
                onChange={(e) => setFilterQualification(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Qualifications</option>
                <option value="bachelor">Bachelor's Degree</option>
                <option value="master">Master's Degree</option>
                <option value="phd">PhD / Doctorate</option>
                <option value="diploma">Diploma</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

        {/* Lecturers List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
              <p className="mt-4 text-gray-600">Loading lecturers...</p>
            </div>
          ) : filteredLecturers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">No lecturers found</p>
            </div>
          ) : (
            filteredLecturers.map((lecturer) => (
              <div key={lecturer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {lecturer.first_name} {lecturer.last_name}
                        </h3>
                        {lecturer.highest_qualification && (
                          <p className="text-sm text-purple-600 font-semibold">{lecturer.highest_qualification}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                        lecturer.is_active 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {lecturer.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{lecturer.email}</span>
                      </div>
                      {lecturer.contact_number && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>{lecturer.contact_number}</span>
                        </div>
                      )}
                      {lecturer.residential_address && (
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin size={14} />
                          <span className="truncate">{lecturer.residential_address}</span>
                        </div>
                      )}
                      {(lecturer.years_academic_experience || lecturer.years_industry_experience) && (
                        <div className="flex items-center gap-2 col-span-2">
                          <Briefcase size={14} />
                          <span>
                            {lecturer.years_academic_experience ? `${lecturer.years_academic_experience}y Academic` : ''}
                            {lecturer.years_academic_experience && lecturer.years_industry_experience ? ' | ' : ''}
                            {lecturer.years_industry_experience ? `${lecturer.years_industry_experience}y Industry` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {lecturer.lecturer_assignments && lecturer.lecturer_assignments.length > 0 && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap size={14} className="text-purple-600" />
                          <span className="text-sm font-semibold text-purple-900">
                            Assigned Modules ({lecturer.lecturer_assignments.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {lecturer.lecturer_assignments.slice(0, 3).map((assignment) => (
                            assignment.modules && assignment.programs ? (
                              <span key={assignment.id} className="text-xs bg-white px-2 py-1 rounded border border-purple-200 text-gray-700">
                                {assignment.modules.module_name} - {assignment.programs.name}
                              </span>
                            ) : null
                          ))}
                          {lecturer.lecturer_assignments.length > 3 && (
                            <span className="text-xs text-purple-600 font-semibold">
                              +{lecturer.lecturer_assignments.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => {
                        setSelectedLecturer(lecturer);
                        setShowAssignModal(true);
                      }}
                      className="flex-1 lg:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Assign Modules
                    </button>
                    <button
                      onClick={() => handleToggleActive(lecturer)}
                      className={`flex-1 lg:flex-none px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        lecturer.is_active
                          ? 'bg-gray-600 hover:bg-gray-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {lecturer.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Lecturer Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-3xl w-full my-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Lecturer</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateLecturer} className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newLecturer.first_name}
                          onChange={(e) => setNewLecturer({...newLecturer, first_name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newLecturer.last_name}
                          onChange={(e) => setNewLecturer({...newLecturer, last_name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={newLecturer.email}
                          onChange={(e) => setNewLecturer({...newLecturer, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                        <input
                          type="tel"
                          value={newLecturer.contact_number}
                          onChange={(e) => setNewLecturer({...newLecturer, contact_number: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Residential Address</label>
                        <textarea
                          value={newLecturer.residential_address}
                          onChange={(e) => setNewLecturer({...newLecturer, residential_address: e.target.value})}
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Qualifications & Experience */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications & Experience</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Highest Qualification</label>
                        <input
                          type="text"
                          value={newLecturer.highest_qualification}
                          onChange={(e) => setNewLecturer({...newLecturer, highest_qualification: e.target.value})}
                          placeholder="e.g., PhD in Computer Science"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Academic Experience (years)</label>
                        <input
                          type="number"
                          min="0"
                          value={newLecturer.years_academic_experience}
                          onChange={(e) => setNewLecturer({...newLecturer, years_academic_experience: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industry Experience (years)</label>
                        <input
                          type="number"
                          min="0"
                          value={newLecturer.years_industry_experience}
                          onChange={(e) => setNewLecturer({...newLecturer, years_industry_experience: parseInt(e.target.value) || 0})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                    >
                      {processing ? 'Creating...' : 'Create Lecturer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Modules Modal */}
        {showAssignModal && selectedLecturer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white p-6 border-b z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Assign Modules to {selectedLecturer.first_name} {selectedLecturer.last_name}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedLecturer(null);
                      setSelectedModules([]);
                      setModuleSearchTerm('');
                      setAssignment({
                        faculty_id: '',
                        department_id: '',
                        program_id: '',
                        module_id: '',
                        intake_id: ''
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAssignModule} className="p-6 space-y-6">
                {/* Filter Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Modules (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Faculty
                      </label>
                      <select
                        value={assignment.faculty_id}
                        onChange={(e) => setAssignment({...assignment, faculty_id: e.target.value, department_id: '', program_id: '', intake_id: ''})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">All Faculties</option>
                        {faculties.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <select
                        value={assignment.department_id}
                        onChange={(e) => setAssignment({...assignment, department_id: e.target.value, program_id: '', intake_id: ''})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={!assignment.faculty_id}
                      >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Program
                      </label>
                      <select
                        value={assignment.program_id}
                        onChange={(e) => setAssignment({...assignment, program_id: e.target.value, intake_id: ''})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={!assignment.department_id}
                      >
                        <option value="">All Programs</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intake
                      </label>
                      <select
                        value={assignment.intake_id}
                        onChange={(e) => setAssignment({...assignment, intake_id: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={!assignment.program_id}
                      >
                        <option value="">All Intakes</option>
                        {intakes.map(i => (
                          <option key={i.id} value={i.id}>
                            {i.intake_name} ({i.intake_year})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Modules
                    </label>
                    <input
                      type="text"
                      placeholder="Search by module code or name..."
                      value={moduleSearchTerm}
                      onChange={(e) => setModuleSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Module Selection */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Select Modules ({selectedModules.length} selected)
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllModules}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Select All
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={handleDeselectAllModules}
                        className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                    {getFilteredModules().length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        No modules found. Try adjusting your filters.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {getFilteredModules().map((module) => (
                          <label
                            key={module.id}
                            className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedModules.includes(module.id)}
                              onChange={() => handleToggleModule(module.id)}
                              className="mt-1 h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">{module.module_code}</span>
                                <span className="text-gray-700">{module.module_name}</span>
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                {module.faculties?.name} → {module.departments?.name} → {module.programs?.name}
                                {module.intakes && (
                                  <span className="ml-2 text-purple-600 font-medium">
                                    • {module.intakes.intake_name} ({module.intakes.intake_year})
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You can select multiple modules from different faculties, departments, and programs. Use the filters above to narrow down the module list.
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedLecturer(null);
                      setSelectedModules([]);
                      setModuleSearchTerm('');
                      setAssignment({
                        faculty_id: '',
                        department_id: '',
                        program_id: '',
                        module_id: '',
                        intake_id: ''
                      });
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing || selectedModules.length === 0}
                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
                  >
                    {processing ? 'Assigning...' : `Assign ${selectedModules.length} Module(s)`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
