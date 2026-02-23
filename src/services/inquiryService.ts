import { ApiService } from './apiService';

export interface InquirySubmission {
    fullName: string;
    email: string;
    phoneNumber: string;
    program: string;
    message?: string;
}

export interface Inquiry {
    id: number;
    fullName: string;
    email: string;
    phoneNumber: string;
    program: string;
    message?: string;
    status: 'PENDING' | 'CONTACTED' | 'RESOLVED' | 'SPAM';
    contactedBy?: string;
    contactedAt?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InquiryStatistics {
    totalInquiries: number;
    pendingInquiries: number;
    contactedInquiries: number;
    resolvedInquiries: number;
    spamInquiries: number;
}

export interface PaginatedInquiries {
    content: Inquiry[];
    pageable: any;
    totalElements: number;
    totalPages: number;
    last: boolean;
    size: number;
    number: number;
    first: boolean;
    empty: boolean;
}

interface BackendResponse<T> {
    statusCode: string;
    message: string;
    data: T;
    timestamp: string;
}

export class InquiryService extends ApiService {
    /**
     * PUBLIC ENDPOINT - Submit inquiry form (no authentication required)
     */
    async submitInquiry(data: InquirySubmission): Promise<{ success: boolean; message: string; data?: Inquiry }> {
        try {
            console.log('📝 Submitting inquiry:', data);
            const response = await fetch(`${this.baseUrl}/api/public/inquiry/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result: BackendResponse<Inquiry> = await response.json();
            console.log('📝 Submit inquiry response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message, data: result.data };
            } else {
                return { success: false, message: result.message || 'Failed to submit inquiry' };
            }
        } catch (error: any) {
            console.error('🚨 Error submitting inquiry:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * Get auth headers for admin endpoints
     */
    private getAuthHeaders() {
        const token = localStorage.getItem('jwt_token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * ADMIN - Get all inquiries with pagination and filters
     */
    async getInquiries(params: {
        search?: string;
        status?: string;
        page?: number;
        size?: number;
    } = {}): Promise<{ success: boolean; message: string; data?: PaginatedInquiries }> {
        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.status) queryParams.append('status', params.status);
            queryParams.append('page', String(params.page ?? 0));
            queryParams.append('size', String(params.size ?? 10));

            console.log('📋 Fetching inquiries with params:', params);
            const response = await fetch(
                `${this.baseUrl}/api/admin/inquiries?${queryParams.toString()}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            const result: BackendResponse<PaginatedInquiries> = await response.json();
            console.log('📋 Get inquiries response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message, data: result.data };
            } else {
                return { success: false, message: result.message || 'Failed to fetch inquiries' };
            }
        } catch (error: any) {
            console.error('🚨 Error fetching inquiries:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * ADMIN - Get inquiry by ID
     */
    async getInquiryById(id: number): Promise<{ success: boolean; message: string; data?: Inquiry }> {
        try {
            console.log('🔍 Fetching inquiry by ID:', id);
            const response = await fetch(
                `${this.baseUrl}/api/admin/inquiries/${id}`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            const result: BackendResponse<Inquiry> = await response.json();
            console.log('🔍 Get inquiry by ID response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message, data: result.data };
            } else {
                return { success: false, message: result.message || 'Failed to fetch inquiry' };
            }
        } catch (error: any) {
            console.error('🚨 Error fetching inquiry:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * ADMIN - Update inquiry status
     */
    async updateInquiryStatus(
        id: number,
        status: 'PENDING' | 'CONTACTED' | 'RESOLVED' | 'SPAM',
        adminNotes?: string
    ): Promise<{ success: boolean; message: string; data?: Inquiry }> {
        try {
            console.log('🔄 Updating inquiry status:', id, status);
            const response = await fetch(
                `${this.baseUrl}/api/admin/inquiries/${id}/status`,
                {
                    method: 'PUT',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({ status, adminNotes })
                }
            );

            const result: BackendResponse<Inquiry> = await response.json();
            console.log('🔄 Update status response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message, data: result.data };
            } else {
                return { success: false, message: result.message || 'Failed to update status' };
            }
        } catch (error: any) {
            console.error('🚨 Error updating inquiry status:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * ADMIN - Get inquiry statistics
     */
    async getStatistics(): Promise<{ success: boolean; message: string; data?: InquiryStatistics }> {
        try {
            console.log('📊 Fetching inquiry statistics');
            const response = await fetch(
                `${this.baseUrl}/api/admin/inquiries/statistics`,
                {
                    method: 'GET',
                    headers: this.getAuthHeaders()
                }
            );

            const result: BackendResponse<InquiryStatistics> = await response.json();
            console.log('📊 Statistics response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message, data: result.data };
            } else {
                return { success: false, message: result.message || 'Failed to fetch statistics' };
            }
        } catch (error: any) {
            console.error('🚨 Error fetching statistics:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * ADMIN - Delete inquiry
     */
    async deleteInquiry(id: number): Promise<{ success: boolean; message: string }> {
        try {
            console.log('🗑️ Deleting inquiry:', id);
            const response = await fetch(
                `${this.baseUrl}/api/admin/inquiries/${id}`,
                {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                }
            );

            const result: BackendResponse<string> = await response.json();
            console.log('🗑️ Delete inquiry response:', result);

            if (result.statusCode === '000') {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Failed to delete inquiry' };
            }
        } catch (error: any) {
            console.error('🚨 Error deleting inquiry:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    /**
     * ADMIN - Export inquiries to Excel within a date range
     */
    async exportInquiriesToExcel(params: {
        startDate: string; // yyyy-MM-dd
        endDate: string;   // yyyy-MM-dd
        status?: string;
    }): Promise<{ success: boolean; message: string }> {
        try {
            const queryParams = new URLSearchParams();
            queryParams.append('startDate', params.startDate);
            queryParams.append('endDate', params.endDate);
            if (params.status) queryParams.append('status', params.status.toUpperCase());

            const url = `${this.baseUrl}/api/admin/inquiries/export/excel?${queryParams.toString()}`;
            console.log('📊 Exporting inquiries to Excel:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { success: false, message: `Export failed: ${response.status} ${errorText}` };
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `inquiries_${params.startDate}_to_${params.endDate}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            return { success: true, message: 'Excel report downloaded successfully' };
        } catch (error: any) {
            console.error('🚨 Error exporting inquiries:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }
}

export const inquiryService = new InquiryService();
