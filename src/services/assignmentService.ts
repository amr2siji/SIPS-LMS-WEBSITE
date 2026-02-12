/**
 * Assignment Service
 * Handles all assignment-related API operations including file uploads
 */

import { ApiService, ApiResponse, PaginatedResponse } from './apiService';

// DTOs matching backend
export interface AssignmentResponse {
    id: number;
    title: string;
    description?: string;
    dueDate: string; // LocalDate as ISO string
    maxMarks: number;
    attachmentUrl?: string;
    attachmentName?: string;
    isPublished: boolean;
    moduleId?: number;
    moduleCode?: string;
    moduleName?: string;
    facultyId?: number;
    facultyName?: string;
    departmentId?: number;
    departmentName?: string;
    programId?: number;
    programName?: string;
    intakeId?: number;
    intakeName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AssignmentCreateRequest {
    moduleId: number;
    title: string;
    description?: string;
    dueDate: string; // ISO date string (YYYY-MM-DD)
    maxMarks: number;
    attachmentUrl?: string;
    attachmentName?: string;
    isPublished?: boolean;
}

export interface AssignmentUpdateRequest {
    title: string;
    description?: string;
    dueDate: string; // ISO date string (YYYY-MM-DD)
    maxMarks: number;
    attachmentUrl?: string;
    attachmentName?: string;
    isPublished?: boolean;
}

export interface AssignmentSearchRequest {
    search?: string;
    moduleId?: number;
    facultyId?: number;
    departmentId?: number;
    programId?: number;
    // intakeId removed - backend doesn't use this field for search/filtering
    isPublished?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
}

class AssignmentServiceClass extends ApiService {
    /**
     * Upload assignment file
     * POST /api/admin/assignments/upload
     */
    async uploadAssignmentFile(file: File): Promise<ApiResponse<{ fileUrl: string; fileName: string }>> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}/api/admin/assignments/upload`, {
            method: 'POST',
            headers: this.getAuthHeadersMultipart(),
            body: formData
        });

        return this.handleResponse<{ fileUrl: string; fileName: string }>(response);
    }

    /**
     * Create a new assignment
     * POST /api/admin/assignments
     */
    async createAssignment(request: AssignmentCreateRequest): Promise<ApiResponse<AssignmentResponse>> {
        const response = await fetch(`${this.baseUrl}/api/admin/assignments`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        return this.handleResponse<AssignmentResponse>(response);
    }

    /**
     * Get assignment by ID
     * GET /api/admin/assignments/{id}
     */
    async getAssignmentById(id: number): Promise<ApiResponse<AssignmentResponse>> {
        const response = await fetch(`${this.baseUrl}/api/admin/assignments/${id}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<AssignmentResponse>(response);
    }

    /**
     * Search assignments with filters and pagination
     * POST /api/admin/assignments/search
     */
    async searchAssignments(request: AssignmentSearchRequest): Promise<ApiResponse<PaginatedResponse<AssignmentResponse>>> {
        const searchRequest = {
            search: request.search || '',
            moduleId: request.moduleId || null,
            facultyId: request.facultyId || null,
            departmentId: request.departmentId || null,
            programId: request.programId || null,
            // intakeId removed - backend doesn't use this field
            isPublished: request.isPublished !== undefined ? request.isPublished : null,
            page: request.page || 0,
            size: request.size || 10,
            sortBy: request.sortBy || 'dueDate',
            sortDirection: request.sortDirection || 'desc'
        };

        const response = await fetch(`${this.baseUrl}/api/admin/assignments/search`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(searchRequest)
        });

        return this.handleResponse<PaginatedResponse<AssignmentResponse>>(response);
    }

    /**
     * Get all assignments with pagination
     * GET /api/admin/assignments
     */
    async getAllAssignments(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'dueDate',
        sortDirection: string = 'desc'
    ): Promise<ApiResponse<PaginatedResponse<AssignmentResponse>>> {
        const url = new URL(`${this.baseUrl}/api/admin/assignments`);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('size', size.toString());
        url.searchParams.append('sortBy', sortBy);
        url.searchParams.append('sortDirection', sortDirection);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<PaginatedResponse<AssignmentResponse>>(response);
    }

    /**
     * Get assignments by module ID
     * GET /api/admin/assignments/module/{moduleId}
     */
    async getAssignmentsByModuleId(moduleId: number): Promise<ApiResponse<AssignmentResponse[]>> {
        const response = await fetch(`${this.baseUrl}/api/admin/assignments/module/${moduleId}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<AssignmentResponse[]>(response);
    }

    /**
     * Get all published assignments
     * GET /api/admin/assignments/published
     */
    async getPublishedAssignments(): Promise<ApiResponse<AssignmentResponse[]>> {
        const response = await fetch(`${this.baseUrl}/api/admin/assignments/published`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<AssignmentResponse[]>(response);
    }

    /**
     * Update assignment
     * PUT /api/admin/assignments/{id}
     */
    async updateAssignment(id: number, request: AssignmentUpdateRequest): Promise<ApiResponse<AssignmentResponse>> {
        const response = await fetch(`${this.baseUrl}/api/admin/assignments/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        return this.handleResponse<AssignmentResponse>(response);
    }

    /**
     * Update assignment publish status
     * PUT /api/admin/assignments/{id}/publish
     */
    async updatePublishStatus(id: number, isPublished: boolean): Promise<ApiResponse<AssignmentResponse>> {
        const url = new URL(`${this.baseUrl}/api/admin/assignments/${id}/publish`);
        url.searchParams.append('isPublished', isPublished.toString());

        const response = await fetch(url.toString(), {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<AssignmentResponse>(response);
    }

    /**
     * Delete assignment
     * DELETE /api/admin/assignments/{id}
     */
    async deleteAssignment(id: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${this.baseUrl}/api/admin/assignments/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<void>(response);
    }

    /**
     * Get assignments by module ID for lecturer (lecturer-facing endpoint)
     * GET /api/lecturer/assignments/module/{moduleId}
     */
    async getAssignmentsByModuleForLecturer(moduleId: number): Promise<ApiResponse<AssignmentResponse[]>> {
        const response = await fetch(`${this.baseUrl}/api/lecturer/assignments/module/${moduleId}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<AssignmentResponse[]>(response);
    }

    /**
     * Create assignment (lecturer-facing endpoint)
     * POST /api/lecturer/assignments
     */
    async createAssignmentForLecturer(request: AssignmentCreateRequest): Promise<ApiResponse<AssignmentResponse>> {
        const response = await fetch(`${this.baseUrl}/api/lecturer/assignments`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        return this.handleResponse<AssignmentResponse>(response);
    }

    /**
     * Update assignment (lecturer-facing endpoint)
     * PUT /api/lecturer/assignments/{id}
     */
    async updateAssignmentForLecturer(id: number, request: AssignmentUpdateRequest): Promise<ApiResponse<AssignmentResponse>> {
        const response = await fetch(`${this.baseUrl}/api/lecturer/assignments/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        return this.handleResponse<AssignmentResponse>(response);
    }

    /**
     * Update assignment publish status (lecturer-facing endpoint)
     * PUT /api/lecturer/assignments/{id}/publish
     */
    async updatePublishStatusForLecturer(id: number, isPublished: boolean): Promise<ApiResponse<AssignmentResponse>> {
        const url = new URL(`${this.baseUrl}/api/lecturer/assignments/${id}/publish`);
        url.searchParams.append('isPublished', isPublished.toString());

        const response = await fetch(url.toString(), {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<AssignmentResponse>(response);
    }

    /**
     * Delete assignment (lecturer-facing endpoint)
     * DELETE /api/lecturer/assignments/{id}
     */
    async deleteAssignmentForLecturer(id: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${this.baseUrl}/api/lecturer/assignments/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<void>(response);
    }
}

// Export singleton instance
export const assignmentService = new AssignmentServiceClass();
