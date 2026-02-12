/**
 * Academic Structure Management Service
 * Handles Faculty, Department, and Program API calls
 */

import { ADMIN_API_URL } from '../lib/apiConfig';

// Backend response format
interface BackendResponse<T> {
  statusCode: string;
  message: string;
  data: T;
  timestamp: string;
}

// Frontend normalized response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// ============= Faculty Types =============
export interface Faculty {
  id: number;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FacultyDropdownOption {
  id: number;
  name: string;
}

export interface CreateFacultyRequest {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateFacultyRequest {
  name: string;
  code?: string;
  description?: string;
}

// ============= Department Types =============
export interface Department {
  id: number;
  departmentName: string;
  description?: string;
  facultyId: number;
  facultyName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentDropdownOption {
  id: number;
  name: string;
}

export interface CreateDepartmentRequest {
  departmentName: string;
  facultyId: number;
  description?: string;
}

export interface UpdateDepartmentRequest {
  departmentName: string;
  facultyId: number;
  description?: string;
}

// ============= Program Types =============
export interface Program {
  id: number;
  name: string;
  code?: string;
  description?: string;
  facultyId: number;
  facultyName: string;
  departmentId: number;
  departmentName: string;
  durationMonths: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramDropdownOption {
  id: number;
  name: string;
}

export interface CreateProgramRequest {
  name: string;
  code?: string;
  facultyId: number;
  departmentId: number;
  durationMonths: number;
  description?: string;
}

export interface UpdateProgramRequest {
  name: string;
  code?: string;
  facultyId: number;
  departmentId: number;
  durationMonths: number;
  description?: string;
}

// ============= Helper Functions =============
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  // Check if response has content
  const contentType = response.headers.get('content-type');
  const hasJsonContent = contentType && contentType.includes('application/json');
  
  // If no content or not JSON, handle appropriately
  if (!hasJsonContent || response.status === 204) {
    if (!response.ok) {
      throw new Error('An error occurred');
    }
    return {
      success: true,
      message: 'Success',
      data: undefined as T,
      timestamp: new Date().toISOString()
    };
  }
  
  // Check if response body is empty
  const text = await response.text();
  if (!text || text.trim() === '') {
    if (!response.ok) {
      throw new Error('An error occurred');
    }
    return {
      success: true,
      message: 'Success',
      data: undefined as T,
      timestamp: new Date().toISOString()
    };
  }
  
  // Parse JSON
  let result: BackendResponse<T>;
  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON:', text);
    throw new Error('Invalid JSON response from server');
  }
  
  if (!response.ok) {
    throw new Error(result.message || 'An error occurred');
  }
  
  // Convert backend response to frontend format
  return {
    success: result.statusCode === "000", // "000" means success
    message: result.message,
    data: result.data,
    timestamp: result.timestamp
  };
};

// ============= Faculty Service =============
export const facultyService = {
  /**
   * Create a new faculty
   */
  create: async (data: CreateFacultyRequest): Promise<ApiResponse<Faculty>> => {
    const response = await fetch(`${ADMIN_API_URL}/faculties`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Faculty>(response);
  },

  /**
   * Get faculty by ID
   */
  getById: async (id: number): Promise<ApiResponse<Faculty>> => {
    const response = await fetch(`${ADMIN_API_URL}/faculties/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Faculty>(response);
  },

  /**
   * Get all faculties
   */
  getAll: async (): Promise<ApiResponse<Faculty[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/faculties`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Faculty[]>(response);
  },

  /**
   * Get active faculties only
   */
  getActive: async (): Promise<ApiResponse<Faculty[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/faculties/active`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Faculty[]>(response);
  },

  /**
   * Get faculty dropdown options (minimal data for dropdowns)
   */
  getDropdownOptions: async (): Promise<ApiResponse<FacultyDropdownOption[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/faculties/dropdown`, {
      headers: getAuthHeaders()
    });
    return handleResponse<FacultyDropdownOption[]>(response);
  },

  /**
   * Update faculty
   */
  update: async (id: number, data: UpdateFacultyRequest): Promise<ApiResponse<Faculty>> => {
    const response = await fetch(`${ADMIN_API_URL}/faculties/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Faculty>(response);
  },

  /**
   * Delete faculty (soft delete)
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${ADMIN_API_URL}/faculties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<null>(response);
  }
};

// ============= Department Service =============
export const departmentService = {
  /**
   * Create a new department
   */
  create: async (data: CreateDepartmentRequest): Promise<ApiResponse<Department>> => {
    const response = await fetch(`${ADMIN_API_URL}/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Department>(response);
  },

  /**
   * Get department by ID
   */
  getById: async (id: number): Promise<ApiResponse<Department>> => {
    const response = await fetch(`${ADMIN_API_URL}/departments/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Department>(response);
  },

  /**
   * Get all departments
   */
  getAll: async (): Promise<ApiResponse<Department[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/departments`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Department[]>(response);
  },

  /**
   * Get active departments only
   */
  getActive: async (): Promise<ApiResponse<Department[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/departments/active`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Department[]>(response);
  },

  /**
   * Get departments by faculty ID
   */
  getByFaculty: async (facultyId: number): Promise<ApiResponse<Department[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/departments/faculty/${facultyId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Department[]>(response);
  },

  /**
   * Get department dropdown options filtered by faculty (for cascading dropdowns)
   */
  getDropdownOptionsByFaculty: async (facultyId: number): Promise<ApiResponse<DepartmentDropdownOption[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/departments/dropdown/${facultyId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<DepartmentDropdownOption[]>(response);
  },

  /**
   * Update department
   */
  update: async (id: number, data: UpdateDepartmentRequest): Promise<ApiResponse<Department>> => {
    const response = await fetch(`${ADMIN_API_URL}/departments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Department>(response);
  },

  /**
   * Delete department (soft delete)
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${ADMIN_API_URL}/departments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<null>(response);
  }
};

// ============= Program Service =============
export const programService = {
  /**
   * Create a new program
   */
  create: async (data: CreateProgramRequest): Promise<ApiResponse<Program>> => {
    const response = await fetch(`${ADMIN_API_URL}/programs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Program>(response);
  },

  /**
   * Get program by ID
   */
  getById: async (id: number): Promise<ApiResponse<Program>> => {
    const response = await fetch(`${ADMIN_API_URL}/programs/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Program>(response);
  },

  /**
   * Get all programs
   */
  getAll: async (): Promise<ApiResponse<Program[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/programs`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Program[]>(response);
  },

  /**
   * Get active programs only
   */
  getActive: async (): Promise<ApiResponse<Program[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/programs/active`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Program[]>(response);
  },

  /**
   * Get programs by faculty ID
   */
  getByFaculty: async (facultyId: number): Promise<ApiResponse<Program[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/programs/faculty/${facultyId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Program[]>(response);
  },

  /**
   * Get program dropdown options by faculty and department
   */
  getDropdownOptions: async (facultyId: number, departmentId: number): Promise<ApiResponse<ProgramDropdownOption[]>> => {
    const response = await fetch(`${ADMIN_API_URL}/programs/dropdown`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ facultyId, departmentId })
    });
    return handleResponse<ProgramDropdownOption[]>(response);
  },

  /**
   * Update program
   */
  update: async (id: number, data: UpdateProgramRequest): Promise<ApiResponse<Program>> => {
    const response = await fetch(`${ADMIN_API_URL}/programs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Program>(response);
  },

  /**
   * Delete program (soft delete)
   */
  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await fetch(`${ADMIN_API_URL}/programs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<null>(response);
  }
};

// ============= Combined Export =============
export const academicStructureService = {
  faculty: facultyService,
  department: departmentService,
  program: programService
};

export default academicStructureService;
