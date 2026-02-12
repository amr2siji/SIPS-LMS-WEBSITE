/**
 * Base API Service Class
 * Handles common API operations, error handling, and standardized responses
 */

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;
    statusCode?: number;
    timestamp?: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    page: number;
    first: boolean;
    last: boolean;
}

export class ApiService {
    protected baseUrl: string;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    }

    /**
     * Get authorization headers with JWT token
     */
    protected getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem('jwt_token');
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    /**
     * Get authorization headers for multipart form data
     */
    protected getAuthHeadersMultipart(): Record<string, string> {
        const token = localStorage.getItem('jwt_token');
        return {
            ...(token && { 'Authorization': `Bearer ${token}` })
            // Don't set Content-Type for FormData
        };
    }

    /**
     * Handle API response and errors
     */
    protected async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const contentType = response.headers.get('content-type');
        let data: any;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            // Handle different error types
            switch (response.status) {
                case 401:
                    // Unauthorized - clear session and redirect
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('user_nic');
                    localStorage.removeItem('user_email');
                    localStorage.removeItem('user_name');
                    window.location.href = '/login?reason=unauthorized';
                    throw new Error('Session expired. Please login again.');
                    
                case 403:
                    // Forbidden - session invalid (auto-logout on new login feature)
                    console.warn('🚫 Session invalid - another login detected or session expired');
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_role');
                    localStorage.removeItem('user_nic');
                    localStorage.removeItem('user_email');
                    localStorage.removeItem('user_name');
                    window.location.href = '/login?reason=session_invalid';
                    throw new Error('Your session is no longer valid. Please login again.');
                    
                case 404:
                    throw new Error('Resource not found.');
                    
                case 500:
                    console.error('Server 500 error details:', data);
                    throw new Error(data.message || 'Server error. Please try again later.');
                    
                default:
                    console.error(`HTTP ${response.status} error details:`, data);
                    throw new Error(data.message || data || 'An error occurred');
            }
        }

        // Handle different response formats
        if (typeof data === 'object' && data !== null) {
            // Standardized backend response format with 'success' field
            if ('success' in data) {
                return data as ApiResponse<T>;
            }
            // Backend response format with 'statusCode' field (e.g., "000" for success)
            else if ('statusCode' in data) {
                return {
                    success: data.statusCode === '000',
                    message: data.message || 'Request successful',
                    data: data.data as T,
                    statusCode: response.status,
                    timestamp: data.timestamp
                };
            }
            // Direct data response
            else {
                return {
                    success: true,
                    message: 'Request successful',
                    data: data as T
                };
            }
        }

        // Text or other response
        return {
            success: true,
            message: 'Request successful',
            data: data as T
        };
    }

    /**
     * GET request
     */
    protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        
        if (params) {
            Object.keys(params).forEach(key => {
                const value = params[key];
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        value.forEach(v => url.searchParams.append(key, v.toString()));
                    } else {
                        url.searchParams.append(key, value.toString());
                    }
                }
            });
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<T>(response);
    }

    /**
     * POST request with JSON body
     */
    protected async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined
        });

        return this.handleResponse<T>(response);
    }

    /**
     * POST request with FormData
     */
    protected async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getAuthHeadersMultipart(),
            body: formData
        });

        return this.handleResponse<T>(response);
    }

    /**
     * PUT request with JSON body
     */
    protected async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined
        });

        return this.handleResponse<T>(response);
    }

    /**
     * PUT request with FormData
     */
    protected async putFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getAuthHeadersMultipart(),
            body: formData
        });

        return this.handleResponse<T>(response);
    }

    /**
     * PATCH request with JSON body
     */
    protected async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined
        });

        return this.handleResponse<T>(response);
    }

    /**
     * DELETE request
     */
    protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        return this.handleResponse<T>(response);
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        const token = localStorage.getItem('jwt_token');
        return !!token;
    }

    /**
     * Get current user role
     */
    public getUserRole(): string | null {
        return localStorage.getItem('user_role');
    }

    /**
     * Get current user NIC
     */
    public getUserNIC(): string | null {
        return localStorage.getItem('user_nic');
    }

    /**
     * Clear authentication data
     */
    public clearAuth(): void {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_nic');
    }
}