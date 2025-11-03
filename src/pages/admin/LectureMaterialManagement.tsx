import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit2, Trash2, X, FileText, Download, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LectureMaterial {
  id: string;
  title: string;
  week_number: number;
  course_id: string;
  file_type: 'ppt' | 'word' | 'pdf' | 'excel';
  file_url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  courses?: { 
    name: string;
    code: string;
    program_id?: string;
    programs?: {
      name: string;
      departments?: {
        id?: string;
        name: string;
        faculties?: {
          id?: string;
          name: string;
        };
      };
    };
  };
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
  name: string;
  intake_name?: string;
  intake_year?: number;
  intake_month?: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export function LectureMaterialManagement() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<LectureMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LectureMaterial | null>(null);
  const [processing, setProcessing] = useState(false);

  // Filter states
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterIntake, setFilterIntake] = useState('all');
  const [filterModule, setfilterModule] = useState('all');
  const [filterWeek, setFilterWeek] = useState('all');
  const [filterFileType, setFilterFileType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Dropdown data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    week_number: 1,
    program_id_temp: '', // Temporary for form selection only
    intake_id_temp: '', // Temporary for form selection only
    course_id: '',
    file_type: 'pdf' as 'ppt' | 'word' | 'pdf' | 'excel',
    file_url: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    loadMaterials();
    loadFaculties();
    loadIntakes();
    loadAllPrograms();
  }, []);

  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadDepartmentsByFaculty(filterFaculty);
    } else {
      setDepartments([]);
      setPrograms([]);
      setCourses([]);
    }
  }, [filterFaculty]);

  useEffect(() => {
    if (filterDepartment !== 'all') {
      loadProgramsByDepartment(filterDepartment);
    } else {
      setPrograms([]);
      setCourses([]);
    }
  }, [filterDepartment]);

  useEffect(() => {
    if (filterProgram !== 'all' && filterIntake !== 'all') {
      loadCoursesByProgramAndIntake(filterProgram, filterIntake);
    } else {
      setCourses([]);
    }
  }, [filterProgram, filterIntake]);

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

  const loadAllPrograms = async () => {
    try {
      const { data } = await supabase
        .from('programs')
        .select('id, name, department_id')
        .eq('is_active', true)
        .order('name');
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadIntakes = async () => {
    try {
      const { data } = await supabase
        .from('intakes')
        .select('id, intake_name, intake_year, intake_month')
        .order('intake_year', { ascending: false })
        .order('intake_month', { ascending: false });
      
      // Map to include 'name' property for backward compatibility
      const mappedData = (data || []).map((intake: any) => ({
        ...intake,
        name: intake.intake_name
      }));
      
      setIntakes(mappedData);
    } catch (error) {
      console.error('Error loading intakes:', error);
    }
  };

  const loadCoursesByProgramAndIntake = async (programId: string, _intakeId?: string) => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('code');
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lecture_materials')
        .select(`
          *,
          courses (
            name,
            code,
            program_id,
            programs (
              name,
              departments (
                name,
                faculties (
                  name
                )
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const supabaseAny = supabase as any;

      if (editingMaterial) {
        // Update existing material
        const { error } = await supabaseAny
          .from('lecture_materials')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingMaterial.id);

        if (error) throw error;
        alert('Lecture material updated successfully!');
      } else {
        // Create new material
        const { error } = await supabaseAny
          .from('lecture_materials')
          .insert(formData);

        if (error) throw error;
        alert('Lecture material created successfully!');
      }

      setShowModal(false);
      setEditingMaterial(null);
      resetForm();
      loadMaterials();
    } catch (error: any) {
      console.error('Error saving material:', error);
      alert('Failed to save material: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleEdit = (material: LectureMaterial) => {
    setEditingMaterial(material);
    
    // Get program_id from the nested courses relationship
    const programId = material.courses?.program_id || '';
    
    setFormData({
      title: material.title,
      week_number: material.week_number,
      program_id_temp: programId,
      intake_id_temp: '', // Not available in courses table
      course_id: material.course_id,
      file_type: material.file_type,
      file_url: material.file_url,
      description: material.description || '',
      is_active: material.is_active,
    });
    
    // Load related dropdowns
    const departmentId = material.courses?.programs?.departments?.id;
    const facultyId = material.courses?.programs?.departments?.faculties?.id;
    
    if (facultyId) {
      setFilterFaculty(facultyId);
      loadDepartmentsByFaculty(facultyId);
    }
    if (departmentId) {
      setFilterDepartment(departmentId);
      loadProgramsByDepartment(departmentId);
    }
    if (programId) {
      loadCoursesByProgramAndIntake(programId, ''); // Empty string for intake since not used
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lecture material?')) {
      return;
    }

    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('lecture_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Lecture material deleted successfully!');
      loadMaterials();
    } catch (error: any) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleStatus = async (material: LectureMaterial) => {
    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('lecture_materials')
        .update({
          is_active: !material.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', material.id);

      if (error) throw error;
      loadMaterials();
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      week_number: 1,
      program_id_temp: '',
      intake_id_temp: '',
      course_id: '',
      file_type: 'pdf',
      file_url: '',
      description: '',
      is_active: true,
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterProgram('all');
    setFilterIntake('all');
    setfilterModule('all');
    setFilterWeek('all');
    setFilterFileType('all');
    setFilterStatus('all');
  };

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.courses?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.courses?.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Get faculty, department, and program from nested course data
    const materialProgramId = material.courses?.program_id;
    const materialFacultyId = material.courses?.programs?.departments?.faculties?.id;
    const materialDepartmentId = material.courses?.programs?.departments?.id;
    
    const matchesFaculty = filterFaculty === 'all' || materialFacultyId === filterFaculty;
    const matchesDepartment = filterDepartment === 'all' || materialDepartmentId === filterDepartment;
    const matchesProgram = filterProgram === 'all' || materialProgramId === filterProgram;
    const matchesModule = filterModule === 'all' || material.course_id === filterModule;
    const matchesWeek = filterWeek === 'all' || material.week_number === parseInt(filterWeek);
    const matchesFileType = filterFileType === 'all' || material.file_type === filterFileType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && material.is_active) ||
      (filterStatus === 'inactive' && !material.is_active);
    
    // Note: Intake filter removed as courses table doesn't have intake_id
    const matchesIntake = filterIntake === 'all'; // Always true, keep filter UI but don't filter by it
    
    return matchesSearch && matchesFaculty && matchesDepartment && matchesProgram && 
           matchesIntake && matchesModule && matchesWeek && matchesFileType && matchesStatus;
  });

  const getFileTypeIcon = (fileType: string) => {
    const icons: any = {
      pdf: '📄',
      ppt: '📊',
      word: '📝',
      excel: '📈',
    };
    return icons[fileType] || '📎';
  };

  const getFileTypeBadge = (fileType: string) => {
    const styles: any = {
      pdf: 'bg-red-100 text-red-800 border-red-200',
      ppt: 'bg-orange-100 text-orange-800 border-orange-200',
      word: 'bg-blue-100 text-blue-800 border-blue-200',
      excel: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[fileType] || 'bg-gray-100 text-gray-800 border-gray-200';
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
              <h1 className="text-3xl font-bold">Lecture Material Management</h1>
              <p className="text-emerald-100 mt-1">Upload and manage course materials week-wise</p>
            </div>
            <button
              onClick={() => {
                setEditingMaterial(null);
                resetForm();
                setShowModal(true);
              }}
              className="bg-white text-emerald-700 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-2 font-semibold"
            >
              <Plus size={20} />
              Add Material
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{materials.length}</div>
                <div className="text-gray-600">Total Materials</div>
              </div>
              <FileText className="text-emerald-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{materials.filter(m => m.is_active).length}</div>
                <div className="text-gray-600">Active</div>
              </div>
              <Eye className="text-blue-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-gray-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{materials.filter(m => !m.is_active).length}</div>
                <div className="text-gray-600">Inactive</div>
              </div>
              <EyeOff className="text-gray-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{new Set(materials.map(m => m.course_id)).size}</div>
                <div className="text-gray-600">Modules</div>
              </div>
              <FileText className="text-purple-500" size={40} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by title, module name, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={filterFaculty}
              onChange={(e) => {
                setFilterFaculty(e.target.value);
                setFilterDepartment('all');
                setFilterProgram('all');
                setfilterModule('all');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                setfilterModule('all');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                setfilterModule('all');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={filterDepartment === 'all'}
            >
              <option value="all">All Programs</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <select
              value={filterIntake}
              onChange={(e) => {
                setFilterIntake(e.target.value);
                setfilterModule('all');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Intakes</option>
              {intakes.map(i => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthName = i.intake_month ? monthNames[i.intake_month - 1] : '';
                const displayText = i.intake_year && i.intake_month 
                  ? `${i.intake_name} (${monthName} ${i.intake_year})`
                  : i.name;
                return (
                  <option key={i.id} value={i.id}>{displayText}</option>
                );
              })}
            </select>

            <select
              value={filterModule}
              onChange={(e) => setfilterModule(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={filterProgram === 'all' || filterIntake === 'all'}
            >
              <option value="all">All courses</option>
              {courses.map(m => (
                <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
              ))}
            </select>

            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Weeks</option>
              {[...Array(15)].map((_, i) => (
                <option key={i + 1} value={i + 1}>Week {i + 1}</option>
              ))}
            </select>

            <select
              value={filterFileType}
              onChange={(e) => setFilterFileType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All File Types</option>
              <option value="pdf">PDF</option>
              <option value="ppt">PowerPoint</option>
              <option value="word">Word</option>
              <option value="excel">Excel</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <X size={18} />
              Reset Filters
            </button>
          </div>
        </div>

        {/* Materials List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              <p className="mt-4 text-gray-600">Loading materials...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No lecture materials found</p>
            </div>
          ) : (
            filteredMaterials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getFileTypeIcon(material.file_type)}</span>
                          <h3 className="text-lg font-bold text-gray-900">{material.title}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getFileTypeBadge(material.file_type)}`}>
                            {material.file_type.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                            material.is_active 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {material.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </div>
                        <p className="text-sm text-emerald-600 font-semibold">
                          {material.courses?.code} - {material.courses?.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Week:</span> {material.week_number}
                      </div>
                      <div>
                        <span className="font-semibold">Faculty:</span> {material.courses?.programs?.departments?.faculties?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Department:</span> {material.courses?.programs?.departments?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Program:</span> {material.courses?.programs?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Uploaded:</span> {new Date(material.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {material.description && (
                      <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {material.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => window.open(material.file_url, '_blank')}
                      className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Download size={18} />
                      Download
                    </button>
                    <button
                      onClick={() => handleEdit(material)}
                      disabled={processing}
                      className="flex-1 lg:flex-none bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(material)}
                      disabled={processing}
                      className={`flex-1 lg:flex-none ${
                        material.is_active 
                          ? 'bg-gray-600 hover:bg-gray-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      } disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2`}
                    >
                      {material.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                      {material.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      disabled={processing}
                      className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingMaterial ? 'Edit Lecture Material' : 'Add Lecture Material'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingMaterial(null);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Introduction to Programming"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Week Number *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="15"
                        value={formData.week_number}
                        onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        File Type *
                      </label>
                      <select
                        required
                        value={formData.file_type}
                        onChange={(e) => setFormData({ ...formData, file_type: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="pdf">PDF</option>
                        <option value="ppt">PowerPoint</option>
                        <option value="word">Word Document</option>
                        <option value="excel">Excel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Program *
                    </label>
                    <select
                      required
                      value={formData.program_id_temp}
                      onChange={(e) => {
                        setFormData({ ...formData, program_id_temp: e.target.value, course_id: '' });
                        if (formData.intake_id_temp) {
                          loadCoursesByProgramAndIntake(e.target.value, formData.intake_id_temp);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Program</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Intake (Month & Year) *
                    </label>
                    <select
                      required
                      value={formData.intake_id_temp}
                      onChange={(e) => {
                        setFormData({ ...formData, intake_id_temp: e.target.value, course_id: '' });
                        if (formData.program_id_temp) {
                          loadCoursesByProgramAndIntake(formData.program_id_temp, e.target.value);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Select Intake</option>
                      {intakes.map(i => {
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthName = i.intake_month ? monthNames[i.intake_month - 1] : '';
                        const displayText = i.intake_year && i.intake_month 
                          ? `${i.intake_name} (${monthName} ${i.intake_year})`
                          : i.name;
                        return (
                          <option key={i.id} value={i.id}>{displayText}</option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Module *
                    </label>
                    <select
                      required
                      value={formData.course_id}
                      onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={!formData.program_id_temp || !formData.intake_id_temp}
                    >
                      <option value="">Select Module</option>
                      {courses.map(m => (
                        <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      File URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="https://example.com/lecture.pdf"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Brief description of the material..."
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">
                      Active (visible to students)
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingMaterial(null);
                        resetForm();
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 font-semibold"
                    >
                      {processing ? 'Saving...' : editingMaterial ? 'Update Material' : 'Add Material'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
