import { ADMIN_API_URL } from '../lib/apiConfig';

// Types for Intake-Module Management
export interface IntakeModuleDTO {
  id: number;
  intakeId: number;
  intakeCode: string;
  intakeName: string;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssignModulesToIntakeRequest {
  intakeId: number;
  moduleIds: number[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: string;
  timestamp: string;
}

class IntakeModuleService {
  private getAuthHeaders() {
    const token = localStorage.getItem('jwt_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Assign a single module to an intake
   */
  async assignModuleToIntake(intakeId: number, moduleId: number): Promise<ApiResponse<IntakeModuleDTO>> {
    try {
      const response = await fetch(`${ADMIN_API_URL}/intake-modules/assign`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ intakeId, moduleId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to assign module to intake',
          statusCode: errorData.statusCode || 'ERROR',
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      // Backend returns statusCode "000" for success, not a success boolean
      return {
        ...result,
        success: result.statusCode === '000'
      };
    } catch (error) {
      console.error('Error assigning module to intake:', error);
      return {
        success: false,
        message: 'Network error occurred',
        statusCode: 'ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Assign multiple modules to an intake (bulk assignment)
   */
  async assignModulesToIntake(request: AssignModulesToIntakeRequest): Promise<ApiResponse<IntakeModuleDTO[]>> {
    try {
      const response = await fetch(`${ADMIN_API_URL}/intake-modules/assign-bulk`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to assign modules to intake',
          statusCode: errorData.statusCode || 'ERROR',
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      // Backend returns statusCode "000" for success, not a success boolean
      return {
        ...result,
        success: result.statusCode === '000'
      };
    } catch (error) {
      console.error('Error assigning modules to intake:', error);
      return {
        success: false,
        message: 'Network error occurred',
        statusCode: 'ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get all modules assigned to an intake
   */
  async getModulesByIntake(intakeId: number): Promise<ApiResponse<IntakeModuleDTO[]>> {
    try {
      const response = await fetch(`${ADMIN_API_URL}/intake-modules/intake/${intakeId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text);
            return {
              success: false,
              message: errorData.message || 'Failed to get modules for intake',
              statusCode: errorData.statusCode || 'ERROR',
              timestamp: new Date().toISOString()
            };
          } catch {
            return {
              success: false,
              message: `HTTP ${response.status}: ${text || 'Failed to get modules'}`,
              statusCode: 'ERROR',
              timestamp: new Date().toISOString()
            };
          }
        }
        return {
          success: false,
          message: `HTTP ${response.status}: Failed to get modules for intake`,
          statusCode: 'ERROR',
          timestamp: new Date().toISOString()
        };
      }

      const text = await response.text();
      if (!text) {
        console.warn('Empty response from server for intake modules', intakeId);
        return {
          success: true,
          message: 'Modules retrieved successfully',
          statusCode: '000',
          data: [],
          timestamp: new Date().toISOString()
        };
      }

      const result = JSON.parse(text);
      // Backend returns statusCode "000" for success, not a success boolean
      return {
        ...result,
        success: result.statusCode === '000'
      };
    } catch (error) {
      console.error('Error getting modules for intake:', error);
      return {
        success: false,
        message: 'Network error occurred',
        statusCode: 'ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get all intakes that have a specific module
   */
  async getIntakesByModule(moduleId: number): Promise<ApiResponse<IntakeModuleDTO[]>> {
    try {
      const response = await fetch(`${ADMIN_API_URL}/intake-modules/module/${moduleId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to get intakes for module',
          statusCode: errorData.statusCode || 'ERROR',
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      // Backend returns statusCode "000" for success, not a success boolean
      return {
        ...result,
        success: result.statusCode === '000'
      };
    } catch (error) {
      console.error('Error getting intakes for module:', error);
      return {
        success: false,
        message: 'Network error occurred',
        statusCode: 'ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Remove a single module from an intake
   */
  async removeModuleFromIntake(intakeId: number, moduleId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${ADMIN_API_URL}/intake-modules?intakeId=${intakeId}&moduleId=${moduleId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to remove module from intake',
          statusCode: errorData.statusCode || 'ERROR',
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      // Backend returns statusCode "000" for success, not a success boolean
      return {
        ...result,
        success: result.statusCode === '000'
      };
    } catch (error) {
      console.error('Error removing module from intake:', error);
      return {
        success: false,
        message: 'Network error occurred',
        statusCode: 'ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Remove all modules from an intake
   */
  async removeAllModulesFromIntake(intakeId: number): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${ADMIN_API_URL}/intake-modules/intake/${intakeId}/all`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to remove all modules from intake',
          statusCode: errorData.statusCode || 'ERROR',
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      // Backend returns statusCode "000" for success, not a success boolean
      return {
        ...result,
        success: result.statusCode === '000'
      };
    } catch (error) {
      console.error('Error removing all modules from intake:', error);
      return {
        success: false,
        message: 'Network error occurred',
        statusCode: 'ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get the count of modules assigned to an intake
   */
  async getModuleCount(intakeId: number): Promise<ApiResponse<number>> {
    try {
      const response = await fetch(`${ADMIN_API_URL}/intake-modules/intake/${intakeId}/count`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // Check if response has content before parsing
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text);
            return {
              success: false,
              message: errorData.message || 'Failed to get module count',
              statusCode: errorData.statusCode || 'ERROR',
              timestamp: new Date().toISOString()
            };
          } catch {
            return {
              success: false,
              message: `HTTP ${response.status}: ${text || 'Failed to get module count'}`,
              statusCode: 'ERROR',
              timestamp: new Date().toISOString()
            };
          }
        }
        return {
          success: false,
          message: `HTTP ${response.status}: Failed to get module count`,
          statusCode: 'ERROR',
          timestamp: new Date().toISOString()
        };
      }

      const text = await response.text();
      if (!text) {
        console.warn('Empty response from server for intake', intakeId);
        return {
          success: true,
          message: 'Module count retrieved successfully',
          statusCode: '000',
          data: 0,
          timestamp: new Date().toISOString()
        };
      }

      const result = JSON.parse(text);
      // Backend returns statusCode "000" for success, not a success boolean
      return {
        ...result,
        success: result.statusCode === '000'
      };
    } catch (error) {
      console.error('Error getting module count:', error);
      return {
        success: false,
        message: 'Network error occurred',
        statusCode: 'ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const intakeModuleService = new IntakeModuleService();
