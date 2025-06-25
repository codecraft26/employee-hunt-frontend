'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginUser, loginWithOTP, verifyOTPLogin, clearError } from '../../store/authSlice';
import { Eye, EyeOff, Mail, Lock, Smartphone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Gamepad2 } from 'lucide-react';
import PendingApprovalMessage from '../../components/PendingApprovalMessage';
import FCMUtils from '../../utils/fcmUtils';
import SupportFloatingButton from '../../components/shared/SupportFloatingButton';

// Add SVG as a React component
const TeamPlayBanner = () => (
  <div className="w-full flex justify-center">
    <svg width="100%" height="180" viewBox="0 0 414 220" fill="none" xmlns="http://www.w3.org/2000/svg" style={{maxWidth: 414, height: 220}}>
      <defs>
        <linearGradient id="bannerGradient" x1="0" y1="0" x2="414" y2="220" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a18aff"/>
          <stop offset="1" stopColor="#6f55ff"/>
        </linearGradient>
        <clipPath id="roundedBanner">
          <rect width="414" height="220" rx="24" />
        </clipPath>
      </defs>
      <g clipPath="url(#roundedBanner)">
        <rect width="414" height="220" fill="url(#bannerGradient)"/>
        <circle cx="207" cy="110" r="75" fill="white" fillOpacity="0.22"/>
        <image href="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" x="0" y="0" height="220" width="414" opacity="0.55"/>
        <g>
          <circle cx="207" cy="110" r="48" fill="white"/>
          <g>
            <path d="M197 110 h20 m-10-10 v20" stroke="#a18aff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="202" cy="115" r="2" fill="#a18aff"/>
            <circle cx="212" cy="115" r="2" fill="#a18aff"/>
          </g>
        </g>
        <text x="207" y="180" textAnchor="middle" fill="white" fontSize="26" fontFamily="Inter,sans-serif" fontWeight="bold">
          Welcome to TeamPlay
        </text>
        <text x="207" y="200" textAnchor="middle" fill="#e0e0ff" fontSize="16" fontFamily="Inter,sans-serif">
          Sign in to join your squad
        </text>
      </g>
    </svg>
  </div>
);

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [otpData, setOtpData] = useState({
    email: '',
    otp: ''
  });
  const [isOTPMode, setIsOTPMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check if user was redirected from registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setShowRegistrationSuccess(true);
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isOTPMode) {
      setOtpData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsPendingApproval(false);
    
    try {
      // Try to generate FCM token for push notifications, but don't fail login if it fails
      let deviceToken: string | null = null;
      try {
        deviceToken = await FCMUtils.getOrGenerateFCMToken(true);
        console.log('FCM token generated for login:', deviceToken ? 'Success' : 'Failed');
      } catch (fcmError) {
        console.warn('FCM token generation failed, continuing with login:', fcmError);
        // Continue with login even if FCM fails
      }
      
      if (isOTPMode) {
        if (otpSent) {
          const otpDataWithToken = {
            ...otpData,
            ...(deviceToken && { deviceToken })
          };
          const result = await dispatch(verifyOTPLogin(otpDataWithToken));
          if (result.type.includes('rejected') && result.payload && typeof result.payload === 'string' && result.payload.includes('pending approval')) {
            setIsPendingApproval(true);
          }
        } else {
          const result = await dispatch(loginWithOTP(otpData.email));
          if (result.meta.requestStatus === 'fulfilled') {
            setOtpSent(true);
          }
        }
      } else {
        const loginDataWithToken = {
          ...formData,
          ...(deviceToken && { deviceToken })
        };
        const result = await dispatch(loginUser(loginDataWithToken));
        if (result.type.includes('rejected') && result.payload && typeof result.payload === 'string' && result.payload.includes('pending approval')) {
          setIsPendingApproval(true);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOTPMode = () => {
    setIsOTPMode(!isOTPMode);
    setOtpSent(false);
    dispatch(clearError());
    // Clear form data when switching modes
    if (!isOTPMode) {
      // Switching to OTP mode, copy email if available
      setOtpData(prev => ({ ...prev, email: formData.email, otp: '' }));
    } else {
      // Switching to password mode, copy email if available
      setFormData(prev => ({ ...prev, email: otpData.email }));
    }
  };

  const resetOTP = () => {
    setOtpSent(false);
    setOtpData({ email: '', otp: '' });
    dispatch(clearError());
  };

  if (isPendingApproval) {
    return <PendingApprovalMessage />;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-white rounded-b-2xl shadow-lg overflow-hidden">
          {/* App Logo */}
          <div className="flex justify-center mt-6 mb-2">
            <img
              src="/dashboard_tiles/bandhan-initial.svg"
              alt="App Logo"
              width={80}
              height={80}
              className="rounded-xl shadow-lg"
              style={{ background: 'white' }}
            />
          </div>
          {/* <TeamPlayBanner /> */}
          {/* Tabs */}
          <div className="flex justify-center mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setIsOTPMode(false)}
              className={`px-6 py-2 text-sm font-medium focus:outline-none border-b-2 transition-colors duration-200 ${!isOTPMode ? 'border-purple-500 text-black' : 'border-transparent text-gray-400'}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setIsOTPMode(true)}
              className={`px-6 py-2 text-sm font-medium focus:outline-none border-b-2 transition-colors duration-200 ${isOTPMode ? 'border-purple-500 text-black' : 'border-transparent text-gray-400'}`}
            >
              OTP
            </button>
          </div>
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2 mx-6">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {/* Registration Success Message */}
          {showRegistrationSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-2 mx-6">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">Registration successful!</p>
                <p className="text-sm text-green-600">Please log in with your credentials to continue.</p>
              </div>
            </div>
          )}
          {/* Success Message for OTP */}
          {otpSent && !error && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-2 mx-6">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">
                OTP has been sent to your email. Please check your inbox.
              </p>
            </div>
          )}
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-purple-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={isOTPMode ? otpData.email : formData.email}
                onChange={handleInputChange}
                className="block w-full pl-10 pr-3 py-3 rounded-full border border-purple-200 bg-blue-50 text-gray-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                placeholder="Please enter official email"
              />
            </div>
            {/* Password Field (only in password mode) */}
            {!isOTPMode && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 rounded-full border border-purple-200 bg-blue-50 text-gray-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-purple-400 hover:text-purple-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
            {/* OTP Field (only in OTP mode after sending) */}
            {isOTPMode && otpSent && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-purple-400" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otpData.otp}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 rounded-full border border-purple-200 bg-blue-50 text-gray-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  placeholder="Enter the OTP"
                />
              </div>
            )}
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-blue-500 hover:bg-purple-600 text-white font-semibold py-3 transition-colors text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto" />
                ) : (
                  <span>{isOTPMode ? (otpSent ? 'Verify OTP' : 'Send OTP') : 'SIGN IN TO PLAY'}</span>
                )}
              </button>
            </div>
            {/* Login with OTP link (only in password mode) */}
            {!isOTPMode && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsOTPMode(true)}
                  className="text-purple-500 hover:underline text-sm font-medium mt-2"
                >
                  Login with OTP
                </button>
              </div>
            )}
            {/* Reset OTP (only in OTP mode) */}
            {isOTPMode && otpSent && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={resetOTP}
                  className="text-sm text-gray-500 hover:text-purple-500 focus:outline-none"
                >
                  Didn't receive OTP? Try again
                </button>
              </div>
            )}
          </form>
          {/* Register Link */}
          <div className="text-center pb-6">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-purple-600 hover:underline"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <SupportFloatingButton />
    </>
  );
}