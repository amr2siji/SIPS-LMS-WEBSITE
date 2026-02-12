/**
 * Centralized API Configuration
 * All API calls should use this configuration to ensure consistency
 */

export const API_CONFIG = {
  // Base URL from environment variable
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  
  // Common API paths
  ENDPOINTS: {
    // Public endpoints
    PUBLIC: '/api',
    AUTH: '/api/auth',
    REGISTRATION: '/api/public/registration',
    
    // Admin endpoints  
    ADMIN: '/api/admin',
    ADMIN_APPLICATIONS: '/api/admin/applications',
    ADMIN_FACULTIES: '/api/admin/faculties',
    ADMIN_DEPARTMENTS: '/api/admin/departments',
    ADMIN_PROGRAMS: '/api/admin/programs',
  }
} as const;

/**
 * Get full API URL for a specific endpoint
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Get base API URL
 */
export const getBaseApiUrl = (): string => {
  return API_CONFIG.BASE_URL;
};

// Export individual URLs for backward compatibility
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const FULL_API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PUBLIC}`;
export const ADMIN_API_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADMIN}`;