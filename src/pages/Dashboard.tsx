import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { InstructorDashboard } from './dashboards/InstructorDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export function Dashboard() {
  const { user, loading } = useAuth();

  console.log('🎯 Dashboard rendering - Loading:', loading, 'User:', user);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ User role:', user.role);

  // Convert role to lowercase for comparison
  const userRole = user.role?.toLowerCase();

  switch (userRole) {
    case 'student':
      console.log('➡️ Rendering StudentDashboard');
      return <StudentDashboard />;
    case 'instructor':
    case 'lecturer':
      console.log('➡️ Rendering InstructorDashboard');
      return <InstructorDashboard />;
    case 'admin':
      console.log('➡️ Rendering AdminDashboard');
      return <AdminDashboard />;
    default:
      console.log('❌ Unknown role:', user.role, '- Redirecting to login');
      return <Navigate to="/login" replace />;
  }
}
