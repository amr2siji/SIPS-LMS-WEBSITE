/**
 * Admin Service
 * Centralized service for all admin-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Get authorization headers
 */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    return {
      success: false,
      message: error.message || `HTTP error! status: ${response.status}`
    };
  }

  const data = await response.json();
  return {
    success: true,
    data: data as T
  };
}

/**
 * Academic Structure APIs
 */

export async function getFaculties(): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/faculties`, {
    headers: getAuthHeaders()
  });
  return handleResponse<any[]>(response);
}

export async function getDepartmentsByFaculty(facultyId: number): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/faculties/${facultyId}/departments`, {
    headers: getAuthHeaders()
  });
  return handleResponse<any[]>(response);
}

export async function getProgramsByDepartment(departmentId: number): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/departments/${departmentId}/programs`, {
    headers: getAuthHeaders()
  });
  return handleResponse<any[]>(response);
}

export async function getIntakesByProgram(programId: number): Promise<ApiResponse<any[]>> {
  const response = await fetch(`${API_BASE_URL}/api/admin/programs/${programId}/intakes`, {
    headers: getAuthHeaders()
  });
  return handleResponse<any[]>(response);
}

export async function getModulesByProgramAndIntake(programId: number, intakeId: number): Promise<ApiResponse<any[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/programs/${programId}/modules?intakeId=${intakeId}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse<any[]>(response);
}

/**
 * Lecture Materials APIs
 */

export async function getLectureMaterials(page: number = 0, size: number = 100): Promise<ApiResponse<any[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/materials?page=${page}&size=${size}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse<any[]>(response);
}

export async function getLectureMaterialById(id: number): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/materials/${id}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse<any>(response);
}

export async function createLectureMaterial(data: any): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/materials`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }
  );
  return handleResponse<any>(response);
}

export async function updateLectureMaterial(id: number, data: any): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/materials/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }
  );
  return handleResponse<any>(response);
}

export async function deleteLectureMaterial(id: number): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/materials/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders()
    }
  );
  return handleResponse<any>(response);
}

export async function toggleLectureMaterialPublishStatus(id: number): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/materials/${id}/publish`,
    {
      method: 'PATCH',
      headers: getAuthHeaders()
    }
  );
  return handleResponse<any>(response);
}

/**
 * Assignment APIs
 */

export async function getAssignments(page: number = 0, size: number = 100): Promise<ApiResponse<any[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/assignments?page=${page}&size=${size}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse<any[]>(response);
}

export async function createAssignment(data: any): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/assignments`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }
  );
  return handleResponse<any>(response);
}

export async function updateAssignment(id: number, data: any): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/assignments/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }
  );
  return handleResponse<any>(response);
}

export async function deleteAssignment(id: number): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/assignments/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders()
    }
  );
  return handleResponse<any>(response);
}

/**
 * Exam APIs
 */

export async function getExams(page: number = 0, size: number = 100): Promise<ApiResponse<any[]>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/exams?page=${page}&size=${size}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse<any[]>(response);
}

export async function createExam(data: any): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/exams`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }
  );
  return handleResponse<any>(response);
}

export async function updateExam(id: number, data: any): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/exams/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }
  );
  return handleResponse<any>(response);
}

export async function deleteExam(id: number): Promise<ApiResponse<any>> {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/exams/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders()
    }
  );
  return handleResponse<any>(response);
}

/**
 * Export all as adminService
 */
export const adminService = {
  // Academic Structure
  getFaculties,
  getDepartmentsByFaculty,
  getProgramsByDepartment,
  getIntakesByProgram,
  getModulesByProgramAndIntake,
  
  // Lecture Materials
  getLectureMaterials,
  getLectureMaterialById,
  createLectureMaterial,
  updateLectureMaterial,
  deleteLectureMaterial,
  toggleLectureMaterialPublishStatus,
  
  // Assignments
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  
  // Exams
  getExams,
  createExam,
  updateExam,
  deleteExam
};
