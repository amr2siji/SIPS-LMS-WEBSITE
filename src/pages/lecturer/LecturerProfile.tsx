import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, GraduationCap, Briefcase,
  Edit3, Save, X, Check, BookOpen, Shield
} from 'lucide-react';
import { lecturerService, LecturerResponse } from '../../services/lecturerService';

export function LecturerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LecturerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false, type: 'success', message: ''
  });

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    residentialAddress: '',
    highestQualification: '',
    academicExperienceYears: 0,
    industryExperienceYears: 0,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  // createdAt/updatedAt may arrive as "2026-02-09T11:59:08" (string) or
  // [2026,2,9,11,59,8,810683000] (array: year,month,day,hour,minute,second,nano) in local dev
  const parseDateTime = (dt: any): string => {
    if (!dt) return '—';
    if (Array.isArray(dt)) {
      const [y, mo, d, h, mi, s] = dt as number[];
      // month is 1-based from Java, Date expects 0-based
      return new Date(y, mo - 1, d, h, mi, s).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    }
    if (typeof dt === 'string') {
      return new Date(dt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    }
    return '—';
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await lecturerService.getLecturerProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        const d = res.data;
        // Strip +94 prefix for display in contact number field
        let contact = d.contactNumber || '';
        if (contact.startsWith('+94')) contact = contact.substring(3);
        setForm({
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          email: d.email || '',
          contactNumber: contact,
          residentialAddress: d.residentialAddress || '',
          highestQualification: d.highestQualification || '',
          academicExperienceYears: d.academicExperienceYears || 0,
          industryExperienceYears: d.industryExperienceYears || 0,
        });
      }
    } catch {
      showNotification('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      showNotification('error', 'First name, last name and email are required');
      return;
    }

    setSaving(true);
    try {
      // Add +94 prefix if not present
      const contactNumber = form.contactNumber
        ? form.contactNumber.startsWith('+94')
          ? form.contactNumber
          : `+94${form.contactNumber}`
        : '';

      const res = await lecturerService.updateLecturerProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        contactNumber,
        residentialAddress: form.residentialAddress,
        highestQualification: form.highestQualification,
        academicExperienceYears: form.academicExperienceYears,
        industryExperienceYears: form.industryExperienceYears,
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setEditing(false);
        showNotification('success', 'Profile updated successfully');
      } else {
        showNotification('error', res.message || 'Failed to update profile');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      let contact = profile.contactNumber || '';
      if (contact.startsWith('+94')) contact = contact.substring(3);
      setForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        contactNumber: contact,
        residentialAddress: profile.residentialAddress || '',
        highestQualification: profile.highestQualification || '',
        academicExperienceYears: profile.academicExperienceYears || 0,
        industryExperienceYears: profile.industryExperienceYears || 0,
      });
    }
    setEditing(false);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: 'success', message: '' }), 4000);
  };

  const InputField = ({
    label, value, onChange, disabled = false, type = 'text', icon: Icon, placeholder = '', hint = ''
  }: {
    label: string; value: string | number; onChange?: (v: string) => void;
    disabled?: boolean; type?: string; icon: any; placeholder?: string; hint?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={16} className={disabled ? 'text-gray-400' : 'text-emerald-500'} />
        </div>
        <input
          type={type}
          value={value}
          onChange={e => onChange && onChange(e.target.value)}
          disabled={disabled || !editing}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors
            ${disabled
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200'
              : editing
                ? 'bg-white border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-white
          ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <Check size={18} /> : <X size={18} />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 via-emerald-600 to-slate-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-emerald-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {profile ? `${profile.firstName} ${profile.lastName}` : 'My Profile'}
                </h1>
                <p className="text-emerald-100 text-sm mt-0.5">Lecturer · {profile?.nic}</p>
              </div>
            </div>
            {!loading && (
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm border border-white/20 transition-colors"
                    >
                      <X size={16} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {saving ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700 inline-block" />
                      ) : (
                        <Save size={16} />
                      )}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Banner */}
            {editing && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-3 text-emerald-800 text-sm">
                <Edit3 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>You're in edit mode. Make your changes and click <strong>Save Changes</strong> when done.</span>
              </div>
            )}

            {/* Identity Card — NIC locked */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Shield size={18} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Identity (Read-Only)</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIC (Primary Key)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profile?.nic || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">NIC cannot be changed — it is your unique identifier.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mt-0.5
                    ${profile?.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    <div className={`w-2 h-2 rounded-full ${profile?.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <User size={18} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Personal Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="First Name *"
                  value={form.firstName}
                  onChange={v => setForm(f => ({ ...f, firstName: v }))}
                  icon={User}
                  placeholder="First name"
                />
                <InputField
                  label="Last Name *"
                  value={form.lastName}
                  onChange={v => setForm(f => ({ ...f, lastName: v }))}
                  icon={User}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Phone size={18} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label="Email Address *"
                  value={form.email}
                  onChange={v => setForm(f => ({ ...f, email: v }))}
                  icon={Mail}
                  type="email"
                  placeholder="your@email.com"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <div className="relative flex">
                    <span className={`inline-flex items-center px-3 rounded-l-lg border border-r-0 text-sm
                      ${editing ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                      +94
                    </span>
                    <input
                      type="tel"
                      value={form.contactNumber}
                      onChange={e => setForm(f => ({ ...f, contactNumber: e.target.value }))}
                      disabled={!editing}
                      placeholder="771234567"
                      className={`flex-1 px-3 py-2.5 border rounded-r-lg text-sm transition-colors
                        ${editing
                          ? 'bg-white border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <InputField
                    label="Residential Address"
                    value={form.residentialAddress}
                    onChange={v => setForm(f => ({ ...f, residentialAddress: v }))}
                    icon={MapPin}
                    placeholder="Your residential address"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <GraduationCap size={18} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Academic Information</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-3">
                  <InputField
                    label="Highest Qualification"
                    value={form.highestQualification}
                    onChange={v => setForm(f => ({ ...f, highestQualification: v }))}
                    icon={GraduationCap}
                    placeholder="e.g. PhD in Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Experience (years)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen size={16} className={editing ? 'text-emerald-500' : 'text-gray-400'} />
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={form.academicExperienceYears}
                      onChange={e => setForm(f => ({ ...f, academicExperienceYears: parseInt(e.target.value) || 0 }))}
                      disabled={!editing}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors
                        ${editing
                          ? 'bg-white border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry Experience (years)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase size={16} className={editing ? 'text-emerald-500' : 'text-gray-400'} />
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={form.industryExperienceYears}
                      onChange={e => setForm(f => ({ ...f, industryExperienceYears: parseInt(e.target.value) || 0 }))}
                      disabled={!editing}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors
                        ${editing
                          ? 'bg-white border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <div className="bg-emerald-50 rounded-lg px-4 py-2.5 border border-emerald-100 w-full text-center">
                    <p className="text-xs text-emerald-600 font-medium">Total Experience</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {(form.academicExperienceYears || 0) + (form.industryExperienceYears || 0)}
                    </p>
                    <p className="text-xs text-emerald-500">years combined</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Shield size={18} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Account Details</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-gray-600">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Account Created</p>
                  <p className="font-medium text-gray-800">
                    {parseDateTime(profile?.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Last Updated</p>
                  <p className="font-medium text-gray-800">
                    {parseDateTime(profile?.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action row at bottom */}
            {editing && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {saving ? (
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Settings shortcut */}
            {!editing && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">Password & Security</p>
                  <p className="text-xs text-gray-500 mt-0.5">Change your password or manage security settings</p>
                </div>
                <button
                  onClick={() => navigate('/lecturer/settings')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Go to Settings →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
