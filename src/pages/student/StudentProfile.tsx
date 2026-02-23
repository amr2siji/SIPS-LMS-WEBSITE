import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Mail, Phone, MapPin, BookOpen, Edit3, Save,
  X, Check, Shield, Heart, GraduationCap, AlertCircle
} from 'lucide-react';
import {
  studentProgramService,
  StudentProfileData,
  StudentProfileUpdateRequest
} from '../../services/studentProgramService';

export function StudentProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false, type: 'success', message: ''
  });

  const [form, setForm] = useState<StudentProfileUpdateRequest>({
    fullName: '',
    nameWithInitials: '',
    dateOfBirth: '',
    mobileNumber: '',
    email: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyRelationship: '',
    emergencyContactMobile: '',
    olQualifications: '',
    alQualifications: '',
    otherQualifications: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await studentProgramService.getStudentProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        populateForm(res.data);
      } else {
        showNotification('error', res.message || 'Failed to load profile');
      }
    } catch (err: any) {
      console.error('StudentProfile loadProfile error:', err);
      showNotification('error', err?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // dateOfBirth may arrive as "2001-02-24" (string) or [2001,2,24] (array) depending on server config
  const parseDateOfBirth = (dob: any): string => {
    if (!dob) return '';
    if (Array.isArray(dob)) {
      // Java LocalDate serialized as [year, month, day]
      const [y, m, d] = dob as number[];
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    if (typeof dob === 'string') return dob.split('T')[0];
    return '';
  };

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

  const populateForm = (d: StudentProfileData) => {
    setForm({
      fullName: d.fullName || '',
      nameWithInitials: d.nameWithInitials || '',
      dateOfBirth: parseDateOfBirth((d as any).dateOfBirth),
      mobileNumber: d.mobileNumber || '',
      email: d.email || '',
      permanentAddress: d.permanentAddress || '',
      emergencyContactName: d.emergencyContactName || '',
      emergencyRelationship: d.emergencyRelationship || '',
      emergencyContactMobile: d.emergencyContactMobile || '',
      olQualifications: d.olQualifications || '',
      alQualifications: d.alQualifications || '',
      otherQualifications: d.otherQualifications || '',
    });
  };

  const handleSave = async () => {
    if (!form.fullName?.trim() || !form.email?.trim()) {
      showNotification('error', 'Full name and email are required');
      return;
    }
    setSaving(true);
    try {
      const res = await studentProgramService.updateStudentProfile(form);
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
    if (profile) populateForm(profile);
    setEditing(false);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: 'success', message: '' }), 4000);
  };

  const InputField = ({
    label, value, onChange, disabled = false, type = 'text', icon: Icon, placeholder = '', hint = ''
  }: {
    label: string; value: string; onChange?: (v: string) => void;
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

  const TextAreaField = ({
    label, value, onChange, placeholder = '', rows = 3
  }: {
    label: string; value: string; onChange?: (v: string) => void; placeholder?: string; rows?: number;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={e => onChange && onChange(e.target.value)}
        disabled={!editing}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 border rounded-lg text-sm transition-colors resize-none
          ${editing
            ? 'bg-white border-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
            : 'bg-gray-50 border-gray-200 text-gray-700'
          }`}
      />
    </div>
  );

  const statusLabel = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      ACTIVE:      { color: 'bg-emerald-50 text-emerald-700', label: 'Active' },
      INACTIVE:    { color: 'bg-gray-100 text-gray-600',      label: 'Inactive' },
      GRADUATED:   { color: 'bg-blue-50 text-blue-700',       label: 'Graduated' },
      DROPPED_OUT: { color: 'bg-red-50 text-red-700',         label: 'Dropped Out' },
      SUSPENDED:   { color: 'bg-yellow-50 text-yellow-700',   label: 'Suspended' },
    };
    return map[status] || { color: 'bg-gray-100 text-gray-600', label: status };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-white
          ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {profile ? profile.fullName : 'My Profile'}
                </h1>
                <p className="text-emerald-100 text-sm mt-0.5">Student · {profile?.nic}</p>
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
                      {saving
                        ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-700 inline-block" />
                        : <Save size={16} />
                      }
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
          <div className="flex justify-center items-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Edit mode banner */}
            {editing && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-3 text-emerald-800 text-sm">
                <Edit3 size={16} className="text-emerald-600 flex-shrink-0" />
                You're in edit mode. Make your changes and click <strong className="ml-1">Save Changes</strong> when done.
              </div>
            )}

            {/* Identity — NIC locked */}
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
                  {profile?.studentStatus && (
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mt-0.5 ${statusLabel(profile.studentStatus).color}`}>
                      <div className={`w-2 h-2 rounded-full ${profile.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {statusLabel(profile.studentStatus).label}
                    </div>
                  )}
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
                <div className="md:col-span-2">
                  <InputField
                    label="Full Name *"
                    value={form.fullName || ''}
                    onChange={v => setForm(f => ({ ...f, fullName: v }))}
                    icon={User}
                    placeholder="Full name as per NIC"
                  />
                </div>
                <InputField
                  label="Name with Initials *"
                  value={form.nameWithInitials || ''}
                  onChange={v => setForm(f => ({ ...f, nameWithInitials: v }))}
                  icon={User}
                  placeholder="e.g. A.B. Perera"
                />
                <InputField
                  label="Date of Birth"
                  value={form.dateOfBirth || ''}
                  onChange={v => setForm(f => ({ ...f, dateOfBirth: v }))}
                  icon={BookOpen}
                  type="date"
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
                  value={form.email || ''}
                  onChange={v => setForm(f => ({ ...f, email: v }))}
                  icon={Mail}
                  type="email"
                  placeholder="your@email.com"
                />
                <InputField
                  label="Mobile Number"
                  value={form.mobileNumber || ''}
                  onChange={v => setForm(f => ({ ...f, mobileNumber: v }))}
                  icon={Phone}
                  type="tel"
                  placeholder="+94771234567"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Permanent Address"
                    value={form.permanentAddress || ''}
                    onChange={v => setForm(f => ({ ...f, permanentAddress: v }))}
                    icon={MapPin}
                    placeholder="Your permanent residential address"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Heart size={18} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Emergency Contact</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <InputField
                  label="Contact Name"
                  value={form.emergencyContactName || ''}
                  onChange={v => setForm(f => ({ ...f, emergencyContactName: v }))}
                  icon={User}
                  placeholder="Full name"
                />
                <InputField
                  label="Relationship"
                  value={form.emergencyRelationship || ''}
                  onChange={v => setForm(f => ({ ...f, emergencyRelationship: v }))}
                  icon={Heart}
                  placeholder="e.g. Parent, Sibling"
                />
                <InputField
                  label="Contact Mobile"
                  value={form.emergencyContactMobile || ''}
                  onChange={v => setForm(f => ({ ...f, emergencyContactMobile: v }))}
                  icon={Phone}
                  type="tel"
                  placeholder="+94771234567"
                />
              </div>
            </div>

            {/* Educational Qualifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <GraduationCap size={18} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Educational Qualifications</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
                <TextAreaField
                  label="O/L Qualifications"
                  value={form.olQualifications || ''}
                  onChange={v => setForm(f => ({ ...f, olQualifications: v }))}
                  placeholder="List your O/L results"
                />
                <TextAreaField
                  label="A/L Qualifications"
                  value={form.alQualifications || ''}
                  onChange={v => setForm(f => ({ ...f, alQualifications: v }))}
                  placeholder="List your A/L results"
                />
                <TextAreaField
                  label="Other Qualifications"
                  value={form.otherQualifications || ''}
                  onChange={v => setForm(f => ({ ...f, otherQualifications: v }))}
                  placeholder="Diplomas, certificates, etc."
                />
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

            {/* Bottom actions */}
            {editing ? (
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
                  {saving
                    ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block" />
                    : <Save size={16} />
                  }
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">Password & Security</p>
                  <p className="text-xs text-gray-500 mt-0.5">Change your password or manage security settings</p>
                </div>
                <button
                  onClick={() => navigate('/student/settings')}
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
