// Student Registration Service for Spring Boot API integration
export interface StudentRegistrationData {
  fullName: string;
  nameWithInitials: string;
  nicNumber: string;
  dateOfBirth: string;
  permanentAddress: string;
  mobileNumber: string;
  emailAddress: string;
  contactName: string;
  relationship: string;
  contactMobileNumber: string;
  olResults: string;
  alResults: string;
  otherQualifications?: string;
  programmeId: number;
  nicDocument: File;
  birthCertificate: File;
  qualificationCertificates: File;
  paymentSlip: File;
}

export interface RegistrationResponse {
  success: boolean;
  data?: {
    id: number;
    fullName: string;
    nameWithInitials: string;
    nicNumber: string;
    emailAddress: string;
    mobileNumber: string;
    programmeName: string;
    status: string;
    applicationNumber: string;
    submittedAt: string;
  };
  message: string;
}

export interface BackendResponse<T> {
  statusCode: string;
  message: string;
  data: T;
  timestamp: string;
}

import { FULL_API_URL } from '../lib/apiConfig';

class RegistrationService {
  async submitRegistration(data: StudentRegistrationData): Promise<RegistrationResponse> {
    try {
      const formData = new FormData();
      
      // Personal Information
      formData.append('fullName', data.fullName);
      formData.append('nameWithInitials', data.nameWithInitials);
      formData.append('nicNumber', data.nicNumber);
      formData.append('dateOfBirth', data.dateOfBirth);
      formData.append('permanentAddress', data.permanentAddress);
      formData.append('mobileNumber', data.mobileNumber);
      formData.append('emailAddress', data.emailAddress);
      
      // Emergency Contact
      formData.append('contactName', data.contactName);
      formData.append('relationship', data.relationship);
      formData.append('contactMobileNumber', data.contactMobileNumber);
      
      // Academic Information
      formData.append('olResults', data.olResults);
      formData.append('alResults', data.alResults);
      formData.append('otherQualifications', data.otherQualifications || '');
      formData.append('programmeId', data.programmeId.toString());
      
      // Required Documents
      formData.append('nicDocument', data.nicDocument);
      formData.append('birthCertificate', data.birthCertificate);
      formData.append('qualificationCertificates', data.qualificationCertificates);
      formData.append('paymentSlip', data.paymentSlip);
      
      console.log('Submitting registration to:', `${FULL_API_URL}/public/registration/submit`);
      
      const response = await fetch(`${FULL_API_URL}/public/registration/submit`, {
        method: 'POST',
        body: formData,
        mode: 'cors'
        // Note: Don't set Content-Type header - browser will set it with boundary for multipart
      });
      
      console.log('Registration response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Registration API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to submit registration'}`);
      }
      
      const result: BackendResponse<any> = await response.json();
      console.log('Registration result:', result);
      
      if (result.statusCode === '000') {
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      } else {
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error: any) {
      console.error('Registration submission failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to submit registration. Please try again.'
      };
    }
  }

  // Helper method to get programmes for dropdown
  async getPrograms(): Promise<{ id: number; name: string; }[]> {
    try {
      const response = await fetch(`${FULL_API_URL}/admin/programs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load programs`);
      }
      
      const result: BackendResponse<any[]> = await response.json();
      
      if (result.statusCode === '000' && result.data) {
        return result.data.map(program => ({
          id: program.id,
          name: program.name
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to load programs:', error);
      return [];
    }
  }

  // Validation helpers
  validateNIC(nic: string): boolean {
    const pattern = /^[0-9]{9}[vVxX]$|^[0-9]{12}$/;
    return pattern.test(nic);
  }

  validateMobileNumber(mobile: string): boolean {
    const pattern = /^\+94\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{4}$/;
    return pattern.test(mobile);
  }

  validateFileSize(file: File): boolean {
    const maxSize = 50 * 1024 * 1024; // 50MB
    return file.size <= maxSize;
  }

  validateFileType(file: File): boolean {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file.type);
  }
}

export const registrationService = new RegistrationService();
