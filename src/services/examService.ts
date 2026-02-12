import { ApiService, ApiResponse } from './apiService';

/**
 * Exam interface matching backend ExamResponse
 */
export interface Exam {
  id: number;
  examName: string;
  description?: string;
  examDate: string;
  examTime: string;
  durationMinutes: number;
  maxMarks: number;
  location?: string;
  instructions?: string;
  published: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Module details
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  
  // Intake details
  intakeId: number;
  intakeName: string;
  
  // Program details (for filtering)
  programId?: number;
  programName?: string;
  
  // Department details (for filtering)
  departmentId?: number;
  departmentName?: string;
  
  // Faculty details (for filtering)
  facultyId?: number;
  facultyName?: string;
}

/**
 * Exam request interface for creating/updating exams
 */
export interface ExamRequest {
  examName: string;
  description?: string;
  moduleId: number;
  intakeId: number;
  examDate: string;
  examTime: string;
  durationMinutes: number;
  maxMarks: number;
  location?: string;
  instructions?: string;
}

/**
 * Exam statistics interface
 */
export interface ExamStats {
  totalExams: number;
  publishedExams: number;
  draftExams: number;
  upcomingExams: number;
  completedExams: number;
}

/**
 * Paginated response interface
 */
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Service for exam management operations
 */
class ExamServiceClass extends ApiService {
  
  /**
   * Create a new exam (Admin)
   */
  async createExamAdmin(request: ExamRequest): Promise<ApiResponse<Exam>> {
    return await this.post<Exam>('/api/admin/exams', request);
  }

  /**
   * Create a new exam (Lecturer)
   */
  async createExamLecturer(request: ExamRequest): Promise<ApiResponse<Exam>> {
    return await this.post<Exam>('/api/lecturer/exams', request);
  }

  /**
   * Update an exam (Admin)
   */
  async updateExamAdmin(id: number, request: ExamRequest): Promise<ApiResponse<Exam>> {
    return await this.put<Exam>(`/api/admin/exams/${id}`, request);
  }

  /**
   * Update an exam (Lecturer)
   */
  async updateExamLecturer(id: number, request: ExamRequest): Promise<ApiResponse<Exam>> {
    return await this.put<Exam>(`/api/lecturer/exams/${id}`, request);
  }

  /**
   * Delete an exam (Admin)
   */
  async deleteExamAdmin(id: number): Promise<ApiResponse<void>> {
    return await this.delete<void>(`/api/admin/exams/${id}`);
  }

  /**
   * Delete an exam (Lecturer)
   */
  async deleteExamLecturer(id: number): Promise<ApiResponse<void>> {
    return await this.delete<void>(`/api/lecturer/exams/${id}`);
  }

  /**
   * Get exam by ID (Admin)
   */
  async getExamByIdAdmin(id: number): Promise<ApiResponse<Exam>> {
    return await this.get<Exam>(`/api/admin/exams/${id}`);
  }

  /**
   * Get exam by ID (Lecturer)
   */
  async getExamByIdLecturer(id: number): Promise<ApiResponse<Exam>> {
    return await this.get<Exam>(`/api/lecturer/exams/${id}`);
  }

  /**
   * Get all exams with pagination and filtering (Admin)
   */
  async getExamsAdmin(
    page: number = 0,
    size: number = 9,
    filters?: {
      moduleId?: number;
      intakeId?: number;
      programId?: number;
      departmentId?: number;
      facultyId?: number;
      published?: boolean;
      searchTerm?: string;
    }
  ): Promise<ApiResponse<PagedResponse<Exam>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters) {
      if (filters.moduleId) params.append('moduleId', filters.moduleId.toString());
      if (filters.intakeId) params.append('intakeId', filters.intakeId.toString());
      if (filters.programId) params.append('programId', filters.programId.toString());
      if (filters.departmentId) params.append('departmentId', filters.departmentId.toString());
      if (filters.facultyId) params.append('facultyId', filters.facultyId.toString());
      if (filters.published !== undefined) params.append('published', filters.published.toString());
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    }

    return await this.get<PagedResponse<Exam>>(`/api/admin/exams?${params.toString()}`);
  }

  /**
   * Get all exams with pagination and filtering (Lecturer)
   */
  async getExamsLecturer(
    page: number = 0,
    size: number = 9,
    filters?: {
      moduleId?: number;
      intakeId?: number;
      programId?: number;
      departmentId?: number;
      facultyId?: number;
      published?: boolean;
      searchTerm?: string;
    }
  ): Promise<ApiResponse<PagedResponse<Exam>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (filters) {
      if (filters.moduleId) params.append('moduleId', filters.moduleId.toString());
      if (filters.intakeId) params.append('intakeId', filters.intakeId.toString());
      if (filters.programId) params.append('programId', filters.programId.toString());
      if (filters.departmentId) params.append('departmentId', filters.departmentId.toString());
      if (filters.facultyId) params.append('facultyId', filters.facultyId.toString());
      if (filters.published !== undefined) params.append('published', filters.published.toString());
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    }

    return await this.get<PagedResponse<Exam>>(`/api/lecturer/exams?${params.toString()}`);
  }

  /**
   * Get exams by module (Admin)
   */
  async getExamsByModuleAdmin(moduleId: number, page: number = 0, size: number = 9): Promise<ApiResponse<PagedResponse<Exam>>> {
    return await this.get<PagedResponse<Exam>>(
      `/api/admin/exams/module/${moduleId}?page=${page}&size=${size}`
    );
  }

  /**
   * Get exams by module (Lecturer)
   */
  async getExamsByModuleLecturer(moduleId: number, page: number = 0, size: number = 9): Promise<ApiResponse<PagedResponse<Exam>>> {
    return await this.get<PagedResponse<Exam>>(
      `/api/lecturer/exams/module/${moduleId}?page=${page}&size=${size}`
    );
  }

  /**
   * Toggle publish status (Admin)
   */
  async togglePublishAdmin(id: number): Promise<ApiResponse<Exam>> {
    return await this.patch<Exam>(`/api/admin/exams/${id}/publish`);
  }

  /**
   * Toggle publish status (Lecturer)
   */
  async togglePublishLecturer(id: number): Promise<ApiResponse<Exam>> {
    return await this.patch<Exam>(`/api/lecturer/exams/${id}/publish`);
  }

  /**
   * Get exam statistics (Admin)
   */
  async getStatsAdmin(): Promise<ApiResponse<ExamStats>> {
    return await this.get<ExamStats>('/api/admin/exams/stats');
  }

  /**
   * Get exam statistics (Lecturer)
   */
  async getStatsLecturer(): Promise<ApiResponse<ExamStats>> {
    return await this.get<ExamStats>('/api/lecturer/exams/stats');
  }
}

export const examService = new ExamServiceClass();
