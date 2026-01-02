import { ApiService, ApiResponse, PaginatedResponse } from './apiService';

export interface Student {
    id?: number;
    nic: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    programId?: number;
    profileImage?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactEmail?: string;
    enrollmentDate?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED_OUT';
    createdAt?: string;
    updatedAt?: string;
}

export interface StudentWithProgram extends Student {
    program?: {
        id: number;
        name: string;
        code: string;
        duration: string;
        credits: number;
        departmentId: number;
        departmentName?: string;
    };
}

export interface StudentProfile extends StudentWithProgram {
    totalCredits?: number;
    completedCredits?: number;
    gpa?: number;
    enrolledModules?: Array<{
        id: number;
        code: string;
        name: string;
        credits: number;
        semester: number;
        status: 'ENROLLED' | 'COMPLETED' | 'FAILED' | 'DROPPED';
    }>;
}

export interface StudentFilters {
    search?: string;
    programId?: number;
    status?: string;
    gender?: string;
    enrollmentYear?: number;
}

export interface CreateStudentRequest {
    nic: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    address: string;
    dateOfBirth: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    programId: number;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactEmail?: string;
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
    id: number;
}

export interface EnrollmentRequest {
    studentId: number;
    moduleId: number;
    semester: number;
    academicYear: string;
}

/**
 * Student Management Service
 * Handles all student-related API operations
 */
export class StudentService extends ApiService {
    private readonly STUDENT_ENDPOINTS = {
        STUDENTS: '/api/students',
        STUDENT_BY_ID: (id: number) => `/api/students/${id}`,
        STUDENT_PROFILE: (id: number) => `/api/students/${id}/profile`,
        STUDENT_MODULES: (id: number) => `/api/students/${id}/modules`,
        STUDENT_MARKS: (id: number) => `/api/students/${id}/marks`,
        STUDENT_PAYMENTS: (id: number) => `/api/students/${id}/payments`,
        ENROLL_MODULE: '/api/students/enroll',
        DROP_MODULE: '/api/students/drop-module',
        UPDATE_STATUS: (id: number) => `/api/students/${id}/status`,
        BULK_UPLOAD: '/api/students/bulk-upload',
        EXPORT: '/api/students/export'
    };

    /**
     * Get all students with pagination and filtering
     */
    async getStudents(
        page: number = 0,
        size: number = 20,
        filters: StudentFilters = {}
    ): Promise<PaginatedResponse<StudentWithProgram>> {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...Object.fromEntries(
                Object.entries(filters)
                    .filter(([, value]) => value !== undefined && value !== '')
                    .map(([key, value]) => [key, value.toString()])
            )
        });

        const response: ApiResponse<PaginatedResponse<StudentWithProgram>> = 
            await this.get(`${this.STUDENT_ENDPOINTS.STUDENTS}?${params}`);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || 'Failed to fetch students');
    }

    /**
     * Get student by ID
     */
    async getStudentById(id: number): Promise<StudentWithProgram> {
        const response: ApiResponse<StudentWithProgram> = 
            await this.get(this.STUDENT_ENDPOINTS.STUDENT_BY_ID(id));

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || `Failed to fetch student with ID ${id}`);
    }

    /**
     * Get student profile with detailed information
     */
    async getStudentProfile(id: number): Promise<StudentProfile> {
        const response: ApiResponse<StudentProfile> = 
            await this.get(this.STUDENT_ENDPOINTS.STUDENT_PROFILE(id));

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || `Failed to fetch student profile for ID ${id}`);
    }

    /**
     * Create new student
     */
    async createStudent(studentData: CreateStudentRequest): Promise<Student> {
        const response: ApiResponse<Student> = 
            await this.post(this.STUDENT_ENDPOINTS.STUDENTS, studentData);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || 'Failed to create student');
    }

    /**
     * Update existing student
     */
    async updateStudent(studentData: UpdateStudentRequest): Promise<Student> {
        const response: ApiResponse<Student> = 
            await this.put(this.STUDENT_ENDPOINTS.STUDENT_BY_ID(studentData.id), studentData);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || `Failed to update student with ID ${studentData.id}`);
    }

    /**
     * Delete student
     */
    async deleteStudent(id: number): Promise<void> {
        const response: ApiResponse<void> = 
            await this.delete(this.STUDENT_ENDPOINTS.STUDENT_BY_ID(id));

        if (!response.success) {
            throw new Error(response.message || `Failed to delete student with ID ${id}`);
        }
    }

    /**
     * Update student status
     */
    async updateStudentStatus(
        id: number, 
        status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DROPPED_OUT'
    ): Promise<Student> {
        const response: ApiResponse<Student> = 
            await this.put(this.STUDENT_ENDPOINTS.UPDATE_STATUS(id), { status });

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || `Failed to update status for student with ID ${id}`);
    }

    /**
     * Get student enrolled modules
     */
    async getStudentModules(id: number): Promise<any[]> {
        const response: ApiResponse<any[]> = 
            await this.get(this.STUDENT_ENDPOINTS.STUDENT_MODULES(id));

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || `Failed to fetch modules for student with ID ${id}`);
    }

    /**
     * Enroll student in module
     */
    async enrollStudentInModule(enrollmentData: EnrollmentRequest): Promise<void> {
        const response: ApiResponse<void> = 
            await this.post(this.STUDENT_ENDPOINTS.ENROLL_MODULE, enrollmentData);

        if (!response.success) {
            throw new Error(response.message || 'Failed to enroll student in module');
        }
    }

    /**
     * Drop student from module
     */
    async dropStudentFromModule(studentId: number, moduleId: number): Promise<void> {
        const response: ApiResponse<void> = 
            await this.post(this.STUDENT_ENDPOINTS.DROP_MODULE, { studentId, moduleId });

        if (!response.success) {
            throw new Error(response.message || 'Failed to drop student from module');
        }
    }

    /**
     * Get student marks/grades
     */
    async getStudentMarks(id: number): Promise<any[]> {
        const response: ApiResponse<any[]> = 
            await this.get(this.STUDENT_ENDPOINTS.STUDENT_MARKS(id));

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || `Failed to fetch marks for student with ID ${id}`);
    }

    /**
     * Get student payment history
     */
    async getStudentPayments(id: number): Promise<any[]> {
        const response: ApiResponse<any[]> = 
            await this.get(this.STUDENT_ENDPOINTS.STUDENT_PAYMENTS(id));

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || `Failed to fetch payments for student with ID ${id}`);
    }

    /**
     * Upload student profile image
     */
    async uploadProfileImage(studentId: number, imageFile: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('studentId', studentId.toString());

        const response: ApiResponse<{ imageUrl: string }> = 
            await this.postFormData(`${this.STUDENT_ENDPOINTS.STUDENTS}/upload-profile-image`, formData);

        if (response.success && response.data) {
            return response.data.imageUrl;
        }

        throw new Error(response.message || 'Failed to upload profile image');
    }

    /**
     * Bulk upload students from CSV/Excel file
     */
    async bulkUploadStudents(file: File): Promise<{ 
        successful: number; 
        failed: number; 
        errors: string[] 
    }> {
        const formData = new FormData();
        formData.append('file', file);

        const response: ApiResponse<{ successful: number; failed: number; errors: string[] }> = 
            await this.postFormData(this.STUDENT_ENDPOINTS.BULK_UPLOAD, formData);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || 'Failed to bulk upload students');
    }

    /**
     * Export students to Excel/CSV
     */
    async exportStudents(
        format: 'excel' | 'csv' = 'excel',
        filters: StudentFilters = {}
    ): Promise<Blob> {
        const params = new URLSearchParams({
            format,
            ...Object.fromEntries(
                Object.entries(filters)
                    .filter(([, value]) => value !== undefined && value !== '')
                    .map(([key, value]) => [key, value.toString()])
            )
        });

        const response = await fetch(`${this.baseUrl}${this.STUDENT_ENDPOINTS.EXPORT}?${params}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        if (response.ok) {
            return await response.blob();
        }

        throw new Error('Failed to export students');
    }

    /**
     * Search students by NIC or name
     */
    async searchStudents(query: string): Promise<StudentWithProgram[]> {
        const response: ApiResponse<StudentWithProgram[]> = 
            await this.get(`${this.STUDENT_ENDPOINTS.STUDENTS}/search?q=${encodeURIComponent(query)}`);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || 'Failed to search students');
    }

    /**
     * Get student statistics for dashboard
     */
    async getStudentStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        graduated: number;
        droppedOut: number;
        byProgram: Array<{ programName: string; count: number }>;
        byGender: Array<{ gender: string; count: number }>;
        recentEnrollments: number;
    }> {
        const response: ApiResponse<any> = 
            await this.get(`${this.STUDENT_ENDPOINTS.STUDENTS}/statistics`);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.message || 'Failed to fetch student statistics');
    }
}

// Create singleton instance
export const studentService = new StudentService();