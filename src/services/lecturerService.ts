import { ApiService, ApiResponse } from './apiService';

export interface LecturerResponse {
  id: string;
  nic: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  residentialAddress?: string;
  highestQualification?: string;
  academicExperienceYears?: number;
  industryExperienceYears?: number;
  isActive: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerRequest {
  nic: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  residentialAddress?: string;
  highestQualification?: string;
  academicExperienceYears?: number;
  industryExperienceYears?: number;
  password?: string; // Optional - system generates if not provided
}

export interface LecturerModuleAssignmentResponse {
  id: number;
  lecturerId: string;
  lecturerName: string;
  lecturerEmail: string;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  programId?: number;
  programName?: string;
  intakeId?: number;
  intakeName?: string;
  departmentId?: number;
  departmentName?: string;
  facultyId?: number;
  facultyName?: string;
  assignedDate: string;
  academicYear?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerModuleAssignmentRequest {
  lecturerId: string;
  moduleId: number;
  academicYear?: string;
  notes?: string;
}

export interface LecturerIntakeAssignmentResponse {
  id: number;
  lecturerId: string;
  lecturerName: string;
  lecturerEmail: string;
  intakeId: number;
  intakeCode: string;
  intakeName: string;
  programName?: string;
  assignedDate: string;
  role?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LecturerIntakeAssignmentRequest {
  lecturerId: string;
  intakeId: number;
  role?: string;
  notes?: string;
}

class LecturerService extends ApiService {
  // ==================== LECTURER MANAGEMENT ====================

  async getLecturerProfile(): Promise<ApiResponse<LecturerResponse>> {
    return this.get('/api/lecturer/profile');
  }

  async updateLecturerProfile(data: Omit<LecturerRequest, 'nic' | 'password'>): Promise<ApiResponse<LecturerResponse>> {
    return this.put('/api/lecturer/profile', data);
  }

  async changeLecturerPassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.put('/api/lecturer/change-password', { currentPassword, newPassword });
  }

  async getMyModules(): Promise<ApiResponse<LecturerModuleAssignmentResponse[]>> {
    return this.get('/api/lecturer/my-modules');
  }

  async getAllLecturers(): Promise<ApiResponse<LecturerResponse[]>> {
    return this.get('/api/admin/lecturers');
  }

  async getActiveLecturers(): Promise<ApiResponse<LecturerResponse[]>> {
    return this.get('/api/admin/lecturers/active');
  }

  async getLecturerById(id: string): Promise<ApiResponse<LecturerResponse>> {
    return this.get(`/api/admin/lecturers/${id}`);
  }

  async createLecturer(data: LecturerRequest): Promise<ApiResponse<LecturerResponse>> {
    return this.post('/api/admin/lecturers', data);
  }

  async updateLecturer(id: string, data: LecturerRequest): Promise<ApiResponse<LecturerResponse>> {
    return this.put(`/api/admin/lecturers/${id}`, data);
  }

  async deleteLecturer(id: string): Promise<ApiResponse<void>> {
    return this.delete(`/api/admin/lecturers/${id}`);
  }

  async activateLecturer(id: string): Promise<ApiResponse<void>> {
    return this.post(`/api/admin/lecturers/${id}/activate`);
  }

  // ==================== MODULE ASSIGNMENT ====================

  async assignLecturerToModule(data: LecturerModuleAssignmentRequest): Promise<ApiResponse<LecturerModuleAssignmentResponse>> {
    return this.post('/api/admin/lecturer-assignments/modules', data);
  }

  async updateModuleAssignment(id: number, data: LecturerModuleAssignmentRequest): Promise<ApiResponse<LecturerModuleAssignmentResponse>> {
    return this.put(`/api/admin/lecturer-assignments/modules/${id}`, data);
  }

  async removeModuleAssignment(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/api/admin/lecturer-assignments/modules/${id}`);
  }

  async getModuleAssignment(id: number): Promise<ApiResponse<LecturerModuleAssignmentResponse>> {
    return this.get(`/api/admin/lecturer-assignments/modules/${id}`);
  }

  async getModuleAssignmentsByLecturer(lecturerId: string): Promise<ApiResponse<LecturerModuleAssignmentResponse[]>> {
    return this.get(`/api/admin/lecturer-assignments/modules/lecturer/${lecturerId}`);
  }

  async getModuleAssignmentsByModule(moduleId: number): Promise<ApiResponse<LecturerModuleAssignmentResponse[]>> {
    return this.get(`/api/admin/lecturer-assignments/modules/module/${moduleId}`);
  }

  async searchModuleAssignments(params: {
    lecturerId?: string;
    moduleId?: number;
    programId?: number;
    isActive?: boolean;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.lecturerId) queryParams.append('lecturerId', params.lecturerId);
    if (params.moduleId) queryParams.append('moduleId', params.moduleId.toString());
    if (params.programId) queryParams.append('programId', params.programId.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    return this.post(`/api/admin/lecturer-assignments/modules/search?${queryParams.toString()}`);
  }

  // ==================== INTAKE ASSIGNMENT ====================

  async assignLecturerToIntake(data: LecturerIntakeAssignmentRequest): Promise<ApiResponse<LecturerIntakeAssignmentResponse>> {
    return this.post('/api/admin/lecturer-assignments/intakes', data);
  }

  async updateIntakeAssignment(id: number, data: LecturerIntakeAssignmentRequest): Promise<ApiResponse<LecturerIntakeAssignmentResponse>> {
    return this.put(`/api/admin/lecturer-assignments/intakes/${id}`, data);
  }

  async removeIntakeAssignment(id: number): Promise<ApiResponse<void>> {
    return this.delete(`/api/admin/lecturer-assignments/intakes/${id}`);
  }

  async getIntakeAssignment(id: number): Promise<ApiResponse<LecturerIntakeAssignmentResponse>> {
    return this.get(`/api/admin/lecturer-assignments/intakes/${id}`);
  }

  async getIntakeAssignmentsByLecturer(lecturerId: string): Promise<ApiResponse<LecturerIntakeAssignmentResponse[]>> {
    return this.get(`/api/admin/lecturer-assignments/intakes/lecturer/${lecturerId}`);
  }

  async getIntakeAssignmentsByIntake(intakeId: number): Promise<ApiResponse<LecturerIntakeAssignmentResponse[]>> {
    return this.get(`/api/admin/lecturer-assignments/intakes/intake/${intakeId}`);
  }

  async searchIntakeAssignments(params: {
    lecturerId?: string;
    intakeId?: number;
    isActive?: boolean;
    search?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.lecturerId) queryParams.append('lecturerId', params.lecturerId);
    if (params.intakeId) queryParams.append('intakeId', params.intakeId.toString());
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDirection) queryParams.append('sortDirection', params.sortDirection);

    return this.post(`/api/admin/lecturer-assignments/intakes/search?${queryParams.toString()}`);
  }
}

export const lecturerService = new LecturerService();
