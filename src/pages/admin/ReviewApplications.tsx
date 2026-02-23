import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, FileText, Mail, Phone, User, Calendar, GraduationCap, MessageCircle, Eye, X, Download, FileSpreadsheet } from 'lucide-react';
import { inquiryService } from '../../services/inquiryService';
import { studentApplicationService, StudentApplication, ApplicationStatistics, DetailedStudentApplication } from '../../services/studentApplicationService';

// Use StudentApplication interface from service
interface Application extends StudentApplication {
  // Keep for backward compatibility with existing code
}

interface Inquiry {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  program: string;
  message: string | null;
  status: 'PENDING' | 'CONTACTED' | 'RESOLVED' | 'SPAM';
  contactedBy?: string;
  contactedAt?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export function ReviewApplications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'applications' | 'inquiries'>('applications');
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationStats, setApplicationStats] = useState<ApplicationStatistics>({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    enrolled: 0
  });
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryStats, setInquiryStats] = useState({
    total: 0,
    pending: 0,
    contacted: 0,
    resolved: 0,
    spam: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [detailedApplication, setDetailedApplication] = useState<DetailedStudentApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  // Removed unused totalElements state variable
  // const [totalElements, setTotalElements] = useState(0);

  // ---- Excel Export State ----
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(firstOfMonth);
  const [exportEndDate, setExportEndDate] = useState(today);
  const [exportStatusFilter, setExportStatusFilter] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications();
    } else {
      loadInquiries();
    }
  }, [activeTab, searchTerm, filterStatus, currentPage]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading applications with filters:', { 
        status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
        search: searchTerm,
        page: currentPage,
        size: 10
      });
      
      // Load applications with pagination and filtering
      const result = await studentApplicationService.getApplications({
        status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
        search: searchTerm,
        page: currentPage,
        size: 10
      });

      console.log('✅ Applications loaded successfully:', result);

      // Map to local Application interface
      setApplications(result.content as Application[]);
      setTotalPages(result.totalPages);
      // setTotalElements(result.totalElements); // Not currently used
      
      // Load statistics
      console.log('🔄 Loading application statistics...');
      const stats = await studentApplicationService.getStatistics();
      console.log('✅ Statistics loaded successfully:', stats);
      setApplicationStats(stats);
      
    } catch (error) {
      console.error('❌ Error loading applications:', error);
      alert('Failed to load applications. Please check if the backend server is running on localhost:8080 and you are properly authenticated.');
    } finally {
      setLoading(false);
    }
  };

  const loadInquiries = async () => {
    try {
      setLoading(true);
      
      // Load inquiries with pagination
      const result = await inquiryService.getInquiries({
        search: searchTerm,
        status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
        page: currentPage,
        size: 10
      });

      if (result.success && result.data) {
        const mappedInquiries: Inquiry[] = result.data.content.map((inquiry: any) => ({
          id: inquiry.id,
          fullName: inquiry.fullName,
          email: inquiry.email,
          phoneNumber: inquiry.phoneNumber,
          program: inquiry.program,
          message: inquiry.message,
          status: inquiry.status,
          contactedBy: inquiry.contactedBy,
          contactedAt: inquiry.contactedAt,
          adminNotes: inquiry.adminNotes,
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.updatedAt
        }));
        
        setInquiries(mappedInquiries);
        setTotalPages(result.data.totalPages);
      }
      
      // Load statistics
      const statsResult = await inquiryService.getStatistics();
      if (statsResult.success && statsResult.data) {
        setInquiryStats({
          total: statsResult.data.totalInquiries,
          pending: statsResult.data.pendingInquiries,
          contacted: statsResult.data.contactedInquiries,
          resolved: statsResult.data.resolvedInquiries,
          spam: statsResult.data.spamInquiries
        });
      }
    } catch (error) {
      console.error('Error loading inquiries:', error);
      alert('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  // ---- Excel Export Handler ----
  const handleExportExcel = async () => {
    if (!exportStartDate || !exportEndDate) {
      setExportMessage({ type: 'error', text: 'Please select both start and end dates.' });
      return;
    }
    if (exportStartDate > exportEndDate) {
      setExportMessage({ type: 'error', text: 'Start date must be before or equal to end date.' });
      return;
    }

    setExportLoading(true);
    setExportMessage(null);

    const statusParam = exportStatusFilter === 'all' ? undefined : exportStatusFilter;

    let result;
    if (activeTab === 'applications') {
      result = await studentApplicationService.exportApplicationsToExcel({
        startDate: exportStartDate,
        endDate: exportEndDate,
        status: statusParam
      });
    } else {
      result = await inquiryService.exportInquiriesToExcel({
        startDate: exportStartDate,
        endDate: exportEndDate,
        status: statusParam
      });
    }

    setExportLoading(false);
    if (result.success) {
      setExportMessage({ type: 'success', text: 'Report downloaded successfully!' });
      setTimeout(() => {
        setShowExportModal(false);
        setExportMessage(null);
      }, 1500);
    } else {
      setExportMessage({ type: 'error', text: result.message || 'Export failed. Please try again.' });
    }
  };

  const handleInquiryStatusUpdate = async (inquiryId: number, newStatus: 'PENDING' | 'CONTACTED' | 'RESOLVED' | 'SPAM', adminNotes?: string) => {
    try {
      setProcessing(true);
      
      const result = await inquiryService.updateInquiryStatus(inquiryId, newStatus, adminNotes);

      if (result.success) {
        // Refresh the inquiry list to reflect the status change
        await loadInquiries();
        setSuccessMessage(`Inquiry status updated to ${newStatus.toLowerCase()}`);
        setShowSuccessModal(true);
      } else {
        alert('Failed to update inquiry status');
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Failed to update inquiry status');
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusUpdate = async (application: Application, newStatus: string, notes?: string) => {
    setProcessing(true);
    console.log(`🔄 Updating application ${application.id} status to ${newStatus}`);
    
    try {
      const result = await studentApplicationService.updateApplicationStatus(application.id, {
        status: newStatus as any,
        adminNotes: notes
      });

      if (result.success) {
        console.log('✅ Status updated successfully:', result);
        setSuccessMessage(result.message);
        setShowSuccessModal(true);
        loadApplications(); // Reload data
      } else {
        console.error('❌ Status update failed:', result);
        alert(`Failed to update status: ${result.message}`);
      }
    } catch (error: any) {
      console.error('❌ Error updating application:', error);
      alert('Failed to update application status. Please check your connection and authentication.');
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async (application: Application) => {
    setSelectedApplication(application);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedApplication) return;
    
    setProcessing(true);
    try {
      const result = await studentApplicationService.updateApplicationStatus(selectedApplication.id, {
        status: 'APPROVED',
        adminNotes: 'Application approved for enrollment'
      });

      if (result.success) {
        console.log('✅ Application approved successfully:', result);
        setSuccessMessage(
          `Application approved successfully! Student "${selectedApplication.studentName}" is now ready for enrollment. Please go to "Manage Students" to assign programs and complete the enrollment process.`
        );
        setShowSuccessModal(true);
        loadApplications(); // Reload data
      } else {
        console.error('❌ Approval failed:', result);
        alert(`Failed to approve application: ${result.message}`);
      }
    } catch (error: any) {
      console.error('❌ Error approving application:', error);
      alert('Failed to approve application. Please check your connection and authentication.');
    } finally {
      setProcessing(false);
      setShowApproveModal(false);
      setSelectedApplication(null);
    }
  };

  const handleMarkUnderReview = async (application: Application) => {
    await handleStatusUpdate(application, 'UNDER_REVIEW', 'Application is now under review');
  };

  const handleEnroll = async (application: Application) => {
    if (!confirm(`Enroll ${application.studentName}? This will complete the enrollment process.`)) {
      return;
    }
    await handleStatusUpdate(application, 'ENROLLED', 'Student has been enrolled successfully');
  };

  const handleReject = async () => {
    if (!selectedApplication || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const result = await studentApplicationService.updateApplicationStatus(selectedApplication.id, {
        status: 'REJECTED',
        adminNotes: rejectionReason
      });

      if (result.success) {
        setSuccessMessage('Application rejected successfully');
        setShowSuccessModal(true);
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedApplication(null);
        loadApplications();
      } else {
        alert(`Failed to reject application: ${result.message}`);
      }
    } catch (error: any) {
      console.error('Error rejecting application:', error);
      alert('Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewDetails = async (application: Application) => {
    try {
      setSelectedApplication(application);
      setLoading(true);
      console.log('Loading detailed application for ID:', application.id);
      const detailed = await studentApplicationService.getApplicationById(application.id);
      console.log('Detailed application data received:', detailed);
      setDetailedApplication(detailed);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error loading detailed application:', error);
      alert('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  // handleDeleteApplication function removed - not currently used in UI

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.programName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Fix status comparison: API returns uppercase, filter uses lowercase
    const matchesStatus = filterStatus === 'all' || app.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || inquiry.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      ENROLLED: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  const getInquiryStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
      CONTACTED: 'bg-blue-100 text-blue-800 border-blue-200',
      RESOLVED: 'bg-green-100 text-green-800 border-green-200',
      SPAM: 'bg-red-100 text-red-800 border-red-200',
    };
    return styles[status as keyof typeof styles] || styles.PENDING;
  };

  // Document handling functions with proper authorization
  const fetchAuthenticatedDocument = async (applicationId: number, documentType: string): Promise<Blob | null> => {
    try {
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
      if (!token) {
        alert('Please log in again to access documents');
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/applications/${applicationId}/documents/${documentType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          alert('Please log in again to access documents');
        } else if (response.status === 404) {
          console.warn(`Document ${documentType} not found for application ${applicationId}`);
        } else {
          console.error(`Error fetching document: ${response.status}`);
        }
        return null;
      }

      return await response.blob();
    } catch (error) {
      console.error('Error fetching authenticated document:', error);
      return null;
    }
  };

  const openDocument = async (applicationId: number, documentType: string) => {
    try {
      const blob = await fetchAuthenticatedDocument(applicationId, documentType);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      }
    } catch (error) {
      console.error('Error opening document:', error);
      alert('Failed to open document');
    }
  };

  const downloadDocument = async (applicationId: number, documentType: string, fileName: string) => {
    try {
      const blob = await fetchAuthenticatedDocument(applicationId, documentType);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}-${applicationId}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document');
    }
  };

  // Custom component for authenticated images
  const AuthenticatedImage = ({ applicationId, documentType, alt, className, onClick }: {
    applicationId: number;
    documentType: string;
    alt: string;
    className: string;
    onClick: () => void;
  }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
      const loadImage = async () => {
        const blob = await fetchAuthenticatedDocument(applicationId, documentType);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
          return () => URL.revokeObjectURL(url);
        } else {
          setImageError(true);
        }
      };
      loadImage();
    }, [applicationId, documentType]);

    if (imageError || !imageSrc) {
      return (
        <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center">
          <FileText size={24} className="text-gray-500" />
        </div>
      );
    }

    return (
      <img 
        src={imageSrc}
        alt={alt}
        className={className}
        onClick={onClick}
      />
    );
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{applicationStats.pending}</div>
                  <div className="text-gray-600">Pending</div>
                </div>
                <Clock className="text-amber-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{applicationStats.underReview}</div>
                  <div className="text-gray-600">Under Review</div>
                </div>
                <FileText className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{applicationStats.approved}</div>
                  <div className="text-gray-600">Approved</div>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{applicationStats.rejected}</div>
                  <div className="text-gray-600">Rejected</div>
                </div>
                <XCircle className="text-red-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{applicationStats.total}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <User className="text-purple-500" size={40} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inquiryStats.pending}</div>
                  <div className="text-gray-600">Pending</div>
                </div>
                <Clock className="text-amber-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inquiryStats.contacted}</div>
                  <div className="text-gray-600">Contacted</div>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inquiryStats.resolved}</div>
                  <div className="text-gray-600">Resolved</div>
                </div>
                <CheckCircle className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{inquiryStats.total}</div>
                  <div className="text-gray-600">Total Inquiries</div>
                </div>
                <MessageCircle className="text-purple-500" size={40} />
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
                  <option value="enrolled">Enrolled</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                </>
              )}
            </select>
            {/* Excel Export Button */}
            <button
              onClick={() => {
                setExportStatusFilter('all');
                setExportMessage(null);
                setShowExportModal(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
              title="Download Excel Report"
            >
              <FileSpreadsheet size={18} />
              Export Excel
            </button>
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
            <div>
              {filteredApplications.length === 0 ? (
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
                        <h3 className="text-lg font-bold text-gray-900">{application.studentName}</h3>
                        <p className="text-sm text-emerald-600 font-semibold">{application.programName}</p>
                        <p className="text-xs text-gray-500">App: {application.applicationNumber}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>NIC: {application.nic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} />
                        <span>{application.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} />
                        <span>{application.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 col-span-2">
                        <GraduationCap size={14} />
                        <span>{application.departmentName} - {application.facultyName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex md:flex-col gap-2">
                    {application.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleMarkUnderReview(application)}
                          disabled={processing}
                          className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <FileText size={18} />
                          Under Review
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
                    {application.status === 'UNDER_REVIEW' && (
                      <>
                        <button
                          onClick={() => handleApprove(application)}
                          disabled={processing}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Approve
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
                    {application.status === 'APPROVED' && (
                      <button
                        onClick={() => handleEnroll(application)}
                        disabled={processing}
                        className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <GraduationCap size={18} />
                        Enroll Student
                      </button>
                    )}
                    <button
                      onClick={() => handleViewDetails(application)}
                      className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
              ))
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
              )}
            </div>
        ) : (
            <div>
              {filteredInquiries.length === 0 ? (
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
                          <h3 className="text-lg font-bold text-gray-900">{inquiry.fullName}</h3>
                          <p className="text-sm text-emerald-600 font-semibold">{inquiry.program}</p>
                          <p className="text-xs text-gray-500">ID: {inquiry.id}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getInquiryStatusBadge(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail size={14} />
                          <span>{inquiry.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>{inquiry.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>Submitted: {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                        </div>
                        {inquiry.contactedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} />
                            <span>Contacted: {new Date(inquiry.contactedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {inquiry.message && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                            <strong>Message:</strong> {inquiry.message}
                          </p>
                        </div>
                      )}
                      
                      {inquiry.adminNotes && (
                        <div className="mb-4">
                          <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-md">
                            <strong>Admin Notes:</strong> {inquiry.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex md:flex-col gap-2">
                      {inquiry.status === 'PENDING' && (
                        <button
                          onClick={() => handleInquiryStatusUpdate(inquiry.id, 'CONTACTED')}
                          disabled={processing}
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Phone size={18} />
                          Mark Contacted
                        </button>
                      )}
                      {inquiry.status === 'CONTACTED' && (
                        <button
                          onClick={() => handleInquiryStatusUpdate(inquiry.id, 'RESOLVED')}
                          disabled={processing}
                          className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Mark Resolved
                        </button>
                      )}
                      <button
                        onClick={() => handleInquiryStatusUpdate(inquiry.id, 'SPAM')}
                        disabled={processing}
                        className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={18} />
                        Mark Spam
                      </button>
                    </div>
                  </div>
                </div>
                ))
              )}
              
              {/* Pagination for Inquiries */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Previous
                  </button>
                  <span className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Application Details Modal */}
        {detailedApplication && showDetailsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  Application Details - {detailedApplication.studentName}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailedApplication(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-800 font-medium">{detailedApplication.studentName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Name with Initials</label>
                      <p className="text-gray-800">{detailedApplication.nameWithInitials || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">NIC</label>
                      <p className="text-gray-800 font-mono">{detailedApplication.nic || selectedApplication?.nic || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Date of Birth</label>
                      <p className="text-gray-800">
                        {detailedApplication.dateOfBirth 
                          ? new Date(detailedApplication.dateOfBirth).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Not provided'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Email</label>
                      <p className="text-blue-600">{detailedApplication.email || selectedApplication?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Phone Number</label>
                      <p className="text-gray-800">{detailedApplication.phoneNumber || selectedApplication?.phoneNumber || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-600">Permanent Address</label>
                      <p className="text-gray-800">{detailedApplication.permanentAddress || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Phone size={20} />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Contact Person Name</label>
                      <p className="text-gray-800">{detailedApplication.contactName || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Relationship</label>
                      <p className="text-gray-800">{detailedApplication.relationship || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Contact Mobile Number</label>
                      <p className="text-gray-800">{detailedApplication.contactMobileNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <GraduationCap size={20} />
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Program</label>
                      <p className="text-gray-800 font-medium">{detailedApplication.programName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Department</label>
                      <p className="text-gray-800">{detailedApplication.departmentName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Faculty</label>
                      <p className="text-gray-800">{detailedApplication.facultyName}</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-600">O/L Results</label>
                      <p className="text-gray-800 bg-white p-2 rounded border">{detailedApplication.olResults || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-600">A/L Results</label>
                      <p className="text-gray-800 bg-white p-2 rounded border">{detailedApplication.alResults || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="block text-sm font-medium text-gray-600">Other Qualifications</label>
                      <p className="text-gray-800 bg-white p-2 rounded border">{detailedApplication.otherQualifications || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Documents Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Uploaded Documents
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NIC Document */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h5 className="font-medium text-gray-800 mb-3">NIC Document</h5>
                      <div className="flex items-center gap-3">
                        <AuthenticatedImage
                          applicationId={detailedApplication.id}
                          documentType="nic"
                          alt="NIC Document"
                          className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                          onClick={() => openDocument(detailedApplication.id, 'nic')}
                        />
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openDocument(detailedApplication.id, 'nic')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => downloadDocument(detailedApplication.id, 'nic', 'nic-document')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Birth Certificate */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h5 className="font-medium text-gray-800 mb-3">Birth Certificate</h5>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 bg-red-50 rounded border flex items-center justify-center">
                          <FileText size={32} className="text-red-600" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openDocument(detailedApplication.id, 'birth-certificate')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            View PDF
                          </button>
                          <button
                            onClick={() => downloadDocument(detailedApplication.id, 'birth-certificate', 'birth-certificate')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Qualification Certificates */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h5 className="font-medium text-gray-800 mb-3">Qualification Certificates</h5>
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 bg-purple-50 rounded border flex items-center justify-center">
                          <GraduationCap size={32} className="text-purple-600" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openDocument(detailedApplication.id, 'qualifications')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            View PDF
                          </button>
                          <button
                            onClick={() => downloadDocument(detailedApplication.id, 'qualifications', 'qualifications')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Payment Slip */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h5 className="font-medium text-gray-800 mb-3">Payment Slip</h5>
                      <div className="flex items-center gap-3">
                        <AuthenticatedImage
                          applicationId={detailedApplication.id}
                          documentType="payment-slip"
                          alt="Payment Slip"
                          className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                          onClick={() => openDocument(detailedApplication.id, 'payment-slip')}
                        />
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => openDocument(detailedApplication.id, 'payment-slip')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => downloadDocument(detailedApplication.id, 'payment-slip', 'payment-slip')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Application Status & Notes
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Current Status</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(detailedApplication.status)}`}>
                          {detailedApplication.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Application Date</label>
                      <p className="text-gray-800">
                        {detailedApplication.createdAt 
                          ? new Date(detailedApplication.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : selectedApplication?.createdAt 
                            ? new Date(selectedApplication.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Not available'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Application Number</label>
                      <p className="text-gray-800 font-mono">{detailedApplication.applicationNumber || selectedApplication?.applicationNumber || 'Not available'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Last Updated</label>
                      <p className="text-gray-800">
                        {detailedApplication.updatedAt 
                          ? new Date(detailedApplication.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : selectedApplication?.updatedAt 
                            ? new Date(selectedApplication.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Not available'
                        }
                      </p>
                    </div>
                    {detailedApplication.adminNotes && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600">Admin Notes</label>
                        <p className="text-gray-800 bg-white p-3 rounded border">{detailedApplication.adminNotes}</p>
                      </div>
                    )}
                    {detailedApplication.rejectionReason && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-red-600">Rejection Reason</label>
                        <p className="text-red-800 bg-red-50 p-3 rounded border border-red-200">{detailedApplication.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailedApplication(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Application Modal */}
        {showRejectModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Reject Application - {selectedApplication.studentName}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Rejection Reason *
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Please provide a reason for rejection..."
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                    setSelectedApplication(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || processing}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {processing ? 'Rejecting...' : 'Reject Application'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approve Application Modal */}
        {showApproveModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 mx-auto">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Approve Application
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Are you sure you want to approve the application for{' '}
                  <span className="font-semibold text-gray-800">{selectedApplication.studentName}</span>?
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">📋 Next Steps:</p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Application will be approved</li>
                    <li>Student will be notified via email</li>
                    <li>Go to <span className="font-semibold">Manage Students</span> to assign programs</li>
                  </ol>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedApplication(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {processing ? 'Approving...' : 'Approve Application'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Success!</h3>
                <p className="text-gray-600 mb-6 whitespace-pre-line">{successMessage}</p>
                
                {successMessage.includes('Manage Students') ? (
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => {
                        setShowSuccessModal(false);
                        navigate('/admin/manage-students');
                      }}
                      className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <GraduationCap size={20} />
                      Go to Manage Students
                    </button>
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Excel Export Modal ===== */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="bg-emerald-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet size={24} />
                  <div>
                    <h3 className="text-xl font-bold">Export to Excel</h3>
                    <p className="text-emerald-100 text-sm">
                      {activeTab === 'applications' ? 'Review Applications' : 'Inquire Applications'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowExportModal(false); setExportMessage(null); }}
                  className="text-white hover:text-emerald-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Date range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <Calendar size={14} className="inline mr-1" />
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      max={exportEndDate}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <Calendar size={14} className="inline mr-1" />
                      End Date
                    </label>
                    <input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      min={exportStartDate}
                      max={today}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Status filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Filter by Status (optional)</label>
                  <select
                    value={exportStatusFilter}
                    onChange={(e) => setExportStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    {activeTab === 'applications' ? (
                      <>
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="enrolled">Enrolled</option>
                      </>
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                        <option value="spam">Spam</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Info box */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
                  <div className="flex items-start gap-2">
                    <Download size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                      The report will include all{' '}
                      <strong>{activeTab === 'applications' ? 'applications' : 'inquiries'}</strong>
                      {' '}submitted between <strong>{exportStartDate}</strong> and <strong>{exportEndDate}</strong>
                      {exportStatusFilter !== 'all' && <span> with status <strong>{exportStatusFilter.replace('_', ' ').toUpperCase()}</strong></span>}.
                    </div>
                  </div>
                </div>

                {/* Feedback message */}
                {exportMessage && (
                  <div className={`rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2 ${
                    exportMessage.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {exportMessage.type === 'success'
                      ? <CheckCircle size={16} />
                      : <XCircle size={16} />}
                    {exportMessage.text}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 flex justify-end gap-3">
                <button
                  onClick={() => { setShowExportModal(false); setExportMessage(null); }}
                  className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exportLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  {exportLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download Excel
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ReviewApplications;
