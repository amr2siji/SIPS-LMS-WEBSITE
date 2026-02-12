import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { registrationService, StudentRegistrationData } from '../services/registrationService';

interface Faculty {
  id: number;
  name: string;
  code: string;
  isActive?: boolean;
}

interface Department {
  id: number;
  departmentName: string;
  name?: string;
  code: string;
  facultyId: number;
  isActive?: boolean;
}

interface Program {
  id: number;
  name: string;
  code: string;
  departmentId: number;
  isActive?: boolean;
}

import { ADMIN_API_URL, FULL_API_URL } from '../lib/apiConfig';

function Register() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    nameWithInitials: '',
    nicNumber: '',
    dateOfBirth: '',
    permanentAddress: '',
    mobileNumber: '+94',
    emailAddress: '',
    contactName: '',
    relationship: '',
    contactMobileNumber: '+94',
    olResults: '',
    alResults: '',
    otherQualifications: '',
    programmeId: '',
  });

  const [documents, setDocuments] = useState<{
    nicDocument: File | null;
    birthCertificate: File | null;
    qualificationCertificates: File | null;
    paymentSlip: File | null;
  }>({
    nicDocument: null,
    birthCertificate: null,
    qualificationCertificates: null,
    paymentSlip: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [applicationNumber, setApplicationNumber] = useState('');

  useEffect(() => {
    loadFaculties();
    loadAllDepartments();
    loadAllPrograms();
  }, []);

  // Filter departments when faculty changes
  useEffect(() => {
    if (selectedFaculty && allDepartments.length > 0) {
      const filtered = allDepartments.filter(d => d.facultyId === parseInt(selectedFaculty));
      setDepartments(filtered);
      setSelectedDepartment('');
      setPrograms([]);
      setFormData(prev => ({ ...prev, programmeId: '' }));
    } else {
      setDepartments([]);
      setPrograms([]);
    }
  }, [selectedFaculty, allDepartments]);

  // Filter programs when department changes
  useEffect(() => {
    if (selectedDepartment && allPrograms.length > 0) {
      const filtered = allPrograms.filter(p => p.departmentId === parseInt(selectedDepartment) && p.isActive !== false);
      setPrograms(filtered);
      setFormData(prev => ({ ...prev, programmeId: '' }));
    } else {
      setPrograms([]);
    }
  }, [selectedDepartment, allPrograms]);

  const loadFaculties = async () => {
    try {
      const response = await fetch(`${FULL_API_URL}/public/inquiry/faculties`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load faculties'}`);
      }
      
      const result = await response.json();
      if (result.statusCode === '000' && result.data) {
        const activeFaculties = result.data.filter((f: Faculty) => f.isActive !== false);
        setFaculties(activeFaculties);
      }
    } catch (error: any) {
      console.error('Error loading faculties:', error);
      setError('Failed to load faculties. Please refresh the page.');
    }
  };

  const loadAllDepartments = async () => {
    try {
      const response = await fetch(`${FULL_API_URL}/public/inquiry/departments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load departments'}`);
      }
      
      const result = await response.json();
      if (result.statusCode === '000' && result.data) {
        setAllDepartments(result.data);
      }
    } catch (error: any) {
      console.error('Error loading departments:', error);
      setError('Failed to load departments. Please refresh the page.');
    }
  };

  const loadAllPrograms = async () => {
    try {
      const response = await fetch(`${FULL_API_URL}/public/inquiry/programs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to load programs'}`);
      }
      
      const result = await response.json();
      if (result.statusCode === '000' && result.data) {
        setAllPrograms(result.data);
      }
    } catch (error: any) {
      console.error('Error loading programs:', error);
      setError('Failed to load programs. Please refresh the page.');
    }
  };

  const handleFileChange = (documentType: keyof typeof documents, file: File | null) => {
    if (file) {
      // Validate file size (50MB)
      if (!registrationService.validateFileSize(file)) {
        setError('File size must be less than 50MB');
        return;
      }
      
      // Validate file type
      if (!registrationService.validateFileType(file)) {
        setError('File must be PDF, JPG, or PNG format');
        return;
      }
      
      setDocuments({ ...documents, [documentType]: file });
      setError('');
    }
  };

  const validateForm = (): boolean => {
    // Reset error
    setError('');

    // Check required fields
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.nameWithInitials.trim()) {
      setError('Name with initials is required');
      return false;
    }
    if (!formData.nicNumber.trim()) {
      setError('NIC number is required');
      return false;
    }
    if (!registrationService.validateNIC(formData.nicNumber)) {
      setError('Invalid NIC format. Use 9 digits followed by V/X or 12 digits');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    if (!formData.permanentAddress.trim()) {
      setError('Permanent address is required');
      return false;
    }
    if (!formData.mobileNumber || formData.mobileNumber === '+94') {
      setError('Mobile number is required');
      return false;
    }
    if (!registrationService.validateMobileNumber(formData.mobileNumber)) {
      setError('Invalid mobile number format. Use +94 XX XXX XXXX');
      return false;
    }
    if (!formData.emailAddress.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!formData.contactName.trim()) {
      setError('Emergency contact name is required');
      return false;
    }
    if (!formData.relationship.trim()) {
      setError('Relationship is required');
      return false;
    }
    if (!formData.contactMobileNumber || formData.contactMobileNumber === '+94') {
      setError('Emergency contact mobile number is required');
      return false;
    }
    if (!registrationService.validateMobileNumber(formData.contactMobileNumber)) {
      setError('Invalid emergency contact mobile number format');
      return false;
    }
    if (!formData.olResults.trim()) {
      setError('O/L results are required');
      return false;
    }
    if (!formData.alResults.trim()) {
      setError('A/L results are required');
      return false;
    }
    if (!selectedFaculty) {
      setError('Faculty selection is required');
      return false;
    }
    if (!selectedDepartment) {
      setError('Department selection is required');
      return false;
    }
    if (!formData.programmeId) {
      setError('Programme selection is required');
      return false;
    }

    // Check required documents
    if (!documents.nicDocument) {
      setError('NIC document is required');
      return false;
    }
    if (!documents.birthCertificate) {
      setError('Birth certificate is required');
      return false;
    }
    if (!documents.qualificationCertificates) {
      setError('Qualification certificates are required');
      return false;
    }
    if (!documents.paymentSlip) {
      setError('Payment slip is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare data for API submission
      const registrationData: StudentRegistrationData = {
        fullName: formData.fullName,
        nameWithInitials: formData.nameWithInitials,
        nicNumber: formData.nicNumber,
        dateOfBirth: formData.dateOfBirth,
        permanentAddress: formData.permanentAddress,
        mobileNumber: formData.mobileNumber,
        emailAddress: formData.emailAddress,
        contactName: formData.contactName,
        relationship: formData.relationship,
        contactMobileNumber: formData.contactMobileNumber,
        olResults: formData.olResults,
        alResults: formData.alResults,
        otherQualifications: formData.otherQualifications,
        programmeId: parseInt(formData.programmeId),
        nicDocument: documents.nicDocument!,
        birthCertificate: documents.birthCertificate!,
        qualificationCertificates: documents.qualificationCertificates!,
        paymentSlip: documents.paymentSlip!
      };

      const result = await registrationService.submitRegistration(registrationData);
      
      if (result.success && result.data) {
        setApplicationNumber(result.data.applicationNumber);
        setSuccess(true);
        
        // Reset form
        setSelectedFaculty('');
        setSelectedDepartment('');
        setFormData({
          fullName: '',
          nameWithInitials: '',
          nicNumber: '',
          dateOfBirth: '',
          permanentAddress: '',
          mobileNumber: '+94',
          emailAddress: '',
          contactName: '',
          relationship: '',
          contactMobileNumber: '+94',
          olResults: '',
          alResults: '',
          otherQualifications: '',
          programmeId: '',
        });
        
        setDocuments({
          nicDocument: null,
          birthCertificate: null,
          qualificationCertificates: null,
          paymentSlip: null,
        });
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit registration. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Submitted!</h2>
          {applicationNumber && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <p className="text-emerald-800 font-semibold">Application Number:</p>
              <p className="text-emerald-900 text-xl font-bold">{applicationNumber}</p>
            </div>
          )}
          <p className="text-gray-700 mb-6">
            Thank you for registering with <span className="font-baskerville">SIPS</span>. Our team will review your registration and payment details. You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setApplicationNumber('');
            }}
            className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Submit Another Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative h-[300px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Register Online</h1>
          <p className="text-xl">Complete your student registration</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Registration</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b-2 border-emerald-500">
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="John Doe Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name with Initials *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nameWithInitials}
                    onChange={(e) => setFormData({ ...formData, nameWithInitials: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="J.D. Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIC Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nicNumber}
                    onChange={(e) => setFormData({ ...formData, nicNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="199812345678 or 981234567V"
                    pattern="^[0-9]{9}[vVxX]$|^[0-9]{12}$"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b-2 border-emerald-500">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permanent Address *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.permanentAddress}
                    onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="123 Main Street, City, Province"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-l-lg">
                        +94
                      </span>
                      <input
                        type="tel"
                        required
                        value={formData.mobileNumber.replace('+94', '')}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 9) {
                            setFormData({ ...formData, mobileNumber: `+94${value}` });
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="77 123 4567"
                        maxLength={9}
                        pattern="^[0-9]{9}$"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.emailAddress}
                      onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b-2 border-emerald-500">
                Emergency Contact
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Jane Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Mother/Father/Spouse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 py-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm rounded-l-lg">
                      +94
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.contactMobileNumber.replace('+94', '')}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 9) {
                          setFormData({ ...formData, contactMobileNumber: `+94${value}` });
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="77 123 4567"
                      maxLength={9}
                      pattern="^[0-9]{9}$"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Qualifications */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b-2 border-emerald-500">
                Educational Qualifications
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    O/L Results *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.olResults}
                    onChange={(e) => setFormData({ ...formData, olResults: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Mathematics - A, Science - B, English - C (Year: 2018)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    A/L Results *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.alResults}
                    onChange={(e) => setFormData({ ...formData, alResults: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Combined Mathematics - A, Physics - B, Chemistry - C (Year: 2020, Stream: Physical Science)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Qualifications
                  </label>
                  <textarea
                    rows={3}
                    value={formData.otherQualifications}
                    onChange={(e) => setFormData({ ...formData, otherQualifications: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Diplomas, certificates, or other relevant qualifications (optional)"
                  />
                </div>
              </div>
            </div>

            {/* Programme Selection */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b-2 border-emerald-500">
                Programme Selection
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Faculty Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Faculty *
                  </label>
                  <select
                    required
                    value={selectedFaculty}
                    onChange={(e) => {
                      setSelectedFaculty(e.target.value);
                      setSelectedDepartment('');
                      setFormData({ ...formData, programmeId: '' });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Faculty --</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Department *
                  </label>
                  <select
                    required
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setFormData({ ...formData, programmeId: '' });
                    }}
                    disabled={!selectedFaculty}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Programme Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Programme *
                  </label>
                  <select
                    required
                    value={formData.programmeId}
                    onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                    disabled={!selectedDepartment}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select Programme --</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Helper text */}
              <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-700">
                  <strong>Selection Guide:</strong> First select your Faculty, then choose the Department within that Faculty, and finally select your desired Programme.
                </p>
              </div>
            </div>

            {/* Document Uploads */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-4 pb-2 border-b-2 border-emerald-500">
                Document Uploads
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIC Document *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('nicDocument', e.target.files?.[0] || null)}
                      className="hidden"
                      id="nic-document"
                    />
                    <label htmlFor="nic-document" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-gray-600 mb-1">
                        {documents.nicDocument ? documents.nicDocument.name : 'Click to upload NIC'}
                      </p>
                      <p className="text-xs text-gray-400">PDF, JPG, PNG</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Certificate *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('birthCertificate', e.target.files?.[0] || null)}
                      className="hidden"
                      id="birth-certificate"
                    />
                    <label htmlFor="birth-certificate" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-gray-600 mb-1">
                        {documents.birthCertificate ? documents.birthCertificate.name : 'Click to upload certificate'}
                      </p>
                      <p className="text-xs text-gray-400">PDF, JPG, PNG</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualification Certificates *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('qualificationCertificates', e.target.files?.[0] || null)}
                      className="hidden"
                      id="qualification-certificate"
                    />
                    <label htmlFor="qualification-certificate" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-gray-600 mb-1">
                        {documents.qualificationCertificates ? documents.qualificationCertificates.name : 'Click to upload certificates'}
                      </p>
                      <p className="text-xs text-gray-400">PDF, JPG, PNG</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Slip *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('paymentSlip', e.target.files?.[0] || null)}
                      className="hidden"
                      id="payment-slip"
                    />
                    <label htmlFor="payment-slip" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-gray-600 mb-1">
                        {documents.paymentSlip ? documents.paymentSlip.name : 'Click to upload payment slip'}
                      </p>
                      <p className="text-xs text-gray-400">PDF, JPG, PNG</p>
                    </label>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                * All documents required. Accepted formats: PDF, JPG, PNG (Max 50MB per file)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-4 rounded-lg font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed text-lg shadow-lg"
            >
              {loading ? 'Submitting Registration...' : 'Submit Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
