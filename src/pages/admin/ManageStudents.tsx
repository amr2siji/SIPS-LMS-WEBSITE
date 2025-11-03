import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Edit, Phone, MapPin, FileText, X, GraduationCap, BookOpen, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Student {
  id: string;
  name_with_initials?: string;
  nic?: string;
  date_of_birth?: string;
  permanent_address?: string;
  mobile_number?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_mobile?: string;
  ol_qualifications?: string;
  al_qualifications?: string;
  other_qualifications?: string;
  nic_document_url?: string;
  birth_certificate_url?: string;
  qualification_certificate_url?: string;
  payment_proof_url?: string;
  status: string;
  program_id?: string;
  faculty_id?: string;
  department_id?: string;
  intake_id?: string;
  programs?: {
    name: string;
  };
  student_programs?: Array<{
    id: string;
    program_id: string;
    enrollment_date: string;
    status: string;
    programs: {
      name: string;
    };
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

export function ManageStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterIntake, setFilterIntake] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Dropdown data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  
  // Create student form
  const [newStudent, setNewStudent] = useState({
    name_with_initials: '',
    nic: '',
    date_of_birth: '',
    permanent_address: '',
    mobile_number: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_mobile: '',
    ol_qualifications: '',
    al_qualifications: '',
    other_qualifications: '',
    program_id: '',
    faculty_id: '',
    department_id: '',
    status: 'active'
  });

  useEffect(() => {
    loadStudents();
    loadFaculties();
  }, []);

  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadDepartmentsByFaculty(filterFaculty);
    } else {
      setDepartments([]);
      setPrograms([]);
    }
  }, [filterFaculty]);

  useEffect(() => {
    if (filterDepartment !== 'all') {
      loadProgramsByDepartment(filterDepartment);
    } else {
      setPrograms([]);
      setIntakes([]);
    }
  }, [filterDepartment]);

  useEffect(() => {
    if (filterProgram !== 'all') {
      loadIntakesByProgram(filterProgram);
    } else {
      setIntakes([]);
    }
  }, [filterProgram]);

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

  const loadStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          programs (
            name
          ),
          student_programs (
            id,
            program_id,
            enrollment_date,
            status,
            programs (
              name
            )
          )
        `)
        .order('name_with_initials');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name_with_initials || !newStudent.nic || !newStudent.program_id) {
      alert('Please fill in required fields: Name, NIC, and Program');
      return;
    }

    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      
      // Create student
      const { error: studentError } = await supabaseAny
        .from('students')
        .insert({
          ...newStudent,
          id: crypto.randomUUID()
        })
        .select()
        .single();

      if (studentError) throw studentError;

      alert('Student created successfully!');
      setShowCreateModal(false);
      setNewStudent({
        name_with_initials: '',
        nic: '',
        date_of_birth: '',
        permanent_address: '',
        mobile_number: '',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_mobile: '',
        ol_qualifications: '',
        al_qualifications: '',
        other_qualifications: '',
        program_id: '',
        faculty_id: '',
        department_id: '',
        status: 'active'
      });
      loadStudents();
    } catch (error: any) {
      console.error('Error creating student:', error);
      alert('Failed to create student: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name_with_initials?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.mobile_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    const matchesFaculty = filterFaculty === 'all' || student.faculty_id === filterFaculty;
    const matchesDepartment = filterDepartment === 'all' || student.department_id === filterDepartment;
    const matchesProgram = filterProgram === 'all' || student.program_id === filterProgram;
    const matchesIntake = filterIntake === 'all' || student.intake_id === filterIntake;
    
    return matchesSearch && matchesStatus && matchesFaculty && matchesDepartment && matchesProgram && matchesIntake;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterProgram('all');
    setFilterIntake('all');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      suspended: 'bg-red-100 text-red-800 border-red-200',
      graduated: 'bg-blue-100 text-blue-800 border-blue-200',
      dropout: 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return styles[status as keyof typeof styles] || styles.inactive;
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
            <div className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'active').length}</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'graduated').length}</div>
            <div className="text-gray-600">Graduated</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'inactive').length}</div>
            <div className="text-gray-600">Inactive</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="text-2xl font-bold text-gray-900">{students.filter(s => s.status === 'dropout').length}</div>
            <div className="text-gray-600">Dropout</div>
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
                  placeholder="Search by name, NIC, or mobile number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.nic || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name_with_initials || 'N/A'}</div>
                        <div className="text-xs text-gray-500">DOB: {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{student.programs?.name || 'Not Assigned'}</div>
                        {student.student_programs && student.student_programs.length > 1 && (
                          <div className="text-xs text-emerald-600 mt-1">+{student.student_programs.length - 1} more enrollments</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} />
                            {student.mobile_number || 'N/A'}
                          </div>
                          {student.permanent_address && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 truncate max-w-xs">
                              <MapPin size={12} />
                              {student.permanent_address}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          {student.al_qualifications && <div>A/L: {student.al_qualifications}</div>}
                          {student.ol_qualifications && <div>O/L: {student.ol_qualifications}</div>}
                          {!student.al_qualifications && !student.ol_qualifications && 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(student.status)}`}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <FileText size={18} />
                          </button>
                          <button 
                            className="text-emerald-600 hover:text-emerald-800 transition-colors p-2 hover:bg-emerald-50 rounded"
                            title="Edit Student"
                          >
                            <Edit size={18} />
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
                        <h2 className="text-2xl font-bold text-white">Add New Student</h2>
                        <p className="text-emerald-100 text-sm mt-1">Fill in the student information below</p>
                      </div>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleCreateStudent} className="p-6 space-y-6">
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
                        value={newStudent.name_with_initials}
                        onChange={(e) => setNewStudent({...newStudent, name_with_initials: e.target.value})}
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={newStudent.date_of_birth}
                        onChange={(e) => setNewStudent({...newStudent, date_of_birth: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        value={newStudent.mobile_number}
                        onChange={(e) => setNewStudent({...newStudent, mobile_number: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., 0771234567"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Permanent Address</label>
                      <textarea
                        value={newStudent.permanent_address}
                        onChange={(e) => setNewStudent({...newStudent, permanent_address: e.target.value})}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                        placeholder="Enter full address"
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
                        value={newStudent.emergency_contact_name}
                        onChange={(e) => setNewStudent({...newStudent, emergency_contact_name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="e.g., R.M. Perera"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                      <input
                        type="text"
                        value={newStudent.emergency_contact_relationship}
                        onChange={(e) => setNewStudent({...newStudent, emergency_contact_relationship: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="e.g., Father"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Mobile</label>
                      <input
                        type="tel"
                        value={newStudent.emergency_contact_mobile}
                        onChange={(e) => setNewStudent({...newStudent, emergency_contact_mobile: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="e.g., 0771234567"
                      />
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
                        value={newStudent.ol_qualifications}
                        onChange={(e) => setNewStudent({...newStudent, ol_qualifications: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., 9 Passes including Mathematics & English"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">A/L Qualifications</label>
                      <input
                        type="text"
                        value={newStudent.al_qualifications}
                        onChange={(e) => setNewStudent({...newStudent, al_qualifications: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Commerce Stream - 3 Passes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Other Qualifications</label>
                      <input
                        type="text"
                        value={newStudent.other_qualifications}
                        onChange={(e) => setNewStudent({...newStudent, other_qualifications: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Diploma, Certificates"
                      />
                    </div>
                  </div>
                </div>

                {/* Program Enrollment Section */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <BookOpen className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Program Enrollment</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Faculty <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newStudent.faculty_id}
                        onChange={(e) => {
                          setNewStudent({...newStudent, faculty_id: e.target.value, department_id: '', program_id: ''});
                          loadDepartmentsByFaculty(e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                        value={newStudent.department_id}
                        onChange={(e) => {
                          setNewStudent({...newStudent, department_id: e.target.value, program_id: ''});
                          loadProgramsByDepartment(e.target.value);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!newStudent.faculty_id}
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Program <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newStudent.program_id}
                        onChange={(e) => setNewStudent({...newStudent, program_id: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!newStudent.department_id}
                        required
                      >
                        <option value="">Select Program</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
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
                        Creating Student...
                      </span>
                    ) : (
                      'Create Student'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
