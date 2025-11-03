import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { InstructorDashboard } from './dashboards/InstructorDashboard';
import { AdminDashboard } from './dashboards/AdminDashboard';

export function Dashboard() {
  const { profile, loading } = useAuth();

  console.log('🎯 Dashboard rendering - Loading:', loading, 'Profile:', profile);

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

  if (!profile) {
    console.log('❌ No profile found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ Profile role:', profile.role);

  switch (profile.role) {
    case 'student':
      console.log('➡️ Rendering StudentDashboard');
      return <StudentDashboard />;
    case 'instructor':
      console.log('➡️ Rendering InstructorDashboard');
      return <InstructorDashboard />;
    case 'admin':
      console.log('➡️ Rendering AdminDashboard');
      return <AdminDashboard />;
    default:
      console.log('❌ Unknown role:', profile.role, '- Redirecting to login');
      return <Navigate to="/login" replace />;
  }
}
