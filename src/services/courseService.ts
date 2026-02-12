/**
 * Course Service
 * Handles all course-related API operations
 */

import { ApiService, ApiResponse, PaginatedResponse } from './apiService';

// DTOs matching backend
export interface CourseResponse {
    id: number;
    courseCode: string;
    courseName: string;
    description?: string;
    credits: number;
    programId?: number;
    programName?: string;
    programCode?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseCreateRequest {
    courseCode: string;
    courseName: string;
    description?: string;
    credits: number;
    programId: number;
}

export interface CourseUpdateRequest {
    courseName: string;
    description?: string;
    credits: number;
    programId: number;
    isActive?: boolean;
}

export interface CourseSearchRequest {
    search?: string;
    programId?: number;
    isActive?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
}

class CourseServiceClass extends ApiService {
    /**
     * Create a new course
     * POST /api/admin/courses
     */
    async createCourse(request: CourseCreateRequest): Promise<ApiResponse<CourseResponse>> {
        const response = await fetch(`${this.baseUrl}/api/admin/courses`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        return this.handleResponse<CourseResponse>(response);
    }

    /**
     * Get course by ID
     * GET /api/admin/courses/{id}
     */
    async getCourseById(id: number): Promise<ApiResponse<CourseResponse>> {
        const response = await fetch(`${this.baseUrl}/api/admin/courses/${id}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<CourseResponse>(response);
    }

    /**
     * Search courses with filters and pagination
     * POST /api/admin/courses/search
     */
    async searchCourses(request: CourseSearchRequest): Promise<ApiResponse<PaginatedResponse<CourseResponse>>> {
        const searchRequest = {
            search: request.search || '',
            programId: request.programId || null,
            isActive: request.isActive !== undefined ? request.isActive : null,
            page: request.page || 0,
            size: request.size || 10,
            sortBy: request.sortBy || 'courseName',
            sortDirection: request.sortDirection || 'asc'
        };

        const response = await fetch(`${this.baseUrl}/api/admin/courses/search`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(searchRequest)
        });

        return this.handleResponse<PaginatedResponse<CourseResponse>>(response);
    }

    /**
     * Get all courses with pagination
     * GET /api/admin/courses
     */
    async getAllCourses(
        page: number = 0,
        size: number = 10,
        sortBy: string = 'courseName',
        sortDirection: string = 'asc'
    ): Promise<ApiResponse<PaginatedResponse<CourseResponse>>> {
        const url = new URL(`${this.baseUrl}/api/admin/courses`);
        url.searchParams.append('page', page.toString());
        url.searchParams.append('size', size.toString());
        url.searchParams.append('sortBy', sortBy);
        url.searchParams.append('sortDirection', sortDirection);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<PaginatedResponse<CourseResponse>>(response);
    }

    /**
     * Get courses by program ID
     * GET /api/admin/courses/program/{programId}
     */
    async getCoursesByProgramId(programId: number): Promise<ApiResponse<CourseResponse[]>> {
        const response = await fetch(`${this.baseUrl}/api/admin/courses/program/${programId}`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<CourseResponse[]>(response);
    }

    /**
     * Get all active courses
     * GET /api/admin/courses/active
     */
    async getActiveCourses(): Promise<ApiResponse<CourseResponse[]>> {
        const response = await fetch(`${this.baseUrl}/api/admin/courses/active`, {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<CourseResponse[]>(response);
    }

    /**
     * Update course
     * PUT /api/admin/courses/{id}
     */
    async updateCourse(id: number, request: CourseUpdateRequest): Promise<ApiResponse<CourseResponse>> {
        const response = await fetch(`${this.baseUrl}/api/admin/courses/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request)
        });

        return this.handleResponse<CourseResponse>(response);
    }

    /**
     * Update course status (activate/deactivate)
     * PUT /api/admin/courses/{id}/status
     */
    async updateCourseStatus(id: number, isActive: boolean): Promise<ApiResponse<CourseResponse>> {
        const url = new URL(`${this.baseUrl}/api/admin/courses/${id}/status`);
        url.searchParams.append('isActive', isActive.toString());

        const response = await fetch(url.toString(), {
            method: 'PUT',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<CourseResponse>(response);
    }

    /**
     * Delete course
     * DELETE /api/admin/courses/{id}
     */
    async deleteCourse(id: number): Promise<ApiResponse<void>> {
        const response = await fetch(`${this.baseUrl}/api/admin/courses/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<void>(response);
    }
}

// Export singleton instance
export const courseService = new CourseServiceClass();
