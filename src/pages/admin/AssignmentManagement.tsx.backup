import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BookOpen, Edit, Trash2, Eye, EyeOff, X, Upload as UploadIcon, File, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

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

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_marks: number;
  is_published: boolean;
  module_id: string;
  intake_id: string;
  assignment_file_url?: string;
  modules?: {
    module_code: string;
    module_name: string;
  };
  intakes?: {
    intake_name: string;
  };
}

export function AssignmentManagement() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [instructorModules, setInstructorModules] = useState<Module[]>([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const [selectedModuleCard, setSelectedModuleCard] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown data for filters (Admin only)
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
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [assignmentFileUrl, setAssignmentFileUrl] = useState('');
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      await checkUserRole();
      loadAssignments();
      loadFaculties();
      if (profile?.role !== 'instructor') {
        loadFilterFaculties();
      }
    };
    initializeData();
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

  // Filter useEffects for Admin
  useEffect(() => {
    if (!isInstructor && filterFaculty !== 'all') {
      loadFilterDepartments(filterFaculty);
    } else {
      setFilterDepartments([]);
      setFilterPrograms([]);
      setFilterModules([]);
    }
  }, [filterFaculty, isInstructor]);

  useEffect(() => {
    if (!isInstructor && filterDepartment !== 'all') {
      loadFilterPrograms(filterDepartment);
    } else {
      setFilterPrograms([]);
      setFilterModules([]);
    }
  }, [filterDepartment, isInstructor]);

  useEffect(() => {
    if (!isInstructor && filterProgram !== 'all') {
      loadFilterModules(filterProgram);
    } else {
      setFilterModules([]);
    }
  }, [filterProgram, isInstructor]);

  const checkUserRole = async () => {
    try {
      if (profile?.role === 'instructor') {
        setIsInstructor(true);
        await loadInstructorModules();
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const loadInstructorModules = async () => {
    try {
      if (!profile?.id) return;

      // Get lecturer's assigned modules
      const { data: lecturerAssignments, error } = await supabase
        .from('lecturer_assignments')
        .select(`
          module_id,
          modules (
            id,
            module_code,
            module_name,
            program_id,
            intake_id
          )
        `)
        .eq('lecturer_id', profile.id);

      if (error) throw error;

      const assignedModules = lecturerAssignments
        ?.map((la: any) => la.modules)
        .filter((m: any) => m !== null) || [];

      // Add dummy data if no modules found (for demonstration)
      if (assignedModules.length === 0) {
        const dummyModules = [
          {
            id: 'dummy-1',
            module_code: 'CS101',
            module_name: 'Introduction to Programming',
            program_id: 'dummy-prog-1',
            intake_id: 'dummy-intake-1'
          },
          {
            id: 'dummy-2',
            module_code: 'CS201',
            module_name: 'Data Structures and Algorithms',
            program_id: 'dummy-prog-1',
            intake_id: 'dummy-intake-1'
          },
          {
            id: 'dummy-3',
            module_code: 'CS301',
            module_name: 'Database Management Systems',
            program_id: 'dummy-prog-1',
            intake_id: 'dummy-intake-2'
          },
          {
            id: 'dummy-4',
            module_code: 'CS401',
            module_name: 'Web Development',
            program_id: 'dummy-prog-2',
            intake_id: 'dummy-intake-2'
          }
        ];
        setInstructorModules(dummyModules);
      } else {
        setInstructorModules(assignedModules);
      }
    } catch (error) {
      console.error('Error loading instructor modules:', error);
      // Set dummy data on error as well
      const dummyModules = [
        {
          id: 'dummy-1',
          module_code: 'CS101',
          module_name: 'Introduction to Programming',
          program_id: 'dummy-prog-1',
          intake_id: 'dummy-intake-1'
        },
        {
          id: 'dummy-2',
          module_code: 'CS201',
          module_name: 'Data Structures and Algorithms',
          program_id: 'dummy-prog-1',
          intake_id: 'dummy-intake-1'
        },
        {
          id: 'dummy-3',
          module_code: 'CS301',
          module_name: 'Database Management Systems',
          program_id: 'dummy-prog-1',
          intake_id: 'dummy-intake-2'
        },
        {
          id: 'dummy-4',
          module_code: 'CS401',
          module_name: 'Web Development',
          program_id: 'dummy-prog-2',
          intake_id: 'dummy-intake-2'
        }
      ];
      setInstructorModules(dummyModules);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          modules (module_code, module_name),
          intakes (intake_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add dummy assignments if instructor has no real assignments
      const isInstructorRole = profile?.role === 'instructor';
      if (isInstructorRole && (!data || data.length === 0)) {
        const dummyAssignments = [
          {
            id: 'dummy-assign-1',
            title: 'Basic Programming Concepts',
            description: 'Complete exercises on variables, data types, and control structures',
            due_date: '2025-12-25',
            max_marks: 100,
            is_published: true,
            module_id: 'dummy-1',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS101', module_name: 'Introduction to Programming' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-2',
            title: 'Object-Oriented Programming Assignment',
            description: 'Implement a class hierarchy for a library management system',
            due_date: '2025-12-30',
            max_marks: 150,
            is_published: true,
            module_id: 'dummy-1',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS101', module_name: 'Introduction to Programming' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-3',
            title: 'Sorting Algorithms Implementation',
            description: 'Implement and analyze Bubble Sort, Quick Sort, and Merge Sort',
            due_date: '2026-01-10',
            max_marks: 120,
            is_published: true,
            module_id: 'dummy-2',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS201', module_name: 'Data Structures and Algorithms' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-4',
            title: 'Binary Search Tree Operations',
            description: 'Create a BST with insert, delete, search, and traversal operations',
            due_date: '2026-01-15',
            max_marks: 100,
            is_published: false,
            module_id: 'dummy-2',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS201', module_name: 'Data Structures and Algorithms' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-5',
            title: 'SQL Query Assignment',
            description: 'Write complex SQL queries for the given database schema',
            due_date: '2026-01-20',
            max_marks: 80,
            is_published: true,
            module_id: 'dummy-3',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS301', module_name: 'Database Management Systems' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-6',
            title: 'Database Normalization Project',
            description: 'Normalize the given database schema up to 3NF',
            due_date: '2026-01-25',
            max_marks: 100,
            is_published: true,
            module_id: 'dummy-3',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS301', module_name: 'Database Management Systems' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-7',
            title: 'Responsive Website Design',
            description: 'Create a fully responsive website using HTML, CSS, and JavaScript',
            due_date: '2026-02-01',
            max_marks: 150,
            is_published: true,
            module_id: 'dummy-4',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS401', module_name: 'Web Development' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-8',
            title: 'REST API Development',
            description: 'Build a RESTful API using Node.js and Express',
            due_date: '2026-02-10',
            max_marks: 120,
            is_published: false,
            module_id: 'dummy-4',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS401', module_name: 'Web Development' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-9',
            title: 'Functions and Recursion',
            description: 'Write recursive functions to solve mathematical problems',
            due_date: '2026-01-05',
            max_marks: 90,
            is_published: true,
            module_id: 'dummy-1',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS101', module_name: 'Introduction to Programming' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-10',
            title: 'File Handling in Python',
            description: 'Create programs to read, write, and manipulate files',
            due_date: '2026-01-12',
            max_marks: 80,
            is_published: false,
            module_id: 'dummy-1',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS101', module_name: 'Introduction to Programming' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-11',
            title: 'Graph Algorithms',
            description: 'Implement BFS, DFS, and Dijkstra\'s shortest path algorithm',
            due_date: '2026-01-18',
            max_marks: 130,
            is_published: true,
            module_id: 'dummy-2',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS201', module_name: 'Data Structures and Algorithms' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-12',
            title: 'Hash Table Implementation',
            description: 'Create a hash table with collision handling using chaining',
            due_date: '2026-01-22',
            max_marks: 110,
            is_published: true,
            module_id: 'dummy-2',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS201', module_name: 'Data Structures and Algorithms' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-13',
            title: 'Dynamic Programming Problems',
            description: 'Solve classic DP problems: Knapsack, LCS, Matrix Chain Multiplication',
            due_date: '2026-01-28',
            max_marks: 140,
            is_published: false,
            module_id: 'dummy-2',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS201', module_name: 'Data Structures and Algorithms' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-14',
            title: 'ER Diagram Design',
            description: 'Design an ER diagram for a hospital management system',
            due_date: '2026-01-28',
            max_marks: 70,
            is_published: true,
            module_id: 'dummy-3',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS301', module_name: 'Database Management Systems' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-15',
            title: 'Transaction Management',
            description: 'Demonstrate ACID properties and implement transaction handling',
            due_date: '2026-02-03',
            max_marks: 90,
            is_published: true,
            module_id: 'dummy-3',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS301', module_name: 'Database Management Systems' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-16',
            title: 'Indexing and Query Optimization',
            description: 'Create indexes and optimize slow database queries',
            due_date: '2026-02-08',
            max_marks: 100,
            is_published: false,
            module_id: 'dummy-3',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS301', module_name: 'Database Management Systems' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-17',
            title: 'React Component Development',
            description: 'Build reusable React components with props and state management',
            due_date: '2026-02-05',
            max_marks: 130,
            is_published: true,
            module_id: 'dummy-4',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS401', module_name: 'Web Development' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-18',
            title: 'Authentication System',
            description: 'Implement JWT-based user authentication and authorization',
            due_date: '2026-02-15',
            max_marks: 140,
            is_published: true,
            module_id: 'dummy-4',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS401', module_name: 'Web Development' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-19',
            title: 'Full Stack Project',
            description: 'Build a complete e-commerce website with frontend and backend',
            due_date: '2026-02-28',
            max_marks: 200,
            is_published: false,
            module_id: 'dummy-4',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS401', module_name: 'Web Development' },
            intakes: { intake_name: 'September 2025' }
          }
        ];
        setAssignments(dummyAssignments);
      } else {
        setAssignments(data || []);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      // Set dummy data on error for instructors
      const isInstructorRole = profile?.role === 'instructor';
      if (isInstructorRole) {
        const dummyAssignments = [
          {
            id: 'dummy-assign-1',
            title: 'Basic Programming Concepts',
            description: 'Complete exercises on variables, data types, and control structures',
            due_date: '2025-12-25',
            max_marks: 100,
            is_published: true,
            module_id: 'dummy-1',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS101', module_name: 'Introduction to Programming' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-2',
            title: 'Sorting Algorithms Implementation',
            description: 'Implement and analyze Bubble Sort, Quick Sort, and Merge Sort',
            due_date: '2026-01-10',
            max_marks: 120,
            is_published: true,
            module_id: 'dummy-2',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS201', module_name: 'Data Structures and Algorithms' },
            intakes: { intake_name: 'January 2025' }
          },
          {
            id: 'dummy-assign-3',
            title: 'SQL Query Assignment',
            description: 'Write complex SQL queries for the given database schema',
            due_date: '2026-01-20',
            max_marks: 80,
            is_published: true,
            module_id: 'dummy-3',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS301', module_name: 'Database Management Systems' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-4',
            title: 'Responsive Website Design',
            description: 'Create a fully responsive website using HTML, CSS, and JavaScript',
            due_date: '2026-02-01',
            max_marks: 150,
            is_published: true,
            module_id: 'dummy-4',
            intake_id: 'dummy-intake-2',
            assignment_file_url: undefined,
            modules: { module_code: 'CS401', module_name: 'Web Development' },
            intakes: { intake_name: 'September 2025' }
          },
          {
            id: 'dummy-assign-5',
            title: 'Hash Table Implementation',
            description: 'Create a hash table with collision handling using chaining',
            due_date: '2026-01-22',
            max_marks: 110,
            is_published: true,
            module_id: 'dummy-2',
            intake_id: 'dummy-intake-1',
            assignment_file_url: undefined,
            modules: { module_code: 'CS201', module_name: 'Data Structures and Algorithms' },
            intakes: { intake_name: 'January 2025' }
          }
        ];
        setAssignments(dummyAssignments);
      }
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

  // Filter load functions for Admin
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

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Validate file type
      const allowedTypes = [
        // Documents
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        // Archives
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        // Audio
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        // Video
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Please upload PDF, Word, Excel, PowerPoint, ZIP, Audio, or Video files.');
        return null;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert('File size exceeds 50MB limit.');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `assignment-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lms-files')
        .getPublicUrl(filePath);

      return publicUrl;
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
      setAssignmentFile(file);
      const fileUrl = await handleFileUpload(file);
      if (fileUrl) {
        setAssignmentFileUrl(fileUrl);
      }
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignmentTitle || !selectedModule || !selectedIntake || !dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny.from('assignments').insert({
        module_id: selectedModule,
        intake_id: selectedIntake,
        title: assignmentTitle,
        description: assignmentDescription,
        due_date: dueDate,
        max_marks: maxMarks,
        assignment_file_url: assignmentFileUrl || null,
        is_published: false
      });

      if (error) throw error;

      alert('Assignment created successfully!');
      resetForm();
      loadAssignments();
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment: ' + error.message);
    }
  };

  const handleTogglePublish = async (assignmentId: string, currentStatus: boolean) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('assignments')
        .update({ is_published: !currentStatus })
        .eq('id', assignmentId);

      if (error) throw error;
      loadAssignments();
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      loadAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
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
    setSelectedModuleCard('');
    setAssignmentTitle('');
    setAssignmentDescription('');
    setDueDate('');
    setMaxMarks(100);
    setAssignmentFileUrl('');
    setAssignmentFile(null);
    setUploading(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterProgram('all');
    setFilterModule('all');
    setFilterStatus('all');
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.modules?.module_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.modules?.module_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = filterModule === 'all' || assignment.module_id === filterModule;
    
    // Admin-only filters
    if (!isInstructor) {
      const matchesProgram = filterProgram === 'all' || 
        filterModules.find(m => m.id === assignment.module_id)?.program_id === filterProgram;
      
      const matchesDepartment = filterDepartment === 'all' || 
        filterPrograms.find(p => p.id === filterModules.find(m => m.id === assignment.module_id)?.program_id)?.department_id === filterDepartment;
      
      const matchesFaculty = filterFaculty === 'all' || 
        filterDepartments.find(d => d.id === filterPrograms.find(p => p.id === filterModules.find(m => m.id === assignment.module_id)?.program_id)?.department_id)?.faculty_id === filterFaculty;
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'published' && assignment.is_published) ||
        (filterStatus === 'draft' && !assignment.is_published);
      
      return matchesSearch && matchesModule && matchesProgram && matchesDepartment && matchesFaculty && matchesStatus;
    }
    
    // Instructor: simple filter
    return matchesSearch && matchesModule;
  });

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
              <h1 className="text-3xl font-bold">Assignment Management</h1>
              <p className="text-blue-100 mt-1">Create and manage assignments for modules</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-500 hover:bg-amber-600 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Create Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructor: Module Cards Section */}
        {isInstructor && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Modules</h2>
                <p className="text-gray-600 mt-1">Select a module to view and manage its assignments</p>
              </div>
              {filterModule !== 'all' && (
                <button
                  onClick={() => setFilterModule('all')}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <X size={18} />
                  Clear Selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {instructorModules.length === 0 ? (
                <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
                  <BookOpen className="mx-auto text-gray-400" size={48} />
                  <p className="mt-4 text-gray-600">No modules assigned to you yet.</p>
                </div>
              ) : (
                instructorModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => setFilterModule(module.id)}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      filterModule === module.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-gray-300 bg-white hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-bold text-gray-900">{module.module_code}</div>
                      {filterModule === module.id && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">{module.module_name}</div>
                    <div className="text-xs text-gray-500">
                      {assignments.filter(a => a.module_id === module.id).length} assignments
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Instructor: Search Bar */}
        {isInstructor && filterModule !== 'all' && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <input
              type="text"
              placeholder="Search assignments by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        )}

        {/* Admin: Advanced Filter UI */}
        {!isInstructor && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search by title or module..."
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
        )}

        {/* Assignments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              <p className="mt-4 text-gray-600">Loading assignments...</p>
            </div>
          ) : isInstructor && filterModule === 'all' ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Module</h3>
              <p className="text-gray-600">Please select a module card above to view its assignments</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <BookOpen className="mx-auto text-gray-400" size={48} />
              <p className="mt-4 text-gray-600">
                {isInstructor 
                  ? 'No assignments found for this module.'
                  : (assignments.length > 0 ? 'No assignments found. Try adjusting your filters.' : 'Create your first assignment!')
                }
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{assignment.title}</h3>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          assignment.is_published
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {assignment.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <span className="font-medium">
                        Module: {assignment.modules?.module_code} - {assignment.modules?.module_name}
                      </span>
                      <span>Intake: {assignment.intakes?.intake_name}</span>
                      <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                      <span>Max Marks: {assignment.max_marks}</span>
                    </div>
                    {assignment.assignment_file_url && (
                      <div className="mt-3">
                        <a
                          href={assignment.assignment_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <File size={16} />
                          Download Assignment File
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleTogglePublish(assignment.id, assignment.is_published)}
                      className={`${
                        assignment.is_published
                          ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      } p-2 rounded-lg transition-colors`}
                      title={assignment.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {assignment.is_published ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
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

        {/* Create Assignment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Assignment</h2>

                {/* Instructor: Module Card Selection */}
                {isInstructor && !selectedModuleCard && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Select Module</h3>
                    <p className="text-sm text-gray-600 mb-4">Choose one of your assigned modules to create an assignment</p>
                    <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                      {instructorModules.map((module) => (
                        <button
                          key={module.id}
                          onClick={() => {
                            setSelectedModuleCard(module.id);
                            setSelectedModule(module.id);
                            setSelectedProgram(module.program_id);
                            setSelectedIntake(module.intake_id);
                          }}
                          className="text-left p-4 border-2 border-gray-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all"
                        >
                          <div className="font-semibold text-gray-900">{module.module_code}</div>
                          <div className="text-sm text-gray-600">{module.module_name}</div>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={resetForm}
                        className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin OR Instructor after module selection: Show steps or details form */}
                {(!isInstructor || selectedModuleCard) && (
                  <>
                    {/* Step Indicator - Only for Admin */}
                    {!isInstructor && (
                      <div className="flex items-center justify-between mb-8">
                        {[1, 2, 3, 4, 5, 6].map((s) => (
                          <div key={s} className="flex items-center">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {s}
                            </div>
                            {s < 6 && <div className={`w-8 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Step 1: Faculty - Admin Only */}
                    {!isInstructor && step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 1: Select Faculty</h3>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Step 2: Department - Admin Only */}
                    {!isInstructor && step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 2: Select Department</h3>
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Step 3: Program - Admin Only */}
                    {!isInstructor && step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 3: Select Program</h3>
                    <select
                      value={selectedProgram}
                      onChange={(e) => setSelectedProgram(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Step 4: Intake - Admin Only */}
                    {!isInstructor && step === 4 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 4: Select Intake</h3>
                    <select
                      value={selectedIntake}
                      onChange={(e) => setSelectedIntake(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Step 5: Module - Admin Only */}
                    {!isInstructor && step === 5 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 5: Select Module</h3>
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    {/* Step 6 OR Instructor: Assignment Details */}
                    {((isInstructor && selectedModuleCard) || (!isInstructor && step === 6)) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Step 6: Assignment Details</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assignment Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={assignmentTitle}
                        onChange={(e) => setAssignmentTitle(e.target.value)}
                        placeholder="e.g., Programming Assignment 1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={assignmentDescription}
                        onChange={(e) => setAssignmentDescription(e.target.value)}
                        placeholder="Assignment description and instructions..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks</label>
                        <input
                          type="number"
                          value={maxMarks}
                          onChange={(e) => setMaxMarks(parseInt(e.target.value))}
                          min="1"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assignment File</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        {!assignmentFile ? (
                          <div>
                            <input
                              type="file"
                              id="assignment-file"
                              onChange={handleFileChange}
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.mp3,.wav,.m4a,.ogg,.mp4,.avi,.mov,.wmv,.webm"
                              className="hidden"
                              disabled={uploading}
                            />
                            <label htmlFor="assignment-file" className="cursor-pointer">
                              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-600 mb-1">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, Word, Excel, PowerPoint, ZIP, Audio, or Video (Max 50MB)
                              </p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                              <File className="w-8 h-8 text-blue-600" />
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">{assignmentFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(assignmentFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            {uploading ? (
                              <Loader className="w-5 h-5 text-blue-600 animate-spin" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignmentFile(null);
                                  setAssignmentFileUrl('');
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      {assignmentFileUrl && !uploading && (
                        <p className="text-xs text-green-600 mt-2">✓ File uploaded successfully</p>
                      )}
                    </div>
                  </div>
                )}

                    {/* Modal Actions */}
                    <div className="flex gap-3 mt-8">
                      {!isInstructor && step > 1 && (
                        <button
                          onClick={() => setStep(step - 1)}
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                      )}
                      {isInstructor && selectedModuleCard && (
                        <button
                          onClick={() => setSelectedModuleCard('')}
                          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Back to Modules
                        </button>
                      )}
                      <button
                        onClick={resetForm}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      {!isInstructor && step < 6 ? (
                        <button
                          onClick={() => setStep(step + 1)}
                          disabled={
                            (step === 1 && !selectedFaculty) ||
                            (step === 2 && !selectedDepartment) ||
                            (step === 3 && !selectedProgram) ||
                            (step === 4 && !selectedIntake) ||
                            (step === 5 && !selectedModule)
                          }
                          className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      ) : (isInstructor && selectedModuleCard) || (!isInstructor && step === 6) ? (
                        <button
                          onClick={handleCreateAssignment}
                          className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Create Assignment
                        </button>
                      ) : null}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
