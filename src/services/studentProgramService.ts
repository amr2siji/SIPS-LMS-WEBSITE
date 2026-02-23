import { ApiService } from './apiService';

/**
 * Student Program interfaces
 */
export interface StudentProgram {
  id: number;
  programCode: string;
  programName: string;
  description: string;
  facultyId: number;
  facultyName: string;
  departmentId: number;
  departmentName: string;
  intakeId?: number;
  intakeName?: string;
  intakeCode?: string;
  totalModules?: number;
  isActive: boolean;
  enrolledAt: string;
}

export interface StudentDashboardStats {
  totalPrograms: number;
  totalModules: number;
  totalMaterials: number;
  pendingAssignments: number;
  completedAssignments: number;
  upcomingExams: number;
}

export interface StudentModule {
  id: number;
  moduleCode: string;
  moduleName: string;
  description: string;
  creditScore: number;
  facultyId: number;
  facultyName: string;
  departmentId: number;
  departmentName: string;
  programId: number;
  programName: string;
  intakeId: number;
  intakeName: string;
  totalMaterials: number;
  totalAssignments: number;
  totalExams: number;
  isActive: boolean;
  createdAt: string;
}

export interface StudentLectureMaterial {
  id: number;
  title: string;
  description: string;
  moduleId: number;
  moduleName: string;
  week: number;
  files: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }>;
  uploadedBy: string;
  uploaderRole: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAssignment {
  id: number;
  title: string;
  description: string;
  moduleId: number;
  moduleName: string;
  dueDate: string;
  maxMarks: number;
  attachmentUrl: string;
  attachmentName: string;
  isPublished: boolean;
  createdAt: string;
  hasSubmitted: boolean;
  submittedAt: string | null;
  marksObtained: number | null;
  feedback: string | null;
  submissionStatus: 'PENDING' | 'SUBMITTED' | 'GRADED';
}

export interface StudentExam {
  id: number;
  examName: string;
  description: string;
  moduleId: number;
  moduleName: string;
  examType: string;
  examDate: string;
  examTime: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  maxMarks: number;
  instructions: string;
  published: boolean;
  createdAt: string;
}

export interface ApiResponseData<T> {
  statusCode: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface StudentProfileData {
  nic: string;
  fullName: string;
  nameWithInitials: string;
  dateOfBirth: any; // string "2001-02-24" in production, number[] [2001,2,24] in dev
  mobileNumber: string;
  email: string;
  permanentAddress: string;
  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyContactMobile?: string;
  olQualifications?: string;
  alQualifications?: string;
  otherQualifications?: string;
  studentStatus: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfileUpdateRequest {
  fullName?: string;
  nameWithInitials?: string;
  dateOfBirth?: string;
  mobileNumber?: string;
  email?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyContactMobile?: string;
  olQualifications?: string;
  alQualifications?: string;
  otherQualifications?: string;
}

/**
 * Student Program Service
 * Handles all student portal API calls
 */
export class StudentProgramService extends ApiService {
  private readonly ENDPOINTS = {
    PROGRAMS: '/api/student/programs',
    DASHBOARD_STATS: '/api/student/dashboard/stats',
    PROGRAM_MODULES: (programId: number) => `/api/student/programs/${programId}/modules`,
    MODULE_MATERIALS: (moduleId: number) => `/api/student/modules/${moduleId}/materials`,
    MODULE_ASSIGNMENTS: (moduleId: number) => `/api/student/modules/${moduleId}/assignments`,
    MODULE_EXAMS: (moduleId: number) => `/api/student/modules/${moduleId}/exams`,
  };

  protected getAuthHeaders() {
    const token = localStorage.getItem('jwt_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get student's enrolled programs
   */
  async getMyPrograms(): Promise<{ success: boolean; data?: StudentProgram[]; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.ENDPOINTS.PROGRAMS}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponseData<StudentProgram[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch programs');
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Error fetching student programs:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch programs',
      };
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{ success: boolean; data?: StudentDashboardStats; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.ENDPOINTS.DASHBOARD_STATS}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponseData<StudentDashboardStats> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch dashboard stats');
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch dashboard stats',
      };
    }
  }

  /**
   * Get modules for a specific program
   */
  async getProgramModules(programId: number): Promise<{ success: boolean; data?: StudentModule[]; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.ENDPOINTS.PROGRAM_MODULES(programId)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponseData<StudentModule[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch program modules');
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Error fetching program modules:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch program modules',
      };
    }
  }

  /**
   * Get lecture materials for a module
   */
  async getModuleMaterials(moduleId: number): Promise<{ success: boolean; data?: StudentLectureMaterial[]; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.ENDPOINTS.MODULE_MATERIALS(moduleId)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponseData<StudentLectureMaterial[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch module materials');
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Error fetching module materials:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch module materials',
      };
    }
  }

  /**
   * Get assignments for a module
   */
  async getModuleAssignments(moduleId: number): Promise<{ success: boolean; data?: StudentAssignment[]; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.ENDPOINTS.MODULE_ASSIGNMENTS(moduleId)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponseData<StudentAssignment[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch module assignments');
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Error fetching module assignments:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch module assignments',
      };
    }
  }

  /**
   * Get exams for a module
   */
  async getModuleExams(moduleId: number): Promise<{ success: boolean; data?: StudentExam[]; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.ENDPOINTS.MODULE_EXAMS(moduleId)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const result: ApiResponseData<StudentExam[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch module exams');
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    } catch (error: any) {
      console.error('Error fetching module exams:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch module exams',
      };
    }
  }

  /**
   * Get own student profile
   * GET /api/student/profile
   */
  async getStudentProfile(): Promise<{ success: boolean; data?: StudentProfileData; message: string }> {
    try {
      const res = await this.get<StudentProfileData>('/api/student/profile');
      return { success: res.success, data: res.data, message: res.message };
    } catch (error: any) {
      console.error('Error fetching student profile:', error);
      return { success: false, message: error.message || 'Failed to fetch profile' };
    }
  }

  /**
   * Update own student profile
   * PUT /api/student/profile
   */
  async updateStudentProfile(data: StudentProfileUpdateRequest): Promise<{ success: boolean; data?: StudentProfileData; message: string }> {
    try {
      const res = await this.put<StudentProfileData>('/api/student/profile', data);
      return { success: res.success, data: res.data, message: res.message };
    } catch (error: any) {
      console.error('Error updating student profile:', error);
      return { success: false, message: error.message || 'Failed to update profile' };
    }
  }

  /**
   * Change own password
   * PUT /api/student/change-password
   */
  async changeStudentPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.put<void>('/api/student/change-password', { currentPassword, newPassword });
      return { success: res.success, message: res.message };
    } catch (error: any) {
      console.error('Error changing student password:', error);
      return { success: false, message: error.message || 'Failed to change password' };
    }
  }
}

// Export singleton instance
export const studentProgramService = new StudentProgramService();
