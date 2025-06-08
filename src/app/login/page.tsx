'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { loginUser, loginWithOTP, verifyOTPLogin, clearError } from '../../store/authSlice';
import { Eye, EyeOff, Mail, Lock, Smartphone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

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

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);

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
    
    try {
      if (isOTPMode) {
        if (otpSent) {
          await dispatch(verifyOTPLogin(otpData));
        } else {
          const result = await dispatch(loginWithOTP(otpData.email));
          if (result.meta.requestStatus === 'fulfilled') {
            setOtpSent(true);
          }
        }
      } else {
        await dispatch(loginUser(formData));
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 opacity-20 blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {isOTPMode ? 'Secure Login' : 'Welcome Back'}
          </h2>
          <p className="mt-3 text-gray-600">
            {isOTPMode ? 'Enter your email to receive a verification code' : 'Sign in to your account to continue'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200">
              Create one here
            </Link>
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-6">
          {/* Success/Error Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3 animate-shake">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {otpSent && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3 animate-bounce">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-green-700 text-sm">OTP sent successfully! Check your email.</span>
            </div>
          )}

          {/* Mode Toggle - Fixed Logic */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 rounded-full p-1 flex">
              <button
                type="button"
                onClick={() => {
                  if (isOTPMode) {
                    toggleOTPMode();
                  }
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  !isOTPMode
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!isOTPMode) {
                    toggleOTPMode();
                  }
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isOTPMode
                    ? 'bg-white text-gray-900 shadow-md'
                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                }`}
              >
                OTP
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isOTPMode ? (
                <>
                  {/* Email Field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 bg-white/50 hover:bg-white/80"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="block w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 bg-white/50 hover:bg-white/80"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* OTP Email Field */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      disabled={otpSent}
                      className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 bg-white/50 hover:bg-white/80 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter your email"
                      value={otpData.email}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* OTP Field */}
                  {otpSent && (
                    <div className="relative group animate-fadeIn">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                      </div>
                      <input
                        id="otp"
                        name="otp"
                        type="text"
                        required
                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all duration-200 bg-white/50 hover:bg-white/80 tracking-widest text-center text-lg font-mono"
                        placeholder="000000"
                        value={otpData.otp}
                        onChange={handleInputChange}
                        maxLength={6}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={toggleOTPMode}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200 flex items-center space-x-1"
              >
                <span>{isOTPMode ? 'Use password instead' : 'Login with OTP'}</span>
              </button>
              
              {isOTPMode && otpSent && (
                <button
                  type="button"
                  onClick={resetOTP}
                  className="font-medium text-gray-600 hover:text-gray-500 transition-colors duration-200"
                >
                  Change email
                </button>
              )}

             
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="group relative w-full flex justify-center items-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              {isLoading || isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>
                    {isOTPMode ? (otpSent ? 'Verifying...' : 'Sending...') : 'Signing in...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>
                    {isOTPMode ? (otpSent ? 'Verify OTP' : 'Send OTP') : 'Sign In'}
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
            </button>
          </form>

          {/* Social Login Divider */}
         

         
        </div>

        {/* Footer */}
       
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}