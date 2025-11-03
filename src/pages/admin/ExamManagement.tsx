import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
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
  department_id: string;
}

interface Intake {
  id: string;
  intake_name: string;
  program_id: string;
}

interface Module {
  id: string;
  module_code: string;
  module_name: string;
  program_id: string;
  intake_id: string;
}

interface Exam {
  id: string;
  exam_name: string;
  description: string;
  exam_date: string;
  exam_time: string;
  duration_minutes: number;
  max_marks: number;
  is_published: boolean;
  module_id: string;
  intake_id: string;
  modules?: {
    module_code: string;
    module_name: string;
  };
  intakes?: {
    intake_name: string;
  };
}

export function ExamManagement() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown data for filters
  const [filterFaculties, setFilterFaculties] = useState<Faculty[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<Department[]>([]);
  const [filterPrograms, setFilterPrograms] = useState<Program[]>([]);
  const [filterModules, setFilterModules] = useState<Module[]>([]);
  
  // Form state
  const [step, setStep] = useState(1);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [examDate, setExamDate] = useState('');
  const [examTime, setExamTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [maxMarks, setMaxMarks] = useState(100);

  useEffect(() => {
    loadExams();
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

  useEffect(() => {
    if (selectedProgram) {
      loadIntakes(selectedProgram);
    }
  }, [selectedProgram]);

  useEffect(() => {
    if (selectedProgram && selectedIntake) {
      loadModules(selectedProgram, selectedIntake);
    }
  }, [selectedProgram, selectedIntake]);

  // Filter useEffects
  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadFilterDepartments(filterFaculty);
    } else {
      setFilterDepartments([]);
      setFilterPrograms([]);
      setFilterModules([]);
    }
  }, [filterFaculty]);

  useEffect(() => {
    if (filterDepartment !== 'all') {
      loadFilterPrograms(filterDepartment);
    } else {
      setFilterPrograms([]);
      setFilterModules([]);
    }
  }, [filterDepartment]);

  useEffect(() => {
    if (filterProgram !== 'all') {
      loadFilterModules(filterProgram);
    } else {
      setFilterModules([]);
    }
  }, [filterProgram]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exams')
        .select(`
          *,
          modules (module_code, module_name),
          intakes (intake_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
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
        .select('id, name, department_id')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadIntakes = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('intakes')
        .select('id, intake_name, program_id')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('intake_year', { ascending: false });

      if (error) throw error;
      setIntakes(data || []);
    } catch (error) {
      console.error('Error loading intakes:', error);
    }
  };

  const loadModules = async (programId: string, intakeId: string) => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('id, module_code, module_name, program_id, intake_id')
        .eq('program_id', programId)
        .eq('intake_id', intakeId)
        .eq('is_active', true)
        .order('module_code');

      if (error) throw error;
      setModules(data || []);
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

  const loadFilterPrograms = async (departmentId: string) => {
    try {
      const { data, error} = await supabase
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

  const loadFilterModules = async (programId: string) => {
    try {
      const { data, error } = await supabase
        .from('modules')
        .select('id, module_code, module_name, program_id')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('module_code');

      if (error) throw error;
      setFilterModules(data || []);
    } catch (error) {
      console.error('Error loading filter modules:', error);
    }
  };

  const handleCreateExam = async () => {
    if (!examName || !selectedModule || !selectedIntake || !examDate || !examTime) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny.from('exams').insert({
        module_id: selectedModule,
        intake_id: selectedIntake,
        exam_name: examName,
        description: examDescription,
        exam_date: examDate,
        exam_time: examTime,
        duration_minutes: durationMinutes,
        max_marks: maxMarks,
        is_published: false
      });

      if (error) throw error;

      alert('Exam created successfully!');
      resetForm();
      loadExams();
    } catch (error: any) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam: ' + error.message);
    }
  };

  const handleTogglePublish = async (examId: string, currentStatus: boolean) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('exams')
        .update({ is_published: !currentStatus })
        .eq('id', examId);

      if (error) throw error;
      loadExams();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);

      if (error) throw error;
      loadExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setStep(1);
    setSelectedFaculty('');
    setSelectedDepartment('');
    setSelectedProgram('');
    setSelectedIntake('');
    setSelectedModule('');
    setExamName('');
    setExamDescription('');
    setExamDate('');
    setExamTime('');
    setDurationMinutes(120);
    setMaxMarks(100);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterProgram('all');
    setFilterModule('all');
    setFilterStatus('all');
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = 
      exam.exam_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.modules?.module_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.modules?.module_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = filterModule === 'all' || exam.module_id === filterModule;
    
    const matchesProgram = filterProgram === 'all' || 
      filterModules.find(m => m.id === exam.module_id)?.program_id === filterProgram;
    
    const matchesDepartment = filterDepartment === 'all' || 
      filterPrograms.find(p => p.id === filterModules.find(m => m.id === exam.module_id)?.program_id)?.department_id === filterDepartment;
    
    const matchesFaculty = filterFaculty === 'all' || 
      filterDepartments.find(d => d.id === filterPrograms.find(p => p.id === filterModules.find(m => m.id === exam.module_id)?.program_id)?.department_id)?.faculty_id === filterFaculty;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'published' && exam.is_published) ||
      (filterStatus === 'draft' && !exam.is_published);
    
    return matchesSearch && matchesModule && matchesProgram && matchesDepartment && matchesFaculty && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-cyan-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Exam Management</h1>
              <p className="text-cyan-100 mt-1">Create and manage exams for modules</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create Exam
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
                  placeholder="Search by exam name or module..."
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
                  setFilterModule('all');
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
                  setFilterModule('all');
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
                  setFilterModule('all');
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
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={filterProgram === 'all'}
              >
                <option value="all">All Modules</option>
                {filterModules.map(m => (
                  <option key={m.id} value={m.id}>{m.module_code} - {m.module_name}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
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

        {/* Exams List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
              <p className="mt-4 text-gray-600">Loading exams...</p>
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <FileText className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">No exams found. {exams.length > 0 ? 'Try adjusting your filters.' : 'Create your first exam!'}</p>
            </div>
          ) : (
            filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{exam.exam_name}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          exam.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {exam.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium text-gray-700">Module:</span>
                        <div className="text-xs">{exam.modules?.module_code} - {exam.modules?.module_name}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Intake:</span>
                        <div className="text-xs">{exam.intakes?.intake_name}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date:</span>
                        <div className="text-xs">{new Date(exam.exam_date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Time:</span>
                        <div className="text-xs">{exam.exam_time} ({exam.duration_minutes} min)</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Max Marks:</span>
                        <div className="text-xs">{exam.max_marks}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleTogglePublish(exam.id, exam.is_published)}
                      className={`${
                        exam.is_published
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } p-2 rounded-lg transition-colors`}
                      title={exam.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {exam.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Exam Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Exam</h2>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3, 4, 5, 6].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          step >= s ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {s}
                      </div>
                      {s < 6 && <div className={`w-8 h-1 ${step > s ? 'bg-cyan-600' : 'bg-gray-200'}`}></div>}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 4: Intake */}
                {step === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 4: Select Intake</h3>
                    <select
                      value={selectedIntake}
                      onChange={(e) => setSelectedIntake(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">-- Select Intake --</option>
                      {intakes.map((intake) => (
                        <option key={intake.id} value={intake.id}>
                          {intake.intake_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 5: Module */}
                {step === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 5: Select Module</h3>
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">-- Select Module --</option>
                      {modules.map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.module_code} - {module.module_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Step 6: Exam Details */}
                {step === 6 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 6: Exam Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exam Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        placeholder="e.g., Mid-Term Examination"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={examDescription}
                        onChange={(e) => setExamDescription(e.target.value)}
                        placeholder="Exam description and instructions..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Exam Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={examTime}
                          onChange={(e) => setExamTime(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Minutes)</label>
                        <input
                          type="number"
                          value={durationMinutes}
                          onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                          min="30"
                          step="15"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
                        <input
                          type="number"
                          value={maxMarks}
                          onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
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
                  {step < 6 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={
                        (step === 1 && !selectedFaculty) ||
                        (step === 2 && !selectedDepartment) ||
                        (step === 3 && !selectedProgram) ||
                        (step === 4 && !selectedIntake) ||
                        (step === 5 && !selectedModule)
                      }
                      className="flex-1 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateExam}
                      className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Create Exam
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
