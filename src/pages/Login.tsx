import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


export function Login() {
  const [nic, setNic] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const { signIn, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check for session invalidation reason
  useEffect(() => {
    const reason = searchParams.get('reason');
    if (reason === 'session_invalid') {
      setError('Your session was terminated because you logged in from another device. Please login again.');
    } else if (reason === 'unauthorized') {
      setError('Your session has expired. Please login again.');
    }
  }, [searchParams]);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn({ nic: nic.trim(), password });
      // Navigation will be handled by the useEffect above when auth state changes
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid NIC or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, show redirect message
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Logged In</h2>
          <p className="text-gray-600 mb-4">
            You're logged in as <strong>{user.fullName || user.nic}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="relative h-[400px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/1370296/pexels-photo-1370296.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center max-w-4xl px-4">
          <h1 className="text-5xl font-bold mb-6">YOUR LEARNING HUB:<br />ACCESS THE LMS</h1>
          <p className="text-xl">Student, Instructor, and Admin Portal</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-emerald-900 text-white p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">LMS LOGIN</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">
                  NIC Number
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-emerald-300" size={20} />
                  <input
                    type="text"
                    name="nic"
                    autoComplete="username"
                    required
                    value={nic}
                    onChange={(e) => setNic(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter your NIC number"
                    maxLength={12}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-emerald-200 mt-1">
                  Enter your National Identity Card number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-emerald-300" size={20} />
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-emerald-100">
                    Remember Me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-amber-300 hover:text-amber-200 transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {loading ? (
                  'Logging in...'
                ) : (
                  <>
                    <LogIn size={20} />
                    LOGIN
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-emerald-200 text-sm mb-4">
                First Time User? Contact Admin for Account Activation
              </p>
              <div className="text-xs text-emerald-300 bg-emerald-800 p-3 rounded">
                <p><strong>Test Credentials:</strong></p>
                <p>Admin: 199912345678 / Admin@123</p>
                <p>Lecturer: 198001234567 / Lecturer@123</p>
                <p>Student: 200001234567 / Student@123</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">IMPORTANT LINKS</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <User className="text-emerald-700 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Course Catalog</h4>
                    <p className="text-sm text-gray-600">Browse all available courses</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <User className="text-emerald-700 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Academic Calendar</h4>
                    <p className="text-sm text-gray-600">Important dates and schedules</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <User className="text-emerald-700 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900">Technical Support</h4>
                    <p className="text-sm text-gray-600">Get help with LMS access</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-100 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Having trouble?</h3>
              <button className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Contact IT Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
