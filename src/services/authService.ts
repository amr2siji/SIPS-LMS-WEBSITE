import { ApiService, ApiResponse } from './apiService';

export interface LoginCredentials {
    nic: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    role: string;
    nic: string;
    fullName?: string;
    expiresIn?: number;
}

export interface RefreshTokenResponse {
    token: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Authentication Service
 * Handles encrypted login, logout, and token management
 */
export class AuthService extends ApiService {
    private readonly AUTH_ENDPOINTS = {
        LOGIN: '/api/auth/login-plain',
        REFRESH: '/api/auth/refresh',
        LOGOUT: '/api/auth/logout'
    };

    /**
     * Login with plain credentials (no encryption)
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            // Prepare login data
            const loginData = {
                nic: credentials.nic.trim(),
                password: credentials.password
            };

            // Send plain request (no encryption)
            const response = await fetch(`${this.baseUrl}${this.AUTH_ENDPOINTS.LOGIN}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();
            
            console.log('Backend response status:', response.status);
            console.log('Backend response data:', result);

            // Check if response is successful based on the actual backend format
            if (response.ok && result.statusCode === "200" && result.message === "Login successful") {
                const responseData = result.data;
                
                console.log('Response data:', responseData);

                // Store JWT token and user info
                localStorage.setItem('jwt_token', responseData.token);
                localStorage.setItem('refresh_token', responseData.refreshToken);
                localStorage.setItem('user_role', responseData.userType); // Backend uses 'userType' not 'role'
                localStorage.setItem('user_nic', responseData.nic);
                localStorage.setItem('user_email', responseData.email);
                
                if (responseData.fullName) {
                    localStorage.setItem('user_name', responseData.fullName);
                }

                return {
                    token: responseData.token,
                    role: responseData.userType, // Map userType to role
                    nic: responseData.nic,
                    fullName: responseData.fullName,
                    expiresIn: 86400 // 24 hours default
                };
            } else {
                console.log('Login failed - result:', result);
                throw new Error(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error instanceof Error ? error : new Error('Login failed');
        }
    }

    /**
     * Refresh JWT token
     */
    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        try {
            const response: ApiResponse<RefreshTokenResponse> = await this.post(
                this.AUTH_ENDPOINTS.REFRESH,
                { refreshToken }
            );

            if (response.success && response.data) {
                // Update stored token
                localStorage.setItem('jwt_token', response.data.token);
                
                return response.data;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            throw error instanceof Error ? error : new Error('Token refresh failed');
        }
    }

    /**
     * Logout user and clear session
     * Calls backend to invalidate session in database
     */
    async logout(): Promise<void> {
        try {
            // Call logout endpoint if token exists
            const token = localStorage.getItem('jwt_token');
            if (token) {
                const response = await fetch(`${this.baseUrl}${this.AUTH_ENDPOINTS.LOGOUT}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const result = await response.json();
                
                if (result.statusCode === '000') {
                    console.log('✅ Session terminated on server:', result.message);
                } else {
                    console.warn('⚠️ Logout response:', result.message);
                }
            }
        } catch (error) {
            console.error('❌ Logout API error:', error);
            // Continue with local cleanup even if API fails
        } finally {
            // Always clear local storage regardless of API call result
            this.clearAuth();
            localStorage.removeItem('user_name');
            
            console.log('🚪 Local session cleared');
        }
    }

    /**
     * Check if current token is expired
     */
    isTokenExpired(): boolean {
        const token = localStorage.getItem('jwt_token');
        if (!token) return true;

        try {
            // Decode JWT token (basic check, not cryptographically verified)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Token validation error:', error);
            return true;
        }
    }

    /**
     * Get current user information
     */
    getCurrentUser(): {
        nic: string | null;
        role: string | null;
        fullName: string | null;
        isAuthenticated: boolean;
    } {
        return {
            nic: this.getUserNIC(),
            role: this.getUserRole(),
            fullName: localStorage.getItem('user_name'),
            isAuthenticated: this.isAuthenticated() && !this.isTokenExpired()
        };
    }

    /**
     * Check if user has specific role
     */
    hasRole(role: string): boolean {
        const userRole = this.getUserRole();
        return userRole === role;
    }

    /**
     * Check if user is admin
     */
    isAdmin(): boolean {
        return this.hasRole('ADMIN');
    }

    /**
     * Check if user is instructor
     */
    isInstructor(): boolean {
        return this.hasRole('INSTRUCTOR');
    }

    /**
     * Check if user is student
     */
    isStudent(): boolean {
        return this.hasRole('STUDENT');
    }

    /**
     * Auto-refresh token before expiration
     */
    setupTokenRefresh(): void {
        const token = localStorage.getItem('jwt_token');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiration = expirationTime - currentTime;
            
            // Refresh token 5 minutes before expiration
            const refreshTime = timeUntilExpiration - (5 * 60 * 1000);
            
            if (refreshTime > 0) {
                setTimeout(() => {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        this.refreshToken(refreshToken).catch(() => {
                            this.logout();
                        });
                    }
                }, refreshTime);
            }
        } catch (error) {
            console.error('Token refresh setup error:', error);
        }
    }

    /**
     * Validate authentication on app start
     */
    validateAuthentication(): boolean {
        if (!this.isAuthenticated() || this.isTokenExpired()) {
            this.clearAuth();
            return false;
        }
        
        // Setup auto-refresh
        this.setupTokenRefresh();
        return true;
    }
}

// Create singleton instance
export const authService = new AuthService();