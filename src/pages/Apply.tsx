import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { SEO } from '../components/SEO';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Hardcoded program list for inquiry form (public page)
const PROGRAMS = [
  'BSc in Computer Science',
  'BSc in Software Engineering',
  'BSc in Information Technology',
  'BSc in Data Science',
  'BSc in Cyber Security',
  'Diploma in Computer Science',
  'Diploma in Software Engineering',
  'Certificate in Web Development',
  'Certificate in Mobile App Development',
  'IBM Professional Certifications'
];

export function Apply() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    program: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/public/inquiry/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.statusCode === '000') {
        setSuccess(true);
        setFormData({ fullName: '', email: '', phoneNumber: '', program: '', message: '' });
      } else {
        throw new Error(data.message || 'Failed to submit inquiry');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <SEO 
          title="Thank You for Your Inquiry | SIPS - Steller Institute of Professional Studies"
          description="Thank you for your interest in SIPS programmes. Our admissions team will contact you shortly."
          noindex={true}
        />
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Inquiry Submitted!</h2>
          <p className="text-gray-700 mb-6">
            Thank you for your interest in <span className="font-baskerville">SIPS</span>. Our admissions team will contact you shortly to provide you with more information.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Submit Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Apply Now - Submit Your Inquiry | SIPS - Steller Institute of Professional Studies"
        description="Apply for SIPS programmes in Sri Lanka. Submit your inquiry for IBM certifications, professional certificates, and quality education programs. Join SIPS today and transform your career."
        keywords="apply SIPS, SIPS application, inquiry form, enroll SIPS, admission Sri Lanka, apply IBM certification, join SIPS, SIPS admission"
        canonical="https://www.sips.edu.lk/apply"
      />
      <section
        className="relative h-[300px] flex items-center justify-center text-white"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Inquire About Our Programmes</h1>
          <p className="text-xl">We're here to help you choose the right path</p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Inquiry Form</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="+94 XX XXX XXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Program *
              </label>
              <select
                required
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Select a program --</option>
                {PROGRAMS.map((program) => (
                  <option key={program} value={program}>
                    {program}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {loading ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={20} />
                  Submit Inquiry
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
