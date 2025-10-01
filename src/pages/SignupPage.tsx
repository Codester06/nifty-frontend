import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

  // Progress Indicator Component
  const ProgressIndicator = () => {
    const steps = [
      { name: 'Mobile', key: 'mobile', stepNumbers: [1, 2] },
      { name: 'Email', key: 'email', stepNumbers: [3, 4] },
      { name: 'PAN', key: 'pan', stepNumbers: [5] },
      { name: 'Credentials', key: 'credentials', stepNumbers: [6] }
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-between items-center relative">
          {steps.map((stepItem, index) => {
            const isCompleted = verificationStatus[stepItem.key as keyof VerificationStatus];
            const isCurrent = stepItem.stepNumbers.includes(step);

            return (
              <div key={stepItem.key} className="flex flex-col items-center flex-1 relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? '✓' : index + 1}
                </div>
                <div className="mt-2 text-center">
                  <div className={`text-sm font-medium ${
                    isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {stepItem.name}
                  </div>
                  {isCompleted && (
                    <div className="text-xs text-green-600 mt-1">Verified</div>
                  )}
                </div>
              </div>
            );
          })}
          {/* Connection lines */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
          {steps.map((stepItem, index) => {
            const isCompleted = verificationStatus[stepItem.key as keyof VerificationStatus];
            if (index < steps.length - 1 && isCompleted) {
              return (
                <div
                  key={`line-${index}`}
                  className="absolute top-5 h-0.5 bg-green-500 -z-10"
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

  // Helper function to render error messages with actions
  const renderErrorMessage = (errorMsg: string) => {
    if (errorMsg.includes('already registered') && errorMsg.includes('Please login')) {
      return (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="mb-2">{errorMsg}</p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      );
    }
    
    if (errorMsg.includes('pending activation')) {
      return (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="mb-2">{errorMsg}</p>
          <p className="text-sm text-yellow-600">Please contact support if you need assistance.</p>
        </div>
      );
    }
    
    return (
      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {errorMsg}
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Create Your Account
        </h1>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Indicator - only show if not on final step */}
          {step < 7 && <ProgressIndicator />}

          {error && renderErrorMessage(error)}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {renderStep()}

          {step < 7 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage; 