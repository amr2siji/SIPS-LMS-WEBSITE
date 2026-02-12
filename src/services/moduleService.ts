import { ADMIN_API_URL } from '../lib/apiConfig';

// Types for Module Management
export interface ModuleData {
  id?: number;
  moduleCode: string;
  moduleName: string;
  description?: string;
  creditScore: number;
  facultyId: number;
  departmentId: number;
  programId: number;
  isActive?: boolean;
}

export interface ModuleUpdateData {
  moduleCode: string;
  moduleName: string;
  description?: string;
  creditScore: number;
  facultyId: number;
  departmentId: number;
  programId: number;
  isActive?: boolean;
}

export interface ModuleResponse {
  id: number;
  moduleCode: string;
  moduleName: string;
  description: string;
  creditScore: number;
  facultyId: number;
  facultyName: string;
  facultyCode: string;
  departmentId: number;
  departmentName: string;
  programId: number;
  programName: string;
  programCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleSearchCriteria {
  search?: string;
  facultyId?: number;
  departmentId?: number;
  programId?: number;
  intakeId?: number;
  isActive?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedModuleResponse {
  content: ModuleResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

// Actual API response structure
interface ApiResponseData<T> {
  statusCode: string;
  message: string;
  data?: T;
  timestamp?: string;
}

class ModuleService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Create a new module
   */
  async createModule(moduleData: ModuleData): Promise<ApiResponse<ModuleResponse>> {
    try {
      console.log('Creating module:', moduleData);
      
      const response = await fetch(`${ADMIN_API_URL}/modules`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(moduleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || `HTTP ${response.status}` };
      }

      const result: ApiResponseData<ModuleResponse> = await response.json();
      console.log('Module created successfully:', result);
      
      if (result.statusCode === '000') {
        return { success: true, data: result.data, message: result.message };
      } else {
        return { success: false, message: result.message || 'Failed to create module' };
      }
    } catch (error: any) {
      console.error('Error creating module:', error);
      return { success: false, message: error.message || 'Failed to create module. Please try again.' };
    }
  }

  /**
   * Search modules with advanced filtering
   */
  async searchModules(criteria: ModuleSearchCriteria): Promise<ApiResponse<PaginatedModuleResponse>> {
    try {
      console.log('Searching modules with criteria:', criteria);

      const response = await fetch(`${ADMIN_API_URL}/modules/search`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(criteria)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || `HTTP ${response.status}` };
      }

      const result: ApiResponseData<PaginatedModuleResponse> = await response.json();
      console.log('Modules search completed:', result);
      
      if (result.statusCode === '000') {
        return { success: true, data: result.data, message: result.message };
      } else {
        return { success: false, message: result.message || 'Failed to search modules' };
      }
    } catch (error: any) {
      console.error('Error searching modules:', error);
      return { success: false, message: error.message || 'Failed to search modules. Please try again.' };
    }
  }

  /**
   * Get all modules with pagination
   */
  async getModules(page = 0, size = 10, sortBy = 'moduleName', sortDirection: 'asc' | 'desc' = 'asc'): Promise<ApiResponse<PaginatedModuleResponse>> {
    try {
      console.log('Loading modules - page:', page, 'size:', size);

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDirection
      });

      const response = await fetch(`${ADMIN_API_URL}/modules?${params.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Modules loaded successfully:', result);
      return result;
    } catch (error) {
      console.error('Error loading modules:', error);
      throw error;
    }
  }

  /**
   * Get module by ID
   */
  async getModuleById(id: number): Promise<ApiResponse<ModuleResponse>> {
    try {
      console.log('Loading module by ID:', id);

      const response = await fetch(`${ADMIN_API_URL}/modules/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Module loaded by ID:', result);
      return result;
    } catch (error) {
      console.error('Error loading module by ID:', error);
      throw error;
    }
  }

  /**
   * Update module
   */
  async updateModule(id: number, moduleData: ModuleUpdateData): Promise<ApiResponse<ModuleResponse>> {
    try {
      console.log('Updating module:', id, moduleData);

      const response = await fetch(`${ADMIN_API_URL}/modules/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(moduleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || `HTTP ${response.status}` };
      }

      const result: ApiResponseData<ModuleResponse> = await response.json();
      console.log('Module updated successfully:', result);
      
      if (result.statusCode === '000') {
        return { success: true, data: result.data, message: result.message };
      } else {
        return { success: false, message: result.message || 'Failed to update module' };
      }
    } catch (error: any) {
      console.error('Error updating module:', error);
      return { success: false, message: error.message || 'Failed to update module. Please try again.' };
    }
  }

  /**
   * Delete module (soft delete)
   */
  async deleteModule(id: number): Promise<ApiResponse<null>> {
    try {
      console.log('Deleting module:', id);

      const response = await fetch(`${ADMIN_API_URL}/modules/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || `HTTP ${response.status}` };
      }

      const result: ApiResponseData<null> = await response.json();
      console.log('Module deleted successfully:', result);
      
      if (result.statusCode === '000') {
        return { success: true, data: null, message: result.message };
      } else {
        return { success: false, message: result.message || 'Failed to delete module' };
      }
    } catch (error: any) {
      console.error('Error deleting module:', error);
      return { success: false, message: error.message || 'Failed to delete module. Please try again.' };
    }
  }

  /**
   * Get modules by faculty
   */
  async getModulesByFaculty(facultyId: number): Promise<ApiResponse<ModuleResponse[]>> {
    try {
      console.log('Loading modules by faculty:', facultyId);

      const response = await fetch(`${ADMIN_API_URL}/modules/faculty/${facultyId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Modules loaded by faculty:', result);
      return result;
    } catch (error) {
      console.error('Error loading modules by faculty:', error);
      throw error;
    }
  }

  /**
   * Get modules by department
   */
  async getModulesByDepartment(departmentId: number): Promise<ApiResponse<ModuleResponse[]>> {
    try {
      console.log('Loading modules by department:', departmentId);

      const response = await fetch(`${ADMIN_API_URL}/modules/department/${departmentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Modules loaded by department:', result);
      return result;
    } catch (error) {
      console.error('Error loading modules by department:', error);
      throw error;
    }
  }

  /**
   * Get modules by program
   */
  async getModulesByProgram(programId: number): Promise<ApiResponse<ModuleResponse[]>> {
    try {
      console.log('Loading modules by program:', programId);

      const response = await fetch(`${ADMIN_API_URL}/modules/program/${programId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to load modules:', errorData);
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}`,
          data: []
        };
      }

      const result = await response.json();
      console.log('Modules loaded by program:', result);
      
      // Backend returns statusCode "000" for success
      // Convert to frontend format
      return {
        success: result.statusCode === '000',
        message: result.message,
        data: result.data || []
      };
    } catch (error) {
      console.error('Error loading modules by program:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load modules',
        data: []
      };
    }
  }

  /**
   * Get modules by intake
   */
  async getModulesByIntake(intakeId: number): Promise<ApiResponse<ModuleResponse[]>> {
    try {
      console.log('Loading modules by intake:', intakeId);

      const response = await fetch(`${ADMIN_API_URL}/modules/intake/${intakeId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result: ApiResponseData<ModuleResponse[]> = await response.json();
      console.log('Modules loaded by intake:', result);
      
      return {
        success: result.statusCode === '000',
        message: result.message,
        data: result.data
      };
    } catch (error) {
      console.error('Error loading modules by intake:', error);
      throw error;
    }
  }
}

export const moduleService = new ModuleService();