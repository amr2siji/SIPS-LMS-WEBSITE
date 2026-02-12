import { ApiService } from './apiService';

export interface StudentStatistics {
    activeStudents: number;
    graduatedStudents: number;
    inactiveStudents: number;
    suspendedStudents: number;
    totalStudents: number;
}

export interface StudentData {
    nic: string;
    fullName: string;
    nameWithInitials: string;
    dateOfBirth?: string | number[]; // Can be string or array [year, month, day]
    mobileNumber: string;
    email: string;
    permanentAddress: string;
    emergencyContactName?: string;
    emergencyRelationship?: string;
    emergencyContactMobile?: string;
    olQualifications?: string;
    alQualifications?: string;
    otherQualifications?: string;
    studentStatus: 'ACTIVE' | 'GRADUATED' | 'INACTIVE' | 'SUSPENDED' | 'DROPOUT';
    isActive: boolean;
    faculties: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    programs: Array<{ 
        programId: number; 
        programName: string;
        departmentId: number;
        departmentName: string;
        facultyId: number;
        facultyName: string;
        intakeId?: number;
        intakeName?: string;
    }>;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedStudentResponse {
    content: StudentData[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface StudentFilters {
    search?: string;
    facultyIds?: number[];
    departmentIds?: number[];
    programIds?: number[];
    intakeIds?: number[];
    status?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export interface CreateStudentData {
    fullName: string;
    nameWithInitials: string;
    nic: string;
    dateOfBirth?: string;
    mobileNumber: string;
    email: string;
    permanentAddress: string;
    emergencyContactName?: string;
    emergencyRelationship?: string;
    emergencyContactMobile?: string;
    olQualifications?: string;
    alQualifications?: string;
    otherQualifications?: string;
    facultyIds: number[];
    programIds: number[];
    intakeIds?: (number | null)[]; // Optional intake IDs, one per program
    studentStatus?: string;
}

export interface StudentFiles {
    nicDocument?: File;
    birthCertificate?: File;
    qualificationCertificate?: File;
    paymentSlip?: File;
}

export interface ApiResponseData {
    statusCode: string;
    message: string;
    data: any;
    timestamp: string;
}

export class StudentManagementService extends ApiService {
    private readonly STUDENT_ENDPOINTS = {
        STATISTICS: '/api/admin/students/statistics',
        STUDENTS: '/api/admin/students',
        STUDENT_BY_NIC: (nic: string) => `/api/admin/students/${nic}`,
        RESET_PASSWORD: (nic: string) => `/api/admin/students/${nic}/reset-password`
    };

    protected getAuthHeaders() {
        const token = localStorage.getItem('jwt_token');
        return {
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Get student statistics
     */
    async getStatistics(): Promise<{ success: boolean; data?: StudentStatistics; message: string }> {
        try {
            console.log('📊 Fetching student statistics...');
            const response = await fetch(`${this.baseUrl}${this.STUDENT_ENDPOINTS.STATISTICS}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            const result: ApiResponseData = await response.json();
            console.log('📊 Statistics response:', result);

            if (result.statusCode === '000') {
                return { success: true, data: result.data, message: result.message };
            } else {
                return { success: false, message: result.message || 'Failed to fetch statistics' };
            }
        } catch (error: any) {
            console.error('🚨 Error fetching statistics:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Get students with filtering and pagination (NO SEARCH)
     */
    async getStudents(filters: StudentFilters = {}): Promise<{ success: boolean; data?: PaginatedStudentResponse; message: string }> {
        try {
            const params = new URLSearchParams();
            
            // DO NOT include search parameter here - use searchStudents() instead
            if (filters.facultyIds?.length) params.append('facultyIds', filters.facultyIds.join(','));
            if (filters.departmentIds?.length) params.append('departmentIds', filters.departmentIds.join(','));
            if (filters.programIds?.length) params.append('programIds', filters.programIds.join(','));
            if (filters.intakeIds?.length) params.append('intakeIds', filters.intakeIds.join(','));
            if (filters.status) params.append('status', filters.status);
            params.append('page', String(filters.page ?? 0));
            params.append('size', String(filters.size ?? 10));
            params.append('sortBy', filters.sortBy ?? 'fullName');
            params.append('sortDirection', filters.sortDirection ?? 'ASC');

            console.log('👥 Fetching students with filters:', filters);
            const response = await fetch(
                `${this.baseUrl}${this.STUDENT_ENDPOINTS.STUDENTS}?${params.toString()}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            const result: ApiResponseData = await response.json();
            console.log('👥 Students response:', result);

            if (result.statusCode === '000') {
                return { success: true, data: result.data, message: result.message };
            } else {
                return { success: false, message: result.message || 'Failed to fetch students' };
            }
        } catch (error: any) {
            console.error('🚨 Error fetching students:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Search students by name, NIC, or mobile number
     */
    async searchStudents(query: string, page: number = 0, size: number = 10): Promise<{ success: boolean; data?: PaginatedStudentResponse; message: string }> {
        try {
            if (!query || query.trim() === '') {
                return { success: false, message: 'Please enter a search term' };
            }

            const params = new URLSearchParams();
            params.append('query', query.trim());
            params.append('page', String(page));
            params.append('size', String(size));
            params.append('sortBy', 'fullName');
            params.append('sortDirection', 'ASC');

            console.log('🔍 Searching students with query:', query);
            const response = await fetch(
                `${this.baseUrl}${this.STUDENT_ENDPOINTS.STUDENTS}/search?${params.toString()}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            const result: ApiResponseData = await response.json();
            console.log('🔍 Search response:', result);

            if (result.statusCode === '000') {
                return { success: true, data: result.data, message: result.message };
            } else {
                return { success: false, message: result.message || 'Search failed' };
            }
        } catch (error: any) {
            console.error('🚨 Error searching students:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Get student by NIC
     */
    async getStudentByNic(nic: string): Promise<{ success: boolean; data?: StudentData; message: string }> {
        try {
            console.log('🔍 Fetching student by NIC:', nic);
            const response = await fetch(
                `${this.baseUrl}${this.STUDENT_ENDPOINTS.STUDENT_BY_NIC(nic)}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            const result: ApiResponseData = await response.json();
            console.log('🔍 Student details response:', result);

            if (result.statusCode === '000') {
                return { success: true, data: result.data, message: result.message };
            } else {
                return { success: false, message: result.message || 'Student not found' };
            }
        } catch (error: any) {
            console.error('🚨 Error fetching student:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Create new student
     */
    async createStudent(studentData: CreateStudentData, files: StudentFiles = {}): Promise<{ success: boolean; data?: StudentData; message: string }> {
        try {
            const formData = new FormData();

            // Add text fields
            formData.append('fullName', studentData.fullName);
            formData.append('nameWithInitials', studentData.nameWithInitials);
            formData.append('nic', studentData.nic);
            formData.append('mobileNumber', studentData.mobileNumber);
            formData.append('email', studentData.email);
            formData.append('permanentAddress', studentData.permanentAddress);

            if (studentData.dateOfBirth) formData.append('dateOfBirth', studentData.dateOfBirth);
            if (studentData.emergencyContactName) formData.append('emergencyContactName', studentData.emergencyContactName);
            if (studentData.emergencyRelationship) formData.append('emergencyRelationship', studentData.emergencyRelationship);
            if (studentData.emergencyContactMobile) formData.append('emergencyContactMobile', studentData.emergencyContactMobile);
            if (studentData.olQualifications) formData.append('olQualifications', studentData.olQualifications);
            if (studentData.alQualifications) formData.append('alQualifications', studentData.alQualifications);
            if (studentData.otherQualifications) formData.append('otherQualifications', studentData.otherQualifications);
            if (studentData.studentStatus) formData.append('studentStatus', studentData.studentStatus);

            // Add arrays
            studentData.facultyIds.forEach(id => formData.append('facultyIds', String(id)));
            studentData.programIds.forEach(id => formData.append('programIds', String(id)));
            
            // Add intakeIds (filter out null values)
            if (studentData.intakeIds && studentData.intakeIds.length > 0) {
                studentData.intakeIds.forEach(id => {
                    if (id !== null && id !== undefined) {
                        formData.append('intakeIds', String(id));
                    }
                });
            }

            // Add files
            if (files.nicDocument) formData.append('nicDocument', files.nicDocument);
            if (files.birthCertificate) formData.append('birthCertificate', files.birthCertificate);
            if (files.qualificationCertificate) formData.append('qualificationCertificate', files.qualificationCertificate);
            if (files.paymentSlip) formData.append('paymentSlip', files.paymentSlip);

            console.log('➕ Creating student:', studentData);
            const response = await fetch(`${this.baseUrl}${this.STUDENT_ENDPOINTS.STUDENTS}`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: formData
            });

            const result: ApiResponseData = await response.json();
            console.log('➕ Create student response:', result);

            if (result.statusCode === '000') {
                return { success: true, data: result.data, message: result.message };
            } else {
                return { success: false, message: result.message || 'Failed to create student' };
            }
        } catch (error: any) {
            console.error('🚨 Error creating student:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Update student
     */
    async updateStudent(nic: string, updates: Partial<CreateStudentData>, files: StudentFiles = {}): Promise<{ success: boolean; data?: StudentData; message: string }> {
        try {
            const formData = new FormData();

            // Add updated fields
            Object.keys(updates).forEach(key => {
                const value = (updates as any)[key];
                if (Array.isArray(value)) {
                    // Filter out null/undefined values from arrays before adding to FormData
                    value.forEach(item => {
                        if (item !== null && item !== undefined) {
                            formData.append(key, String(item));
                        }
                    });
                } else if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            });

            // Add files
            if (files.nicDocument) formData.append('nicDocument', files.nicDocument);
            if (files.birthCertificate) formData.append('birthCertificate', files.birthCertificate);
            if (files.qualificationCertificate) formData.append('qualificationCertificate', files.qualificationCertificate);
            if (files.paymentSlip) formData.append('paymentSlip', files.paymentSlip);

            console.log('✏️ Updating student:', nic);
            const response = await fetch(
                `${this.baseUrl}${this.STUDENT_ENDPOINTS.STUDENT_BY_NIC(nic)}`,
                {
                    method: 'PUT',
                    headers: this.getAuthHeaders(),
                    body: formData
                }
            );

            const result: ApiResponseData = await response.json();
            console.log('✏️ Update student response:', result);

            if (result.statusCode === '000') {
                return { success: true, data: result.data, message: result.message };
            } else {
                return { success: false, message: result.message || 'Failed to update student' };
            }
        } catch (error: any) {
            console.error('🚨 Error updating student:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Reset student password
     */
    async resetPassword(nic: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log('🔑 Resetting password for student:', nic);
            const response = await fetch(
                `${this.baseUrl}${this.STUDENT_ENDPOINTS.RESET_PASSWORD(nic)}`,
                {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                }
            );

            const result: ApiResponseData = await response.json();
            console.log('🔑 Reset password response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Failed to reset password' };
            }
        } catch (error: any) {
            console.error('🚨 Error resetting password:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Delete student permanently
     */
    async deleteStudent(nic: string): Promise<{ success: boolean; message: string }> {
        try {
            console.log('🗑️ Deleting student:', nic);
            const response = await fetch(
                `${this.baseUrl}${this.STUDENT_ENDPOINTS.STUDENT_BY_NIC(nic)}`,
                {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                }
            );

            const result: ApiResponseData = await response.json();
            console.log('🗑️ Delete student response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Failed to delete student' };
            }
        } catch (error: any) {
            console.error('🚨 Error deleting student:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Change student status
     */
    async changeStudentStatus(nic: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'GRADUATED' | 'DROPOUT'): Promise<{ success: boolean; message: string; data?: StudentData }> {
        try {
            console.log('🔄 Changing student status:', nic, 'to', status);
            const response = await fetch(
                `${this.baseUrl}/api/admin/students/${nic}/status?status=${status}`,
                {
                    method: 'PATCH',
                    headers: this.getAuthHeaders()
                }
            );

            const result: ApiResponseData = await response.json();
            console.log('🔄 Change status response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message, data: result.data };
            } else {
                return { success: false, message: result.message || 'Failed to change student status' };
            }
        } catch (error: any) {
            console.error('🚨 Error changing student status:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }
}

export const studentManagementService = new StudentManagementService();
