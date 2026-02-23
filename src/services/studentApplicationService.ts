// Student Application Management Service for Spring Boot API integration
export interface StudentApplication {
  id: number;
  applicationNumber: string;
  studentName: string; // Maps to fullName in API
  email: string; // Maps to emailAddress in API
  nic: string; // Maps to nicNumber in API
  phoneNumber: string; // Maps to mobileNumber in API
  programName: string;
  departmentName: string;
  facultyName: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ENROLLED';
  createdAt: string;
  updatedAt: string;
}

export interface DetailedStudentApplication extends StudentApplication {
  nameWithInitials: string;
  dateOfBirth: string;
  permanentAddress: string;
  contactName: string;
  relationship: string;
  contactMobileNumber: string;
  olResults: string;
  alResults: string;
  otherQualifications?: string;
  olResultsPath?: string;
  alResultsPath?: string;
  transcriptPath?: string;
  nicCopyPath?: string;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ApplicationStatistics {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  enrolled: number;
}

export interface PaginatedApplications {
  content: StudentApplication[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface StatusUpdateRequest {
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ENROLLED';
  adminNotes?: string;
}

export interface BackendResponse<T> {
  statusCode: string;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApplicationResponse {
  success: boolean;
  data?: any;
  message: string;
}

import { ADMIN_API_URL } from '../lib/apiConfig';

// Helper function to convert date array to ISO string
const convertDateArray = (dateArray: number[]): string => {
  if (!dateArray || dateArray.length < 3) return new Date().toISOString();
  
  // Handle both date and datetime arrays
  const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = dateArray;
  const date = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000));
  return date.toISOString();
};

// Helper function to map API response to our interface
const mapApiResponseToStudentApplication = (apiData: any): StudentApplication => ({
  id: apiData.id,
  applicationNumber: apiData.applicationNumber,
  studentName: apiData.fullName,
  email: apiData.emailAddress,
  nic: apiData.nicNumber,
  phoneNumber: apiData.mobileNumber,
  programName: apiData.programName,
  departmentName: apiData.departmentName,
  facultyName: apiData.facultyName,
  status: apiData.status,
  createdAt: convertDateArray(apiData.createdAt),
  updatedAt: convertDateArray(apiData.updatedAt)
});

// Helper function to map API response to detailed interface
const mapApiResponseToDetailedApplication = (apiData: any): DetailedStudentApplication => ({
  ...mapApiResponseToStudentApplication(apiData),
  nameWithInitials: apiData.nameWithInitials,
  dateOfBirth: apiData.dateOfBirth ? convertDateArray(apiData.dateOfBirth) : '',
  permanentAddress: apiData.permanentAddress,
  contactName: apiData.contactName,
  relationship: apiData.relationship,
  contactMobileNumber: apiData.contactMobileNumber,
  olResults: apiData.olResults,
  alResults: apiData.alResults,
  otherQualifications: apiData.otherQualifications,
  olResultsPath: apiData.olResultsPath,
  alResultsPath: apiData.alResultsPath,
  transcriptPath: apiData.transcriptPath,
  nicCopyPath: apiData.nicDocumentPath,
  adminNotes: apiData.adminNotes,
  rejectionReason: apiData.rejectionReason
});

class StudentApplicationService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getApplications(params?: {
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedApplications> {
    try {
      const searchParams = new URLSearchParams();
      
      if (params?.status) searchParams.append('status', params.status);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.page !== undefined) searchParams.append('page', params.page.toString());
      if (params?.size !== undefined) searchParams.append('size', params.size.toString());

      const url = `${ADMIN_API_URL}/applications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      console.log('Loading applications from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });

      console.log('Applications response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Applications API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load applications'}`);
      }

      const result = await response.json();
      console.log('Applications result:', result);

      // Handle both direct pagination response and wrapped response
      let paginationData;
      if (result.content) {
        paginationData = result;
      } else if (result.statusCode === '000' && result.data) {
        paginationData = result.data;
      } else {
        throw new Error('Invalid response format');
      }

      // Map the API response to our interface
      const mappedContent = paginationData.content.map(mapApiResponseToStudentApplication);
      
      return {
        ...paginationData,
        content: mappedContent
      } as PaginatedApplications;
    } catch (error: any) {
      console.error('Failed to load applications:', error);
      throw error;
    }
  }

  async getApplicationById(id: number): Promise<DetailedStudentApplication> {
    try {
      console.log('Loading application by ID:', id);

      const response = await fetch(`${ADMIN_API_URL}/applications/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });

      console.log('Application detail response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Application detail API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load application'}`);
      }

      const result: BackendResponse<any> = await response.json();
      console.log('Application detail result:', result);
      console.log('Application detail data fields:', {
        id: result.data?.id,
        nic: result.data?.nicNumber,
        email: result.data?.emailAddress,
        phoneNumber: result.data?.mobileNumber,
        createdAt: result.data?.createdAt,
        updatedAt: result.data?.updatedAt
      });

      if (result.statusCode === '000' && result.data) {
        // Handle array response (single item in content array)
        if (result.data.content && Array.isArray(result.data.content) && result.data.content.length > 0) {
          return mapApiResponseToDetailedApplication(result.data.content[0]);
        }
        // Handle direct object response
        else if (result.data.id) {
          return mapApiResponseToDetailedApplication(result.data);
        } else {
          throw new Error('No application data found in response');
        }
      } else {
        throw new Error(result.message || 'Failed to load application');
      }
    } catch (error: any) {
      console.error('Failed to load application:', error);
      throw error;
    }
  }

  async getApplicationByNumber(applicationNumber: string): Promise<DetailedStudentApplication> {
    try {
      console.log('Loading application by number:', applicationNumber);

      const response = await fetch(`${ADMIN_API_URL}/applications/number/${applicationNumber}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });

      console.log('Application by number response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Application by number API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load application'}`);
      }

      const result: BackendResponse<any> = await response.json();
      console.log('Application by number result:', result);

      if (result.statusCode === '000' && result.data) {
        // Handle array response (single item in content array)
        if (result.data.content && Array.isArray(result.data.content) && result.data.content.length > 0) {
          return mapApiResponseToDetailedApplication(result.data.content[0]);
        }
        // Handle direct object response
        else if (result.data.id) {
          return mapApiResponseToDetailedApplication(result.data);
        } else {
          throw new Error('No application data found in response');
        }
      } else {
        throw new Error(result.message || 'Failed to load application');
      }
    } catch (error: any) {
      console.error('Failed to load application by number:', error);
      throw error;
    }
  }

  async updateApplicationStatus(id: number, statusUpdate: StatusUpdateRequest): Promise<ApplicationResponse> {
    try {
      console.log('Updating application status:', id, statusUpdate);

      const response = await fetch(`${ADMIN_API_URL}/applications/${id}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(statusUpdate),
        mode: 'cors'
      });

      console.log('Status update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Status update API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to update status'}`);
      }

      const result = await response.json();
      console.log('Status update result:', result);

      if (result.success || result.statusCode === '000') {
        return {
          success: true,
          message: result.message || 'Status updated successfully'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to update status'
        };
      }
    } catch (error: any) {
      console.error('Failed to update application status:', error);
      return {
        success: false,
        message: error.message || 'Failed to update status'
      };
    }
  }

  async getStatistics(): Promise<ApplicationStatistics> {
    try {
      console.log('Loading application statistics');

      const response = await fetch(`${ADMIN_API_URL}/applications/statistics`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });

      console.log('Statistics response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Statistics API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load statistics'}`);
      }

      const result = await response.json();
      console.log('Statistics result:', result);

      // Handle both direct response and wrapped response
      if (result.total !== undefined) {
        return result as ApplicationStatistics;
      } else if (result.statusCode === '000' && result.data) {
        // Map backend field names to frontend interface
        const backendData = result.data;
        return {
          total: backendData.totalApplications || 0,
          pending: backendData.pendingApplications || 0,
          underReview: backendData.underReviewApplications || 0,
          approved: backendData.approvedApplications || 0,
          rejected: backendData.rejectedApplications || 0,
          enrolled: backendData.enrolledApplications || 0
        } as ApplicationStatistics;
      } else {
        throw new Error('Invalid statistics response format');
      }
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
      // Return default statistics on error
      return {
        total: 0,
        pending: 0,
        underReview: 0,
        approved: 0,
        rejected: 0,
        enrolled: 0
      };
    }
  }

  async getApplicationsByStatus(status: string, page?: number, size?: number): Promise<PaginatedApplications> {
    try {
      const searchParams = new URLSearchParams();
      if (page !== undefined) searchParams.append('page', page.toString());
      if (size !== undefined) searchParams.append('size', size.toString());

      const url = `${ADMIN_API_URL}/applications/status/${status}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      console.log('Loading applications by status from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });

      console.log('Applications by status response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Applications by status API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load applications'}`);
      }

      const result = await response.json();
      console.log('Applications by status result:', result);

      // Handle both direct pagination response and wrapped response
      if (result.content) {
        return result as PaginatedApplications;
      } else if (result.statusCode === '000' && result.data) {
        return result.data as PaginatedApplications;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to load applications by status:', error);
      throw error;
    }
  }

  async deleteApplication(id: number): Promise<ApplicationResponse> {
    try {
      console.log('Deleting application:', id);

      const response = await fetch(`${ADMIN_API_URL}/applications/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to delete application'}`);
      }

      const result = await response.json();
      console.log('Delete result:', result);

      if (result.success || result.statusCode === '000') {
        return {
          success: true,
          message: result.message || 'Application deleted successfully'
        };
      } else {
        return {
          success: false,
          message: result.message || 'Failed to delete application'
        };
      }
    } catch (error: any) {
      console.error('Failed to delete application:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete application'
      };
    }
  }

  /**
   * Export applications to Excel within a date range
   * Downloads the file directly in the browser
   */
  async exportApplicationsToExcel(params: {
    startDate: string; // yyyy-MM-dd
    endDate: string;   // yyyy-MM-dd
    status?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('startDate', params.startDate);
      searchParams.append('endDate', params.endDate);
      if (params.status) searchParams.append('status', params.status.toUpperCase());

      const url = `${ADMIN_API_URL}/applications/export/excel?${searchParams.toString()}`;
      console.log('📊 Exporting applications to Excel:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, message: `Export failed: ${response.status} ${errorText}` };
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `applications_${params.startDate}_to_${params.endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: 'Excel report downloaded successfully' };
    } catch (error: any) {
      console.error('Failed to export applications:', error);
      return { success: false, message: error.message || 'Failed to export applications' };
    }
  }
}

export const studentApplicationService = new StudentApplicationService();
