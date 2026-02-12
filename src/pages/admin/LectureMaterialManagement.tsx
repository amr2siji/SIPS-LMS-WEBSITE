import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Edit2, Trash2, X, FileText, Download, Eye, EyeOff, Upload as UploadIcon, File, Loader } from 'lucide-react';
import { uploadLectureMaterialFile, validateFile } from '../../services/fileUploadService';
import { adminService } from '../../services/adminService';
import { intakeModuleService } from '../../services/intakeModuleService';

interface LectureMaterial {
  id: string;
  title: string;
  week_number: number;
  module_id: string;
  file_type: 'ppt' | 'word' | 'pdf' | 'excel';
  file_url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  modules?: { 
    module_name: string;
    module_code: string;
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

  // Form-specific dropdown data (simplified - only intakes and courses needed)
  const [formIntakes, setFormIntakes] = useState<Intake[]>([]);
  const [formCourses, setFormCourses] = useState<Course[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    week_number: 1,
    // Removed: faculty_id_temp, department_id_temp, program_id_temp - use intake-based selection
    intake_id_temp: '', // Temporary for form selection only
    module_id: '',
    file_type: 'pdf' as 'ppt' | 'word' | 'pdf' | 'excel',
    file_url: '',
    description: '',
    is_active: true,
  });
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMaterials();
    loadFaculties();
    loadIntakes();
    loadAllPrograms();
    loadAllIntakes(); // Load all intakes for form
  }, []);

  // When intake is selected, load modules for that intake
  useEffect(() => {
    if (formData.intake_id_temp && formData.intake_id_temp !== '') {
      loadModulesForIntake(Number(formData.intake_id_temp));
    } else {
      setFormCourses([]);
    }
  }, [formData.intake_id_temp]);

  // Filter dropdowns
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
      const result = await adminService.getFaculties();
      if (result.success && result.data) {
        setFaculties(result.data);
      }
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadDepartmentsByFaculty = async (facultyId: string) => {
    try {
      const result = await adminService.getDepartmentsByFaculty(Number(facultyId));
      if (result.success && result.data) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadProgramsByDepartment = async (departmentId: string) => {
    try {
      const result = await adminService.getProgramsByDepartment(Number(departmentId));
      if (result.success && result.data) {
        setPrograms(result.data);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadAllPrograms = async () => {
    try {
      // Load all programs - this might need a dedicated backend endpoint
      const result = await adminService.getFaculties();
      if (result.success && result.data) {
        // For now, we'll load programs when a faculty is selected
        // TODO: Add getAllPrograms() endpoint to backend
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadIntakes = async () => {
    try {
      if (filterProgram) {
        const result = await adminService.getIntakesByProgram(Number(filterProgram));
        if (result.success && result.data) {
          // Map to include 'name' property for backward compatibility
          const mappedData = result.data.map((intake: any) => ({
            ...intake,
            name: intake.intake_name || intake.name
          }));
          setIntakes(mappedData);
        }
      }
    } catch (error) {
      console.error('Error loading intakes:', error);
    }
  };

  const loadCoursesByProgramAndIntake = async (programId: string, intakeId?: string) => {
    try {
      const result = await adminService.getModulesByProgramAndIntake(
        Number(programId),
        intakeId ? Number(intakeId) : 0
      );
      if (result.success && result.data) {
        setCourses(result.data);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  // Form-specific load functions
  // Load all intakes for form dropdown (no cascading needed)
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
        console.log('Raw intake API response for lecture materials:', result);
        if (result.data && Array.isArray(result.data)) {
          const mappedIntakes = result.data.map((intake: any) => ({
            id: intake.id,
            name: `${intake.intakeName} - ${intake.programName} (${intake.facultyName})`,
            intake_name: intake.intakeName,
            intake_year: intake.intakeYear,
            intake_month: intake.intakeMonth
          }));
          console.log('Mapped intakes for lecture material creation:', mappedIntakes);
          setFormIntakes(mappedIntakes);
        }
      }
    } catch (error) {
      console.error('Error loading all intakes:', error);
      setFormIntakes([]);
    }
  };

  // Load modules for selected intake using intakeModuleService
  const loadModulesForIntake = async (intakeId: number) => {
    try {
      console.log('Loading modules for intake ID:', intakeId);
      const response = await intakeModuleService.getModulesByIntake(intakeId);
      console.log('Modules response from intakeModuleService:', response);
      if (response && response.success && response.data) {
        const mappedModules = response.data.map((im: any) => ({
          id: im.moduleId,
          name: im.moduleName,
          code: im.moduleCode
        }));
        console.log('Mapped modules for lecture material creation:', mappedModules);
        setFormCourses(mappedModules);
      } else {
        console.warn('No modules found for intake:', intakeId);
        setFormCourses([]);
      }
    } catch (error) {
      console.error('Error loading modules for intake:', error);
      setFormCourses([]);
    }
  };

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const result = await adminService.getLectureMaterials(0, 100);
      
      if (result.success && result.data) {
        setMaterials(result.data);
      }
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Validate file using the service
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return null;
      }

      // Upload file to backend
      const result = await uploadLectureMaterialFile(file);
      
      if (!result.success) {
        alert(result.message || 'Failed to upload file');
        return null;
      }

      // Auto-detect file type from extension
      const fileExt = file.name.split('.').pop();
      let detectedFileType: 'ppt' | 'word' | 'pdf' | 'excel' = 'pdf';
      if (fileExt) {
        const ext = fileExt.toLowerCase();
        if (ext === 'ppt' || ext === 'pptx') detectedFileType = 'ppt';
        else if (ext === 'doc' || ext === 'docx') detectedFileType = 'word';
        else if (ext === 'xls' || ext === 'xlsx') detectedFileType = 'excel';
        else if (ext === 'pdf') detectedFileType = 'pdf';
      }
      
      setFormData(prev => ({ ...prev, file_type: detectedFileType }));

      return result.fileUrl || null;
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMaterialFile(file);
      const fileUrl = await handleFileUpload(file);
      if (fileUrl) {
        setFormData(prev => ({ ...prev, file_url: fileUrl }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Prepare data excluding temporary fields (only intake_id_temp now)
      const { intake_id_temp, ...dbData } = formData;

      if (editingMaterial) {
        // Update existing material
        const result = await adminService.updateLectureMaterial(Number(editingMaterial.id), {
          ...dbData,
          updated_at: new Date().toISOString(),
        });

        if (!result.success) {
          throw new Error(result.message || 'Failed to update material');
        }
        alert('Lecture material updated successfully!');
      } else {
        // Create new material
        const result = await adminService.createLectureMaterial(dbData);

        if (!result.success) {
          throw new Error(result.message || 'Failed to create material');
        }
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
    
    // For editing, user will need to select intake again (simplified approach)
    // We can't easily determine which intake the module belongs to from the material
    setFormData({
      title: material.title,
      week_number: material.week_number,
      // Removed: faculty_id_temp, department_id_temp, program_id_temp
      intake_id_temp: '', // User will select intake again
      module_id: material.module_id,
      file_type: material.file_type,
      file_url: material.file_url,
      description: material.description || '',
      is_active: material.is_active,
    });
    
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lecture material?')) {
      return;
    }

    setProcessing(true);
    try {
      const result = await adminService.deleteLectureMaterial(Number(id));

      if (!result.success) {
        throw new Error(result.message || 'Failed to delete material');
      }
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
      const result = await adminService.toggleLectureMaterialPublishStatus(Number(material.id));

      if (!result.success) {
        throw new Error(result.message || 'Failed to update status');
      }
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
      // Removed: faculty_id_temp, department_id_temp, program_id_temp
      intake_id_temp: '',
      module_id: '',
      file_type: 'pdf',
      file_url: '',
      description: '',
      is_active: true,
    });
    setFormCourses([]); // Clear modules when resetting
    setMaterialFile(null);
    setUploading(false);
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
      material.modules?.module_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.modules?.module_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Get faculty, department, and program from nested module data
    const materialProgramId = material.modules?.program_id;
    const materialFacultyId = material.modules?.programs?.departments?.faculties?.id;
    const materialDepartmentId = material.modules?.programs?.departments?.id;
    
    const matchesFaculty = filterFaculty === 'all' || materialFacultyId === filterFaculty;
    const matchesDepartment = filterDepartment === 'all' || materialDepartmentId === filterDepartment;
    const matchesProgram = filterProgram === 'all' || materialProgramId === filterProgram;
    const matchesModule = filterModule === 'all' || material.module_id === filterModule;
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
                <div className="text-2xl font-bold text-gray-900">{new Set(materials.map(m => m.module_id)).size}</div>
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
                          {material.modules?.module_code} - {material.modules?.module_name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Week:</span> {material.week_number}
                      </div>
                      <div>
                        <span className="font-semibold">Faculty:</span> {material.modules?.programs?.departments?.faculties?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Department:</span> {material.modules?.programs?.departments?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-semibold">Program:</span> {material.modules?.programs?.name || 'N/A'}
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
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Intake (Month & Year) *
                    </label>
                    {formIntakes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>Loading intakes...</p>
                        <p className="text-sm mt-2">If no intakes appear, please create intakes in Intake Management first.</p>
                      </div>
                    ) : (
                      <select
                        required
                        value={formData.intake_id_temp}
                        onChange={(e) => setFormData({ ...formData, intake_id_temp: e.target.value, module_id: '' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Intake</option>
                        {formIntakes.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Module *
                    </label>
                    {formData.intake_id_temp && formCourses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No modules assigned to this intake yet.</p>
                        <p className="text-sm mt-2">Please assign modules to the intake first in Intake Management.</p>
                      </div>
                    ) : (
                      <select
                        required
                        value={formData.module_id}
                        onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        disabled={!formData.intake_id_temp}
                      >
                        <option value="">Select Module</option>
                        {formCourses.map(m => (
                          <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Lecture Material File *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                      {!materialFile ? (
                        <div>
                          <input
                            type="file"
                            id="material-file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            className="hidden"
                            disabled={uploading}
                            required={!editingMaterial}
                          />
                          <label htmlFor="material-file" className="cursor-pointer">
                            <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600 mb-1">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, Word, Excel, or PowerPoint (Max 50MB)
                            </p>
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <File className="w-8 h-8 text-emerald-600" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">{materialFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(materialFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          {uploading ? (
                            <Loader className="w-5 h-5 text-emerald-600 animate-spin" />
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setMaterialFile(null);
                                setFormData(prev => ({ ...prev, file_url: '' }));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {formData.file_url && !uploading && (
                      <p className="text-xs text-green-600 mt-2">✓ File uploaded successfully</p>
                    )}
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
