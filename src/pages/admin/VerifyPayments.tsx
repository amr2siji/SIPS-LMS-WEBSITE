import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, DollarSign, Calendar, FileText, Eye, AlertCircle, X } from 'lucide-react';
import * as adminService from '../../services/adminService';

interface Payment {
  id: number;
  studentNic: string;
  studentName: string;
  programId?: number;
  programName?: string;
  intakeId?: number;
  intakeName?: string;
  amount: number;
  paymentType: string;
  proofFileUrl?: string;
  status: string;
  rejectionReason?: string;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface Faculty {
  id: number;
  name: string;
}

interface Department {
  id: number;
  departmentName: string;
  facultyId: number;
}

interface Program {
  id: number;
  name: string;
  departmentId: number;
}

interface Intake {
  id: number;
  intakeName: string;
  intakeYear: number;
  intakeMonth: number;
  programId: number;
}

// Helper function to convert date array from backend to Date object
const convertArrayToDate = (dateArray: number[]): string => {
  if (!Array.isArray(dateArray) || dateArray.length < 3) {
    return new Date().toISOString();
  }
  // Backend returns: [year, month, day, hour, minute, second, nanosecond]
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
  // Month is 1-based in Java, but 0-based in JavaScript
  return new Date(year, month - 1, day, hour, minute, second).toISOString();
};

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
      const result = await adminService.getFaculties();
      if (result.success && result.data) {
        // Handle both ApiResponse<T> and direct array response
        const facultiesData = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
        setFaculties(facultiesData.map((f: any) => ({ id: f.id, name: f.name })));
      }
    } catch (error) {
      console.error('Error loading faculties:', error);
    }
  };

  const loadDepartmentsByFaculty = async (facultyId: string) => {
    try {
      const result = await adminService.getDepartmentsByFaculty(Number(facultyId));
      if (result.success && result.data) {
        const deptData = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
        setDepartments(deptData.map((d: any) => ({ 
          id: d.id, 
          departmentName: d.departmentName, 
          facultyId: d.facultyId 
        })));
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadProgramsByDepartment = async (departmentId: string) => {
    try {
      const result = await adminService.getProgramsByDepartment(Number(departmentId));
      if (result.success && result.data) {
        const progData = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
        setPrograms(progData.map((p: any) => ({ 
          id: p.id, 
          name: p.name, 
          departmentId: p.departmentId 
        })));
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadIntakesByProgram = async (programId: string) => {
    try {
      const result = await adminService.getIntakesByProgram(Number(programId));
      if (result.success && result.data) {
        const intakeData = Array.isArray(result.data) ? result.data : (result.data as any).data || [];
        setIntakes(intakeData.map((i: any) => ({
          id: i.id,
          intakeName: i.intakeName,
          intakeYear: i.intakeYear,
          intakeMonth: i.intakeMonth,
          programId: i.programId
        })));
      }
    } catch (error) {
      console.error('Error loading intakes:', error);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(`${API_BASE_URL}/api/admin/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load payments');
      }

      const paymentsData = await response.json();
      console.log('Payments loaded:', paymentsData);
      
      // Convert date arrays to ISO strings
      const processedPayments = Array.isArray(paymentsData) 
        ? paymentsData.map((payment: any) => ({
            ...payment,
            createdAt: Array.isArray(payment.createdAt) 
              ? convertArrayToDate(payment.createdAt) 
              : payment.createdAt,
            updatedAt: Array.isArray(payment.updatedAt) 
              ? convertArrayToDate(payment.updatedAt) 
              : payment.updatedAt,
            verifiedAt: payment.verifiedAt && Array.isArray(payment.verifiedAt)
              ? convertArrayToDate(payment.verifiedAt) 
              : payment.verifiedAt
          }))
        : [];
      
      setPayments(processedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (payment: Payment) => {
    if (!confirm(`Verify payment of Rs. ${payment.amount} from ${payment.studentName}?`)) {
      return;
    }

    setProcessing(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(`${API_BASE_URL}/api/admin/payments/${payment.id}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

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
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
      const token = localStorage.getItem('jwt_token');

      const response = await fetch(`${API_BASE_URL}/api/admin/payments/${selectedPayment.id}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved: false,
          rejectionReason: rejectionReason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject payment');
      }

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
      payment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentNic?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesPaymentType = filterPaymentType === 'all' || payment.paymentType === filterPaymentType;
    const matchesProgram = filterProgram === 'all' || payment.programId?.toString() === filterProgram;
    const matchesIntake = filterIntake === 'all' || payment.intakeId?.toString() === filterIntake;

    return matchesSearch && matchesStatus && matchesPaymentType && matchesProgram && matchesIntake;
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

  const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

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
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
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
                  const monthName = monthNames[intake.intakeMonth - 1];
                  return (
                    <option key={intake.id} value={intake.id}>
                      {intake.intakeName} ({monthName} {intake.intakeYear})
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
                        <h3 className="text-lg font-bold text-gray-900">{payment.studentName || 'N/A'}</h3>
                        <p className="text-sm text-gray-500">NIC: {payment.studentNic}</p>
                        {payment.programName && (
                          <p className="text-sm text-emerald-600 font-semibold">{payment.programName}</p>
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
                        {payment.amount ? (
                          <span className="text-green-600 font-bold">LKR {payment.amount.toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-500 italic">Not Provided</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span className="font-semibold">Date:</span>
                        {payment.createdAt ? (
                          new Date(payment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={16} />
                        <span className="font-semibold">Type:</span>
                        {payment.paymentType}
                      </div>
                      {payment.rejectionReason && (
                        <div className="col-span-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{payment.rejectionReason}</p>
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
                    {payment.proofFileUrl && (
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
                Please provide a reason for rejecting payment from <strong>{selectedPayment.studentName}</strong>.
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
        {showProofModal && selectedPayment && selectedPayment.proofFileUrl && (
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
                <p><strong>Student:</strong> {selectedPayment.studentName}</p>
                <p><strong>Amount:</strong> {selectedPayment.amount ? `LKR ${selectedPayment.amount.toLocaleString()}` : 'Not Provided'}</p>
              </div>
              
              {/* Check if it's a PDF or image */}
              {selectedPayment.proofFileUrl.toLowerCase().endsWith('.pdf') ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50">
                  <div className="text-center">
                    <FileText className="mx-auto text-red-500 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">PDF Payment Proof</h3>
                    <p className="text-gray-600 mb-6">
                      This is a PDF document. Click the button below to open and view the payment proof in a new tab.
                    </p>
                    <button
                      onClick={() => window.open(selectedPayment.proofFileUrl, '_blank')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                      <FileText size={20} />
                      Open PDF in New Tab
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img 
                      src={selectedPayment.proofFileUrl}
                      alt="Payment Proof" 
                      className="w-full h-auto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => window.open(selectedPayment.proofFileUrl, '_blank')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Open in New Tab
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
