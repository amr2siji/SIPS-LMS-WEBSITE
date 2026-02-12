import { useState, useEffect } from 'react';
import { MessageCircle, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { inquiryService, InquirySubmission } from '../services/inquiryService';

interface Faculty {
  id: number;
  name: string;
  code: string;
  isActive?: boolean; // Make optional since it might not be in API response
}

interface Department {
  id: number;
  departmentName: string;
  name?: string; // Keep for backward compatibility
  code: string;
  facultyId: number;
  isActive?: boolean; // Make optional since it might not be in API response
}

interface Program {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  isActive?: boolean; // Make optional since it might not be in API response
}

import { FULL_API_URL } from '../lib/apiConfig';

export function FloatingInquireButton() {
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  const [formData, setFormData] = useState<InquirySubmission>({
    fullName: '',
    email: '',
    phoneNumber: '',
    program: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data when modal opens
  useEffect(() => {
    if (showModal) {
      console.log('Modal opened, loading data...');
      loadFaculties();
      loadAllDepartments();
      loadAllPrograms();
    }
  }, [showModal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter departments when faculty changes
  useEffect(() => {
    if (selectedFaculty && allDepartments.length > 0) {
      console.log('Filtering departments for faculty:', selectedFaculty);
      const filtered = allDepartments.filter(d => d.facultyId === parseInt(selectedFaculty));
      console.log('Filtered departments:', filtered);
      console.log('Department names to display:', filtered.map(d => d.departmentName));
      setDepartments(filtered);
      setSelectedDepartment('');
      setPrograms([]);
      setFormData(prev => ({ ...prev, program: '' }));
    } else {
      setDepartments([]);
      setPrograms([]);
    }
  }, [selectedFaculty, allDepartments]);

  // Filter programs when department changes
  useEffect(() => {
    if (selectedDepartment && allPrograms.length > 0) {
      console.log('Filtering programs for department:', selectedDepartment);
      const filtered = allPrograms.filter(p => p.departmentId === parseInt(selectedDepartment) && p.isActive !== false);
      console.log('Filtered programs:', filtered);
      setPrograms(filtered);
      setFormData(prev => ({ ...prev, program: '' }));
    } else {
      setPrograms([]);
    }
  }, [selectedDepartment, allPrograms]);

  const loadFaculties = async () => {
    try {
      console.log('Loading faculties from:', `${FULL_API_URL}/public/inquiry/faculties`);
      const response = await fetch(`${FULL_API_URL}/public/inquiry/faculties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors' // Explicitly set CORS mode
      });
      console.log('Faculties response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Faculties API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load faculties'}`);
      }
      
      const result = await response.json();
      console.log('Faculties result:', result);
      if (result.statusCode === '000' && result.data) {
        // Filter by isActive if the property exists, otherwise include all
        const activeFaculties = result.data.filter((f: Faculty) => f.isActive !== false);
        console.log('Active faculties:', activeFaculties);
        setFaculties(activeFaculties);
      }
    } catch (error: any) {
      console.error('Error loading faculties:', error);
      console.error('Error details:', error.message, error.cause);
      // Show user-friendly error
      setErrors(prev => ({ ...prev, general: 'Unable to load faculties. Please ensure the backend server is running.' }));
    }
  };

  const loadAllDepartments = async () => {
    try {
      console.log('Loading departments from:', `${FULL_API_URL}/public/inquiry/departments`);
      const response = await fetch(`${FULL_API_URL}/public/inquiry/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      console.log('Departments response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Departments API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load departments'}`);
      }
      
      const result = await response.json();
      console.log('Departments result:', result);
      if (result.statusCode === '000' && result.data) {
        console.log('Setting all departments:', result.data);
        setAllDepartments(result.data);
      }
    } catch (error: any) {
      console.error('Error loading departments:', error);
      console.error('Error details:', error.message, error.cause);
      setErrors(prev => ({ ...prev, general: 'Unable to load departments. Please ensure the backend server is running.' }));
    }
  };

  const loadAllPrograms = async () => {
    try {
      console.log('Loading programs from:', `${FULL_API_URL}/public/inquiry/programs`);
      const response = await fetch(`${FULL_API_URL}/public/inquiry/programs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      console.log('Programs response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Programs API error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load programs'}`);
      }
      
      const result = await response.json();
      console.log('Programs result:', result);
      if (result.statusCode === '000' && result.data) {
        console.log('Setting all programs:', result.data);
        setAllPrograms(result.data);
      }
    } catch (error: any) {
      console.error('Error loading programs:', error);
      console.error('Error details:', error.message, error.cause);
      setErrors(prev => ({ ...prev, general: 'Unable to load programs. Please ensure the backend server is running.' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (formData.phoneNumber.length !== 9 || !/^\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter exactly 9 digits';
    }

    if (!formData.program) {
      newErrors.program = 'Please select a program';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create submission data with +94 prefix for phone number
      const submissionData = {
        ...formData,
        phoneNumber: `+94${formData.phoneNumber}`
      };
      
      const result = await inquiryService.submitInquiry(submissionData);
      
      if (result.success) {
        setSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowModal(false);
          setSubmitted(false);
          resetForm();
        }, 3000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error: any) {
      setErrors({ general: 'Failed to submit inquiry. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      program: '',
      message: ''
    });
    setErrors({});
    setSelectedFaculty('');
    setSelectedDepartment('');
    setDepartments([]);
    setPrograms([]);
  };

  const handleClose = () => {
    setShowModal(false);
    setSubmitted(false);
    resetForm();
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => {
            console.log('Inquire Us button clicked, opening modal...');
            setShowModal(true);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="group relative bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 flex items-center gap-3 overflow-hidden px-6 py-4"
        >
          {/* Animated Ring */}
          <div className="absolute inset-0 rounded-full">
            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-red-600 animate-pulse opacity-30"></div>
          </div>

          {/* Icon */}
          <div className="relative z-10">
            <MessageCircle 
              size={24} 
              className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
            />
          </div>

          {/* Text */}
          <span className="relative z-10 font-semibold text-base whitespace-nowrap">
            Inquire Us
          </span>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
        </button>

        {/* Floating particles effect */}
        {isHovered && (
          <>
            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0ms' }}></div>
            <div className="absolute top-2 right-4 w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '150ms' }}></div>
            <div className="absolute top-4 right-2 w-1 h-1 bg-red-600 rounded-full animate-bounce opacity-50" style={{ animationDelay: '300ms' }}></div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            {!submitted ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Inquire Us</h2>
                      <p className="text-red-100 text-sm mt-1">We'll get back to you shortly</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.fullName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-l-xl">
                        +94
                      </span>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => {
                          // Only allow digits and limit to 9 digits after +94
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 9) {
                            setFormData({ ...formData, phoneNumber: value });
                            if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: '' });
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-r-xl focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="XX XXX XXXX"
                        maxLength={9}
                      />
                    </div>
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>

                  {/* Faculty Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Faculty <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                      style={{ 
                        color: '#000000 !important', 
                        backgroundColor: '#ffffff !important',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none'
                      }}
                    >
                      <option value="" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>Select Faculty</option>
                      {faculties.map(f => (
                        <option key={f.id} value={f.id} style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Department Selection */}
                  {departments.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white"
                        style={{ 
                          color: '#000000 !important', 
                          backgroundColor: '#ffffff !important',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>Select Department</option>
                        {departments.map(d => {
                          console.log('Rendering option for department:', d.id, d.departmentName);
                          return (
                            <option key={d.id} value={d.id} style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>{d.departmentName}</option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {/* Program Selection */}
                  {programs.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Program <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.program}
                        onChange={(e) => {
                          setFormData({ ...formData, program: e.target.value });
                          if (errors.program) setErrors({ ...errors, program: '' });
                        }}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 bg-white ${
                          errors.program ? 'border-red-500' : 'border-gray-300'
                        }`}
                        style={{ 
                          color: '#000000 !important', 
                          backgroundColor: '#ffffff !important',
                          WebkitAppearance: 'none',
                          MozAppearance: 'none'
                        }}
                      >
                        <option value="" style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>Select Program</option>
                        {programs.map(p => (
                          <option key={p.id} value={p.name} style={{ color: '#000000 !important', backgroundColor: '#ffffff !important' }}>{p.name}</option>
                        ))}
                      </select>
                      {errors.program && (
                        <p className="text-red-500 text-sm mt-1">{errors.program}</p>
                      )}
                    </div>
                  )}                  {/* Message (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message <span className="text-gray-500 text-xs">(Optional)</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      placeholder="Tell us about your inquiry..."
                    />
                  </div>

                  {/* General Error */}
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-red-700 text-sm flex items-center gap-2">
                        <AlertCircle size={16} />
                        {errors.general}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Inquiry'
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success Message */
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                <p className="text-gray-600">
                  We've received your inquiry and will contact you shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
