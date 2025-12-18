import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, Clock, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  marks_obtained: number | null;
  status: string;
  submitted_at: string;
  assignments?: {
    title: string;
    max_marks: number;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  score: number | null;
  status: string;
  created_at: string;
  exams?: {
    exam_name: string;
    max_marks: number;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
}

interface OverallScore {
  id: string;
  student_id: string;
  module_id: string;
  assignment_score: number | null;
  exam_score: number | null;
  overall_score: number | null;
  grade: string | null;
  is_finalized: boolean;
  profiles?: {
    full_name: string;
    email: string;
  };
  modules?: {
    module_code: string;
    module_name: string;
  };
}

interface ScoreWeight {
  id: string;
  module_id: string;
  intake_id: string;
  assignments_weight: number;
  exams_weight: number;
  is_published: boolean;
}

export function MarksManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'assignments' | 'exams' | 'overall'>('assignments');
  
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<ExamSubmission[]>([]);
  const [overallScores, setOverallScores] = useState<OverallScore[]>([]);
  const [scoreWeights, setScoreWeights] = useState<ScoreWeight[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showSetMarksModal, setShowSetMarksModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState<OverallScore | null>(null);
  const [overallMarksInput, setOverallMarksInput] = useState('');
  const [assignmentWeight, setAssignmentWeight] = useState(40);
  const [examWeight, setExamWeight] = useState(60);
  
  // Module and Intake selection
  const [modules, setModules] = useState<any[]>([]);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedIntakeId, setSelectedIntakeId] = useState('');

  // Filter states for Assignment Marks
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('all'); // all, pending, graded
  const [assignmentTitleFilter, setAssignmentTitleFilter] = useState('all');
  const [assignmentScoreRangeFilter, setAssignmentScoreRangeFilter] = useState('all'); // all, 90-100, 80-89, 70-79, 60-69, below-60
  const [assignmentModuleFilter, setAssignmentModuleFilter] = useState('all');
  const [assignmentDepartmentFilter, setAssignmentDepartmentFilter] = useState('all');
  const [assignmentProgramFilter, setAssignmentProgramFilter] = useState('all');

  // Filter states for Exam Marks
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const [examStatusFilter, setExamStatusFilter] = useState('all'); // all, pending, graded
  const [examNameFilter, setExamNameFilter] = useState('all');
  const [examScoreRangeFilter, setExamScoreRangeFilter] = useState('all'); // all, 90-100, 80-89, 70-79, 60-69, below-60
  const [examModuleFilter, setExamModuleFilter] = useState('all');
  const [examDepartmentFilter, setExamDepartmentFilter] = useState('all');
  const [examProgramFilter, setExamProgramFilter] = useState('all');

  // Filter states for Overall Scores
  const [overallSearchTerm, setOverallSearchTerm] = useState('');
  const [overallModuleFilter, setOverallModuleFilter] = useState('all');
  const [overallGradeFilter, setOverallGradeFilter] = useState('all'); // all, A+, A, A-, B+, B, C, F
  const [overallStatusFilter, setOverallStatusFilter] = useState('all'); // all, finalized, draft
  const [overallScoreRangeFilter, setOverallScoreRangeFilter] = useState('all'); // all, 90-100, 80-89, 70-79, 60-69, below-60
  const [overallDepartmentFilter, setOverallDepartmentFilter] = useState('all');
  const [overallProgramFilter, setOverallProgramFilter] = useState('all');

  // Filter states for Module-Wide Score Weight Configuration
  const [weightModuleFilter, setWeightModuleFilter] = useState('all');
  const [weightIntakeFilter, setWeightIntakeFilter] = useState('all');
  const [weightPublishedFilter, setWeightPublishedFilter] = useState('all'); // all, published, draft

  useEffect(() => {
    loadData();
    loadModulesAndIntakes();
  }, [activeTab]);

  const loadModulesAndIntakes = async () => {
    try {
      // Load faculties
      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('*')
        .order('name');

      if (!facultiesError && facultiesData && facultiesData.length > 0) {
        setFaculties(facultiesData);
      } else {
        const dummyFaculties = [
          { id: 'faculty-1', name: 'Faculty of Computing' },
          { id: 'faculty-2', name: 'Faculty of Engineering' },
          { id: 'faculty-3', name: 'Faculty of Business' }
        ];
        setFaculties(dummyFaculties);
      }

      // Load departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (!departmentsError && departmentsData && departmentsData.length > 0) {
        setDepartments(departmentsData);
      } else {
        const dummyDepartments = [
          { id: 'dept-1', name: 'Computer Science', faculty_id: 'faculty-1' },
          { id: 'dept-2', name: 'Software Engineering', faculty_id: 'faculty-1' },
          { id: 'dept-3', name: 'Information Technology', faculty_id: 'faculty-1' },
          { id: 'dept-4', name: 'Civil Engineering', faculty_id: 'faculty-2' },
          { id: 'dept-5', name: 'Business Management', faculty_id: 'faculty-3' }
        ];
        setDepartments(dummyDepartments);
      }

      // Load programs
      const { data: programsData, error: programsError } = await supabase
        .from('programs')
        .select('*')
        .order('name');

      if (!programsError && programsData && programsData.length > 0) {
        setPrograms(programsData);
      } else {
        const dummyPrograms = [
          { id: 'prog-1', name: 'BSc in Computer Science', department_id: 'dept-1' },
          { id: 'prog-2', name: 'BSc in Software Engineering', department_id: 'dept-2' },
          { id: 'prog-3', name: 'BSc in Information Technology', department_id: 'dept-3' },
          { id: 'prog-4', name: 'BEng in Civil Engineering', department_id: 'dept-4' },
          { id: 'prog-5', name: 'BBA in Business Management', department_id: 'dept-5' }
        ];
        setPrograms(dummyPrograms);
      }

      // Load modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('module_code');

      if (modulesError) throw modulesError;
      
      // If no modules from database, use dummy data
      if (!modulesData || modulesData.length === 0) {
        const dummyModules = [
          { id: 'module-1', module_code: 'CS401', module_name: 'Advanced Database Systems', department_id: 'dept-1' },
          { id: 'module-2', module_code: 'CS402', module_name: 'Software Engineering Principles', department_id: 'dept-2' },
          { id: 'module-3', module_code: 'CS403', module_name: 'Machine Learning Fundamentals', department_id: 'dept-1' },
          { id: 'module-4', module_code: 'CS404', module_name: 'Web Technologies & Applications', department_id: 'dept-3' },
          { id: 'module-5', module_code: 'CS405', module_name: 'Data Structures & Algorithms', department_id: 'dept-1' }
        ];
        setModules(dummyModules);
      } else {
        setModules(modulesData || []);
      }

      // Load intakes
      const { data: intakesData, error: intakesError } = await supabase
        .from('intakes')
        .select('*')
        .order('intake_year', { ascending: false });

      if (intakesError) throw intakesError;
      
      // If no intakes from database, use dummy data
      if (!intakesData || intakesData.length === 0) {
        const dummyIntakes = [
          { id: 'intake-1', intake_name: 'Semester 1', intake_year: 2024, intake_month: 1 },
          { id: 'intake-2', intake_name: 'Semester 2', intake_year: 2024, intake_month: 7 },
          { id: 'intake-3', intake_name: 'Semester 1', intake_year: 2025, intake_month: 1 }
        ];
        setIntakes(dummyIntakes);
      } else {
        setIntakes(intakesData || []);
      }
    } catch (error) {
      console.error('Error loading modules and intakes:', error);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'assignments') {
        await loadAssignmentSubmissions();
      } else if (activeTab === 'exams') {
        await loadExamSubmissions();
      } else {
        await loadOverallScores();
        await loadScoreWeights();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAssignmentSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignments (title, max_marks),
          profiles (full_name, email)
        `)
        .order('submitted_at', { ascending: false });

      // If error or no data from database, use dummy data for testing
      if (error || !data || data.length === 0) {
        const dummyAssignments: AssignmentSubmission[] = [
          {
            id: 'asn-sub-1',
            assignment_id: 'asn-1',
            student_id: 'student-1',
            marks_obtained: null,
            status: 'pending',
            submitted_at: '2024-12-10T10:30:00Z',
            assignments: {
              title: 'Database Design Project',
              max_marks: 100
            },
            profiles: {
              full_name: 'Kasun Perera',
              email: 'kasun.perera@example.com'
            }
          },
          {
            id: 'asn-sub-2',
            assignment_id: 'asn-1',
            student_id: 'student-2',
            marks_obtained: 87,
            status: 'graded',
            submitted_at: '2024-12-09T14:20:00Z',
            assignments: {
              title: 'Database Design Project',
              max_marks: 100
            },
            profiles: {
              full_name: 'Nimali Silva',
              email: 'nimali.silva@example.com'
            }
          },
          {
            id: 'asn-sub-3',
            assignment_id: 'asn-2',
            student_id: 'student-3',
            marks_obtained: null,
            status: 'pending',
            submitted_at: '2024-12-11T09:15:00Z',
            assignments: {
              title: 'Software Requirements Analysis',
              max_marks: 100
            },
            profiles: {
              full_name: 'Ravindu Fernando',
              email: 'ravindu.fernando@example.com'
            }
          },
          {
            id: 'asn-sub-4',
            assignment_id: 'asn-2',
            student_id: 'student-4',
            marks_obtained: 92,
            status: 'graded',
            submitted_at: '2024-12-10T16:45:00Z',
            assignments: {
              title: 'Software Requirements Analysis',
              max_marks: 100
            },
            profiles: {
              full_name: 'Sanduni Jayasinghe',
              email: 'sanduni.jayasinghe@example.com'
            }
          },
          {
            id: 'asn-sub-5',
            assignment_id: 'asn-3',
            student_id: 'student-5',
            marks_obtained: 78,
            status: 'graded',
            submitted_at: '2024-12-08T11:30:00Z',
            assignments: {
              title: 'Neural Network Implementation',
              max_marks: 100
            },
            profiles: {
              full_name: 'Dilshan Wickramasinghe',
              email: 'dilshan.wickramasinghe@example.com'
            }
          },
          {
            id: 'asn-sub-6',
            assignment_id: 'asn-3',
            student_id: 'student-6',
            marks_obtained: null,
            status: 'pending',
            submitted_at: '2024-12-12T13:20:00Z',
            assignments: {
              title: 'Neural Network Implementation',
              max_marks: 100
            },
            profiles: {
              full_name: 'Thisara Gunawardana',
              email: 'thisara.gunawardana@example.com'
            }
          },
          {
            id: 'asn-sub-7',
            assignment_id: 'asn-4',
            student_id: 'student-7',
            marks_obtained: 95,
            status: 'graded',
            submitted_at: '2024-12-07T10:00:00Z',
            assignments: {
              title: 'React Web Application',
              max_marks: 100
            },
            profiles: {
              full_name: 'Anusha Dissanayake',
              email: 'anusha.dissanayake@example.com'
            }
          },
          {
            id: 'asn-sub-8',
            assignment_id: 'asn-4',
            student_id: 'student-8',
            marks_obtained: null,
            status: 'pending',
            submitted_at: '2024-12-13T15:30:00Z',
            assignments: {
              title: 'React Web Application',
              max_marks: 100
            },
            profiles: {
              full_name: 'Chamara Rajapaksha',
              email: 'chamara.rajapaksha@example.com'
            }
          },
          {
            id: 'asn-sub-9',
            assignment_id: 'asn-5',
            student_id: 'student-9',
            marks_obtained: 85,
            status: 'graded',
            submitted_at: '2024-12-06T12:45:00Z',
            assignments: {
              title: 'Algorithm Complexity Analysis',
              max_marks: 100
            },
            profiles: {
              full_name: 'Malini Rathnayake',
              email: 'malini.rathnayake@example.com'
            }
          },
          {
            id: 'asn-sub-10',
            assignment_id: 'asn-5',
            student_id: 'student-10',
            marks_obtained: 72,
            status: 'graded',
            submitted_at: '2024-12-05T09:20:00Z',
            assignments: {
              title: 'Algorithm Complexity Analysis',
              max_marks: 100
            },
            profiles: {
              full_name: 'Ashen Wijesinghe',
              email: 'ashen.wijesinghe@example.com'
            }
          },
          {
            id: 'asn-sub-11',
            assignment_id: 'asn-1',
            student_id: 'student-11',
            marks_obtained: null,
            status: 'pending',
            submitted_at: '2024-12-14T11:00:00Z',
            assignments: {
              title: 'Database Design Project',
              max_marks: 100
            },
            profiles: {
              full_name: 'Tharindu Bandara',
              email: 'tharindu.bandara@example.com'
            }
          },
          {
            id: 'asn-sub-12',
            assignment_id: 'asn-2',
            student_id: 'student-12',
            marks_obtained: 89,
            status: 'graded',
            submitted_at: '2024-12-09T08:30:00Z',
            assignments: {
              title: 'Software Requirements Analysis',
              max_marks: 100
            },
            profiles: {
              full_name: 'Ishara Madushani',
              email: 'ishara.madushani@example.com'
            }
          }
        ];
        setAssignmentSubmissions(dummyAssignments);
      } else {
        setAssignmentSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error loading assignment submissions:', error);
      // Even on error, show dummy data
      const dummyAssignments: AssignmentSubmission[] = [
        {
          id: 'asn-sub-1',
          assignment_id: 'asn-1',
          student_id: 'student-1',
          marks_obtained: null,
          status: 'pending',
          submitted_at: '2024-12-10T10:30:00Z',
          assignments: {
            title: 'Database Design Project',
            max_marks: 100
          },
          profiles: {
            full_name: 'Kasun Perera',
            email: 'kasun.perera@example.com'
          }
        },
        {
          id: 'asn-sub-2',
          assignment_id: 'asn-1',
          student_id: 'student-2',
          marks_obtained: 87,
          status: 'graded',
          submitted_at: '2024-12-09T14:20:00Z',
          assignments: {
            title: 'Database Design Project',
            max_marks: 100
          },
          profiles: {
            full_name: 'Nimali Silva',
            email: 'nimali.silva@example.com'
          }
        },
        {
          id: 'asn-sub-3',
          assignment_id: 'asn-2',
          student_id: 'student-3',
          marks_obtained: null,
          status: 'pending',
          submitted_at: '2024-12-11T09:15:00Z',
          assignments: {
            title: 'Software Requirements Analysis',
            max_marks: 100
          },
          profiles: {
            full_name: 'Ravindu Fernando',
            email: 'ravindu.fernando@example.com'
          }
        },
        {
          id: 'asn-sub-4',
          assignment_id: 'asn-2',
          student_id: 'student-4',
          marks_obtained: 92,
          status: 'graded',
          submitted_at: '2024-12-10T16:45:00Z',
          assignments: {
            title: 'Software Requirements Analysis',
            max_marks: 100
          },
          profiles: {
            full_name: 'Sanduni Jayasinghe',
            email: 'sanduni.jayasinghe@example.com'
          }
        },
        {
          id: 'asn-sub-5',
          assignment_id: 'asn-3',
          student_id: 'student-5',
          marks_obtained: 78,
          status: 'graded',
          submitted_at: '2024-12-08T11:30:00Z',
          assignments: {
            title: 'Neural Network Implementation',
            max_marks: 100
          },
          profiles: {
            full_name: 'Dilshan Wickramasinghe',
            email: 'dilshan.wickramasinghe@example.com'
          }
        },
        {
          id: 'asn-sub-6',
          assignment_id: 'asn-3',
          student_id: 'student-6',
          marks_obtained: null,
          status: 'pending',
          submitted_at: '2024-12-12T13:20:00Z',
          assignments: {
            title: 'Neural Network Implementation',
            max_marks: 100
          },
          profiles: {
            full_name: 'Thisara Gunawardana',
            email: 'thisara.gunawardana@example.com'
          }
        },
        {
          id: 'asn-sub-7',
          assignment_id: 'asn-4',
          student_id: 'student-7',
          marks_obtained: 95,
          status: 'graded',
          submitted_at: '2024-12-07T10:00:00Z',
          assignments: {
            title: 'React Web Application',
            max_marks: 100
          },
          profiles: {
            full_name: 'Anusha Dissanayake',
            email: 'anusha.dissanayake@example.com'
          }
        },
        {
          id: 'asn-sub-8',
          assignment_id: 'asn-4',
          student_id: 'student-8',
          marks_obtained: null,
          status: 'pending',
          submitted_at: '2024-12-13T15:30:00Z',
          assignments: {
            title: 'React Web Application',
            max_marks: 100
          },
          profiles: {
            full_name: 'Chamara Rajapaksha',
            email: 'chamara.rajapaksha@example.com'
          }
        },
        {
          id: 'asn-sub-9',
          assignment_id: 'asn-5',
          student_id: 'student-9',
          marks_obtained: 85,
          status: 'graded',
          submitted_at: '2024-12-06T12:45:00Z',
          assignments: {
            title: 'Algorithm Complexity Analysis',
            max_marks: 100
          },
          profiles: {
            full_name: 'Malini Rathnayake',
            email: 'malini.rathnayake@example.com'
          }
        },
        {
          id: 'asn-sub-10',
          assignment_id: 'asn-5',
          student_id: 'student-10',
          marks_obtained: 72,
          status: 'graded',
          submitted_at: '2024-12-05T09:20:00Z',
          assignments: {
            title: 'Algorithm Complexity Analysis',
            max_marks: 100
          },
          profiles: {
            full_name: 'Ashen Wijesinghe',
            email: 'ashen.wijesinghe@example.com'
          }
        },
        {
          id: 'asn-sub-11',
          assignment_id: 'asn-1',
          student_id: 'student-11',
          marks_obtained: null,
          status: 'pending',
          submitted_at: '2024-12-14T11:00:00Z',
          assignments: {
            title: 'Database Design Project',
            max_marks: 100
          },
          profiles: {
            full_name: 'Tharindu Bandara',
            email: 'tharindu.bandara@example.com'
          }
        },
        {
          id: 'asn-sub-12',
          assignment_id: 'asn-2',
          student_id: 'student-12',
          marks_obtained: 89,
          status: 'graded',
          submitted_at: '2024-12-09T08:30:00Z',
          assignments: {
            title: 'Software Requirements Analysis',
            max_marks: 100
          },
          profiles: {
            full_name: 'Ishara Madushani',
            email: 'ishara.madushani@example.com'
          }
        }
      ];
      setAssignmentSubmissions(dummyAssignments);
    }
  };

  const loadExamSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('exam_submissions')
        .select(`
          *,
          exams (exam_name, max_marks),
          profiles (full_name, email)
        `)
        .order('created_at', { ascending: false });

      // If error or no data from database, use dummy data for testing
      if (error || !data || data.length === 0) {
        const dummyExams: ExamSubmission[] = [
          {
            id: 'exam-sub-1',
            exam_id: 'exam-1',
            student_id: 'student-1',
            score: null,
            status: 'pending',
            created_at: '2024-12-15T09:00:00Z',
            exams: {
              exam_name: 'Database Systems Final Exam',
              max_marks: 100
            },
            profiles: {
              full_name: 'Kasun Perera',
              email: 'kasun.perera@example.com'
            }
          },
          {
            id: 'exam-sub-2',
            exam_id: 'exam-1',
            student_id: 'student-2',
            score: 82,
            status: 'graded',
            created_at: '2024-12-15T09:00:00Z',
            exams: {
              exam_name: 'Database Systems Final Exam',
              max_marks: 100
            },
            profiles: {
              full_name: 'Nimali Silva',
              email: 'nimali.silva@example.com'
            }
          },
          {
            id: 'exam-sub-3',
            exam_id: 'exam-2',
            student_id: 'student-3',
            score: null,
            status: 'pending',
            created_at: '2024-12-16T10:00:00Z',
            exams: {
              exam_name: 'Software Engineering Mid-Term',
              max_marks: 100
            },
            profiles: {
              full_name: 'Ravindu Fernando',
              email: 'ravindu.fernando@example.com'
            }
          },
          {
            id: 'exam-sub-4',
            exam_id: 'exam-2',
            student_id: 'student-4',
            score: 88,
            status: 'graded',
            created_at: '2024-12-16T10:00:00Z',
            exams: {
              exam_name: 'Software Engineering Mid-Term',
              max_marks: 100
            },
            profiles: {
              full_name: 'Sanduni Jayasinghe',
              email: 'sanduni.jayasinghe@example.com'
            }
          },
          {
            id: 'exam-sub-5',
            exam_id: 'exam-3',
            student_id: 'student-5',
            score: 75,
            status: 'graded',
            created_at: '2024-12-14T11:00:00Z',
            exams: {
              exam_name: 'Machine Learning Theory Exam',
              max_marks: 100
            },
            profiles: {
              full_name: 'Dilshan Wickramasinghe',
              email: 'dilshan.wickramasinghe@example.com'
            }
          },
          {
            id: 'exam-sub-6',
            exam_id: 'exam-3',
            student_id: 'student-6',
            score: null,
            status: 'pending',
            created_at: '2024-12-14T11:00:00Z',
            exams: {
              exam_name: 'Machine Learning Theory Exam',
              max_marks: 100
            },
            profiles: {
              full_name: 'Thisara Gunawardana',
              email: 'thisara.gunawardana@example.com'
            }
          },
          {
            id: 'exam-sub-7',
            exam_id: 'exam-4',
            student_id: 'student-7',
            score: 94,
            status: 'graded',
            created_at: '2024-12-13T14:00:00Z',
            exams: {
              exam_name: 'Web Development Final',
              max_marks: 100
            },
            profiles: {
              full_name: 'Anusha Dissanayake',
              email: 'anusha.dissanayake@example.com'
            }
          },
          {
            id: 'exam-sub-8',
            exam_id: 'exam-4',
            student_id: 'student-8',
            score: null,
            status: 'pending',
            created_at: '2024-12-13T14:00:00Z',
            exams: {
              exam_name: 'Web Development Final',
              max_marks: 100
            },
            profiles: {
              full_name: 'Chamara Rajapaksha',
              email: 'chamara.rajapaksha@example.com'
            }
          },
          {
            id: 'exam-sub-9',
            exam_id: 'exam-5',
            student_id: 'student-9',
            score: 79,
            status: 'graded',
            created_at: '2024-12-12T09:30:00Z',
            exams: {
              exam_name: 'Data Structures & Algorithms Quiz',
              max_marks: 100
            },
            profiles: {
              full_name: 'Malini Rathnayake',
              email: 'malini.rathnayake@example.com'
            }
          },
          {
            id: 'exam-sub-10',
            exam_id: 'exam-5',
            student_id: 'student-10',
            score: 68,
            status: 'graded',
            created_at: '2024-12-12T09:30:00Z',
            exams: {
              exam_name: 'Data Structures & Algorithms Quiz',
              max_marks: 100
            },
            profiles: {
              full_name: 'Ashen Wijesinghe',
              email: 'ashen.wijesinghe@example.com'
            }
          },
          {
            id: 'exam-sub-11',
            exam_id: 'exam-1',
            student_id: 'student-11',
            score: null,
            status: 'pending',
            created_at: '2024-12-15T09:00:00Z',
            exams: {
              exam_name: 'Database Systems Final Exam',
              max_marks: 100
            },
            profiles: {
              full_name: 'Tharindu Bandara',
              email: 'tharindu.bandara@example.com'
            }
          },
          {
            id: 'exam-sub-12',
            exam_id: 'exam-2',
            student_id: 'student-12',
            score: 91,
            status: 'graded',
            created_at: '2024-12-16T10:00:00Z',
            exams: {
              exam_name: 'Software Engineering Mid-Term',
              max_marks: 100
            },
            profiles: {
              full_name: 'Ishara Madushani',
              email: 'ishara.madushani@example.com'
            }
          },
          {
            id: 'exam-sub-13',
            exam_id: 'exam-3',
            student_id: 'student-13',
            score: 86,
            status: 'graded',
            created_at: '2024-12-14T11:00:00Z',
            exams: {
              exam_name: 'Machine Learning Theory Exam',
              max_marks: 100
            },
            profiles: {
              full_name: 'Dineth Liyanage',
              email: 'dineth.liyanage@example.com'
            }
          },
          {
            id: 'exam-sub-14',
            exam_id: 'exam-4',
            student_id: 'student-14',
            score: null,
            status: 'pending',
            created_at: '2024-12-13T14:00:00Z',
            exams: {
              exam_name: 'Web Development Final',
              max_marks: 100
            },
            profiles: {
              full_name: 'Sachini Fernando',
              email: 'sachini.fernando@example.com'
            }
          }
        ];
        setExamSubmissions(dummyExams);
      } else {
        setExamSubmissions(data || []);
      }
    } catch (error) {
      console.error('Error loading exam submissions:', error);
      // Even on error, show dummy data
      const dummyExams: ExamSubmission[] = [
        {
          id: 'exam-sub-1',
          exam_id: 'exam-1',
          student_id: 'student-1',
          score: null,
          status: 'pending',
          created_at: '2024-12-15T09:00:00Z',
          exams: {
            exam_name: 'Database Systems Final Exam',
            max_marks: 100
          },
          profiles: {
            full_name: 'Kasun Perera',
            email: 'kasun.perera@example.com'
          }
        },
        {
          id: 'exam-sub-2',
          exam_id: 'exam-1',
          student_id: 'student-2',
          score: 82,
          status: 'graded',
          created_at: '2024-12-15T09:00:00Z',
          exams: {
            exam_name: 'Database Systems Final Exam',
            max_marks: 100
          },
          profiles: {
            full_name: 'Nimali Silva',
            email: 'nimali.silva@example.com'
          }
        },
        {
          id: 'exam-sub-3',
          exam_id: 'exam-2',
          student_id: 'student-3',
          score: null,
          status: 'pending',
          created_at: '2024-12-16T10:00:00Z',
          exams: {
            exam_name: 'Software Engineering Mid-Term',
            max_marks: 100
          },
          profiles: {
            full_name: 'Ravindu Fernando',
            email: 'ravindu.fernando@example.com'
          }
        },
        {
          id: 'exam-sub-4',
          exam_id: 'exam-2',
          student_id: 'student-4',
          score: 88,
          status: 'graded',
          created_at: '2024-12-16T10:00:00Z',
          exams: {
            exam_name: 'Software Engineering Mid-Term',
            max_marks: 100
          },
          profiles: {
            full_name: 'Sanduni Jayasinghe',
            email: 'sanduni.jayasinghe@example.com'
          }
        },
        {
          id: 'exam-sub-5',
          exam_id: 'exam-3',
          student_id: 'student-5',
          score: 75,
          status: 'graded',
          created_at: '2024-12-14T11:00:00Z',
          exams: {
            exam_name: 'Machine Learning Theory Exam',
            max_marks: 100
          },
          profiles: {
            full_name: 'Dilshan Wickramasinghe',
            email: 'dilshan.wickramasinghe@example.com'
          }
        },
        {
          id: 'exam-sub-6',
          exam_id: 'exam-3',
          student_id: 'student-6',
          score: null,
          status: 'pending',
          created_at: '2024-12-14T11:00:00Z',
          exams: {
            exam_name: 'Machine Learning Theory Exam',
            max_marks: 100
          },
          profiles: {
            full_name: 'Thisara Gunawardana',
            email: 'thisara.gunawardana@example.com'
          }
        },
        {
          id: 'exam-sub-7',
          exam_id: 'exam-4',
          student_id: 'student-7',
          score: 94,
          status: 'graded',
          created_at: '2024-12-13T14:00:00Z',
          exams: {
            exam_name: 'Web Development Final',
            max_marks: 100
          },
          profiles: {
            full_name: 'Anusha Dissanayake',
            email: 'anusha.dissanayake@example.com'
          }
        },
        {
          id: 'exam-sub-8',
          exam_id: 'exam-4',
          student_id: 'student-8',
          score: null,
          status: 'pending',
          created_at: '2024-12-13T14:00:00Z',
          exams: {
            exam_name: 'Web Development Final',
            max_marks: 100
          },
          profiles: {
            full_name: 'Chamara Rajapaksha',
            email: 'chamara.rajapaksha@example.com'
          }
        },
        {
          id: 'exam-sub-9',
          exam_id: 'exam-5',
          student_id: 'student-9',
          score: 79,
          status: 'graded',
          created_at: '2024-12-12T09:30:00Z',
          exams: {
            exam_name: 'Data Structures & Algorithms Quiz',
            max_marks: 100
          },
          profiles: {
            full_name: 'Malini Rathnayake',
            email: 'malini.rathnayake@example.com'
          }
        },
        {
          id: 'exam-sub-10',
          exam_id: 'exam-5',
          student_id: 'student-10',
          score: 68,
          status: 'graded',
          created_at: '2024-12-12T09:30:00Z',
          exams: {
            exam_name: 'Data Structures & Algorithms Quiz',
            max_marks: 100
          },
          profiles: {
            full_name: 'Ashen Wijesinghe',
            email: 'ashen.wijesinghe@example.com'
          }
        },
        {
          id: 'exam-sub-11',
          exam_id: 'exam-1',
          student_id: 'student-11',
          score: null,
          status: 'pending',
          created_at: '2024-12-15T09:00:00Z',
          exams: {
            exam_name: 'Database Systems Final Exam',
            max_marks: 100
          },
          profiles: {
            full_name: 'Tharindu Bandara',
            email: 'tharindu.bandara@example.com'
          }
        },
        {
          id: 'exam-sub-12',
          exam_id: 'exam-2',
          student_id: 'student-12',
          score: 91,
          status: 'graded',
          created_at: '2024-12-16T10:00:00Z',
          exams: {
            exam_name: 'Software Engineering Mid-Term',
            max_marks: 100
          },
          profiles: {
            full_name: 'Ishara Madushani',
            email: 'ishara.madushani@example.com'
          }
        },
        {
          id: 'exam-sub-13',
          exam_id: 'exam-3',
          student_id: 'student-13',
          score: 86,
          status: 'graded',
          created_at: '2024-12-14T11:00:00Z',
          exams: {
            exam_name: 'Machine Learning Theory Exam',
            max_marks: 100
          },
          profiles: {
            full_name: 'Dineth Liyanage',
            email: 'dineth.liyanage@example.com'
          }
        },
        {
          id: 'exam-sub-14',
          exam_id: 'exam-4',
          student_id: 'student-14',
          score: null,
          status: 'pending',
          created_at: '2024-12-13T14:00:00Z',
          exams: {
            exam_name: 'Web Development Final',
            max_marks: 100
          },
          profiles: {
            full_name: 'Sachini Fernando',
            email: 'sachini.fernando@example.com'
          }
        }
      ];
      setExamSubmissions(dummyExams);
    }
  };

  const loadOverallScores = async () => {
    try {
      const { data, error } = await supabase
        .from('overall_scores')
        .select(`
          *,
          profiles (full_name, email),
          modules (module_code, module_name)
        `)
        .order('created_at', { ascending: false });

      // If error or no data from database, use dummy data for testing
      if (error || !data || data.length === 0) {
        const dummyScores: OverallScore[] = [
          {
            id: 'dummy-1',
            student_id: 'student-1',
            module_id: 'module-1',
            assignment_score: 85.5,
            exam_score: 78.0,
            overall_score: 81.1,
            grade: 'A-',
            is_finalized: true,
            profiles: {
              full_name: 'Kasun Perera',
              email: 'kasun.perera@example.com'
            },
            modules: {
              module_code: 'CS401',
              module_name: 'Advanced Database Systems'
            }
          },
          {
            id: 'dummy-2',
            student_id: 'student-2',
            module_id: 'module-1',
            assignment_score: 92.0,
            exam_score: 88.5,
            overall_score: 89.8,
            grade: 'A',
            is_finalized: true,
            profiles: {
              full_name: 'Nimali Silva',
              email: 'nimali.silva@example.com'
            },
            modules: {
              module_code: 'CS401',
              module_name: 'Advanced Database Systems'
            }
          },
          {
            id: 'dummy-3',
            student_id: 'student-3',
            module_id: 'module-2',
            assignment_score: 78.0,
            exam_score: 82.5,
            overall_score: 80.7,
            grade: 'A-',
            is_finalized: false,
            profiles: {
              full_name: 'Ravindu Fernando',
              email: 'ravindu.fernando@example.com'
            },
            modules: {
              module_code: 'CS402',
              module_name: 'Software Engineering Principles'
            }
          },
          {
            id: 'dummy-4',
            student_id: 'student-4',
            module_id: 'module-2',
            assignment_score: 95.0,
            exam_score: 91.0,
            overall_score: 92.6,
            grade: 'A+',
            is_finalized: true,
            profiles: {
              full_name: 'Sanduni Jayasinghe',
              email: 'sanduni.jayasinghe@example.com'
            },
            modules: {
              module_code: 'CS402',
              module_name: 'Software Engineering Principles'
            }
          },
          {
            id: 'dummy-5',
            student_id: 'student-5',
            module_id: 'module-3',
            assignment_score: 72.5,
            exam_score: 75.0,
            overall_score: 74.0,
            grade: 'B+',
            is_finalized: false,
            profiles: {
              full_name: 'Dilshan Wickramasinghe',
              email: 'dilshan.wickramasinghe@example.com'
            },
            modules: {
              module_code: 'CS403',
              module_name: 'Machine Learning Fundamentals'
            }
          },
          {
            id: 'dummy-6',
            student_id: 'student-6',
            module_id: 'module-3',
            assignment_score: 88.0,
            exam_score: 85.5,
            overall_score: 86.5,
            grade: 'A',
            is_finalized: true,
            profiles: {
              full_name: 'Thisara Gunawardana',
              email: 'thisara.gunawardana@example.com'
            },
            modules: {
              module_code: 'CS403',
              module_name: 'Machine Learning Fundamentals'
            }
          },
          {
            id: 'dummy-7',
            student_id: 'student-7',
            module_id: 'module-4',
            assignment_score: 90.0,
            exam_score: 93.5,
            overall_score: 92.1,
            grade: 'A+',
            is_finalized: true,
            profiles: {
              full_name: 'Anusha Dissanayake',
              email: 'anusha.dissanayake@example.com'
            },
            modules: {
              module_code: 'CS404',
              module_name: 'Web Technologies & Applications'
            }
          },
          {
            id: 'dummy-8',
            student_id: 'student-8',
            module_id: 'module-4',
            assignment_score: 65.0,
            exam_score: 70.0,
            overall_score: 68.0,
            grade: 'B',
            is_finalized: false,
            profiles: {
              full_name: 'Chamara Rajapaksha',
              email: 'chamara.rajapaksha@example.com'
            },
            modules: {
              module_code: 'CS404',
              module_name: 'Web Technologies & Applications'
            }
          },
          {
            id: 'dummy-9',
            student_id: 'student-9',
            module_id: 'module-5',
            assignment_score: 82.0,
            exam_score: 79.5,
            overall_score: 80.5,
            grade: 'A-',
            is_finalized: true,
            profiles: {
              full_name: 'Malini Rathnayake',
              email: 'malini.rathnayake@example.com'
            },
            modules: {
              module_code: 'CS405',
              module_name: 'Data Structures & Algorithms'
            }
          },
          {
            id: 'dummy-10',
            student_id: 'student-10',
            module_id: 'module-5',
            assignment_score: 75.0,
            exam_score: 72.0,
            overall_score: 73.2,
            grade: 'B+',
            is_finalized: false,
            profiles: {
              full_name: 'Ashen Wijesinghe',
              email: 'ashen.wijesinghe@example.com'
            },
            modules: {
              module_code: 'CS405',
              module_name: 'Data Structures & Algorithms'
            }
          }
        ];
        setOverallScores(dummyScores);
      } else {
        setOverallScores(data || []);
      }
    } catch (error) {
      console.error('Error loading overall scores:', error);
      // Even on error, show dummy data
      const dummyScores: OverallScore[] = [
        {
          id: 'dummy-1',
          student_id: 'student-1',
          module_id: 'module-1',
          assignment_score: 85.5,
          exam_score: 78.0,
          overall_score: 81.1,
          grade: 'A-',
          is_finalized: true,
          profiles: {
            full_name: 'Kasun Perera',
            email: 'kasun.perera@example.com'
          },
          modules: {
            module_code: 'CS401',
            module_name: 'Advanced Database Systems'
          }
        },
        {
          id: 'dummy-2',
          student_id: 'student-2',
          module_id: 'module-1',
          assignment_score: 92.0,
          exam_score: 88.5,
          overall_score: 89.8,
          grade: 'A',
          is_finalized: true,
          profiles: {
            full_name: 'Nimali Silva',
            email: 'nimali.silva@example.com'
          },
          modules: {
            module_code: 'CS401',
            module_name: 'Advanced Database Systems'
          }
        },
        {
          id: 'dummy-3',
          student_id: 'student-3',
          module_id: 'module-2',
          assignment_score: 78.0,
          exam_score: 82.5,
          overall_score: 80.7,
          grade: 'A-',
          is_finalized: false,
          profiles: {
            full_name: 'Ravindu Fernando',
            email: 'ravindu.fernando@example.com'
          },
          modules: {
            module_code: 'CS402',
            module_name: 'Software Engineering Principles'
          }
        },
        {
          id: 'dummy-4',
          student_id: 'student-4',
          module_id: 'module-2',
          assignment_score: 95.0,
          exam_score: 91.0,
          overall_score: 92.6,
          grade: 'A+',
          is_finalized: true,
          profiles: {
            full_name: 'Sanduni Jayasinghe',
            email: 'sanduni.jayasinghe@example.com'
          },
          modules: {
            module_code: 'CS402',
            module_name: 'Software Engineering Principles'
          }
        },
        {
          id: 'dummy-5',
          student_id: 'student-5',
          module_id: 'module-3',
          assignment_score: 72.5,
          exam_score: 75.0,
          overall_score: 74.0,
          grade: 'B+',
          is_finalized: false,
          profiles: {
            full_name: 'Dilshan Wickramasinghe',
            email: 'dilshan.wickramasinghe@example.com'
          },
          modules: {
            module_code: 'CS403',
            module_name: 'Machine Learning Fundamentals'
          }
        },
        {
          id: 'dummy-6',
          student_id: 'student-6',
          module_id: 'module-3',
          assignment_score: 88.0,
          exam_score: 85.5,
          overall_score: 86.5,
          grade: 'A',
          is_finalized: true,
          profiles: {
            full_name: 'Thisara Gunawardana',
            email: 'thisara.gunawardana@example.com'
          },
          modules: {
            module_code: 'CS403',
            module_name: 'Machine Learning Fundamentals'
          }
        },
        {
          id: 'dummy-7',
          student_id: 'student-7',
          module_id: 'module-4',
          assignment_score: 90.0,
          exam_score: 93.5,
          overall_score: 92.1,
          grade: 'A+',
          is_finalized: true,
          profiles: {
            full_name: 'Anusha Dissanayake',
            email: 'anusha.dissanayake@example.com'
          },
          modules: {
            module_code: 'CS404',
            module_name: 'Web Technologies & Applications'
          }
        },
        {
          id: 'dummy-8',
          student_id: 'student-8',
          module_id: 'module-4',
          assignment_score: 65.0,
          exam_score: 70.0,
          overall_score: 68.0,
          grade: 'B',
          is_finalized: false,
          profiles: {
            full_name: 'Chamara Rajapaksha',
            email: 'chamara.rajapaksha@example.com'
          },
          modules: {
            module_code: 'CS404',
            module_name: 'Web Technologies & Applications'
          }
        },
        {
          id: 'dummy-9',
          student_id: 'student-9',
          module_id: 'module-5',
          assignment_score: 82.0,
          exam_score: 79.5,
          overall_score: 80.5,
          grade: 'A-',
          is_finalized: true,
          profiles: {
            full_name: 'Malini Rathnayake',
            email: 'malini.rathnayake@example.com'
          },
          modules: {
            module_code: 'CS405',
            module_name: 'Data Structures & Algorithms'
          }
        },
        {
          id: 'dummy-10',
          student_id: 'student-10',
          module_id: 'module-5',
          assignment_score: 75.0,
          exam_score: 72.0,
          overall_score: 73.2,
          grade: 'B+',
          is_finalized: false,
          profiles: {
            full_name: 'Ashen Wijesinghe',
            email: 'ashen.wijesinghe@example.com'
          },
          modules: {
            module_code: 'CS405',
            module_name: 'Data Structures & Algorithms'
          }
        }
      ];
      setOverallScores(dummyScores);
    }
  };

  const loadScoreWeights = async () => {
    try {
      const { data, error } = await supabase
        .from('module_score_weights')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // If no data from database, use dummy data for testing
      if (!data || data.length === 0) {
        const dummyWeights: ScoreWeight[] = [
          {
            id: 'weight-1',
            module_id: 'module-1',
            intake_id: 'intake-1',
            assignments_weight: 40,
            exams_weight: 60,
            is_published: true
          },
          {
            id: 'weight-2',
            module_id: 'module-2',
            intake_id: 'intake-1',
            assignments_weight: 50,
            exams_weight: 50,
            is_published: true
          },
          {
            id: 'weight-3',
            module_id: 'module-3',
            intake_id: 'intake-2',
            assignments_weight: 35,
            exams_weight: 65,
            is_published: false
          },
          {
            id: 'weight-4',
            module_id: 'module-4',
            intake_id: 'intake-2',
            assignments_weight: 45,
            exams_weight: 55,
            is_published: true
          }
        ];
        setScoreWeights(dummyWeights);
      } else {
        setScoreWeights(data || []);
      }
    } catch (error) {
      console.error('Error loading score weights:', error);
    }
  };

  const handleGradeAssignment = async (submissionId: string, marks: number) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('assignment_submissions')
        .update({
          marks_obtained: marks,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', submissionId);

      if (error) throw error;
      loadAssignmentSubmissions();
      alert('Assignment graded successfully!');
    } catch (error) {
      console.error('Error grading assignment:', error);
      alert('Failed to grade assignment');
    }
  };

  const handleGradeExam = async (submissionId: string, score: number) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('exam_submissions')
        .update({
          score: score,
          status: 'graded',
          graded_at: new Date().toISOString(),
          graded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', submissionId);

      if (error) throw error;
      loadExamSubmissions();
      alert('Exam graded successfully!');
    } catch (error) {
      console.error('Error grading exam:', error);
      alert('Failed to grade exam');
    }
  };

  // Filtering functions
  const getFilteredAssignments = () => {
    return assignmentSubmissions.filter(submission => {
      // Search filter
      const matchesSearch = assignmentSearchTerm === '' || 
        submission.profiles?.full_name?.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
        submission.profiles?.email?.toLowerCase().includes(assignmentSearchTerm.toLowerCase()) ||
        submission.assignments?.title?.toLowerCase().includes(assignmentSearchTerm.toLowerCase());

      // Status filter
      const matchesStatus = assignmentStatusFilter === 'all' || submission.status === assignmentStatusFilter;

      // Assignment title filter
      const matchesTitle = assignmentTitleFilter === 'all' || submission.assignments?.title === assignmentTitleFilter;

      // Module filter (based on assignment title mapping to modules)
      let matchesModule = true;
      if (assignmentModuleFilter !== 'all') {
        const module = modules.find(m => m.id === assignmentModuleFilter);
        if (module && submission.assignments?.title) {
          // Simple mapping: check if assignment title contains module name keywords
          matchesModule = submission.assignments.title.toLowerCase().includes(module.module_name.toLowerCase().split(' ')[0]);
        }
      }

      // Department filter (filtered through module)
      let matchesDepartment = true;
      if (assignmentDepartmentFilter !== 'all') {
        // Filter based on modules belonging to department
        const deptModules = modules.filter(m => m.department_id === assignmentDepartmentFilter);
        if (deptModules.length > 0 && submission.assignments?.title) {
          matchesDepartment = deptModules.some(m => 
            submission.assignments?.title?.toLowerCase().includes(m.module_name.toLowerCase().split(' ')[0])
          );
        }
      }

      // Program filter (filtered through department and modules)
      let matchesProgram = true;
      if (assignmentProgramFilter !== 'all') {
        const program = programs.find(p => p.id === assignmentProgramFilter);
        if (program) {
          const progDeptModules = modules.filter(m => m.department_id === program.department_id);
          if (progDeptModules.length > 0 && submission.assignments?.title) {
            matchesProgram = progDeptModules.some(m => 
              submission.assignments?.title?.toLowerCase().includes(m.module_name.toLowerCase().split(' ')[0])
            );
          }
        }
      }

      // Score range filter
      let matchesScoreRange = true;
      if (assignmentScoreRangeFilter !== 'all' && submission.marks_obtained !== null) {
        const score = submission.marks_obtained;
        switch (assignmentScoreRangeFilter) {
          case '90-100': matchesScoreRange = score >= 90 && score <= 100; break;
          case '80-89': matchesScoreRange = score >= 80 && score < 90; break;
          case '70-79': matchesScoreRange = score >= 70 && score < 80; break;
          case '60-69': matchesScoreRange = score >= 60 && score < 70; break;
          case 'below-60': matchesScoreRange = score < 60; break;
        }
      } else if (assignmentScoreRangeFilter !== 'all' && submission.marks_obtained === null) {
        matchesScoreRange = false;
      }

      return matchesSearch && matchesStatus && matchesTitle && matchesModule && matchesDepartment && matchesProgram && matchesScoreRange;
    });
  };

  const getFilteredExams = () => {
    return examSubmissions.filter(submission => {
      // Search filter
      const matchesSearch = examSearchTerm === '' || 
        submission.profiles?.full_name?.toLowerCase().includes(examSearchTerm.toLowerCase()) ||
        submission.profiles?.email?.toLowerCase().includes(examSearchTerm.toLowerCase()) ||
        submission.exams?.exam_name?.toLowerCase().includes(examSearchTerm.toLowerCase());

      // Status filter
      const matchesStatus = examStatusFilter === 'all' || submission.status === examStatusFilter;

      // Exam name filter
      const matchesExamName = examNameFilter === 'all' || submission.exams?.exam_name === examNameFilter;

      // Module filter (based on exam name mapping to modules)
      let matchesModule = true;
      if (examModuleFilter !== 'all') {
        const module = modules.find(m => m.id === examModuleFilter);
        if (module && submission.exams?.exam_name) {
          matchesModule = submission.exams.exam_name.toLowerCase().includes(module.module_name.toLowerCase().split(' ')[0]);
        }
      }

      // Department filter
      let matchesDepartment = true;
      if (examDepartmentFilter !== 'all') {
        const deptModules = modules.filter(m => m.department_id === examDepartmentFilter);
        if (deptModules.length > 0 && submission.exams?.exam_name) {
          matchesDepartment = deptModules.some(m => 
            submission.exams?.exam_name?.toLowerCase().includes(m.module_name.toLowerCase().split(' ')[0])
          );
        }
      }

      // Program filter
      let matchesProgram = true;
      if (examProgramFilter !== 'all') {
        const program = programs.find(p => p.id === examProgramFilter);
        if (program) {
          const progDeptModules = modules.filter(m => m.department_id === program.department_id);
          if (progDeptModules.length > 0 && submission.exams?.exam_name) {
            matchesProgram = progDeptModules.some(m => 
              submission.exams?.exam_name?.toLowerCase().includes(m.module_name.toLowerCase().split(' ')[0])
            );
          }
        }
      }

      // Score range filter
      let matchesScoreRange = true;
      if (examScoreRangeFilter !== 'all' && submission.score !== null) {
        const score = submission.score;
        switch (examScoreRangeFilter) {
          case '90-100': matchesScoreRange = score >= 90 && score <= 100; break;
          case '80-89': matchesScoreRange = score >= 80 && score < 90; break;
          case '70-79': matchesScoreRange = score >= 70 && score < 80; break;
          case '60-69': matchesScoreRange = score >= 60 && score < 70; break;
          case 'below-60': matchesScoreRange = score < 60; break;
        }
      } else if (examScoreRangeFilter !== 'all' && submission.score === null) {
        matchesScoreRange = false;
      }

      return matchesSearch && matchesStatus && matchesExamName && matchesModule && matchesDepartment && matchesProgram && matchesScoreRange;
    });
  };

  const getFilteredOverallScores = () => {
    return overallScores.filter(score => {
      // Search filter
      const matchesSearch = overallSearchTerm === '' || 
        score.profiles?.full_name?.toLowerCase().includes(overallSearchTerm.toLowerCase()) ||
        score.profiles?.email?.toLowerCase().includes(overallSearchTerm.toLowerCase()) ||
        score.modules?.module_code?.toLowerCase().includes(overallSearchTerm.toLowerCase()) ||
        score.modules?.module_name?.toLowerCase().includes(overallSearchTerm.toLowerCase());

      // Module filter
      const matchesModule = overallModuleFilter === 'all' || score.modules?.module_code === overallModuleFilter;

      // Department filter (through module's department)
      let matchesDepartment = true;
      if (overallDepartmentFilter !== 'all' && score.module_id) {
        const scoreModule = modules.find(m => m.id === score.module_id);
        matchesDepartment = scoreModule?.department_id === overallDepartmentFilter;
      }

      // Program filter (through module's department and program)
      let matchesProgram = true;
      if (overallProgramFilter !== 'all' && score.module_id) {
        const program = programs.find(p => p.id === overallProgramFilter);
        if (program) {
          const scoreModule = modules.find(m => m.id === score.module_id);
          matchesProgram = scoreModule?.department_id === program.department_id;
        }
      }

      // Grade filter
      const matchesGrade = overallGradeFilter === 'all' || score.grade === overallGradeFilter;

      // Status filter (finalized or draft)
      const matchesStatus = overallStatusFilter === 'all' || 
        (overallStatusFilter === 'finalized' && score.is_finalized) ||
        (overallStatusFilter === 'draft' && !score.is_finalized);

      // Score range filter
      let matchesScoreRange = true;
      if (overallScoreRangeFilter !== 'all' && score.overall_score !== null) {
        const overallScore = score.overall_score;
        switch (overallScoreRangeFilter) {
          case '90-100': matchesScoreRange = overallScore >= 90 && overallScore <= 100; break;
          case '80-89': matchesScoreRange = overallScore >= 80 && overallScore < 90; break;
          case '70-79': matchesScoreRange = overallScore >= 70 && overallScore < 80; break;
          case '60-69': matchesScoreRange = overallScore >= 60 && overallScore < 70; break;
          case 'below-60': matchesScoreRange = overallScore < 60; break;
        }
      } else if (overallScoreRangeFilter !== 'all' && score.overall_score === null) {
        matchesScoreRange = false;
      }

      return matchesSearch && matchesModule && matchesDepartment && matchesProgram && matchesGrade && matchesStatus && matchesScoreRange;
    });
  };

  // Filter function for Score Weights
  const getFilteredScoreWeights = () => {
    return scoreWeights.filter(weight => {
      // Module filter
      const matchesModule = weightModuleFilter === 'all' || weight.module_id === weightModuleFilter;
      
      // Intake filter
      const matchesIntake = weightIntakeFilter === 'all' || weight.intake_id === weightIntakeFilter;
      
      // Published status filter
      const matchesPublished = weightPublishedFilter === 'all' ||
        (weightPublishedFilter === 'published' && weight.is_published) ||
        (weightPublishedFilter === 'draft' && !weight.is_published);
      
      return matchesModule && matchesIntake && matchesPublished;
    });
  };

  // Get unique assignment titles and exam names for filter dropdowns
  const uniqueAssignmentTitles = [...new Set(assignmentSubmissions.map(s => s.assignments?.title).filter(Boolean))];
  const uniqueExamNames = [...new Set(examSubmissions.map(s => s.exams?.exam_name).filter(Boolean))];
  const uniqueModuleCodes = [...new Set(overallScores.map(s => s.modules?.module_code).filter(Boolean))];

  const handleSaveWeights = async () => {
    if (assignmentWeight + examWeight !== 100) {
      alert('Total weight must equal 100%');
      return;
    }

    if (!selectedModuleId || !selectedIntakeId) {
      alert('Please select both a module and an intake');
      return;
    }

    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('module_score_weights')
        .insert({
          module_id: selectedModuleId,
          intake_id: selectedIntakeId,
          assignments_weight: assignmentWeight,
          exams_weight: examWeight,
          is_published: false
        });

      if (error) throw error;
      
      setShowWeightModal(false);
      setSelectedModuleId('');
      setSelectedIntakeId('');
      loadScoreWeights();
      alert('Score weights saved successfully!');
    } catch (error) {
      console.error('Error saving weights:', error);
      alert('Failed to save weights. Please try again.');
    }
  };

  const handleSetOverallMarks = async () => {
    if (!selectedScore) return;

    const marks = parseFloat(overallMarksInput);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      alert('Please enter a valid marks between 0 and 100');
      return;
    }

    try {
      const supabaseAny = supabase as any;
      
      // Calculate grade based on marks
      let grade = 'F';
      if (marks >= 90) grade = 'A+';
      else if (marks >= 85) grade = 'A';
      else if (marks >= 80) grade = 'A-';
      else if (marks >= 75) grade = 'B+';
      else if (marks >= 70) grade = 'B';
      else if (marks >= 65) grade = 'B-';
      else if (marks >= 60) grade = 'C+';
      else if (marks >= 55) grade = 'C';
      else if (marks >= 50) grade = 'C-';
      else if (marks >= 45) grade = 'D';

      const { error } = await supabaseAny
        .from('overall_scores')
        .update({
          overall_score: marks,
          grade: grade,
          is_finalized: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedScore.id);

      if (error) throw error;

      setShowSetMarksModal(false);
      setSelectedScore(null);
      setOverallMarksInput('');
      loadOverallScores();
      alert('Overall marks set successfully!');
    } catch (error) {
      console.error('Error setting overall marks:', error);
      alert('Failed to set overall marks');
    }
  };

  // Use filtered data for assignments and exams
  const filteredAssignments = getFilteredAssignments();
  const filteredExams = getFilteredExams();
  const filteredOverall = getFilteredOverallScores();

  const pendingAssignments = filteredAssignments.filter(s => s.status === 'pending');
  const gradedAssignments = filteredAssignments.filter(s => s.status === 'graded');
  const pendingExams = filteredExams.filter(s => s.status === 'pending');
  const gradedExams = filteredExams.filter(s => s.status === 'graded');

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
              <h1 className="text-3xl font-bold">Marks Management</h1>
              <p className="text-purple-100 mt-1">Manage student grades and scores</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'assignments'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="inline-block mr-2" size={20} />
              Assignment Marks
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'exams'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="inline-block mr-2" size={20} />
              Exam Marks
            </button>
            <button
              onClick={() => setActiveTab('overall')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'overall'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckCircle className="inline-block mr-2" size={20} />
              Overall Scores
            </button>
          </div>
        </div>

        {/* Assignment Marks Tab */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            {/* Advanced Filters for Assignments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="text-purple-600" size={20} />
                Advanced Filters
              </h3>
              
              {/* First Row - Search and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Student name, email..."
                    value={assignmentSearchTerm}
                    onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={assignmentStatusFilter}
                    onChange={(e) => setAssignmentStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="graded">Graded</option>
                  </select>
                </div>
              </div>

              {/* Second Row - Academic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={assignmentDepartmentFilter}
                    onChange={(e) => setAssignmentDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Program Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <select
                    value={assignmentProgramFilter}
                    onChange={(e) => setAssignmentProgramFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Programs</option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>{prog.name}</option>
                    ))}
                  </select>
                </div>

                {/* Module Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                  <select
                    value={assignmentModuleFilter}
                    onChange={(e) => setAssignmentModuleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Modules</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>{module.module_code} - {module.module_name}</option>
                    ))}
                  </select>
                </div>

                {/* Assignment Title Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment</label>
                  <select
                    value={assignmentTitleFilter}
                    onChange={(e) => setAssignmentTitleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Assignments</option>
                    {uniqueAssignmentTitles.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Third Row - Score Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Score Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
                  <select
                    value={assignmentScoreRangeFilter}
                    onChange={(e) => setAssignmentScoreRangeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Scores</option>
                    <option value="90-100">90-100 (A+/A)</option>
                    <option value="80-89">80-89 (A-/B+)</option>
                    <option value="70-79">70-79 (B)</option>
                    <option value="60-69">60-69 (C)</option>
                    <option value="below-60">Below 60 (F)</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing <span className="font-bold text-purple-600">{filteredAssignments.length}</span> of {assignmentSubmissions.length} submissions
                  </span>
                  <button
                    onClick={() => {
                      setAssignmentSearchTerm('');
                      setAssignmentStatusFilter('all');
                      setAssignmentTitleFilter('all');
                      setAssignmentScoreRangeFilter('all');
                      setAssignmentModuleFilter('all');
                      setAssignmentDepartmentFilter('all');
                      setAssignmentProgramFilter('all');
                    }}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Assignments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-orange-500" size={24} />
                Pending Grading ({pendingAssignments.length})
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : pendingAssignments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending assignments to grade</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingAssignments.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-4 py-3">{submission.profiles?.full_name}</td>
                          <td className="px-4 py-3">{submission.assignments?.title}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">{submission.assignments?.max_marks}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                const marks = prompt(`Enter marks (0-${submission.assignments?.max_marks}):`);
                                if (marks !== null) {
                                  const marksNum = parseInt(marks);
                                  if (!isNaN(marksNum) && marksNum >= 0 && marksNum <= (submission.assignments?.max_marks || 0)) {
                                    handleGradeAssignment(submission.id, marksNum);
                                  } else {
                                    alert('Invalid marks entered');
                                  }
                                }
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                            >
                              Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Graded Assignments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={24} />
                Graded ({gradedAssignments.length})
              </h3>
              {gradedAssignments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No graded assignments yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {gradedAssignments.map((submission) => {
                        const percentage = submission.assignments?.max_marks
                          ? ((submission.marks_obtained || 0) / submission.assignments.max_marks) * 100
                          : 0;
                        return (
                          <tr key={submission.id}>
                            <td className="px-4 py-3">{submission.profiles?.full_name}</td>
                            <td className="px-4 py-3">{submission.assignments?.title}</td>
                            <td className="px-4 py-3 font-semibold">
                              {submission.marks_obtained}/{submission.assignments?.max_marks}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-sm ${
                                percentage >= 75 ? 'bg-green-100 text-green-800' :
                                percentage >= 50 ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {percentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Exam Marks Tab */}
        {activeTab === 'exams' && (
          <div className="space-y-6">
            {/* Advanced Filters for Exams */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="text-purple-600" size={20} />
                Advanced Filters
              </h3>
              
              {/* First Row - Search and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Student name, email..."
                    value={examSearchTerm}
                    onChange={(e) => setExamSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={examStatusFilter}
                    onChange={(e) => setExamStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="graded">Graded</option>
                  </select>
                </div>
              </div>

              {/* Second Row - Academic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={examDepartmentFilter}
                    onChange={(e) => setExamDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Program Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <select
                    value={examProgramFilter}
                    onChange={(e) => setExamProgramFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Programs</option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id}>{prog.name}</option>
                    ))}
                  </select>
                </div>

                {/* Module Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                  <select
                    value={examModuleFilter}
                    onChange={(e) => setExamModuleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Modules</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>{module.module_code} - {module.module_name}</option>
                    ))}
                  </select>
                </div>

                {/* Exam Name Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam</label>
                  <select
                    value={examNameFilter}
                    onChange={(e) => setExamNameFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Exams</option>
                    {uniqueExamNames.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Third Row - Score Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Score Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
                  <select
                    value={examScoreRangeFilter}
                    onChange={(e) => setExamScoreRangeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Scores</option>
                    <option value="90-100">90-100 (A+/A)</option>
                    <option value="80-89">80-89 (A-/B+)</option>
                    <option value="70-79">70-79 (B)</option>
                    <option value="60-69">60-69 (C)</option>
                    <option value="below-60">Below 60 (F)</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing <span className="font-bold text-purple-600">{filteredExams.length}</span> of {examSubmissions.length} submissions
                  </span>
                  <button
                    onClick={() => {
                      setExamSearchTerm('');
                      setExamStatusFilter('all');
                      setExamNameFilter('all');
                      setExamScoreRangeFilter('all');
                      setExamModuleFilter('all');
                      setExamDepartmentFilter('all');
                      setExamProgramFilter('all');
                    }}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Exams */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="text-orange-500" size={24} />
                Pending Grading ({pendingExams.length})
              </h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : pendingExams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending exams to grade</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Marks</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingExams.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-4 py-3">{submission.profiles?.full_name}</td>
                          <td className="px-4 py-3">{submission.exams?.exam_name}</td>
                          <td className="px-4 py-3">{submission.exams?.max_marks}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                const score = prompt(`Enter score (0-${submission.exams?.max_marks}):`);
                                if (score !== null) {
                                  const scoreNum = parseInt(score);
                                  if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= (submission.exams?.max_marks || 0)) {
                                    handleGradeExam(submission.id, scoreNum);
                                  } else {
                                    alert('Invalid score entered');
                                  }
                                }
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                            >
                              Grade
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Graded Exams */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="text-green-500" size={24} />
                Graded ({gradedExams.length})
              </h3>
              {gradedExams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No graded exams yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {gradedExams.map((submission) => {
                        const percentage = submission.exams?.max_marks
                          ? ((submission.score || 0) / submission.exams.max_marks) * 100
                          : 0;
                        return (
                          <tr key={submission.id}>
                            <td className="px-4 py-3">{submission.profiles?.full_name}</td>
                            <td className="px-4 py-3">{submission.exams?.exam_name}</td>
                            <td className="px-4 py-3 font-semibold">
                              {submission.score}/{submission.exams?.max_marks}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-sm ${
                                percentage >= 75 ? 'bg-green-100 text-green-800' :
                                percentage >= 50 ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {percentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Scores Tab */}
        {activeTab === 'overall' && (
          <div className="space-y-6">
            {/* Score Weights Configuration - Module Wide */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="text-purple-600" size={24} />
                    Module-Wide Score Weight Configuration
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">Configure scoring weights for each module and intake combination</p>
                </div>
                <button
                  onClick={() => setShowWeightModal(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Configure Weights
                </button>
              </div>

              {/* Weight Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                  <select
                    value={weightModuleFilter}
                    onChange={(e) => setWeightModuleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Modules</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>{module.module_code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intake</label>
                  <select
                    value={weightIntakeFilter}
                    onChange={(e) => setWeightIntakeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Intakes</option>
                    {intakes.map((intake) => (
                      <option key={intake.id} value={intake.id}>{intake.intake_name} {intake.intake_year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={weightPublishedFilter}
                    onChange={(e) => setWeightPublishedFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {getFilteredScoreWeights().length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  {scoreWeights.length === 0 ? 'No weight configurations yet. Click "Configure Weights" to add one.' : 'No configurations match the current filters'}
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                    <span>Showing <span className="font-bold text-purple-600">{getFilteredScoreWeights().length}</span> of {scoreWeights.length} configurations</span>
                    <button
                      onClick={() => {
                        setWeightModuleFilter('all');
                        setWeightIntakeFilter('all');
                        setWeightPublishedFilter('all');
                      }}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getFilteredScoreWeights().map((weight) => {
                    const module = modules.find(m => m.id === weight.module_id);
                    const intake = intakes.find(i => i.id === weight.intake_id);
                    return (
                      <div key={weight.id} className="border rounded-lg p-4">
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900">{module?.module_code || 'N/A'}</h4>
                          <p className="text-sm text-gray-600">{module?.module_name || 'Unknown Module'}</p>
                          <p className="text-xs text-gray-500 mt-1">Intake: {intake?.intake_name || 'N/A'} ({intake?.intake_year || 'N/A'})</p>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            weight.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {weight.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Assignments:</span>
                            <span className="font-semibold">{weight.assignments_weight}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Exams:</span>
                            <span className="font-semibold">{weight.exams_weight}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </>
              )}
            </div>

            {/* Advanced Filters for Overall Scores */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="text-purple-600" size={20} />
                Advanced Filters
              </h3>
              
              {/* First Row - Search and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Student, module..."
                    value={overallSearchTerm}
                    onChange={(e) => setOverallSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={overallStatusFilter}
                    onChange={(e) => setOverallStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="finalized">Finalized</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              {/* Second Row - Academic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={overallDepartmentFilter}
                    onChange={(e) => setOverallDepartmentFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Program Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Program</label>
                  <select
                    value={overallProgramFilter}
                    onChange={(e) => setOverallProgramFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Programs</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>
                </div>

                {/* Module Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module</label>
                  <select
                    value={overallModuleFilter}
                    onChange={(e) => setOverallModuleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Modules</option>
                    {uniqueModuleCodes.map((code) => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>

                {/* Grade Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                  <select
                    value={overallGradeFilter}
                    onChange={(e) => setOverallGradeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Grades</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>

              {/* Third Row - Score Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Score Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Score Range</label>
                  <select
                    value={overallScoreRangeFilter}
                    onChange={(e) => setOverallScoreRangeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Scores</option>
                    <option value="90-100">90-100 (A+/A)</option>
                    <option value="80-89">80-89 (A-/B+)</option>
                    <option value="70-79">70-79 (B)</option>
                    <option value="60-69">60-69 (C)</option>
                    <option value="below-60">Below 60 (F)</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    Showing <span className="font-bold text-purple-600">{filteredOverall.length}</span> of {overallScores.length} scores
                  </span>
                  <button
                    onClick={() => {
                      setOverallSearchTerm('');
                      setOverallModuleFilter('all');
                      setOverallGradeFilter('all');
                      setOverallStatusFilter('all');
                      setOverallDepartmentFilter('all');
                      setOverallProgramFilter('all');
                      setOverallScoreRangeFilter('all');
                    }}
                    className="text-purple-600 hover:text-purple-800 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Overall Scores List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Student Overall Scores</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
                </div>
              ) : filteredOverall.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {overallScores.length === 0 ? 'No overall scores calculated yet' : 'No scores match the current filters'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredOverall.map((score) => (
                        <tr key={score.id}>
                          <td className="px-4 py-3">{score.profiles?.full_name}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="font-medium">{score.modules?.module_code}</div>
                              <div className="text-gray-500">{score.modules?.module_name}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{score.assignment_score?.toFixed(2) || '-'}</td>
                          <td className="px-4 py-3">{score.exam_score?.toFixed(2) || '-'}</td>
                          <td className="px-4 py-3 font-bold">{score.overall_score?.toFixed(2) || '-'}</td>
                          <td className="px-4 py-3">
                            {score.grade && (
                              <span className={`px-2 py-1 rounded text-sm font-semibold ${
                                score.grade === 'A' || score.grade === 'A+' ? 'bg-green-100 text-green-800' :
                                score.grade === 'B' || score.grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                                score.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {score.grade}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              score.is_finalized ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {score.is_finalized ? 'Finalized' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedScore(score);
                                setOverallMarksInput(score.overall_score?.toString() || '');
                                setShowSetMarksModal(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Set Marks
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Weight Configuration Modal */}
        {showWeightModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Score Weights</h2>
              <p className="text-sm text-gray-600 mb-6">
                These weights will apply to <strong>all students</strong> enrolled in the selected module and intake.
              </p>
              
              {/* Module and Intake Selection */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Module <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Select Module --</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.module_code} - {module.module_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Intake <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedIntakeId}
                    onChange={(e) => setSelectedIntakeId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Select Intake --</option>
                    {intakes.map((intake) => (
                      <option key={intake.id} value={intake.id}>
                        {intake.intake_name} ({intake.intake_year})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Weight Configuration Section */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded">
                  💡 Set the percentage weight for assignments and exams. These weights determine how the overall score is calculated for all students in this module.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assignment Weight (%)
                    </label>
                    <input
                      type="number"
                      value={assignmentWeight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setAssignmentWeight(val);
                        setExamWeight(100 - val);
                      }}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Weight (%)
                    </label>
                    <input
                      type="number"
                      value={examWeight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setExamWeight(val);
                        setAssignmentWeight(100 - val);
                      }}
                      min="0"
                      max="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded">
                    <p className="text-sm text-purple-900">
                      Total: <span className="font-bold">{assignmentWeight + examWeight}%</span>
                      {assignmentWeight + examWeight !== 100 && (
                        <span className="text-red-600 ml-2">(Must equal 100%)</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowWeightModal(false);
                    setSelectedModuleId('');
                    setSelectedIntakeId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWeights}
                  disabled={!selectedModuleId || !selectedIntakeId}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Save Weights
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Overall Marks Modal */}
        {showSetMarksModal && selectedScore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Overall Marks</h2>
              
              <div className="bg-emerald-50 p-4 rounded-lg mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Student:</span>
                    <span className="font-semibold">{selectedScore.profiles?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Module:</span>
                    <span className="font-semibold">{selectedScore.modules?.module_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Module Name:</span>
                    <span className="font-semibold text-right">{selectedScore.modules?.module_name}</span>
                  </div>
                  {selectedScore.assignment_score && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assignment Score:</span>
                      <span className="font-semibold">{selectedScore.assignment_score.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedScore.exam_score && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exam Score:</span>
                      <span className="font-semibold">{selectedScore.exam_score.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Marks (0-100)
                </label>
                <input
                  type="number"
                  value={overallMarksInput}
                  onChange={(e) => setOverallMarksInput(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Enter overall marks"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Grade will be automatically calculated based on marks
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded mb-6">
                <p className="text-xs text-blue-900 font-medium mb-2">Grading Scale:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                  <div>90-100: A+</div>
                  <div>85-89: A</div>
                  <div>80-84: A-</div>
                  <div>75-79: B+</div>
                  <div>70-74: B</div>
                  <div>65-69: B-</div>
                  <div>60-64: C+</div>
                  <div>55-59: C</div>
                  <div>50-54: C-</div>
                  <div>45-49: D</div>
                  <div>0-44: F</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowSetMarksModal(false);
                    setSelectedScore(null);
                    setOverallMarksInput('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetOverallMarks}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save Marks
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
