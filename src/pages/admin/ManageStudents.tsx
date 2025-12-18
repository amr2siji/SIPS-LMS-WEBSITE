import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Edit, Phone, MapPin, FileText, X, GraduationCap, BookOpen, UserCheck, Upload, Eye, Mail, TrendingUp, Award } from 'lucide-react';
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
    full_name: '',
    name_with_initials: '',
    nic: '',
    date_of_birth: '',
    permanent_address: '',
    mobile_number: '',
    email: '',
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

  // For multiple program enrollments
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [selectedFaculties, setSelectedFaculties] = useState<string[]>([]);
  const [allAvailablePrograms, setAllAvailablePrograms] = useState<Program[]>([]);
  
  // Document uploads
  const [documents, setDocuments] = useState<{
    nic_document: File | null;
    birth_certificate: File | null;
    qualification_certificate: File | null;
    payment_slip: File | null;
  }>({
    nic_document: null,
    birth_certificate: null,
    qualification_certificate: null,
    payment_slip: null,
  });

  // View/Edit modals
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

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

  const handleFileChange = (documentType: keyof typeof documents, file: File | null) => {
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setDocuments({ ...documents, [documentType]: file });
    }
  };

  const uploadDocument = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev => {
      if (prev.includes(programId)) {
        return prev.filter(id => id !== programId);
      } else {
        return [...prev, programId];
      }
    });
  };

  const toggleFacultySelection = (facultyId: string) => {
    setSelectedFaculties(prev => {
      const newSelection = prev.includes(facultyId)
        ? prev.filter(id => id !== facultyId)
        : [...prev, facultyId];
      
      // Load programs from all selected faculties
      loadProgramsFromFaculties(newSelection);
      return newSelection;
    });
  };

  const loadProgramsFromFaculties = async (facultyIds: string[]) => {
    if (facultyIds.length === 0) {
      setAllAvailablePrograms([]);
      return;
    }

    try {
      const { data: allDepartments } = await supabase
        .from('departments')
        .select('id')
        .in('faculty_id', facultyIds)
        .eq('is_active', true);

      if (allDepartments && allDepartments.length > 0) {
        const departmentIds = allDepartments.map((d: { id: string }) => d.id);
        
        const { data: programsData } = await supabase
          .from('programs')
          .select('id, name, department_id')
          .in('department_id', departmentIds)
          .eq('is_active', true)
          .order('name');

        setAllAvailablePrograms(programsData || []);
      } else {
        setAllAvailablePrograms([]);
      }
    } catch (error) {
      console.error('Error loading programs from faculties:', error);
      setAllAvailablePrograms([]);
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name_with_initials || !newStudent.nic) {
      alert('Please fill in required fields: Name and NIC');
      return;
    }

    if (selectedPrograms.length === 0) {
      alert('Please select at least one program');
      return;
    }

    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      
      // Upload all documents
      const nic_document_url = documents.nic_document 
        ? await uploadDocument(documents.nic_document, 'nic-documents')
        : null;

      const birth_certificate_url = documents.birth_certificate
        ? await uploadDocument(documents.birth_certificate, 'birth-certificates')
        : null;

      const qualification_certificate_url = documents.qualification_certificate
        ? await uploadDocument(documents.qualification_certificate, 'qualification-certificates')
        : null;

      const payment_proof_url = documents.payment_slip
        ? await uploadDocument(documents.payment_slip, 'payment-proofs')
        : null;
      
      const studentId = crypto.randomUUID();
      
      // Create student with document URLs
      const { error: studentError } = await supabaseAny
        .from('students')
        .insert({
          ...newStudent,
          id: studentId,
          program_id: selectedPrograms[0], // Set primary program
          nic_document_url,
          birth_certificate_url,
          qualification_certificate_url,
          payment_proof_url
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Enroll student in all selected programs
      const enrollments = selectedPrograms.map(programId => ({
        id: crypto.randomUUID(),
        student_id: studentId,
        program_id: programId,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active'
      }));

      const { error: enrollmentError } = await supabaseAny
        .from('student_programs')
        .insert(enrollments);

      if (enrollmentError) throw enrollmentError;

      alert('Student created successfully!');
      setShowCreateModal(false);
      setNewStudent({
        full_name: '',
        name_with_initials: '',
        nic: '',
        date_of_birth: '',
        permanent_address: '',
        mobile_number: '',
        email: '',
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
      setSelectedPrograms([]);
      setDocuments({
        nic_document: null,
        birth_certificate: null,
        qualification_certificate: null,
        payment_slip: null,
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
                            onClick={() => handleViewStudent(student)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEditStudent(student)}
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
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newStudent.full_name}
                        onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., Kumara Mahinda Silva Perera"
                        required
                      />
                    </div>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newStudent.mobile_number}
                        onChange={(e) => setNewStudent({...newStudent, mobile_number: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="e.g., 0771234567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Permanent Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={newStudent.permanent_address}
                        onChange={(e) => setNewStudent({...newStudent, permanent_address: e.target.value})}
                        rows={3}
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
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Program Enrollment</h3>
                      <p className="text-sm text-gray-600">Select faculties and programs (multiple selection allowed)</p>
                    </div>
                  </div>
                  
                  {/* Faculty Selection */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Faculties <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Select at least one)</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-3 bg-white rounded-lg border border-gray-200">
                      {faculties.map(faculty => (
                        <label
                          key={faculty.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            selectedFaculties.includes(faculty.id)
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFaculties.includes(faculty.id)}
                            onChange={() => toggleFacultySelection(faculty.id)}
                            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                          />
                          <span className="text-sm font-medium text-gray-900">{faculty.name}</span>
                        </label>
                      ))}
                    </div>
                    {selectedFaculties.length > 0 && (
                      <p className="text-sm text-purple-600 mt-2">
                        {selectedFaculties.length} faculty/faculties selected
                      </p>
                    )}
                  </div>

                  {/* Student Status */}
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Student Status
                    </label>
                    <select
                      value={newStudent.status}
                      onChange={(e) => setNewStudent({...newStudent, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  
                  {/* Available Programs List */}
                  {allAvailablePrograms.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Select Programs <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Select at least one)</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 bg-white rounded-lg border border-gray-200">
                        {allAvailablePrograms.map(program => (
                          <label
                            key={program.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedPrograms.includes(program.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPrograms.includes(program.id)}
                              onChange={() => toggleProgramSelection(program.id)}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-900">{program.name}</span>
                          </label>
                        ))}
                      </div>
                      {selectedPrograms.length > 0 && (
                        <p className="text-sm text-purple-600 mt-2">
                          {selectedPrograms.length} program{selectedPrograms.length > 1 ? 's' : ''} selected
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedFaculties.length > 0 && allAvailablePrograms.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <BookOpen className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-gray-600">No programs available in selected faculties</p>
                    </div>
                  )}
                </div>

                {/* Document Uploads Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                      <Upload className="text-white" size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Document Uploads</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        NIC Document
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-white">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('nic_document', e.target.files?.[0] || null)}
                          className="hidden"
                          id="nic-document"
                        />
                        <label htmlFor="nic-document" className="cursor-pointer">
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600 mb-1 font-medium">
                            {documents.nic_document ? documents.nic_document.name : 'Click to upload NIC'}
                          </p>
                          <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 50MB)</p>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Birth Certificate
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-white">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('birth_certificate', e.target.files?.[0] || null)}
                          className="hidden"
                          id="birth-certificate"
                        />
                        <label htmlFor="birth-certificate" className="cursor-pointer">
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600 mb-1 font-medium">
                            {documents.birth_certificate ? documents.birth_certificate.name : 'Click to upload certificate'}
                          </p>
                          <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 50MB)</p>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Qualification Certificates
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-white">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('qualification_certificate', e.target.files?.[0] || null)}
                          className="hidden"
                          id="qualification-certificate"
                        />
                        <label htmlFor="qualification-certificate" className="cursor-pointer">
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600 mb-1 font-medium">
                            {documents.qualification_certificate ? documents.qualification_certificate.name : 'Click to upload certificates'}
                          </p>
                          <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 50MB)</p>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Payment Slip
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-white">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange('payment_slip', e.target.files?.[0] || null)}
                          className="hidden"
                          id="payment-slip"
                        />
                        <label htmlFor="payment-slip" className="cursor-pointer">
                          <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-600 mb-1 font-medium">
                            {documents.payment_slip ? documents.payment_slip.name : 'Click to upload payment slip'}
                          </p>
                          <p className="text-xs text-gray-400">PDF, JPG, PNG (Max 50MB)</p>
                        </label>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    * All documents are optional but recommended for complete student records
                  </p>
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

        {/* View Student Details Modal */}
        {showViewModal && selectedStudent && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setShowViewModal(false)}></div>
            
            <div className="fixed inset-0 z-[70] overflow-y-auto">
              <div className="flex min-h-full items-start justify-center p-4 pt-10 pb-20">
                <div className="bg-white rounded-2xl max-w-6xl w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Student Details</h2>
                        <p className="text-blue-100 text-sm mt-1">Complete student information</p>
                      </div>
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-2 mb-4">
                          <UserCheck className="text-emerald-600" size={24} />
                          <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Name with Initials</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.name_with_initials || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">NIC</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.nic || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Date of Birth</p>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(selectedStudent.status)}`}>
                              {selectedStudent.status.charAt(0).toUpperCase() + selectedStudent.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Mail className="text-blue-600" size={24} />
                          <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Mobile Number</p>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <Phone size={14} />
                              {selectedStudent.mobile_number || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                            <div className="flex items-start gap-2 text-sm font-medium text-gray-900">
                              <MapPin size={14} className="mt-1 flex-shrink-0" />
                              <span>{selectedStudent.permanent_address || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                        <div className="flex items-center gap-2 mb-4">
                          <Phone className="text-amber-600" size={24} />
                          <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Contact Name</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.emergency_contact_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Relationship</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.emergency_contact_relationship || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Mobile Number</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.emergency_contact_mobile || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Educational Qualifications */}
                      <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                        <div className="flex items-center gap-2 mb-4">
                          <GraduationCap className="text-purple-600" size={24} />
                          <h3 className="text-lg font-bold text-gray-900">Qualifications</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">O/L Results</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.ol_qualifications || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">A/L Results</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.al_qualifications || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Other Qualifications</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.other_qualifications || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Overall Academic Performance */}
                      <div className="md:col-span-2 bg-gradient-to-br from-rose-50 to-orange-50 p-6 rounded-xl border-2 border-rose-200 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <Award className="text-rose-600" size={28} />
                            <h3 className="text-xl font-bold text-gray-900">Overall Academic Performance</h3>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
                            <TrendingUp className="text-green-600" size={20} />
                            <span className="text-sm font-semibold text-gray-600">Semester 2 - 2024</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          {/* GPA Card */}
                          <div className="bg-white p-5 rounded-xl border-2 border-rose-300 shadow-md hover:shadow-xl transition-shadow">
                            <div className="flex flex-col items-center">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Overall GPA</p>
                              <div className="text-4xl font-black text-rose-600 mb-1">3.67</div>
                              <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                                <TrendingUp size={14} />
                                <span>+0.15</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Out of 4.00</p>
                            </div>
                          </div>

                          {/* Credits Earned */}
                          <div className="bg-white p-5 rounded-xl border-2 border-blue-300 shadow-md hover:shadow-xl transition-shadow">
                            <div className="flex flex-col items-center">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Credits Earned</p>
                              <div className="text-4xl font-black text-blue-600 mb-1">78</div>
                              <div className="flex items-center gap-1 text-xs text-gray-600 font-semibold">
                                <span>/ 120 Total</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">65% Complete</p>
                            </div>
                          </div>

                          {/* Attendance Rate */}
                          <div className="bg-white p-5 rounded-xl border-2 border-emerald-300 shadow-md hover:shadow-xl transition-shadow">
                            <div className="flex flex-col items-center">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Attendance</p>
                              <div className="text-4xl font-black text-emerald-600 mb-1">92%</div>
                              <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                <TrendingUp size={14} />
                                <span>Excellent</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">This Semester</p>
                            </div>
                          </div>

                          {/* Academic Standing */}
                          <div className="bg-white p-5 rounded-xl border-2 border-amber-300 shadow-md hover:shadow-xl transition-shadow">
                            <div className="flex flex-col items-center">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Standing</p>
                              <div className="text-2xl font-black text-amber-600 mb-1">Dean's List</div>
                              <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                                <Award size={14} />
                                <span>Honor Roll</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">3 Semesters</p>
                            </div>
                          </div>
                        </div>

                        {/* Course Performance Breakdown */}
                        <div className="bg-white p-6 rounded-xl border border-rose-200">
                          <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Recent Course Performance</h4>
                          <div className="space-y-3">
                            {/* Course 1 */}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-white rounded-lg border border-emerald-200">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Advanced Database Systems</p>
                                <p className="text-xs text-gray-500">CS401 - 4 Credits</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Score</p>
                                  <p className="text-sm font-bold text-gray-900">87%</p>
                                </div>
                                <div className="px-4 py-2 bg-emerald-100 rounded-lg">
                                  <p className="text-lg font-black text-emerald-700">A</p>
                                </div>
                              </div>
                            </div>

                            {/* Course 2 */}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Software Engineering Principles</p>
                                <p className="text-xs text-gray-500">CS402 - 3 Credits</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Score</p>
                                  <p className="text-sm font-bold text-gray-900">91%</p>
                                </div>
                                <div className="px-4 py-2 bg-blue-100 rounded-lg">
                                  <p className="text-lg font-black text-blue-700">A</p>
                                </div>
                              </div>
                            </div>

                            {/* Course 3 */}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-200">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Machine Learning Fundamentals</p>
                                <p className="text-xs text-gray-500">CS403 - 4 Credits</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Score</p>
                                  <p className="text-sm font-bold text-gray-900">83%</p>
                                </div>
                                <div className="px-4 py-2 bg-purple-100 rounded-lg">
                                  <p className="text-lg font-black text-purple-700">A-</p>
                                </div>
                              </div>
                            </div>

                            {/* Course 4 */}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-white rounded-lg border border-amber-200">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Web Technologies & Applications</p>
                                <p className="text-xs text-gray-500">CS404 - 3 Credits</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Score</p>
                                  <p className="text-sm font-bold text-gray-900">94%</p>
                                </div>
                                <div className="px-4 py-2 bg-amber-100 rounded-lg">
                                  <p className="text-lg font-black text-amber-700">A+</p>
                                </div>
                              </div>
                            </div>

                            {/* Course 5 */}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-rose-50 to-white rounded-lg border border-rose-200">
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">Data Structures & Algorithms</p>
                                <p className="text-xs text-gray-500">CS405 - 4 Credits</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Score</p>
                                  <p className="text-sm font-bold text-gray-900">78%</p>
                                </div>
                                <div className="px-4 py-2 bg-rose-100 rounded-lg">
                                  <p className="text-lg font-black text-rose-700">B+</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Program Enrollment */}
                      <div className="md:col-span-2 bg-indigo-50 p-6 rounded-xl border border-indigo-200">
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen className="text-indigo-600" size={24} />
                          <h3 className="text-lg font-bold text-gray-900">Program Enrollment</h3>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Primary Program</p>
                            <p className="text-sm font-medium text-gray-900">{selectedStudent.programs?.name || 'Not Assigned'}</p>
                          </div>
                          {selectedStudent.student_programs && selectedStudent.student_programs.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">All Enrolled Programs</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedStudent.student_programs.map((enrollment) => (
                                  <div key={enrollment.id} className="bg-white p-3 rounded-lg border border-indigo-200">
                                    <p className="text-sm font-medium text-gray-900">{enrollment.programs.name}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                      <p className="text-xs text-gray-600">
                                        Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                                      </p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        enrollment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {enrollment.status}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Documents */}
                      <div className="md:col-span-2 bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="text-gray-600" size={24} />
                          <h3 className="text-lg font-bold text-gray-900">Uploaded Documents</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <a
                            href={selectedStudent.nic_document_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              selectedStudent.nic_document_url
                                ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 cursor-pointer'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          >
                            <FileText className={`mx-auto mb-2 ${selectedStudent.nic_document_url ? 'text-emerald-600' : 'text-gray-400'}`} size={24} />
                            <p className="text-xs font-medium text-gray-700">NIC</p>
                            <p className="text-xs text-gray-500">{selectedStudent.nic_document_url ? 'View' : 'Not uploaded'}</p>
                          </a>
                          <a
                            href={selectedStudent.birth_certificate_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              selectedStudent.birth_certificate_url
                                ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 cursor-pointer'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          >
                            <FileText className={`mx-auto mb-2 ${selectedStudent.birth_certificate_url ? 'text-blue-600' : 'text-gray-400'}`} size={24} />
                            <p className="text-xs font-medium text-gray-700">Birth Cert.</p>
                            <p className="text-xs text-gray-500">{selectedStudent.birth_certificate_url ? 'View' : 'Not uploaded'}</p>
                          </a>
                          <a
                            href={selectedStudent.qualification_certificate_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              selectedStudent.qualification_certificate_url
                                ? 'border-purple-300 bg-purple-50 hover:bg-purple-100 cursor-pointer'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          >
                            <FileText className={`mx-auto mb-2 ${selectedStudent.qualification_certificate_url ? 'text-purple-600' : 'text-gray-400'}`} size={24} />
                            <p className="text-xs font-medium text-gray-700">Qualifications</p>
                            <p className="text-xs text-gray-500">{selectedStudent.qualification_certificate_url ? 'View' : 'Not uploaded'}</p>
                          </a>
                          <a
                            href={selectedStudent.payment_proof_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-4 rounded-lg border-2 text-center transition-all ${
                              selectedStudent.payment_proof_url
                                ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 cursor-pointer'
                                : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                            }`}
                          >
                            <FileText className={`mx-auto mb-2 ${selectedStudent.payment_proof_url ? 'text-amber-600' : 'text-gray-400'}`} size={24} />
                            <p className="text-xs font-medium text-gray-700">Payment</p>
                            <p className="text-xs text-gray-500">{selectedStudent.payment_proof_url ? 'View' : 'Not uploaded'}</p>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowViewModal(false);
                          handleEditStudent(selectedStudent);
                        }}
                        className="flex-1 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <Edit size={20} />
                        Edit Student
                      </button>
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Student Modal */}
        {showEditModal && selectedStudent && (
          <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setShowEditModal(false)}></div>
            
            <div className="fixed inset-0 z-[70] overflow-y-auto">
              <div className="flex min-h-full items-start justify-center p-4 pt-10 pb-20">
                <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                  {/* Modal Header */}
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Edit Student</h2>
                        <p className="text-emerald-100 text-sm mt-1">Update student information</p>
                      </div>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="text-center py-12">
                      <Edit className="mx-auto text-gray-400 mb-4" size={64} />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Edit Functionality</h3>
                      <p className="text-gray-600 mb-4">
                        Student editing functionality will be implemented here.
                      </p>
                      <p className="text-sm text-gray-500">
                        Student ID: {selectedStudent.id}
                      </p>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold text-gray-700 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
