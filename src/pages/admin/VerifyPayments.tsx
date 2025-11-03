import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, DollarSign, Calendar, CreditCard, FileText, Eye, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Payment {
  id: string;
  student_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  payment_type?: string;
  installment_number?: number;
  total_installments?: number;
  status: string;
  reference_number: string;
  payment_proof_url?: string;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  students?: {
    name_with_initials: string;
    nic: string;
    program_id?: string;
    faculty_id?: string;
    department_id?: string;
    intake_id?: string;
    programs?: {
      name: string;
    };
  };
}

interface Faculty {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  faculty_id: string;
}

interface Program {
  id: string;
  name: string;
  department_id: string;
}

interface Intake {
  id: string;
  intake_name: string;
  intake_year: number;
  intake_month: number;
  program_id: string;
}

export function VerifyPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterPaymentType, setFilterPaymentType] = useState('all');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterProgram, setFilterProgram] = useState('all');
  const [filterIntake, setFilterIntake] = useState('all');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  
  // Dropdown data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);

  useEffect(() => {
    loadPayments();
    loadFaculties();
  }, []);

  useEffect(() => {
    if (filterFaculty !== 'all') {
      loadDepartmentsByFaculty(filterFaculty);
    } else {
      setDepartments([]);
      setPrograms([]);
    }
  }, [filterFaculty]);

  useEffect(() => {
    if (filterDepartment !== 'all') {
      loadProgramsByDepartment(filterDepartment);
    } else {
      setPrograms([]);
      setIntakes([]);
    }
  }, [filterDepartment]);

  useEffect(() => {
    if (filterProgram !== 'all') {
      loadIntakesByProgram(filterProgram);
    } else {
      setIntakes([]);
    }
  }, [filterProgram]);

  const loadFaculties = async () => {
    try {
      const { data } = await supabase
        .from('faculties')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      setFaculties(data || []);
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadDepartmentsByFaculty = async (facultyId: string) => {
    try {
      const { data } = await supabase
        .from('departments')
        .select('id, name, faculty_id')
        .eq('faculty_id', facultyId)
        .eq('is_active', true)
        .order('name');
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadProgramsByDepartment = async (departmentId: string) => {
    try {
      const { data } = await supabase
        .from('programs')
        .select('id, name, department_id')
        .eq('department_id', departmentId)
        .eq('is_active', true)
        .order('name');
      setPrograms(data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadIntakesByProgram = async (programId: string) => {
    try {
      const { data } = await supabase
        .from('intakes')
        .select('id, intake_name, intake_year, intake_month, program_id')
        .eq('program_id', programId)
        .eq('is_active', true)
        .order('intake_year', { ascending: false })
        .order('intake_month', { ascending: false });
      setIntakes(data || []);
    } catch (error) {
      console.error('Error loading intakes:', error);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Load payments and students separately
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Load students with their programs
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          id,
          name_with_initials,
          nic,
          program_id,
          faculty_id,
          department_id,
          programs (
            name
          )
        `);

      if (studentsError) throw studentsError;

      // Match payments with students
      const paymentsWithStudents = (paymentsData || []).map((payment: any) => {
        const student = (studentsData || []).find((s: any) => s.id === payment.student_id);
        return {
          ...payment,
          students: student
        };
      });

      setPayments(paymentsWithStudents);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (payment: Payment) => {
    if (!confirm(`Verify payment of Rs. ${payment.amount} from ${payment.students?.name_with_initials}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      const currentUser = await supabase.auth.getUser();

      const { error } = await supabaseAny
        .from('payments')
        .update({
          status: 'verified',
          verified_by: currentUser.data.user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', payment.id);

      if (error) throw error;

      alert('Payment verified successfully!');
      loadPayments();
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      alert('Failed to verify payment: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      const currentUser = await supabase.auth.getUser();

      const { error } = await supabaseAny
        .from('payments')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          verified_by: currentUser.data.user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', selectedPayment.id);

      if (error) throw error;

      alert('Payment rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedPayment(null);
      loadPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      alert('Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.students?.name_with_initials?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.students?.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesPaymentType = filterPaymentType === 'all' || payment.payment_type === filterPaymentType;
    const matchesFaculty = filterFaculty === 'all' || payment.students?.faculty_id === filterFaculty;
    const matchesDepartment = filterDepartment === 'all' || payment.students?.department_id === filterDepartment;
    const matchesProgram = filterProgram === 'all' || payment.students?.program_id === filterProgram;
    const matchesIntake = filterIntake === 'all' || payment.students?.intake_id === filterIntake;
    
    return matchesSearch && matchesStatus && matchesPaymentType && matchesFaculty && matchesDepartment && matchesProgram && matchesIntake;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('pending');
    setFilterPaymentType('all');
    setFilterFaculty('all');
    setFilterDepartment('all');
    setFilterProgram('all');
    setFilterIntake('all');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      verified: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-green-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Verify Payments</h1>
              <p className="text-green-100 mt-1">Review and confirm payment submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'pending').length}</div>
                <div className="text-gray-600">Pending</div>
              </div>
              <DollarSign className="text-amber-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'verified').length}</div>
                <div className="text-gray-600">Verified</div>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{payments.filter(p => p.status === 'rejected').length}</div>
                <div className="text-gray-600">Rejected</div>
              </div>
              <XCircle className="text-red-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">LKR {totalAmount.toLocaleString()}</div>
                <div className="text-gray-600">Total Amount</div>
              </div>
              <DollarSign className="text-blue-500" size={40} />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by student name, NIC, or reference number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={filterPaymentType}
                onChange={(e) => setFilterPaymentType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Payment Types</option>
                <option value="complete">Complete Payment</option>
                <option value="installment">Installment</option>
              </select>
              <select
                value={filterFaculty}
                onChange={(e) => {
                  setFilterFaculty(e.target.value);
                  setFilterDepartment('all');
                  setFilterProgram('all');
                  setFilterIntake('all');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Faculties</option>
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <select
                value={filterDepartment}
                onChange={(e) => {
                  setFilterDepartment(e.target.value);
                  setFilterProgram('all');
                  setFilterIntake('all');
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={filterFaculty === 'all'}
              >
                <option value="all">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <select
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setFilterIntake('all');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={filterDepartment === 'all'}
              >
                <option value="all">All Programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={filterIntake}
                onChange={(e) => setFilterIntake(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={filterProgram === 'all'}
              >
                <option value="all">All Intakes</option>
                {intakes.map(intake => {
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  const monthName = monthNames[intake.intake_month - 1];
                  return (
                    <option key={intake.id} value={intake.id}>
                      {intake.intake_name} ({monthName} {intake.intake_year})
                    </option>
                  );
                })}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                title="Reset all filters"
              >
                <X size={20} />
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
              <p className="mt-4 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">No payments found</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{payment.students?.name_with_initials || 'N/A'}</h3>
                        <p className="text-sm text-gray-500">NIC: {payment.students?.nic}</p>
                        {payment.students?.programs && (
                          <p className="text-sm text-emerald-600 font-semibold">{payment.students.programs.name}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="font-semibold">Amount:</span>
                        <span className="text-green-600 font-bold">LKR {payment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span className="font-semibold">Date:</span>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CreditCard size={16} />
                        <span className="font-semibold">Method:</span>
                        {payment.payment_method}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={16} />
                        <span className="font-semibold">Reference:</span>
                        {payment.reference_number}
                      </div>
                      {payment.payment_type === 'installment' && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 col-span-2">
                          <CreditCard size={16} />
                          <span className="font-semibold">Installment {payment.installment_number} of {payment.total_installments}</span>
                        </div>
                      )}
                      {payment.rejection_reason && (
                        <div className="col-span-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{payment.rejection_reason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex lg:flex-col gap-2">
                    {payment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleVerify(payment)}
                          disabled={processing}
                          className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Verify
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRejectModal(true);
                          }}
                          disabled={processing}
                          className="flex-1 lg:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </>
                    )}
                    {payment.payment_proof_url && (
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowProofModal(true);
                        }}
                        className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye size={18} />
                        View Proof
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Payment</h2>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting payment from <strong>{selectedPayment.students?.name_with_initials}</strong>.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedPayment(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {processing ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Proof Modal */}
        {showProofModal && selectedPayment && selectedPayment.payment_proof_url && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Payment Proof</h2>
                <button
                  onClick={() => {
                    setShowProofModal(false);
                    setSelectedPayment(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4 text-sm text-gray-600">
                <p><strong>Student:</strong> {selectedPayment.students?.name_with_initials}</p>
                <p><strong>Amount:</strong> LKR {selectedPayment.amount.toLocaleString()}</p>
                <p><strong>Reference:</strong> {selectedPayment.reference_number}</p>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={selectedPayment.payment_proof_url} 
                  alt="Payment Proof" 
                  className="w-full h-auto"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => window.open(selectedPayment.payment_proof_url, '_blank')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
