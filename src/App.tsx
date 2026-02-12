import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingInquireButton } from './components/FloatingInquireButton';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { TestEncryption } from './components/TestEncryption';
import { Home } from './pages/Home';
import { Programmes } from './pages/Programmes';
import { Blog } from './pages/Blog';
import { About } from './pages/About';
import { Apply } from './pages/Apply';
import Register from './pages/Register';
import { Login } from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import { FirstTimePasswordChange } from './pages/FirstTimePasswordChange';
import { Dashboard } from './pages/Dashboard';
import { ManageStudents } from './pages/admin/ManageStudents';
import { ManageCourses } from './pages/admin/ManageCourses';
import { ReviewApplications } from './pages/admin/ReviewApplications';
import { VerifyPayments } from './pages/admin/VerifyPayments';
import { ModuleManagement } from './pages/admin/ModuleManagement';
import IntakeManagement from './pages/admin/IntakeManagement';
import { AssignmentManagement } from './pages/admin/AssignmentManagement';
import { ExamManagement } from './pages/admin/ExamManagement';
import { MarksManagement } from './pages/admin/MarksManagement';
import { LecturerManagement } from './pages/admin/LecturerManagement';
import { AdminLectureMaterialManagement } from './pages/admin/AdminLectureMaterialManagement';
import { ManageAcademicStructure } from './pages/admin/ManageAcademicStructure';
import ReviewInquiries from './pages/admin/ReviewInquiries';
import { StudentModules } from './pages/dashboards/StudentModules';
import { StudentResults } from './pages/dashboards/StudentResults';
import { StudentExamSchedule } from './pages/dashboards/StudentExamSchedule';
import { StudentPayments } from './pages/dashboards/StudentPayments';
import { LecturerAssignmentManagement } from './pages/lecturer/LecturerAssignmentManagement';
import { LecturerMaterialManagement } from './pages/lecturer/LecturerMaterialManagement';
import { LecturerExamManagement } from './pages/lecturer/LecturerExamManagement';
import { LecturerMarksManagement } from './pages/lecturer/LecturerMarksManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/programmes" element={<PublicLayout><Programmes /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/apply" element={<PublicLayout><Apply /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/forgot-password" element={<PublicLayout><ForgotPassword /></PublicLayout>} />
          <Route path="/first-time-password-change" element={<PublicLayout><FirstTimePasswordChange /></PublicLayout>} />
          <Route path="/test" element={<PublicLayout><TestEncryption /></PublicLayout>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student/modules" element={<StudentModules />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/exam-schedule" element={<StudentExamSchedule />} />
          <Route path="/student/payments" element={<StudentPayments />} />
          <Route path="/lecturer/assignments" element={<LecturerAssignmentManagement />} />
          <Route path="/lecturer/materials" element={<LecturerMaterialManagement />} />
          <Route path="/lecturer/exams" element={<LecturerExamManagement />} />
          <Route path="/lecturer/marks-management" element={<LecturerMarksManagement />} />
          <Route path="/admin/manage-students" element={<ManageStudents />} />
          <Route path="/admin/manage-courses" element={<ManageCourses />} />
          <Route path="/admin/academic-structure" element={<ManageAcademicStructure />} />
          <Route path="/admin/review-applications" element={<ReviewApplications />} />
          <Route path="/admin/review-inquiries" element={<ReviewInquiries />} />
          <Route path="/admin/verify-payments" element={<VerifyPayments />} />
          <Route path="/admin/module-management" element={<ModuleManagement />} />
          <Route path="/admin/intake-management" element={<IntakeManagement />} />
          <Route path="/admin/assignment-management" element={<AssignmentManagement />} />
          <Route path="/admin/exams" element={<ExamManagement />} />
          <Route path="/admin/marks-management" element={<MarksManagement />} />
          <Route path="/admin/lecturer-management" element={<LecturerManagement />} />
          <Route path="/admin/lecture-material-management" element={<AdminLectureMaterialManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingInquireButton />
      <FloatingWhatsAppButton />
    </div>
  );
}

export default App;
