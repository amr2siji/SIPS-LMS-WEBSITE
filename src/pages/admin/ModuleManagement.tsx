import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Book, Edit, Trash2, Power, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
  program_type: string;
  department_id: string;
  image_url?: string;
  payment_type: string;
  program_amount: number;
  duration_months: number;
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
  description: string;
  credit_score: number;
  is_active: boolean;
  program_id: string;
  intake_id: string;
  programs?: {
    name: string;
  };
  intakes?: {
    intake_name: string;
    intake_year: number;
    intake_month: number;
  };
}

export function ModuleManagement() {
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  
  // Filter states
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterIntake, setFilterIntake] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown data for filters
  const [filterFaculties, setFilterFaculties] = useState<Faculty[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<Department[]>([]);
  const [filterPrograms, setFilterPrograms] = useState<Program[]>([]);
  const [filterIntakes, setFilterIntakes] = useState<Intake[]>([]);
  
  // Form state
  const [step, setStep] = useState(1);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [moduleCode, setModuleCode] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [creditScore, setCreditScore] = useState(3);

  useEffect(() => {
    loadModules();
    loadFaculties();
    loadFilterFaculties();
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      loadDepartments(selectedFaculty);
    }
  }, [selectedFaculty]);

  useEffect(() => {
    if (selectedDepartment) {
      loadPrograms(selectedDepartment);
    }
  }, [selectedDepartment]);

  // Filter useEffects
  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadFilterDepartments(filterFaculty);
    } else {
      setFilterDepartments([]);
      setFilterPrograms([]);
      setFilterIntakes([]);
    }
  }, [filterFaculty]);

  useEffect(() => {
    if (filterDepartment !== 'all') {
      loadFilterPrograms(filterDepartment);
    } else {
      setFilterPrograms([]);
      setFilterIntakes([]);
    }
  }, [filterDepartment]);

  useEffect(() => {
    if (filterProgram !== 'all') {
      loadFilterIntakes(filterProgram);
    } else {
      setFilterIntakes([]);
    }
  }, [filterProgram]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('modules')
        .select(`
          *,
          programs (name),
          intakes (intake_name, intake_year, intake_month)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModules(data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from('faculties')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadDepartments = async (facultyId: string) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name, faculty_id')
        .eq('faculty_id', facultyId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadPrograms = async (departmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
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

  const loadFilterPrograms = async (departmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name, department_id')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setFilterPrograms(data || []);
    } catch (error) {
      console.error('Error loading filter programs:', error);
    }
  };

  const loadFilterIntakes = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('intakes')
        .select('id, intake_name, intake_year, intake_month, program_id')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('intake_year', { ascending: false })
        .order('intake_month', { ascending: false });

      if (error) throw error;
      setFilterIntakes(data || []);
    } catch (error) {
      console.error('Error loading filter intakes:', error);
    }
  };

  const handleCreateModule = async () => {
    if (!moduleCode || !moduleName || !selectedProgram || !selectedYear || !selectedMonth) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const supabaseAny = supabase as any;
      
      // First, create a new intake
      const intakeName = `Intake ${selectedMonth}/${selectedYear}`;
      const { data: newIntake, error: intakeError } = await supabaseAny
        .from('intakes')
        .insert({
          program_id: selectedProgram,
          intake_name: intakeName,
          intake_year: parseInt(selectedYear),
          intake_month: parseInt(selectedMonth)
        })
        .select()
        .single();

      if (intakeError) throw intakeError;

      // Then create the module with the new intake
      const { error: moduleError } = await supabaseAny.from('modules').insert({
        program_id: selectedProgram,
        intake_id: newIntake.id,
        module_code: moduleCode,
        module_name: moduleName,
        description: moduleDescription,
        credit_score: creditScore,
        is_active: true
      });

      if (moduleError) throw moduleError;

      alert('Module and intake created successfully!');
      resetForm();
      loadModules();
    } catch (error: any) {
      console.error('Error creating module:', error);
      alert('Failed to create module: ' + error.message);
    }
  };

  const handleToggleActive = async (moduleId: string, currentStatus: boolean) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('modules')
        .update({ is_active: !currentStatus })
        .eq('id', moduleId);

      if (error) throw error;
      loadModules();
    } catch (error) {
      console.error('Error toggling module status:', error);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setStep(1);
    setSelectedFaculty('');
    setSelectedDepartment('');
    setSelectedProgram('');
    setSelectedYear('');
    setSelectedMonth('');
    setModuleCode('');
    setModuleName('');
    setModuleDescription('');
    setCreditScore(3);
    setEditingModule(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterProgram('all');
    setFilterIntake('all');
    setFilterStatus('all');
  };

  const filteredModules = modules.filter(module => {
    const matchesSearch = 
      module.module_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.module_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFaculty = filterFaculty === 'all' || 
      filterDepartments.find(d => d.id === filterDepartment)?.faculty_id === filterFaculty;
    
    const matchesDepartment = filterDepartment === 'all' || 
      filterPrograms.find(p => p.id === module.program_id)?.department_id === filterDepartment;
    
    const matchesProgram = filterProgram === 'all' || module.program_id === filterProgram;
    
    const matchesIntake = filterIntake === 'all' || module.intake_id === filterIntake;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && module.is_active) ||
      (filterStatus === 'inactive' && !module.is_active);
    
    return matchesSearch && matchesFaculty && matchesDepartment && matchesProgram && matchesIntake && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-indigo-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Module Management</h1>
              <p className="text-indigo-100 mt-1">Manage academic modules, programs, and intakes</p>
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
        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by module code or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Faculties</option>
                {filterFaculties.map(f => (
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
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setFilterIntake('all');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={filterDepartment === 'all'}
              >
                <option value="all">All Programs</option>
                {filterPrograms.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={filterIntake}
                onChange={(e) => setFilterIntake(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={filterProgram === 'all'}
              >
                <option value="all">All Intakes</option>
                {filterIntakes.map(intake => {
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
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
              <p className="mt-4 text-gray-600">Loading modules...</p>
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Book className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">No modules found. {modules.length > 0 ? 'Try adjusting your filters.' : 'Create your first module!'}</p>
            </div>
          ) : (
            filteredModules.map((module) => (
              <div
                key={module.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                  !module.is_active ? 'opacity-60' : ''
                }`}
              >
                <div className={`h-2 ${module.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{module.module_code}</h3>
                      <p className="text-sm text-gray-500">{module.programs?.name}</p>
                      <p className="text-xs text-gray-400">
                        {module.intakes?.intake_name} - {module.intakes?.intake_year}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        module.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {module.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">{module.module_name}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{module.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Book size={16} />
                    <span>{module.credit_score} Credits</span>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(module.id, module.is_active)}
                      className={`${
                        module.is_active ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      } p-2 rounded-lg transition-colors`}
                    >
                      <Power size={18} />
                    </button>
                    <button className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Module Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {editingModule ? 'Edit Module' : 'Create New Module'}
                </h2>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          step >= s
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {s}
                      </div>
                      {s < 5 && (
                        <div
                          className={`w-12 h-1 ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Step 1: Faculty */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 1: Select Faculty</h3>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Faculty --</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 2: Department */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 2: Select Department</h3>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 3: Program */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 3: Select Program</h3>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name} ({program.program_type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 4: Intake */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 4: Create New Intake</h3>

                    {/* Year Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intake Year <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Select Year --</option>
                        {(() => {
                          const currentYear = new Date().getFullYear();
                          const startYear = currentYear - 3;
                          const endYear = currentYear + 10;
                          const years = [];
                          for (let year = endYear; year >= startYear; year--) {
                            years.push(year);
                          }
                          return years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ));
                        })()}
                      </select>
                    </div>

                    {/* Month Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intake Month <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">-- Select Month --</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                      </select>
                    </div>

                    {/* Intake Display (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Intake
                      </label>
                      <input
                        type="text"
                        value={selectedYear && selectedMonth ? `Intake ${selectedMonth}/${selectedYear}` : ''}
                        readOnly
                        placeholder="Select year and month first"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                      {selectedYear && selectedMonth && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ A new intake will be created for {(() => {
                            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                            return monthNames[parseInt(selectedMonth) - 1];
                          })()} {selectedYear}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Module Details */}
                {step === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 5: Module Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={moduleCode}
                        onChange={(e) => setModuleCode(e.target.value)}
                        placeholder="e.g., CS101"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Module Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={moduleName}
                        onChange={(e) => setModuleName(e.target.value)}
                        placeholder="e.g., Introduction to Programming"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={moduleDescription}
                        onChange={(e) => setModuleDescription(e.target.value)}
                        placeholder="Module description..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credit Score
                      </label>
                      <input
                        type="number"
                        value={creditScore}
                        onChange={(e) => setCreditScore(parseInt(e.target.value))}
                        min="1"
                        max="10"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex gap-3 mt-8">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  {step < 5 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && !selectedFaculty) ||
                        (step === 2 && !selectedDepartment) ||
                        (step === 3 && !selectedProgram) ||
                        (step === 4 && (!selectedYear || !selectedMonth))
                      }
                      className="flex-1 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateModule}
                      className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Module
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
