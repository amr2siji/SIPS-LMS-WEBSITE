import { ApiService } from './apiService';

export interface ApiResponseData {
    statusCode: string;
    message: string;
    data: any;
    timestamp: string;
}

export class ForgotPasswordService extends ApiService {
    private readonly FORGOT_PASSWORD_ENDPOINTS = {
        REQUEST_RESET: '/api/auth/forgot-password',
        VERIFY_CODE: '/api/auth/verify-reset-code',
        RESET_PASSWORD: '/api/auth/reset-password'
    };

    async requestPasswordReset(nic: string): Promise<{ success: boolean; maskedEmail?: string; message: string }> {
        try {
            console.log('🔐 Requesting password reset for NIC:', nic);
            const response = await fetch(`${this.baseUrl}${this.FORGOT_PASSWORD_ENDPOINTS.REQUEST_RESET}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nic: nic.trim() })
            });

            const result: ApiResponseData = await response.json();
            console.log('📧 Password reset response:', result);
            
            // Check for both '000' (app success code) and '200' (HTTP success as statusCode)
            if (result.statusCode === '000' || result.statusCode === '200' || response.ok) {
                console.log('✅ Reset code sent successfully, masked email:', result.data);
                return { success: true, maskedEmail: result.data, message: result.message };
            } else {
                console.log('❌ Failed to send reset code:', result.message);
                return { success: false, message: result.message || 'Failed to send reset code' };
            }
        } catch (error: any) {
            console.error('🚨 Network error in password reset:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    async verifyResetCode(resetCode: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.baseUrl}${this.FORGOT_PASSWORD_ENDPOINTS.VERIFY_CODE}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetCode: resetCode.trim() })
            });

            const result: ApiResponseData = await response.json();

            // Check for both '000' (app success code) and '200' (HTTP success as statusCode)
            if (result.statusCode === '000' || result.statusCode === '200' || response.ok) {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Invalid or expired reset code' };
            }
        } catch (error: any) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    async resetPassword(resetCode: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await fetch(`${this.baseUrl}${this.FORGOT_PASSWORD_ENDPOINTS.RESET_PASSWORD}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetCode: resetCode.trim(), newPassword, confirmPassword })
            });

            const result: ApiResponseData = await response.json();

            // Check for both '000' (app success code) and '200' (HTTP success as statusCode)
            if (result.statusCode === '000' || result.statusCode === '200' || response.ok) {
                return { success: true, message: result.message };
            } else {
                return { success: false, message: result.message || 'Failed to reset password' };
            }
        } catch (error: any) {
            return { success: false, message: 'Network error. Please try again.' };
        }
    }
}

export const forgotPasswordService = new ForgotPasswordService();
