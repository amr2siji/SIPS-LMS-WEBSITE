import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';


export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();

  // Navigate to dashboard after successful login (user and profile are set)
  // Only run after login attempt
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  // Watch for user/profile to be set after login
  useEffect(() => {
    if (loginAttempted && user && profile) {
      navigate('/dashboard');
    }
  }, [user, profile, loginAttempted, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoginAttempted(false);
    try {
      await signIn(email, password);
      setLoginAttempted(true);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-3xl font-bold mb-6">STUDENT LOGIN</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">
                  Username (Student ID)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-emerald-300" size={20} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-emerald-100 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-emerald-300" size={20} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

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
                First Time User? Activate Your Account
              </p>
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
