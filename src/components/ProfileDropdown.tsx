import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Edit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    newMobileOtp: '',
    newEmailOtp: '',
  });
  const [otpRequested, setOtpRequested] = useState<{ mobile: boolean; email: boolean }>({ mobile: false, email: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { user, logout, updateUser } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openProfileModal = () => {
    setForm({
      username: user?.username || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
      password: '',
      newMobileOtp: '',
      newEmailOtp: '',
    });
    setOtpRequested({ mobile: false, email: false });
    setIsProfileModalOpen(true);
    setIsOpen(false);
    setMessage('');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Username and password can be changed directly
  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');
    if (form.password && form.password.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('nifty-bulk-token');
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setMessage(errData.error || 'Failed to update profile');
        setLoading(false);
        return;
      }
      updateUser({ username: form.username });
      setMessage('Profile updated!');
      setForm(f => ({ ...f, password: '' }));
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Request OTP for mobile/email change
  const requestOtp = async (type: 'mobile' | 'email') => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('nifty-bulk-token');
      const res = await fetch(`${API_BASE_URL}/users/request-${type}-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [type]: form[type] }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
      setOtpRequested(o => ({ ...o, [type]: true }));
      setMessage(`OTP sent to your ${type}`);
    } catch {
      setMessage('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and update mobile/email
  const verifyOtpAndUpdate = async (type: 'mobile' | 'email') => {
    setLoading(true);
    setMessage('');
    try {
      const token = localStorage.getItem('nifty-bulk-token');
      const res = await fetch(`${API_BASE_URL}/users/verify-${type}-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          [type]: form[type],
          otp: type === 'mobile' ? form.newMobileOtp : form.newEmailOtp,
        }),
      });
      if (!res.ok) throw new Error('Failed to verify OTP');
      updateUser({ [type]: form[type] });
      setForm(f => ({ ...f, [type]: form[type] })); // Ensure UI shows new email/mobile
      setMessage(`${type === 'mobile' ? 'Mobile' : 'Email'} updated!`);
      setOtpRequested(o => ({ ...o, [type]: false }));
      setForm(f => ({ ...f, newMobileOtp: '', newEmailOtp: '' }));
    } catch {
      setMessage('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white/10 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200/30 dark:border-slate-700/50 rounded-xl hover:bg-white/20 dark:hover:bg-slate-700/80 transition-all duration-300 shadow-lg"
        >
          <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200/50 dark:border-slate-700/50 rounded-2xl shadow-xl z-50">
            <div className="p-3 border-b border-gray-200/50 dark:border-slate-700/50">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{user?.mobile}</p>
            </div>
            <div className="py-1">
              <button
                onClick={openProfileModal}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors rounded-xl mx-1"
              >
                <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors rounded-xl mx-1"
              >
                <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                     <div className="rounded-3xl p-6 w-full max-w-md mx-auto my-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Username</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Email</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => requestOtp('email')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors duration-200"
                    disabled={loading}
                  >
                    Send OTP
                  </button>
                </div>
                {otpRequested.email && (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      name="newEmailOtp"
                      value={form.newEmailOtp}
                      onChange={handleProfileChange}
                      placeholder="Enter OTP"
                      className="w-full px-3 py-2 border rounded focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => verifyOtpAndUpdate('email')}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors duration-200"
                      disabled={loading}
                    >
                      Verify & Update
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Mobile</label>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  />
                  <button
                    type="button"
                    onClick={() => requestOtp('mobile')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors duration-200"
                    disabled={loading}
                  >
                    Send OTP
                  </button>
                </div>
                {otpRequested.mobile && (
                  <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
                      name="newMobileOtp"
                      value={form.newMobileOtp}
                      onChange={handleProfileChange}
                      placeholder="Enter OTP"
                      className="w-full px-3 py-2 border rounded focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    />
                    <button
                      type="button"
                      onClick={() => verifyOtpAndUpdate('mobile')}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors duration-200"
                      disabled={loading}
                    >
                      Verify & Update
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Password</label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  />
                </div>
              </div>
            </div>
            {message && <div className="text-green-600 text-sm mt-2">{message}</div>}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-xl transition-colors duration-200 font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileDropdown;