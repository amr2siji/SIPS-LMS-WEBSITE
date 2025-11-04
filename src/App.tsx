import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FloatingInquireButton } from './components/FloatingInquireButton';
import { Home } from './pages/Home';
import { Programmes } from './pages/Programmes';
import { Blog } from './pages/Blog';
import { About } from './pages/About';
import { Apply } from './pages/Apply';
import Register from './pages/Register';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { SetupTestUsers } from './pages/SetupTestUsers';
import { ManageStudents } from './pages/admin/ManageStudents';
import { ManageCourses } from './pages/admin/ManageCourses';
import { ReviewApplications } from './pages/admin/ReviewApplications';
import { VerifyPayments } from './pages/admin/VerifyPayments';
import { ModuleManagement } from './pages/admin/ModuleManagement';
import { AssignmentManagement } from './pages/admin/AssignmentManagement';
import { ExamManagement } from './pages/admin/ExamManagement';
import { MarksManagement } from './pages/admin/MarksManagement';
import { LecturerManagement } from './pages/admin/LecturerManagement';
import { LectureMaterialManagement } from './pages/admin/LectureMaterialManagement';
import { StudentModules } from './pages/dashboards/StudentModules';
import { StudentResults } from './pages/dashboards/StudentResults';
import { StudentExamSchedule } from './pages/dashboards/StudentExamSchedule';
import { StudentPayments } from './pages/dashboards/StudentPayments';

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
          <Route path="/setup-test-users" element={<SetupTestUsers />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/student/modules" element={<StudentModules />} />
          <Route path="/student/results" element={<StudentResults />} />
          <Route path="/student/exam-schedule" element={<StudentExamSchedule />} />
          <Route path="/student/payments" element={<StudentPayments />} />
          <Route path="/admin/manage-students" element={<ManageStudents />} />
          <Route path="/admin/manage-courses" element={<ManageCourses />} />
          <Route path="/admin/review-applications" element={<ReviewApplications />} />
          <Route path="/admin/verify-payments" element={<VerifyPayments />} />
          <Route path="/admin/module-management" element={<ModuleManagement />} />
          <Route path="/admin/assignment-management" element={<AssignmentManagement />} />
          <Route path="/admin/exam-management" element={<ExamManagement />} />
          <Route path="/admin/marks-management" element={<MarksManagement />} />
          <Route path="/admin/lecturer-management" element={<LecturerManagement />} />
          <Route path="/admin/lecture-material-management" element={<LectureMaterialManagement />} />
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
    </div>
  );
}

export default App;
