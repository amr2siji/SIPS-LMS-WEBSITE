import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, CheckCircle } from 'lucide-react';

interface Program {
  id: string;
  name: string;
}

function Register() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    name_with_initials: '',
    nic: '',
    date_of_birth: '',
    permanent_address: '',
    mobile_number: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_mobile: '',
    ol_qualifications: '',
    al_qualifications: '',
    other_qualifications: '',
    program_id: '',
  });

  const [documents, setDocuments] = useState<{
    nic_document: File | null;
    birth_certificate: File | null;
    qualification_certificate: File | null;
    payment_slip: File | null;
  }>({
    nic_document: null,
    birth_certificate: null,
    qualification_certificate: null,
    payment_slip: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    const { data } = await supabase
      .from('programs')
      .select('id, name')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setPrograms(data);
    }
  };

  const handleFileChange = (documentType: keyof typeof documents, file: File | null) => {
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setDocuments({ ...documents, [documentType]: file });
      setError('');
    }
  };

  const uploadDocument = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload all documents
      const nic_document_url = documents.nic_document 
        ? await uploadDocument(documents.nic_document, 'nic-documents')
        : null;

      const birth_certificate_url = documents.birth_certificate
        ? await uploadDocument(documents.birth_certificate, 'birth-certificates')
        : null;

      const qualification_certificate_url = documents.qualification_certificate
        ? await uploadDocument(documents.qualification_certificate, 'qualification-certificates')
        : null;

      const payment_proof_url = documents.payment_slip
        ? await uploadDocument(documents.payment_slip, 'payment-proofs')
        : null;

      // Insert registration data
      const registrationData = {
        ...formData,
        phone: formData.mobile_number,  // Legacy field compatibility
        address: formData.permanent_address,  // Legacy field compatibility
        nic_document_url,
        birth_certificate_url,
        qualification_certificate_url,
        payment_slip_url: payment_proof_url,
        status: 'pending'
      };

      // Temporary workaround for type mismatch - run migration and regenerate types
      const { error: insertError } = await (supabase as any)
        .from('registrations')
        .insert([registrationData]);

      if (insertError) throw insertError;

      setSuccess(true);
      
      // Reset form
      setFormData({
        full_name: '',
        name_with_initials: '',
        nic: '',
        date_of_birth: '',
        permanent_address: '',
        mobile_number: '',
        email: '',
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_mobile: '',
        ol_qualifications: '',
        al_qualifications: '',
        other_qualifications: '',
        program_id: '',
      });
      
      setDocuments({
        nic_document: null,
        birth_certificate: null,
        qualification_certificate: null,
        payment_slip: null,
      });
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
          <p className="text-gray-700 mb-6">
            Thank you for registering with <span className="font-baskerville">SIPS</span>. Our team will review your registration and payment details. You will receive a confirmation email shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
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
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                    value={formData.name_with_initials}
                    onChange={(e) => setFormData({ ...formData, name_with_initials: e.target.value })}
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
                    value={formData.nic}
                    onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="199812345678 or 981234567V"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
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
                    value={formData.permanent_address}
                    onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="123 Main Street, City, Province"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0771234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
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
                    value={formData.emergency_contact_relationship}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Mother/Father/Spouse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.emergency_contact_mobile}
                    onChange={(e) => setFormData({ ...formData, emergency_contact_mobile: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0771234567"
                  />
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
                    value={formData.ol_qualifications}
                    onChange={(e) => setFormData({ ...formData, ol_qualifications: e.target.value })}
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
                    value={formData.al_qualifications}
                    onChange={(e) => setFormData({ ...formData, al_qualifications: e.target.value })}
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
                    value={formData.other_qualifications}
                    onChange={(e) => setFormData({ ...formData, other_qualifications: e.target.value })}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Programme *
                </label>
                <select
                  required
                  value={formData.program_id}
                  onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select a programme --</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
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
                      onChange={(e) => handleFileChange('nic_document', e.target.files?.[0] || null)}
                      className="hidden"
                      id="nic-document"
                    />
                    <label htmlFor="nic-document" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-gray-600 mb-1">
                        {documents.nic_document ? documents.nic_document.name : 'Click to upload NIC'}
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
                      onChange={(e) => handleFileChange('birth_certificate', e.target.files?.[0] || null)}
                      className="hidden"
                      id="birth-certificate"
                    />
                    <label htmlFor="birth-certificate" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-gray-600 mb-1">
                        {documents.birth_certificate ? documents.birth_certificate.name : 'Click to upload certificate'}
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
                      onChange={(e) => handleFileChange('qualification_certificate', e.target.files?.[0] || null)}
                      className="hidden"
                      id="qualification-certificate"
                    />
                    <label htmlFor="qualification-certificate" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-gray-600 mb-1">
                        {documents.qualification_certificate ? documents.qualification_certificate.name : 'Click to upload certificates'}
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
                      onChange={(e) => handleFileChange('payment_slip', e.target.files?.[0] || null)}
                      className="hidden"
                      id="payment-slip"
                    />
                    <label htmlFor="payment-slip" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={40} />
                      <p className="text-sm text-gray-600 mb-1">
                        {documents.payment_slip ? documents.payment_slip.name : 'Click to upload payment slip'}
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
