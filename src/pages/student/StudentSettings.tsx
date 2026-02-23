import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Check, X, KeyRound } from 'lucide-react';
import { studentProgramService } from '../../services/studentProgramService';

export function StudentSettings() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false, type: 'success', message: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => setNotification({ show: false, type: 'success', message: '' }), 4000);
  };

  const requirements = [
    { label: 'At least 8 characters',      met: form.newPassword.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(form.newPassword) },
    { label: 'At least one number',          met: /[0-9]/.test(form.newPassword) },
    { label: 'Passwords match',              met: form.newPassword.length > 0 && form.newPassword === form.confirmPassword },
  ];

  const allMet = requirements.every(r => r.met);
  const hasInput = form.currentPassword.length > 0 && form.newPassword.length > 0 && form.confirmPassword.length > 0;

  const handleChangePassword = async () => {
    if (!form.currentPassword.trim()) {
      showNotification('error', 'Please enter your current password');
      return;
    }
    if (!allMet) {
      showNotification('error', 'Please meet all password requirements before saving');
      return;
    }
    setSaving(true);
    try {
      const res = await studentProgramService.changeStudentPassword(form.currentPassword, form.newPassword);
      if (res.success) {
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showNotification('success', 'Password changed successfully!');
      } else {
        showNotification('error', res.message || 'Failed to change password');
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const PasswordField = ({
    label, value, fieldKey, visible, hint
  }: {
    label: string; value: string; fieldKey: 'currentPassword' | 'newPassword' | 'confirmPassword';
    visible: boolean; hint?: string;
  }) => {
    const showKey = fieldKey === 'currentPassword' ? 'current' : fieldKey === 'newPassword' ? 'new' : 'confirm';
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <KeyRound size={16} className="text-emerald-500" />
          </div>
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={e => setForm(f => ({ ...f, [fieldKey]: e.target.value }))}
            placeholder={`Enter ${label.toLowerCase()}`}
            className="w-full pl-10 pr-12 py-2.5 border border-emerald-300 rounded-lg text-sm bg-white
              focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          />
          <button
            type="button"
            onClick={() => setShow(s => ({ ...s, [showKey]: !s[showKey as keyof typeof s] }))}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      </div>
    );
  };

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-emerald-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40">
              <Lock size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-emerald-100 text-sm mt-0.5">Manage your account security preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Quick nav to profile */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 text-sm">View / Edit Profile</p>
            <p className="text-xs text-gray-500 mt-0.5">Update your personal and contact information</p>
          </div>
          <button
            onClick={() => navigate('/student/profile')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Go to Profile →
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Shield size={18} className="text-emerald-600" />
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Change Password</h2>
          </div>

          <div className="p-6 space-y-5">
            <PasswordField
              label="Current Password"
              value={form.currentPassword}
              fieldKey="currentPassword"
              visible={show.current}
              hint="Enter the password you currently use to sign in"
            />

            <div className="border-t border-dashed border-gray-200 pt-5 space-y-5">
              <PasswordField
                label="New Password"
                value={form.newPassword}
                fieldKey="newPassword"
                visible={show.new}
              />
              <PasswordField
                label="Confirm New Password"
                value={form.confirmPassword}
                fieldKey="confirmPassword"
                visible={show.confirm}
              />
            </div>

            {/* Requirements checker */}
            {(form.newPassword.length > 0 || form.confirmPassword.length > 0) && (
              <div className="bg-gray-50 rounded-lg px-4 py-4 border border-gray-200 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Password requirements</p>
                {requirements.map(r => (
                  <div key={r.label} className={`flex items-center gap-2 text-sm ${r.met ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {r.met
                      ? <Check size={14} className="text-emerald-500 flex-shrink-0" />
                      : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    }
                    {r.label}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={handleChangePassword}
                disabled={saving || !hasInput}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-60
                  ${allMet && hasInput
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {saving
                  ? <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block" />
                  : <Lock size={16} />
                }
                {saving ? 'Changing…' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 px-6 py-5">
          <p className="text-sm font-semibold text-emerald-800 mb-2">🔒 Password Tips</p>
          <ul className="text-xs text-emerald-700 space-y-1 list-disc list-inside">
            <li>Use a combination of letters, numbers, and symbols</li>
            <li>Avoid using personal information like your name or NIC</li>
            <li>Don't reuse passwords from other websites</li>
            <li>Consider using a passphrase for easier memorability</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
