import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Mail, CreditCard, User, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Shield, Zap, TrendingUp, Star } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

interface VerificationStatus {
  mobile: boolean;
  email: boolean;
  pan: boolean;
  credentials: boolean;
}

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [pan, setPan] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    mobile: false,
    email: false,
    pan: false,
    credentials: false
  });
  const [isReturningUser, setIsReturningUser] = useState(false);

  // Check verification status on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mobileParam = urlParams.get('mobile');
    if (mobileParam) {
      setMobile(mobileParam);
      checkVerificationStatus(mobileParam);
    }
  }, []);

  // Enhanced Progress Indicator Component
  const ProgressIndicator = () => {
    const steps = [
      { name: 'Mobile', key: 'mobile', stepNumbers: [1, 2], icon: Smartphone },
      { name: 'Email', key: 'email', stepNumbers: [3, 4], icon: Mail },
      { name: 'PAN', key: 'pan', stepNumbers: [5], icon: CreditCard },
      { name: 'Account', key: 'credentials', stepNumbers: [6], icon: User }
    ];

    return (
      <div className="mb-10">
        <div className="flex justify-between items-center relative">
          {steps.map((stepItem, index) => {
            const isCompleted = verificationStatus[stepItem.key as keyof VerificationStatus];
            const isCurrent = stepItem.stepNumbers.includes(step);
            const IconComponent = stepItem.icon;

            return (
              <div key={stepItem.key} className="flex flex-col items-center flex-1 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg'
                    : isCurrent
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <IconComponent className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <div className={`text-sm font-semibold ${
                    isCompleted 
                      ? 'text-green-600 dark:text-green-400' 
                      : isCurrent 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {stepItem.name}
                  </div>
                  {isCompleted && (
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">Verified</div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Enhanced Connection lines */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 dark:bg-slate-600 rounded-full -z-10" />
          {steps.map((stepItem, index) => {
            const isCompleted = verificationStatus[stepItem.key as keyof VerificationStatus];
            if (index < steps.length - 1 && isCompleted) {
              return (
                <div
                  key={`line-${index}`}
                  className="absolute top-6 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full -z-10 transition-all duration-500"
                  style={{
                    left: `${(index / (steps.length - 1)) * 100}%`,
                    width: `${100 / (steps.length - 1)}%`
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  // Check verification status for smart routing
  const checkVerificationStatus = async (mobileNumber: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/status?mobile=${mobileNumber}`);
      const data = await response.json();

      if (response.ok) {
        if (data.status === 'active') {
          setError('Mobile number is already registered. Please login instead.');
          return;
        }

        if (data.status === 'pending_activation') {
          setError('Mobile number is already registered but pending activation. Please wait for admin approval.');
          return;
        }

        if (data.status === 'in_progress') {
          setIsReturningUser(true);
          setVerificationStatus(data.verificationStatus);
          setStep(data.stepNumber);

          // Pre-fill user data
          if (data.userData.email) setEmail(data.userData.email);
          if (data.userData.pan) setPan(data.userData.pan);
          if (data.userData.username) setUsername(data.userData.username);

          // Handle special step names for OTP verification
          let stepMessage = data.nextStep;
          if (data.nextStep === 'mobile_otp') {
            stepMessage = 'mobile OTP';
          } else if (data.nextStep === 'email_otp') {
            stepMessage = 'email OTP';
          }

          setSuccess(`Welcome back! Continue from ${stepMessage} verification.`);
        }
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  // Enhanced error message renderer
  const renderErrorMessage = (errorMsg: string) => {
    if (errorMsg.includes('already registered') && errorMsg.includes('Please login')) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">!</span>
            </div>
            <div className="flex-1">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium mb-3">{errorMsg}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (errorMsg.includes('pending activation')) {
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-sm">⏳</span>
            </div>
            <div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm font-medium mb-2">{errorMsg}</p>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">Please contact support if you need assistance.</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-2xl">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-red-700 dark:text-red-300 text-sm font-medium">{errorMsg}</span>
        </div>
      </div>
    );
  };

  const sendMobileOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First check if user has existing verification process
      const statusResponse = await fetch(`${API_BASE_URL}/auth/signup/status?mobile=${mobile}`);
      const statusData = await statusResponse.json();

      if (statusResponse.ok) {
        if (statusData.status === 'active') {
          setError('Mobile number is already registered. Please login instead.');
          return;
        }

        if (statusData.status === 'pending_activation') {
          setError('Mobile number is already registered but pending activation. Please wait for admin approval.');
          return;
        }

        if (statusData.status === 'in_progress') {
          setIsReturningUser(true);
          setVerificationStatus(statusData.verificationStatus);

          // Pre-fill user data
          if (statusData.userData.email) setEmail(statusData.userData.email);
          if (statusData.userData.pan) setPan(statusData.userData.pan);
          if (statusData.userData.username) setUsername(statusData.userData.username);

          // If user is trying to send mobile OTP again, allow it and proceed to send new OTP
          if (statusData.nextStep === 'mobile_otp' || statusData.nextStep === 'mobile') {
            // Don't return here, continue to send OTP
          } else {
            // For other steps, redirect to the appropriate step
            setStep(statusData.stepNumber);

            let stepMessage = statusData.nextStep;
            if (statusData.nextStep === 'email_otp') {
              stepMessage = 'email OTP';
            }

            setSuccess(`Welcome back! Continue from ${stepMessage} verification.`);
            return;
          }
        }
      }

      // If we reach here, proceed with sending OTP
      const response = await fetch(`${API_BASE_URL}/auth/signup/mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Please enter the OTP to verify your mobile number');
        setStep(2);
      } else {
        // Handle specific error cases
        if (data.error && typeof data.error === 'string') {
          if (data.error.includes('already registered with an active account')) {
            setError('Mobile number is already registered. Please login instead.');
          } else if (data.error.includes('pending activation')) {
            setError('Mobile number is already registered but pending activation. Please wait for admin approval.');
          } else {
            setError(data.error);
          }
        } else {
          setError(data.error || 'Failed to send OTP');
        }
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyMobileOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/mobile/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Mobile number verified successfully');
        setVerificationStatus(prev => ({ ...prev, mobile: true }));
        setStep(3);
        setOtp('');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendEmailOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP sent to your email');
        setStep(4);
      } else {
        // Handle specific error cases
        if (data.error && typeof data.error === 'string') {
          if (data.error.includes('already registered with another account')) {
            setError('Email address is already registered with another account. Please use a different email.');
          } else {
            setError(data.error);
          }
        } else {
          setError(data.error || 'Failed to send email OTP');
        }
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully');
        setVerificationStatus(prev => ({ ...prev, email: true }));
        setStep(5);
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyPan = async () => {
    if (!pan || pan.length !== 10) {
      setError('Please enter a valid 10-digit PAN number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/pan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, pan }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('PAN verified successfully');
        setVerificationStatus(prev => ({ ...prev, pan: true }));
        setStep(6);
      } else {
        setError(data.error || 'PAN verification failed');
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setCredentials = async () => {
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! You will be activated within 24-48 hours by admin.');
        setVerificationStatus(prev => ({ ...prev, credentials: true }));
        setStep(7);
      } else {
        // Handle specific error cases
        if (data.error && typeof data.error === 'string') {
          if (data.error.includes('Username is already taken')) {
            setError('Username is already taken. Please choose a different username.');
          } else {
            setError(data.error);
          }
        } else {
          setError(data.error || 'Failed to create account');
        }
      }
    } catch (_err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Mobile Number</h2>
              <p className="text-gray-600">
                {isReturningUser
                  ? "OTP Sent"
                  : "Please enter the OTP to verify your mobile number"
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={10}
              />
            </div>
            <button
              onClick={sendMobileOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : (isReturningUser ? 'Resend OTP' : 'Send OTP')}
            </button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Mobile OTP</h2>
              <p className="text-gray-600">Enter the 6-digit OTP sent to {mobile}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
            </div>
            <button
              onClick={verifyMobileOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Email Address</h2>
              <p className="text-gray-600">We'll send you an OTP to verify your email address</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={sendEmailOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Email OTP'}
            </button>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Email OTP</h2>
              <p className="text-gray-600">Enter the 6-digit OTP sent to {email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={6}
              />
            </div>
            <button
              onClick={verifyEmailOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter PAN Number</h2>
              <p className="text-gray-600">Please enter your PAN number for verification</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number
              </label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="Enter your PAN number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={10}
              />
            </div>
            <button
              onClick={verifyPan}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify PAN'}
            </button>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Username & Password</h2>
              <p className="text-gray-600">Create your account credentials</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 8 characters)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={setCredentials}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </motion.div>
        );

      case 7:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h2>
              <p className="text-gray-600 mb-6">
                You will be activated within 24-48 hours by our admin team.
              </p>
              <p className="text-gray-600 mb-6">
                You will receive an email notification once your account is activated.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Go to Login
            </button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-16 left-16 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/3 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-10 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                Join the Future of
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Smart Trading
                </span>
              </h1>
              <p className="text-lg text-purple-100 mb-8 leading-relaxed">
                Create your account and start learning professional stock market trading with comprehensive courses and expert guidance
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-purple-100">Zero account opening charges</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-purple-100">Instant account activation</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="text-purple-100">24/7 customer support</span>
              </div>
            </div>

            <div className="mt-10 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="text-center mb-4">
                <div className="text-lg font-bold mb-1 text-white">Master Stock Market Trading</div>
                <div className="text-sm text-purple-100">Learn from industry experts and build wealth</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">📈</span>
                  </div>
                  <span className="text-purple-100 text-sm">Live Market Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">🎓</span>
                  </div>
                  <span className="text-purple-100 text-sm">Expert-Led Courses</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">💰</span>
                  </div>
                  <span className="text-purple-100 text-sm">Wealth Building Strategies</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <Star className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Account
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Start your trading journey in just a few steps
            </p>
          </div>

          {/* Signup Form Card */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-slate-700/50 p-8">
            {/* Progress Indicator - only show if not on final step */}
            {step < 7 && <ProgressIndicator />}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                {renderErrorMessage(error)}
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-2xl"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 dark:text-green-300 text-sm font-medium">{success}</span>
                </div>
              </motion.div>
            )}

            {/* Form Content */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>

            {/* Login Link */}
            {step < 7 && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {step < 7 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                By creating an account, you agree to our{' '}
                <a href="/tnC" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage; 