/**
 * File Upload Service
 * Handles file uploads to the Spring Boot backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface UploadResponse {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  message?: string;
}

/**
 * Upload a lecture material file to the backend
 */
export async function uploadLectureMaterialFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('jwt_token');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/materials/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Upload failed'
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Upload an assignment file to the backend
 */
export async function uploadAssignmentFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('jwt_token');
    
    const response = await fetch(`${API_BASE_URL}/api/admin/assignments/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Upload failed'
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Get file URL for viewing/downloading
 */
export function getFileUrl(filePath: string): string {
  // If already a full URL, return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  
  // Otherwise, construct URL
  return `${API_BASE_URL}/api/admin/materials/files/${filePath}`;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, options: {
  maxSize?: number;  // in bytes, default 50MB
  allowedTypes?: string[];  // MIME types
} = {}): { valid: boolean; error?: string } {
  const maxSize = options.maxSize || 50 * 1024 * 1024; // 50MB default
  const allowedTypes = options.allowedTypes || [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only PDF, Word, Excel, and PowerPoint files are allowed'
    };
  }

  return { valid: true };
}
