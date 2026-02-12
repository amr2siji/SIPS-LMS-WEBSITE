import { ADMIN_API_URL } from '../lib/apiConfig';

// Intake interfaces
export interface Intake {
  id: number;
  intakeName: string;
  programId: number;
  programName?: string;
  departmentId?: number;
  departmentName?: string;
  facultyId?: number;
  facultyName?: string;
  intakeYear: number;
  intakeMonth: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IntakeDropdownOption {
  id: number;
  intakeName: string;
  intakeYear: number;
  intakeMonth: number;
  programName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}

class IntakeService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Get all active intakes
   */
  async getActiveIntakes(): Promise<ApiResponse<Intake[]>> {
    try {
      console.log('Loading active intakes');

      const response = await fetch(`${ADMIN_API_URL}/intakes/active`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}`,
          data: []
        };
      }

      const result = await response.json();
      console.log('Active intakes loaded:', result);
      
      // Backend returns statusCode "000" for success
      // Convert to frontend format
      return {
        success: result.statusCode === '000',
        message: result.message,
        data: result.data || []
      };
    } catch (error) {
      console.error('Error loading active intakes:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load intakes',
        data: []
      };
    }
  }

  /**
   * Get intakes by program ID
   */
  async getIntakesByProgram(programId: number): Promise<ApiResponse<Intake[]>> {
    try {
      console.log('Loading intakes for program:', programId);

      const response = await fetch(`${ADMIN_API_URL}/intakes/program/${programId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Failed to load intakes:', errorData);
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}`,
          data: []
        };
      }

      const result = await response.json();
      console.log('Program intakes loaded:', result);
      
      // Backend returns statusCode "000" for success
      // Convert to frontend format
      return {
        success: result.statusCode === '000',
        message: result.message,
        data: result.data || []
      };
    } catch (error) {
      console.error('Error loading program intakes:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to load intakes',
        data: []
      };
    }
  }

  /**
   * Get dropdown options for intakes by program
   */
  async getDropdownOptionsByProgram(programId: number): Promise<ApiResponse<IntakeDropdownOption[]>> {
    try {
      console.log('Loading intake dropdown options for program:', programId);

      const response = await fetch(`${ADMIN_API_URL}/intakes/program/${programId}/dropdown`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Intake dropdown options loaded:', result);
      return result;
    } catch (error) {
      console.error('Error loading intake dropdown options:', error);
      throw error;
    }
  }

  /**
   * Get intake by ID
   */
  async getIntakeById(id: number): Promise<ApiResponse<Intake>> {
    try {
      console.log('Loading intake by ID:', id);

      const response = await fetch(`${ADMIN_API_URL}/intakes/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('Intake loaded by ID:', result);
      return result;
    } catch (error: any) {
      console.error('Error loading intake by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new intake
   */
  async createIntake(intakeData: {
    programId: number;
    intakeYear: number;
    intakeMonth: number;
  }): Promise<ApiResponse<Intake>> {
    try {
      console.log('Creating intake:', intakeData);

      const response = await fetch(`${ADMIN_API_URL}/intakes`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(intakeData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}`,
          data: undefined
        };
      }

      const result = await response.json();
      console.log('Intake created:', result);
      
      return {
        success: result.statusCode === '000',
        message: result.message,
        data: result.data
      };
    } catch (error) {
      console.error('Error creating intake:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create intake',
        data: undefined
      };
    }
  }

  /**
   * Update an existing intake
   */
  async updateIntake(id: number, intakeData: {
    programId: number;
    intakeYear: number;
    intakeMonth: number;
  }): Promise<ApiResponse<Intake>> {
    try {
      console.log('Updating intake:', id, intakeData);

      const response = await fetch(`${ADMIN_API_URL}/intakes/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(intakeData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}`,
          data: undefined
        };
      }

      const result = await response.json();
      console.log('Intake updated:', result);
      
      return {
        success: result.statusCode === '000',
        message: result.message,
        data: result.data
      };
    } catch (error) {
      console.error('Error updating intake:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update intake',
        data: undefined
      };
    }
  }

  /**
   * Delete an intake (soft delete)
   */
  async deleteIntake(id: number): Promise<ApiResponse<string>> {
    try {
      console.log('Deleting intake:', id);

      const response = await fetch(`${ADMIN_API_URL}/intakes/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}`,
          data: undefined
        };
      }

      const result = await response.json();
      console.log('Intake deleted:', result);
      
      return {
        success: result.statusCode === '000',
        message: result.message,
        data: result.data
      };
    } catch (error) {
      console.error('Error deleting intake:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete intake',
        data: undefined
      };
    }
  }
}

export const intakeService = new IntakeService();