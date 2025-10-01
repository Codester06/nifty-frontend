import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Edit3, Save, X, Camera, Award, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user) {
      setForm({
        username: user.name || user.username || '',
        email: user.email || '',
        mobile: user.mobile || '',
        password: '',
        newMobileOtp: '',
        newEmailOtp: '',
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      if (form.password && form.password.length < 6) {
        showMessage('Password must be at least 6 characters long', 'error');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('nifty-bulk-token');
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          username: form.username, 
          ...(form.password && { password: form.password })
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        showMessage(errData.error || 'Failed to update profile', 'error');
        setLoading(false);
        return;
      }

      updateUser({ name: form.username });
      showMessage('Profile updated successfully!');
      setForm(f => ({ ...f, password: '' }));
      setIsEditing(false);
    } catch {
      showMessage('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (type: 'mobile' | 'email') => {
    setLoading(true);
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
      showMessage(`OTP sent to your ${type}`);
    } catch {
      showMessage('Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndUpdate = async (type: 'mobile' | 'email') => {
    setLoading(true);
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
      showMessage(`${type === 'mobile' ? 'Mobile' : 'Email'} updated successfully!`);
      setOtpRequested(o => ({ ...o, [type]: false }));
      setForm(f => ({ ...f, newMobileOtp: '', newEmailOtp: '' }));
    } catch {
      showMessage('Failed to verify OTP', 'error');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                  <User className="h-12 w-12 text-white" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                  <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user?.name || user?.username || 'User'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Member since {new Date().getFullYear()}
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-700 dark:text-green-300 text-sm font-medium">Active</span>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Award className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">Verified</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl border ${
            messageType === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Profile Information</h2>
              
              <div className="space-y-8">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Display Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                      placeholder="Enter your display name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Email Address
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-32 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                        placeholder="Enter your email"
                      />
                      <button
                        type="button"
                        onClick={() => requestOtp('email')}
                        disabled={loading || !form.email}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                      >
                        Send OTP
                      </button>
                    </div>
                    
                    {otpRequested.email && (
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="newEmailOtp"
                          value={form.newEmailOtp}
                          onChange={handleInputChange}
                          placeholder="Enter OTP"
                          className="w-full pl-12 pr-32 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => verifyOtpAndUpdate('email')}
                          disabled={loading || !form.newEmailOtp}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Mobile Number
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-32 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                        placeholder="Enter your mobile number"
                      />
                      <button
                        type="button"
                        onClick={() => requestOtp('mobile')}
                        disabled={loading || !form.mobile}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                      >
                        Send OTP
                      </button>
                    </div>
                    
                    {otpRequested.mobile && (
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="newMobileOtp"
                          value={form.newMobileOtp}
                          onChange={handleInputChange}
                          placeholder="Enter OTP"
                          className="w-full pl-12 pr-32 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => verifyOtpAndUpdate('mobile')}
                          disabled={loading || !form.newMobileOtp}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium transition-colors duration-200 disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password */}
                {isEditing && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      New Password (Optional)
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white transition-all duration-300"
                        placeholder="Enter new password (min 6 characters)"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Leave blank to keep current password
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Account Stats & Security */}
          <div className="space-y-8">
            {/* Account Stats */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Account Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Member Since</span>
                  </div>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    {new Date().getFullYear()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Account Status</span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Location</span>
                  </div>
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                    India
                  </span>
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Auth</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">SMS verification</p>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Email Verified</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Primary email</p>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Mobile Verified</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Primary mobile</p>
                    </div>
                  </div>
                  <div className="w-10 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default Profile;