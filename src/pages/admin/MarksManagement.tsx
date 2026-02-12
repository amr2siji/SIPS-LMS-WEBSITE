import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, Clock, Settings, Download, Eye, X, Check } from 'lucide-react';
import { adminService } from '../../services/adminService';

interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  marks_obtained: number | null;
  status: string;
  submitted_at: string | any[]; // Can be ISO string or array from backend
  submission_url?: string;
  submission_name?: string;
  feedback?: string;
  assignments?: {
    title: string;
    max_marks: number;
  };
  profiles?: {
    full_name: string;
    email: string;
  };
  moduleCode?: string;
  moduleName?: string;
  departmentName?: string;
  programName?: string;
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
  moduleCode?: string;
  moduleName?: string;
  departmentName?: string;
  programName?: string;
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
  is_published?: boolean;
  profiles?: {
    full_name: string;
    email: string;
  };
  modules?: {
    module_code: string;
    module_name: string;
  };
  departmentName?: string;
  programName?: string;
}

interface ScoreWeight {
  id: string;
  module_id: string | number;
  intake_id: string | number;
  assignments_weight: number;
  exams_weight: number;
  is_published: boolean;
  // Optional fields from backend that include display info
  moduleCode?: string;
  moduleName?: string;
  intakeName?: string;
  intakeYear?: number;
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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedScore, setSelectedScore] = useState<OverallScore | null>(null);
  const [overallMarksInput, setOverallMarksInput] = useState('');
  const [assignmentWeight, setAssignmentWeight] = useState(40);
  const [examWeight, setExamWeight] = useState(60);
  
  // Module and Intake selection
  const [modules, setModules] = useState<any[]>([]);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedIntakeId, setSelectedIntakeId] = useState('');

  // Publish modal state
  const [publishModuleId, setPublishModuleId] = useState('');
  const [publishIntakeId, setPublishIntakeId] = useState('');
  const [publishAction, setPublishAction] = useState<'publish' | 'unpublish'>('publish');

  // Filter states for Assignment Marks
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('all'); // all, pending, graded
  const [assignmentTitleFilter, setAssignmentTitleFilter] = useState('all');
  const [assignmentScoreRangeFilter, setAssignmentScoreRangeFilter] = useState('all'); // all, 90-100, 80-89, 70-79, 60-69, below-60
  const [assignmentModuleFilter, setAssignmentModuleFilter] = useState('all');
  const [assignmentIntakeFilter, setAssignmentIntakeFilter] = useState('all');

  // Filter states for Exam Marks
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const [examStatusFilter, setExamStatusFilter] = useState('all'); // all, pending, graded
  const [examNameFilter, setExamNameFilter] = useState('all');
  const [examScoreRangeFilter, setExamScoreRangeFilter] = useState('all'); // all, 90-100, 80-89, 70-79, 60-69, below-60
  const [examModuleFilter, setExamModuleFilter] = useState('all');
  const [examIntakeFilter, setExamIntakeFilter] = useState('all');

  // Filter states for Overall Scores
  const [overallSearchTerm, setOverallSearchTerm] = useState('');
  const [overallModuleFilter, setOverallModuleFilter] = useState('all');
  const [overallIntakeFilter, setOverallIntakeFilter] = useState('all');
  const [overallGradeFilter, setOverallGradeFilter] = useState('all'); // all, A+, A, A-, B+, B, C, F
  const [overallStatusFilter, setOverallStatusFilter] = useState('all'); // all, finalized, draft
  const [overallScoreRangeFilter, setOverallScoreRangeFilter] = useState('all'); // all, 90-100, 80-89, 70-79, 60-69, below-60

  // Notification state
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Grading modal state
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeModalData, setGradeModalData] = useState<{
    submissionId: string;
    studentName: string;
    examName: string;
    maxMarks: number;
  } | null>(null);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Assignment grading modal state
  const [showAssignmentGradeModal, setShowAssignmentGradeModal] = useState(false);
  const [assignmentGradeModalData, setAssignmentGradeModalData] = useState<{
    submissionId: string;
    studentName: string;
    assignmentTitle: string;
    maxMarks: number;
    submissionUrl?: string;
    submissionName?: string;
  } | null>(null);
  const [assignmentGradeMarks, setAssignmentGradeMarks] = useState('');
  const [assignmentGradeFeedback, setAssignmentGradeFeedback] = useState('');

  // Notification helper function
  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => setNotification({ show: false, type: 'success', title: '', message: '' }), 4000);
  };

  // Handle viewing assignment file with authentication
  const handleViewAssignmentFile = async (fileUrl: string, fileName: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        showNotification('error', 'Authentication Error', 'Please login again to view files');
        return;
      }

      // Fetch file with authentication header
      const response = await fetch(`${API_BASE_URL}${fileUrl}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load file');
      }

      // Create blob URL and open in new tab
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Open in new window
      const newWindow = window.open(blobUrl, '_blank');
      
      // Clean up blob URL after window loads (or after 1 minute as fallback)
      if (newWindow) {
        newWindow.addEventListener('load', () => {
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        });
      } else {
        // Fallback: download if popup blocked
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || 'assignment-file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      }
    } catch (error: any) {
      console.error('Error viewing file:', error);
      showNotification('error', 'Error', 'Failed to load file. Please try again.');
    }
  };

  // Helper function to parse date array from backend
  const parseDateArray = (dateArray: any): string => {
    if (!dateArray) return 'N/A';
    
    // Check if it's already a string
    if (typeof dateArray === 'string') {
      try {
        return new Date(dateArray).toLocaleString();
      } catch {
        return 'Invalid Date';
      }
    }
    
    // Check if it's an array (LocalDateTime from backend)
    if (Array.isArray(dateArray) && dateArray.length >= 3) {
      try {
        // Array format: [year, month, day, hour, minute, second, nanosecond]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
        // Note: JavaScript months are 0-indexed, but backend sends 1-indexed
        const date = new Date(year, month - 1, day, hour, minute, second);
        return date.toLocaleString();
      } catch {
        return 'Invalid Date';
      }
    }
    
    return 'Invalid Date';
  };

  // Filter states for Module-Wide Score Weight Configuration
  const [weightModuleFilter, setWeightModuleFilter] = useState('all');
  const [weightIntakeFilter, setWeightIntakeFilter] = useState('all');
  const [weightPublishedFilter, setWeightPublishedFilter] = useState('all'); // all, published, draft

  // Modules for selected intake (in weight configuration modal)
  const [intakeModules, setIntakeModules] = useState<any[]>([]);
  
  // All modules assigned to any intake (for weight cards display)
  const [modulesAssignedToIntakes, setModulesAssignedToIntakes] = useState<any[]>([]);

  // Helper function to extract unique modules from submissions data
  const extractModulesFromSubmissions = (submissions: any[]) => {
    const modulesMap = new Map();
    
    submissions.forEach((sub: any) => {
      // Handle both submission format and overall score format
      const moduleId = sub.module_id || sub.moduleId;
      const moduleCode = sub.moduleCode || sub.modules?.module_code;
      const moduleName = sub.moduleName || sub.modules?.module_name;
      
      if (moduleCode && moduleName) {
        // Use moduleCode as the unique key, but store the numeric ID if available
        if (!modulesMap.has(moduleCode)) {
          modulesMap.set(moduleCode, {
            id: moduleId || moduleCode, // Use numeric ID if available, otherwise moduleCode
            moduleCode: moduleCode,
            moduleName: moduleName,
            module_code: moduleCode, // For backward compatibility
            module_name: moduleName  // For backward compatibility
          });
        }
      }
    });
    
    const extractedModules = Array.from(modulesMap.values());
    console.log('Extracted modules from data:', extractedModules);
    
    if (extractedModules.length > 0) {
      setModules(extractedModules);
    }
  };

  useEffect(() => {
    loadData();
    loadModulesAndIntakes();
  }, [activeTab]);

  const loadModulesAndIntakes = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Load modules from real API
      try {
        console.log('Fetching modules from:', `${API_BASE_URL}/api/admin/modules?size=1000`);
        const modulesResponse = await fetch(`${API_BASE_URL}/api/admin/modules?size=1000`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Modules response status:', modulesResponse.status);
        
        if (modulesResponse.ok) {
          const modulesResult = await modulesResponse.json();
          console.log('Modules API response:', modulesResult);
          // Handle paginated response - extract content array from Page object
          const modulesData = modulesResult.data?.content || modulesResult.data || [];
          console.log('Modules data array:', modulesData);
          setModules(modulesData);
          
          console.log('Loaded modules:', modulesData.length);
        } else {
          console.error('Failed to load modules, status:', modulesResponse.status);
          const errorText = await modulesResponse.text();
          console.error('Error response:', errorText);
        }
      } catch (error) {
        console.error('Error loading modules:', error);
      }

      // Load intakes from real API
      try {
        const intakesResponse = await fetch(`${API_BASE_URL}/api/admin/intakes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (intakesResponse.ok) {
          const intakesResult = await intakesResponse.json();
          const intakesData = intakesResult.data || [];
          console.log('Loaded intakes:', intakesData);
          setIntakes(intakesData);
        }
      } catch (error) {
        console.error('Error loading intakes:', error);
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
        await loadModulesAssignedToIntakes(); // Load modules assigned to intakes for weight cards
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAssignmentSubmissions = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedModuleId && selectedModuleId !== 'all') {
        params.append('moduleId', selectedModuleId);
      }
      if (selectedIntakeId && selectedIntakeId !== 'all') {
        params.append('intakeId', selectedIntakeId);
      }
      if (assignmentStatusFilter && assignmentStatusFilter !== 'all') {
        // Map frontend status to backend status
        const statusMap: any = {
          'pending': 'SUBMITTED',
          'graded': 'GRADED'
        };
        params.append('status', statusMap[assignmentStatusFilter] || assignmentStatusFilter.toUpperCase());
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/marks/assignments?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load assignment submissions');
      }

      const result = await response.json();
      const submissions = result.data || [];

      // Transform backend response to match frontend interface
      const transformedSubmissions = submissions.map((sub: any) => ({
        id: sub.id.toString(),
        assignment_id: sub.assignmentId?.toString() || '',
        student_id: sub.studentNic || '',
        marks_obtained: sub.marksObtained,
        status: sub.status === 'SUBMITTED' ? 'pending' : (sub.status === 'GRADED' ? 'graded' : sub.status.toLowerCase()),
        submitted_at: sub.submittedAt, // Keep original format for processing
        submission_url: sub.submissionUrl,
        submission_name: sub.submissionName,
        feedback: sub.feedback,
        assignments: {
          title: sub.assignmentTitle || 'Unknown Assignment',
          max_marks: sub.maxMarks || 100
        },
        profiles: {
          full_name: sub.studentName || 'Unknown Student',
          email: sub.studentEmail || ''
        },
        moduleCode: sub.moduleCode,
        moduleName: sub.moduleName,
        departmentName: sub.departmentName,
        programName: sub.programName
      }));

      setAssignmentSubmissions(transformedSubmissions);
      console.log('Loaded assignment submissions:', transformedSubmissions.length);
      console.log('Sample submission:', transformedSubmissions[0]);
      
      // Extract unique modules from submissions since /api/admin/modules is failing
      extractModulesFromSubmissions(transformedSubmissions);

    } catch (error) {
      console.error('Error loading assignment submissions:', error);
      // Show empty array on error
      setAssignmentSubmissions([]);
    }
  };

  // Fallback to dummy data function (for development/testing)
  const loadAssignmentSubmissionsDummy = async () => {
    try {
      if (true) {
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Build query parameters for exams-for-marking endpoint
      const params = new URLSearchParams();
      if (selectedModuleId && selectedModuleId !== 'all') {
        params.append('moduleId', selectedModuleId);
      }
      if (selectedIntakeId && selectedIntakeId !== 'all') {
        params.append('intakeId', selectedIntakeId);
      }

      // Use the new exams-for-marking endpoint that shows ALL students for published exams
      const response = await fetch(`${API_BASE_URL}/api/admin/marks/exams-for-marking?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load exams for marking');
      }

      const result = await response.json();
      const examMarks = result.data || [];

      // Transform backend ExamMarkingResponse to match frontend interface
      const transformedSubmissions = examMarks.map((mark: any) => ({
        id: `${mark.examId}-${mark.studentNic}`, // Unique ID combining exam and student
        exam_id: mark.examId?.toString() || '',
        student_id: mark.studentNic || '',
        score: mark.score, // Will be null if not graded yet
        status: mark.status === 'NOT_GRADED' ? 'pending' : (mark.status === 'GRADED' ? 'graded' : mark.status.toLowerCase()),
        created_at: mark.gradedAt || new Date().toISOString(),
        exams: {
          exam_name: mark.examName || 'Unknown Exam',
          max_marks: mark.maxMarks || 100
        },
        profiles: {
          full_name: mark.studentName || 'Unknown Student',
          email: mark.studentEmail || ''
        },
        moduleCode: mark.moduleCode,
        moduleName: mark.moduleName,
        departmentName: mark.departmentName,
        programName: mark.programName
      }));

      // Apply frontend status filter if any
      let filteredSubmissions = transformedSubmissions;
      if (examStatusFilter && examStatusFilter !== 'all') {
        filteredSubmissions = transformedSubmissions.filter((sub: any) => sub.status === examStatusFilter);
      }

      setExamSubmissions(filteredSubmissions);
      console.log('Loaded exam submissions:', filteredSubmissions.length);
      
      // Extract unique modules from exam submissions
      extractModulesFromSubmissions(filteredSubmissions);

    } catch (error) {
      console.error('Error loading exam submissions:', error);
      // Show empty array on error
      setExamSubmissions([]);
    }
  };

  // Fallback to dummy data function (for development/testing)
  const loadExamSubmissionsDummy = async () => {
    try {
      if (true) {
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedModuleId && selectedModuleId !== 'all') {
        params.append('moduleId', selectedModuleId);
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/marks/overall?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load overall scores');
      }

      const result = await response.json();
      const scores = result.data || [];

      // Transform backend response to match frontend interface
      const transformedScores = scores.map((score: any) => ({
        id: `${score.studentNic}-${score.moduleId}`,
        student_id: score.studentNic,
        module_id: score.moduleId.toString(),
        assignment_score: score.assignmentScore || 0,
        exam_score: score.examScore || 0,
        overall_score: score.overallScore || 0,
        grade: score.grade || 'F',
        is_finalized: score.isComplete || false,
        is_published: score.isPublished || false,
        profiles: {
          full_name: score.studentName || 'Unknown Student',
          email: score.studentEmail || ''
        },
        modules: {
          module_code: score.moduleCode || '',
          module_name: score.moduleName || 'Unknown Module'
        }
      }));

      setOverallScores(transformedScores);
      console.log('Loaded overall scores:', transformedScores.length);
      console.log('Sample score:', transformedScores[0]);
      
      // Extract unique modules from overall scores
      extractModulesFromSubmissions(transformedScores);

    } catch (error) {
      console.error('Error loading overall scores:', error);
      setOverallScores([]);
    }
  };

  const loadScoreWeights = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Load score weights from backend API
      const response = await fetch(`${API_BASE_URL}/api/admin/score-weights`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const weightsData = result.data || [];
        
        // Transform backend response to frontend format
        const transformedWeights: ScoreWeight[] = weightsData.map((w: any) => ({
          id: w.id.toString(),
          module_id: w.moduleId,
          intake_id: w.intakeId,
          assignments_weight: w.assignmentsWeight,
          exams_weight: w.examsWeight,
          is_published: w.isPublished,
          // Store module and intake info directly from backend
          moduleCode: w.moduleCode,
          moduleName: w.moduleName,
          intakeName: w.intakeName,
          intakeYear: w.intakeYear
        }));
        
        console.log('Loaded score weights from API:', {
          count: transformedWeights.length,
          sample: transformedWeights[0]
        });
        
        setScoreWeights(transformedWeights);
      } else {
        console.error('Failed to load score weights, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        // Generate default weights if API fails
        generateDefaultWeights();
      }
    } catch (error) {
      console.error('Error loading score weights:', error);
      // Generate default weights if API fails
      generateDefaultWeights();
    }
  };

  // Load modules for a specific intake (used in weight configuration modal)
  const loadModulesByIntake = async (intakeId: string) => {
    if (!intakeId) {
      setIntakeModules([]);
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Call backend API to get modules for this intake
      const response = await fetch(`${API_BASE_URL}/api/admin/intake-modules/intake/${intakeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const modulesData = result.data || [];
        
        console.log(`Loaded ${modulesData.length} modules for intake ${intakeId}`);
        setIntakeModules(modulesData);
      } else {
        console.error('Failed to load modules for intake, status:', response.status);
        setIntakeModules([]);
      }
    } catch (error) {
      console.error('Error loading modules for intake:', error);
      setIntakeModules([]);
    }
  };

  // Load all modules that are assigned to any intake (used for weight cards display)
  const loadModulesAssignedToIntakes = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        console.error('No authentication token found');
        return;
      }

      // Call backend API to get all modules assigned to intakes
      const response = await fetch(`${API_BASE_URL}/api/admin/intake-modules/all-assigned-modules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const modulesData = result.data || [];
        
        console.log(`Loaded ${modulesData.length} unique modules assigned to intakes`);
        setModulesAssignedToIntakes(modulesData);
      } else {
        console.error('Failed to load modules assigned to intakes, status:', response.status);
        setModulesAssignedToIntakes([]);
      }
    } catch (error) {
      console.error('Error loading modules assigned to intakes:', error);
      setModulesAssignedToIntakes([]);
    }
  };

  const generateDefaultWeights = () => {
    // Generate default score weights based on loaded modules and intakes
    if (modules.length === 0 || intakes.length === 0) {
      console.log('Waiting for modules and intakes to load before generating score weights');
      return;
    }
    
    const generatedWeights: ScoreWeight[] = [];
    let weightId = 1;
    
    // Generate weight configuration for each module-intake combination
    modules.forEach(module => {
      intakes.forEach(intake => {
        generatedWeights.push({
          id: `weight-${weightId}`,
          module_id: module.id,
          intake_id: intake.id,
          assignments_weight: 40, // Default: 40% assignments
          exams_weight: 60,       // Default: 60% exams
          is_published: true
        });
        weightId++;
      });
    });
    
    console.log('Generated default score weights:', {
      count: generatedWeights.length,
      sample: generatedWeights[0],
      moduleCount: modules.length,
      intakeCount: intakes.length
    });
    
    setScoreWeights(generatedWeights);
  };

  const handleGradeAssignment = async (submissionId: string, marks: number, feedback?: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        showNotification('error', 'Authentication Error', 'No authentication token found. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/marks/assignments/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          submissionId: parseInt(submissionId),
          marksObtained: marks,
          feedback: feedback || ''
        })
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to grade assignment');
      }

      await loadAssignmentSubmissions();
      showNotification('success', 'Success', 'Assignment graded successfully!');
      
      // Close modal and reset form
      setShowAssignmentGradeModal(false);
      setAssignmentGradeModalData(null);
      setAssignmentGradeMarks('');
      setAssignmentGradeFeedback('');
    } catch (error: any) {
      console.error('Error grading assignment:', error);
      showNotification('error', 'Error', `Failed to grade assignment: ${error.message}`);
    }
  };

  const handleGradeExam = async (submissionId: string, score: number, feedback?: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        showNotification('error', 'Authentication Error', 'No authentication token found. Please login again.');
        return;
      }

      // Parse submissionId which is in format "examId-studentNic"
      const [examId, studentNic] = submissionId.split('-');
      
      if (!examId || !studentNic) {
        showNotification('error', 'Invalid Data', 'Invalid submission ID format');
        return;
      }

      // Use the new endpoint that doesn't require submission ID
      const params = new URLSearchParams();
      params.append('score', score.toString());
      if (feedback) {
        params.append('feedback', feedback);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/admin/marks/exams/${examId}/students/${studentNic}/grade?${params}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to grade exam');
      }

      await loadExamSubmissions();
      showNotification('success', 'Success', 'Exam marks saved successfully!');
      
      // Close modal and reset form
      setShowGradeModal(false);
      setGradeModalData(null);
      setGradeScore('');
      setGradeFeedback('');
    } catch (error: any) {
      console.error('Error grading exam:', error);
      showNotification('error', 'Error', `Failed to grade exam: ${error.message}`);
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

      // Module filter - match against submission's moduleCode or moduleName
      let matchesModule = true;
      if (assignmentModuleFilter !== 'all') {
        const selectedModule = modules.find(m => m.id.toString() === assignmentModuleFilter.toString());
        if (selectedModule) {
          matchesModule = submission.moduleCode === selectedModule.moduleCode || 
                         submission.moduleName?.toLowerCase() === selectedModule.moduleName?.toLowerCase();
        } else {
          matchesModule = false;
        }
      }

      // Intake filter - you can add intake matching logic here if needed
      const matchesIntake = assignmentIntakeFilter === 'all'; // TODO: Add intake matching when data includes intake info

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

      return matchesSearch && matchesStatus && matchesTitle && matchesModule && matchesIntake && matchesScoreRange;
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

      // Module filter - match against submission's moduleCode or moduleName
      let matchesModule = true;
      if (examModuleFilter !== 'all') {
        const selectedModule = modules.find(m => m.id.toString() === examModuleFilter.toString());
        if (selectedModule) {
          matchesModule = submission.moduleCode === selectedModule.moduleCode || 
                         submission.moduleName?.toLowerCase() === selectedModule.moduleName?.toLowerCase();
        } else {
          matchesModule = false;
        }
      }

      // Intake filter
      const matchesIntake = examIntakeFilter === 'all'; // TODO: Add intake matching when data includes intake info

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

      return matchesSearch && matchesStatus && matchesExamName && matchesModule && matchesIntake && matchesScoreRange;
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

      // Module filter - match against score's module_code
      const matchesModule = overallModuleFilter === 'all' || score.modules?.module_code === overallModuleFilter;

      // Intake filter
      const matchesIntake = overallIntakeFilter === 'all'; // TODO: Add intake matching when data includes intake info

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

      return matchesSearch && matchesModule && matchesIntake && matchesGrade && matchesStatus && matchesScoreRange;
    });
  };

  // Filter function for Score Weights
  const getFilteredScoreWeights = () => {
    // Get unique module IDs that are assigned to any intake
    // These are the modules where assignments/exams can be created
    const assignedModuleIds = new Set(
      modulesAssignedToIntakes.map(m => Number(m.moduleId)).filter(id => !isNaN(id))
    );
    
    console.log('Modules assigned to intakes:', modulesAssignedToIntakes.length);
    console.log('Assigned module IDs:', Array.from(assignedModuleIds));
    console.log('Total score weights:', scoreWeights.length);
    
    return scoreWeights.filter(weight => {
      // Convert weight module_id to number for comparison
      const weightModuleId = Number(weight.module_id);
      
      // Only show weights for modules that are assigned to at least one intake
      const isAssignedToIntake = assignedModuleIds.has(weightModuleId);
      
      // Module filter
      const matchesModule = weightModuleFilter === 'all' || weight.module_id === weightModuleFilter;
      
      // Intake filter
      const matchesIntake = weightIntakeFilter === 'all' || weight.intake_id === weightIntakeFilter;
      
      // Published status filter
      const matchesPublished = weightPublishedFilter === 'all' ||
        (weightPublishedFilter === 'published' && weight.is_published) ||
        (weightPublishedFilter === 'draft' && !weight.is_published);
      
      return isAssignedToIntake && matchesModule && matchesIntake && matchesPublished;
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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      // Prepare request body
      const requestBody = {
        moduleId: parseInt(selectedModuleId.toString()),
        intakeId: parseInt(selectedIntakeId.toString()),
        assignmentsWeight: assignmentWeight,
        examsWeight: examWeight,
        isPublished: true
      };

      console.log('Saving score weight:', requestBody);

      // Save to backend API
      const response = await fetch(`${API_BASE_URL}/api/admin/score-weights`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save score weights');
      }

      const result = await response.json();
      console.log('Score weight saved successfully:', result);

      // Close modal and reset
      setShowWeightModal(false);
      setSelectedModuleId('');
      setSelectedIntakeId('');
      setAssignmentWeight(40);
      setExamWeight(60);

      // Show success message
      alert('Score weights saved successfully! The configuration has been updated.');

      // Reload score weights and overall scores
      await loadScoreWeights();
      await loadOverallScores();
    } catch (error: any) {
      console.error('Error saving weights:', error);
      alert(error.message || 'Failed to save score weights. Please try again.');
    }
  };

  const handleSetOverallMarks = async () => {
    if (!selectedScore) return;

    const marks = parseFloat(overallMarksInput);
    if (isNaN(marks) || marks < 0 || marks > 100) {
      showNotification('error', 'Invalid Input', 'Please enter a valid marks between 0 and 100');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        showNotification('error', 'Authentication Error', 'No authentication token found. Please login again.');
        return;
      }

      // Prepare request body
      const requestBody = {
        studentNic: selectedScore.student_id,
        moduleId: parseInt(selectedScore.module_id.toString()),
        overallScore: marks,
        comments: '',
        isFinalized: true
      };

      // Call backend API to set overall score
      const response = await fetch(`${API_BASE_URL}/api/admin/marks/overall`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to set overall marks');
      }

      const result = await response.json();
      console.log('Overall marks set successfully:', result);

      // Close modal and reset
      setShowSetMarksModal(false);
      setSelectedScore(null);
      setOverallMarksInput('');

      // Show success notification
      showNotification('success', 'Success', 'Overall marks set successfully!');

      // Reload overall scores
      await loadOverallScores();
    } catch (error: any) {
      console.error('Error setting overall marks:', error);
      showNotification('error', 'Error', error.message || 'Failed to set overall marks');
    }
  };

  const handlePublishResults = async () => {
    if (!publishModuleId || !publishIntakeId) {
      showNotification('error', 'Invalid Input', 'Please select both module and intake');
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      if (!token) {
        showNotification('error', 'Authentication Error', 'Please login again');
        return;
      }

      const endpoint = publishAction === 'publish' ? '/api/admin/marks/publish' : '/api/admin/marks/unpublish';
      
      const requestBody = {
        moduleId: parseInt(publishModuleId),
        intakeId: parseInt(publishIntakeId),
        studentNics: null, // Publish for all students in the intake
        comments: ''
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${publishAction} results`);
      }

      const result = await response.json();
      console.log(`Results ${publishAction}ed successfully:`, result);

      // Close modal and reset
      setShowPublishModal(false);
      setPublishModuleId('');
      setPublishIntakeId('');

      // Show success notification
      const count = result.data.publishedCount || result.data.unpublishedCount || 0;
      showNotification('success', 'Success', 
        `Successfully ${publishAction}ed ${count} result(s)!`);

      // Reload overall scores to show updated published status
      await loadOverallScores();
    } catch (error: any) {
      console.error(`Error ${publishAction}ing results:`, error);
      showNotification('error', 'Error', error.message || `Failed to ${publishAction} results`);
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                      <option key={module.id} value={module.id}>{module.moduleCode} - {module.moduleName}</option>
                    ))}
                  </select>
                </div>

                {/* Intake Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intake</label>
                  <select
                    value={assignmentIntakeFilter}
                    onChange={(e) => setAssignmentIntakeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Intakes</option>
                    {intakes.map((intake) => (
                      <option key={intake.id} value={intake.id}>{intake.intakeName}</option>
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
                      setAssignmentIntakeFilter('all');
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingAssignments.map((submission) => (
                        <tr key={submission.id}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{submission.profiles?.full_name}</div>
                              <div className="text-sm text-gray-500">{submission.profiles?.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{submission.assignments?.title}</div>
                              {submission.submission_name && (
                                <div className="text-xs text-gray-500 mt-1">📎 {submission.submission_name}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {parseDateArray(submission.submitted_at)}
                          </td>
                          <td className="px-4 py-3">{submission.assignments?.max_marks}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {submission.submission_url && (
                                <button
                                  onClick={() => handleViewAssignmentFile(submission.submission_url!, submission.submission_name || 'assignment-file')}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                                  title="View Submission"
                                >
                                  <Eye size={16} />
                                  View
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setAssignmentGradeModalData({
                                    submissionId: submission.id,
                                    studentName: submission.profiles?.full_name || 'Unknown Student',
                                    assignmentTitle: submission.assignments?.title || 'Unknown Assignment',
                                    maxMarks: submission.assignments?.max_marks || 0,
                                    submissionUrl: submission.submission_url,
                                    submissionName: submission.submission_name
                                  });
                                  setAssignmentGradeMarks('');
                                  setAssignmentGradeFeedback('');
                                  setShowAssignmentGradeModal(true);
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm"
                              >
                                Grade
                              </button>
                            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                      <option key={module.id} value={module.id}>{module.moduleCode} - {module.moduleName}</option>
                    ))}
                  </select>
                </div>

                {/* Intake Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intake</label>
                  <select
                    value={examIntakeFilter}
                    onChange={(e) => setExamIntakeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Intakes</option>
                    {intakes.map((intake) => (
                      <option key={intake.id} value={intake.id}>{intake.intakeName}</option>
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
                      setExamIntakeFilter('all');
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
                                setGradeModalData({
                                  submissionId: submission.id,
                                  studentName: submission.profiles?.full_name || 'Unknown Student',
                                  examName: submission.exams?.exam_name || 'Unknown Exam',
                                  maxMarks: submission.exams?.max_marks || 0
                                });
                                setGradeScore('');
                                setGradeFeedback('');
                                setShowGradeModal(true);
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
                  <p className="text-sm text-gray-600 mt-1">Configure scoring weights for each module assigned to intakes (where assignments/exams can be created)</p>
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
                      <option key={module.id} value={module.id}>{module.moduleCode}</option>
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
                    // Use data directly from weight object (backend includes module/intake info)
                    return (
                      <div key={weight.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {weight.moduleCode || 'N/A'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {weight.moduleName || 'Unknown Module'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Intake: {weight.intakeName || 'N/A'} ({weight.intakeYear || 'N/A'})
                          </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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

                {/* Intake Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intake</label>
                  <select
                    value={overallIntakeFilter}
                    onChange={(e) => setOverallIntakeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Intakes</option>
                    {intakes.map((intake) => (
                      <option key={intake.id} value={intake.id}>{intake.intakeName}</option>
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
                      setOverallIntakeFilter('all');
                      setOverallGradeFilter('all');
                      setOverallStatusFilter('all');
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Student Overall Scores</h3>
                <button
                  onClick={() => {
                    setShowPublishModal(true);
                    setPublishAction('publish');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                  <CheckCircle size={18} />
                  Publish Results
                </button>
              </div>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
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
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              score.is_published ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {score.is_published ? '✓ Published' : '⏳ Unpublished'}
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
                    Select Intake <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedIntakeId}
                    onChange={(e) => {
                      const newIntakeId = e.target.value;
                      setSelectedIntakeId(newIntakeId);
                      setSelectedModuleId(''); // Reset module selection when intake changes
                      loadModulesByIntake(newIntakeId); // Load modules for selected intake
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Select Intake --</option>
                    {intakes.map((intake) => (
                      <option key={intake.id} value={intake.id}>
                        {intake.intakeName || intake.intake_name || 'Unnamed Intake'} ({intake.intakeYear || intake.intake_year || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Module <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    disabled={!selectedIntakeId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedIntakeId ? '-- Select Module --' : '-- Select Intake First --'}
                    </option>
                    {/* Show modules assigned to the selected intake */}
                    {intakeModules.map((intakeModule) => (
                      <option key={intakeModule.moduleId} value={intakeModule.moduleId}>
                        {intakeModule.moduleCode} - {intakeModule.moduleName}
                      </option>
                    ))}
                  </select>
                  {selectedIntakeId && intakeModules.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ No modules assigned to this intake
                    </p>
                  )}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-md w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
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
                    <span className="font-semibold text-right max-w-[200px] break-words">{selectedScore.modules?.module_name}</span>
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

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-4 max-w-md ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {notification.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                  {notification.title}
                </h3>
                <p className={`mt-1 text-sm ${notification.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Exam Modal */}
      {showGradeModal && gradeModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Grade Exam</h2>
                <button
                  onClick={() => {
                    setShowGradeModal(false);
                    setGradeModalData(null);
                    setGradeScore('');
                    setGradeFeedback('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const scoreNum = parseInt(gradeScore);
                if (!isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= gradeModalData.maxMarks) {
                  handleGradeExam(gradeModalData.submissionId, scoreNum, gradeFeedback || undefined);
                } else {
                  showNotification('error', 'Invalid Score', `Please enter a valid score between 0 and ${gradeModalData.maxMarks}`);
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Student:</span>
                  <span className="text-sm text-gray-900">{gradeModalData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Exam:</span>
                  <span className="text-sm text-gray-900">{gradeModalData.examName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Maximum Marks:</span>
                  <span className="text-sm font-bold text-purple-600">{gradeModalData.maxMarks}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score (0-{gradeModalData.maxMarks}) *
                </label>
                <input
                  type="number"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max={gradeModalData.maxMarks}
                  required
                  placeholder="Enter score"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Enter feedback for student..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGradeModal(false);
                    setGradeModalData(null);
                    setGradeScore('');
                    setGradeFeedback('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Assignment Modal */}
      {showAssignmentGradeModal && assignmentGradeModalData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Grade Assignment</h2>
                <button
                  onClick={() => {
                    setShowAssignmentGradeModal(false);
                    setAssignmentGradeModalData(null);
                    setAssignmentGradeMarks('');
                    setAssignmentGradeFeedback('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const marksNum = parseInt(assignmentGradeMarks);
                if (!isNaN(marksNum) && marksNum >= 0 && marksNum <= assignmentGradeModalData.maxMarks) {
                  handleGradeAssignment(assignmentGradeModalData.submissionId, marksNum, assignmentGradeFeedback || undefined);
                } else {
                  showNotification('error', 'Invalid Marks', `Please enter valid marks between 0 and ${assignmentGradeModalData.maxMarks}`);
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Student:</span>
                  <span className="text-sm text-gray-900">{assignmentGradeModalData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Assignment:</span>
                  <span className="text-sm text-gray-900">{assignmentGradeModalData.assignmentTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Maximum Marks:</span>
                  <span className="text-sm font-bold text-purple-600">{assignmentGradeModalData.maxMarks}</span>
                </div>
                {assignmentGradeModalData.submissionName && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Submitted File:</span>
                    <span className="text-sm text-gray-900">📎 {assignmentGradeModalData.submissionName}</span>
                  </div>
                )}
              </div>

              {/* View Submission Button */}
              {assignmentGradeModalData.submissionUrl && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">View Student Submission</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleViewAssignmentFile(assignmentGradeModalData.submissionUrl!, assignmentGradeModalData.submissionName || 'assignment-file')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-1"
                    >
                      <Eye size={16} />
                      Open File
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks (0-{assignmentGradeModalData.maxMarks}) *
                </label>
                <input
                  type="number"
                  value={assignmentGradeMarks}
                  onChange={(e) => setAssignmentGradeMarks(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="0"
                  max={assignmentGradeModalData.maxMarks}
                  required
                  placeholder="Enter marks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={assignmentGradeFeedback}
                  onChange={(e) => setAssignmentGradeFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  placeholder="Enter feedback for student..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignmentGradeModal(false);
                    setAssignmentGradeModalData(null);
                    setAssignmentGradeMarks('');
                    setAssignmentGradeFeedback('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Publish Results Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-md w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="text-emerald-600" size={24} />
                {publishAction === 'publish' ? 'Publish Results' : 'Unpublish Results'}
              </h2>
              <button
                onClick={() => {
                  setShowPublishModal(false);
                  setPublishModuleId('');
                  setPublishIntakeId('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  {publishAction === 'publish' 
                    ? '📢 This will make the results visible to students in the selected intake for the selected module. Only finalized and graded results will be published.'
                    : '⚠️ This will hide the published results from students. They will no longer be able to see their grades for this module.'}
                </p>
              </div>

              {/* Step 1: Select Intake First */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step 1: Select Intake *
                </label>
                <select
                  value={publishIntakeId}
                  onChange={(e) => {
                    setPublishIntakeId(e.target.value);
                    setPublishModuleId(''); // Reset module when intake changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Select Intake --</option>
                  {intakes.map((intake) => (
                    <option key={intake.id} value={intake.id}>
                      {intake.intakeName || intake.intake_name} ({intake.intakeYear || intake.intake_year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Select Module (filtered by intake) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step 2: Select Module *
                </label>
                <select
                  value={publishModuleId}
                  onChange={(e) => setPublishModuleId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={!publishIntakeId}
                >
                  <option value="">
                    {publishIntakeId ? '-- Select Module --' : '-- Select an intake first --'}
                  </option>
                  {publishIntakeId && (() => {
                    const selectedIntakeIdNum = Number(publishIntakeId);
                    console.log('Selected intake ID:', selectedIntakeIdNum);
                    console.log('Modules assigned to intakes:', modulesAssignedToIntakes);
                    
                    const filteredModules = modulesAssignedToIntakes.filter(im => {
                      const imIntakeId = Number(im.intakeId || im.intake_id);
                      const matches = imIntakeId === selectedIntakeIdNum;
                      if (matches) {
                        console.log('Matched intake module:', im);
                      }
                      return matches;
                    });
                    
                    console.log('Filtered modules for intake:', filteredModules);
                    
                    return filteredModules.map((intakeModule) => {
                      const moduleIdToFind = Number(intakeModule.moduleId || intakeModule.module_id);
                      const module = modules.find(m => Number(m.id) === moduleIdToFind);
                      
                      if (module) {
                        console.log('Found module:', module);
                      } else {
                        console.log('Module not found for ID:', moduleIdToFind);
                      }
                      
                      return module ? (
                        <option key={intakeModule.id} value={module.id}>
                          {module.moduleCode || module.module_code} - {module.moduleName || module.module_name}
                        </option>
                      ) : null;
                    });
                  })()}
                </select>
                {!publishIntakeId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select an intake first to see available modules
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Make sure all students in the intake have been graded and their scores are finalized before publishing.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPublishModal(false);
                    setPublishModuleId('');
                    setPublishIntakeId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishResults}
                  disabled={!publishModuleId || !publishIntakeId}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${
                    publishAction === 'publish'
                      ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300'
                      : 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300'
                  } disabled:cursor-not-allowed`}
                >
                  {publishAction === 'publish' ? '✓ Publish' : '✗ Unpublish'}
                </button>
              </div>

              {/* Action switcher */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setPublishAction(publishAction === 'publish' ? 'unpublish' : 'publish')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {publishAction === 'publish' 
                    ? '← Switch to Unpublish Mode' 
                    : '← Switch to Publish Mode'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
