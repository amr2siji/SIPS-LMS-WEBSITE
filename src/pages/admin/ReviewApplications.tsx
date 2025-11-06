import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, FileText, Mail, Phone, User, MapPin, Calendar, GraduationCap, AlertCircle, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Application {
  id: string;
  user_id: string;
  program_id: string;
  status: string;
  application_date: string;
  remarks: string;
  name?: string;
  email?: string;
  phone?: string;
  name_with_initials?: string;
  nic?: string;
  date_of_birth?: string;
  permanent_address?: string;
  mobile_number?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_mobile?: string;
  ol_qualifications?: string;
  al_qualifications?: string;
  other_qualifications?: string;
  nic_document_url?: string;
  birth_certificate_url?: string;
  qualification_certificate_url?: string;
  payment_proof_url?: string;
  rejection_reason?: string;
  programs?: {
    name: string;
    department_id?: string;
    departments?: {
      faculty_id?: string;
    };
  };
}

interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  program_id: string | null;
  message: string | null;
  status: string;
  created_at: string;
  programs?: {
    name: string;
  };
}

export function ReviewApplications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'applications' | 'inquiries'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    } else {
      loadInquiries();
    }
  }, [activeTab]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          programs (
            name,
            department_id,
            departments (
              faculty_id
            )
          )
        `)
        .order('application_date', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inquiries')
        .select(`
          *,
          programs (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInquiryStatusUpdate = async (inquiryId: string, newStatus: string) => {
    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny
        .from('inquiries')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', inquiryId);

      if (error) throw error;
      
      alert('Inquiry status updated successfully');
      loadInquiries();
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('Failed to update inquiry status');
    }
  };

  const handleApprove = async (application: Application) => {
    if (!confirm(`Approve application for ${application.name}? This will create a student profile.`)) {
      return;
    }

    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      const currentUser = await supabase.auth.getUser();

      // Create student profile
      const { error: studentError } = await supabaseAny
        .from('students')
        .insert({
          id: application.user_id,
          name_with_initials: application.name_with_initials,
          nic: application.nic,
          date_of_birth: application.date_of_birth,
          permanent_address: application.permanent_address,
          mobile_number: application.mobile_number,
          emergency_contact_name: application.emergency_contact_name,
          emergency_contact_relationship: application.emergency_contact_relationship,
          emergency_contact_mobile: application.emergency_contact_mobile,
          ol_qualifications: application.ol_qualifications,
          al_qualifications: application.al_qualifications,
          other_qualifications: application.other_qualifications,
          nic_document_url: application.nic_document_url,
          birth_certificate_url: application.birth_certificate_url,
          qualification_certificate_url: application.qualification_certificate_url,
          payment_proof_url: application.payment_proof_url,
          program_id: application.program_id,
          faculty_id: application.programs?.departments?.faculty_id,
          department_id: application.programs?.department_id,
          status: 'active'
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // Update application status
      const { error: updateError } = await supabaseAny
        .from('applications')
        .update({
          status: 'approved',
          processed_by: currentUser.data.user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      alert('Application approved and student profile created successfully!');
      loadApplications();
    } catch (error: any) {
      console.error('Error approving application:', error);
      alert('Failed to approve application: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const supabaseAny = supabase as any;
      const currentUser = await supabase.auth.getUser();

      const { error } = await supabaseAny
        .from('applications')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          processed_by: currentUser.data.user?.id,
          processed_at: new Date().toISOString()
        })
        .eq('id', selectedApplication.id);

      if (error) throw error;

      alert('Application rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedApplication(null);
      loadApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.name_with_initials?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.programs?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = 
      inq.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.programs?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inq.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-amber-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Review Applications</h1>
              <p className="text-amber-100 mt-1">Process and manage student applications</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {activeTab === 'applications' ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'pending').length}</div>
                <div className="text-gray-600">Pending</div>
              </div>
              <Clock className="text-amber-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'approved').length}</div>
                <div className="text-gray-600">Approved</div>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{applications.filter(a => a.status === 'rejected').length}</div>
                <div className="text-gray-600">Rejected</div>
              </div>
              <XCircle className="text-red-500" size={40} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                <div className="text-gray-600">Total</div>
              </div>
              <FileText className="text-blue-500" size={40} />
            </div>
          </div>
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inquiries.filter(i => i.status === 'pending').length}</div>
                  <div className="text-gray-600">Pending</div>
                </div>
                <Clock className="text-amber-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inquiries.filter(i => i.status === 'contacted').length}</div>
                  <div className="text-gray-600">Contacted</div>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inquiries.length}</div>
                  <div className="text-gray-600">Total Inquiries</div>
                </div>
                <MessageCircle className="text-blue-500" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('applications')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'applications'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText size={20} />
                Review Applications
              </div>
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === 'inquiries'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50'
                  : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle size={20} />
                Inquire Applications
              </div>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={activeTab === 'applications' ? "Search by name, email, NIC, or program..." : "Search by name, email, phone, or program..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Status</option>
              {activeTab === 'applications' ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Applications/Inquiries List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              <p className="mt-4 text-gray-600">Loading {activeTab === 'applications' ? 'applications' : 'inquiries'}...</p>
            </div>
          ) : activeTab === 'applications' ? (
            filteredApplications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-600">No applications found</p>
              </div>
            ) : (
              filteredApplications.map((application) => (
                <div key={application.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{application.name_with_initials || application.name}</h3>
                        <p className="text-sm text-emerald-600 font-semibold">{application.programs?.name}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(application.status)}`}>
                        {application.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {application.nic && (
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span>NIC: {application.nic}</span>
                        </div>
                      )}
                      {application.date_of_birth && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>DOB: {new Date(application.date_of_birth).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{application.email}</span>
                      </div>
                      {application.mobile_number && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>{application.mobile_number}</span>
                        </div>
                      )}
                      {application.permanent_address && (
                        <div className="flex items-center gap-2 col-span-2">
                          <MapPin size={14} />
                          <span className="truncate">{application.permanent_address}</span>
                        </div>
                      )}
                      {(application.al_qualifications || application.ol_qualifications) && (
                        <div className="flex items-center gap-2 col-span-2">
                          <GraduationCap size={14} />
                          <span>Qualifications: {application.al_qualifications || application.ol_qualifications}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        <span>Applied: {new Date(application.application_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {application.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                        <div>
                          <p className="text-sm font-semibold text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{application.rejection_reason}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex md:flex-col gap-2">
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(application)}
                          disabled={processing}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Approve & Create Profile
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowRejectModal(true);
                          }}
                          disabled={processing}
                          className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowDetailsModal(true);
                      }}
                      className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText size={18} />
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
              ))
            )
          ) : (
            filteredInquiries.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-600">No inquiries found</p>
              </div>
            ) : (
              filteredInquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{inquiry.full_name}</h3>
                          {inquiry.programs?.name && (
                            <p className="text-sm text-emerald-600 font-semibold">{inquiry.programs.name}</p>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(inquiry.status)}`}>
                          {inquiry.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span>{inquiry.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>{inquiry.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>Inquired: {new Date(inquiry.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {inquiry.message && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm font-semibold text-gray-800 mb-1">Message:</p>
                          <p className="text-sm text-gray-700">{inquiry.message}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex md:flex-col gap-2">
                      {inquiry.status === 'pending' && (
                        <button
                          onClick={() => handleInquiryStatusUpdate(inquiry.id, 'contacted')}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Mark as Contacted
                        </button>
                      )}
                      {inquiry.status === 'contacted' && (
                        <button
                          onClick={() => handleInquiryStatusUpdate(inquiry.id, 'resolved')}
                          className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Mark as Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name with Initials:</span>
                        <p className="text-gray-600">{selectedApplication.name_with_initials || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">NIC:</span>
                        <p className="text-gray-600">{selectedApplication.nic || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Date of Birth:</span>
                        <p className="text-gray-600">{selectedApplication.date_of_birth ? new Date(selectedApplication.date_of_birth).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Mobile:</span>
                        <p className="text-gray-600">{selectedApplication.mobile_number || 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-gray-700">Address:</span>
                        <p className="text-gray-600">{selectedApplication.permanent_address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <p className="text-gray-600">{selectedApplication.emergency_contact_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Relationship:</span>
                        <p className="text-gray-600">{selectedApplication.emergency_contact_relationship || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Mobile:</span>
                        <p className="text-gray-600">{selectedApplication.emergency_contact_mobile || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Educational Qualifications</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">O/L Qualifications:</span>
                        <p className="text-gray-600">{selectedApplication.ol_qualifications || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">A/L Qualifications:</span>
                        <p className="text-gray-600">{selectedApplication.al_qualifications || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Other Qualifications:</span>
                        <p className="text-gray-600">{selectedApplication.other_qualifications || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Documents</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedApplication.nic_document_url && (
                        <a href={selectedApplication.nic_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          📄 NIC Document
                        </a>
                      )}
                      {selectedApplication.birth_certificate_url && (
                        <a href={selectedApplication.birth_certificate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          📄 Birth Certificate
                        </a>
                      )}
                      {selectedApplication.qualification_certificate_url && (
                        <a href={selectedApplication.qualification_certificate_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          📄 Qualification Certificates
                        </a>
                      )}
                      {selectedApplication.payment_proof_url && (
                        <a href={selectedApplication.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                          📄 Payment Proof
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reject Application</h2>
              <p className="text-gray-600 mb-4">
                Please provide a reason for rejecting <strong>{selectedApplication.name_with_initials || selectedApplication.name}</strong>'s application.
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
                    setSelectedApplication(null);
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
      </div>
    </div>
  );
}
