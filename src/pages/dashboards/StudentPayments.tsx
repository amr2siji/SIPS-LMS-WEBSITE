import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, DollarSign, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Payment {
  id: string;
  payment_type: string;
  proof_file_url: string;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  program_id: string;
  program_name: string;
  intake_id: string;
  intake_name: string;
}

export function StudentPayments() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Form states
  const [paymentType, setPaymentType] = useState<'complete' | 'installment'>('complete');
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [intakes, setIntakes] = useState<any[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPaymentProgram, setSelectedPaymentProgram] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');

  useEffect(() => {
    if (profile) {
      loadPayments();
      loadFaculties();
    }
  }, [profile]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      const { data: paymentsData, error } = await supabase
        .from('payments')
        .select(`
          id,
          payment_type,
          proof_file_url,
          status,
          rejection_reason,
          created_at,
          program_id,
          intake_id,
          programs:program_id (
            name
          ),
          intakes:intake_id (
            intake_name
          )
        `)
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPayments: Payment[] = (paymentsData || []).map((p: any) => ({
        id: p.id,
        payment_type: p.payment_type,
        proof_file_url: p.proof_file_url,
        status: p.status,
        rejection_reason: p.rejection_reason,
        created_at: p.created_at,
        program_id: p.program_id,
        program_name: p.programs?.name || 'Unknown Program',
        intake_id: p.intake_id,
        intake_name: p.intakes?.intake_name || 'Unknown Intake',
      }));

      setPayments(formattedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFaculties = async () => {
    try {
      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (facultiesError) throw facultiesError;
      setFaculties(facultiesData || []);
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const handleFacultyChange = async (facultyId: string) => {
    setSelectedFaculty(facultyId);
    setSelectedDepartment('');
    setSelectedPaymentProgram('');
    setSelectedIntake('');
    setDepartments([]);
    setPrograms([]);
    setIntakes([]);

    if (!facultyId) return;

    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('faculty_id', facultyId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const handleDepartmentChange = async (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedPaymentProgram('');
    setSelectedIntake('');
    setPrograms([]);
    setIntakes([]);

    if (!departmentId) return;

    try {
      const { data, error } = await supabase
        .from('programs')
        .select('id, name')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const handleProgramChange = async (programId: string) => {
    setSelectedPaymentProgram(programId);
    setSelectedIntake('');
    setIntakes([]);

    if (!programId) return;

    try {
      const { data, error } = await supabase
        .from('intakes')
        .select('id, intake_name, intake_year, intake_month')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('intake_year', { ascending: false })
        .order('intake_month', { ascending: false });

      if (error) throw error;
      setIntakes(data || []);
    } catch (error) {
      console.error('Error loading intakes:', error);
    }
  };

  const handlePaymentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentFile(e.target.files[0]);
    }
  };

  const handlePaymentSubmit = async () => {
    if (!paymentFile) {
      alert('Please select a payment proof file');
      return;
    }

    if (!selectedPaymentProgram || !selectedIntake) {
      alert('Please select program and intake');
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = paymentFile.name.split('.').pop();
      const fileName = `${profile?.id}_${Date.now()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lms-files')
        .upload(filePath, paymentFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lms-files')
        .getPublicUrl(filePath);

      // Create payment record
      const { error: insertError } = await (supabase
        .from('payments') as any)
        .insert({
          student_id: profile?.id,
          program_id: selectedPaymentProgram,
          intake_id: selectedIntake,
          payment_type: paymentType,
          proof_file_url: publicUrl,
          status: 'pending',
        });

      if (insertError) throw insertError;

      alert('Payment proof uploaded successfully!');
      
      // Reset form
      setShowUploadForm(false);
      setPaymentFile(null);
      setPaymentType('complete');
      setSelectedFaculty('');
      setSelectedDepartment('');
      setSelectedPaymentProgram('');
      setSelectedIntake('');
      
      // Reload payments
      loadPayments();
    } catch (error) {
      console.error('Error uploading payment:', error);
      alert('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle size={16} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle size={16} />
            Rejected
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
            <Clock size={16} />
            Pending
          </span>
        );
    }
  };

  const getPaymentTypeColor = (type: string) => {
    return type === 'complete' 
      ? 'bg-blue-100 text-blue-800 border-blue-300' 
      : 'bg-purple-100 text-purple-800 border-purple-300';
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header */}
      <nav className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <div className="h-8 w-px bg-white/20"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">Payment Management</h1>
                <p className="text-sm text-emerald-100">Upload and track your payment submissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all font-medium border border-white/20"
            >
              <Upload size={18} />
              {showUploadForm ? 'Hide Form' : 'Upload Payment'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Payments</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{payments.length}</h3>
                <p className="text-sm text-blue-600 font-medium">Submitted</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Review</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{pendingCount}</h3>
                <p className="text-sm text-yellow-600 font-medium">Awaiting approval</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 rounded-xl">
                <Clock className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{approvedCount}</h3>
                <p className="text-sm text-green-600 font-medium">Verified payments</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{rejectedCount}</h3>
                <p className="text-sm text-red-600 font-medium">Need resubmission</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl">
                <XCircle className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <h2 className="text-2xl font-bold">Upload Payment Proof</h2>
              <p className="text-blue-100 mt-1">Submit your payment documentation</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Program Selection */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3">Select Program for Payment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Faculty Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Faculty *</label>
                    <select
                      value={selectedFaculty}
                      onChange={(e) => handleFacultyChange(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Faculty</option>
                      {faculties.map((faculty) => (
                        <option key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department Dropdown */}
                  {selectedFaculty && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Department *</label>
                      <select
                        value={selectedDepartment}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Program Dropdown */}
                  {selectedDepartment && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Program *</label>
                      <select
                        value={selectedPaymentProgram}
                        onChange={(e) => handleProgramChange(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Program</option>
                        {programs.map((program) => (
                          <option key={program.id} value={program.id}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Intake Dropdown */}
                  {selectedPaymentProgram && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Intake *</label>
                      <select
                        value={selectedIntake}
                        onChange={(e) => setSelectedIntake(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Intake</option>
                        {intakes.map((intake) => (
                          <option key={intake.id} value={intake.id}>
                            {intake.intake_name || `${intake.intake_month}/${intake.intake_year}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Payment Type *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentType === 'complete' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="complete"
                      checked={paymentType === 'complete'}
                      onChange={(e) => setPaymentType(e.target.value as 'complete' | 'installment')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">Complete Payment</span>
                      <p className="text-sm text-gray-600">Full payment for the entire program</p>
                    </div>
                  </label>
                  
                  <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${paymentType === 'installment' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="paymentType"
                      value="installment"
                      checked={paymentType === 'installment'}
                      onChange={(e) => setPaymentType(e.target.value as 'complete' | 'installment')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div className="ml-3">
                      <span className="font-semibold text-gray-900">Installment Payment</span>
                      <p className="text-sm text-gray-600">Pay in scheduled installments</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Payment Proof Document *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    onChange={handlePaymentFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="payment-file-upload"
                  />
                  <label htmlFor="payment-file-upload" className="cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600 mb-1">
                      {paymentFile ? (
                        <span className="text-blue-600 font-semibold">{paymentFile.name}</span>
                      ) : (
                        <>Click to upload or drag and drop</>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadForm(false);
                    setPaymentFile(null);
                    setPaymentType('complete');
                    setSelectedFaculty('');
                    setSelectedDepartment('');
                    setSelectedPaymentProgram('');
                    setSelectedIntake('');
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={uploading || !paymentFile || !selectedIntake}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Submit Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white">
            <h2 className="text-2xl font-bold">Payment History</h2>
            <p className="text-indigo-100 mt-1">Track your submitted payment proofs and their status</p>
          </div>

          <div className="overflow-x-auto">
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Payments Yet</h3>
                <p className="text-gray-600 mb-4">You haven't submitted any payment proofs yet.</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Upload size={18} />
                  Upload First Payment
                </button>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date Submitted</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Program</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Intake</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Type</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <>
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(payment.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.program_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{payment.intake_name}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border ${getPaymentTypeColor(payment.payment_type)}`}>
                            {payment.payment_type === 'complete' ? 'Complete' : 'Installment'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <a
                            href={payment.proof_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm"
                          >
                            View Proof
                          </a>
                        </td>
                      </tr>
                      {payment.status === 'rejected' && payment.rejection_reason && (
                        <tr className="bg-red-50">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
                              <div>
                                <div className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</div>
                                <div className="text-sm text-red-800">{payment.rejection_reason}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
