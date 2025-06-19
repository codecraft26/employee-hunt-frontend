'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser, clearError } from '../../store/authSlice';
import { useCategories } from '../../hooks/useCategories';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Building2, Upload, X, Heart } from 'lucide-react';
import Image from 'next/image';

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

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  employeeCode: string;
  gender: string;
  hobbies: string;
  profileImage: File | null;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    employeeCode: '',
    gender: '',
    hobbies: '',
    profileImage: null,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isAuthenticated, user, error: authError } = useAppSelector((state) => state.auth);
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { return () => { dispatch(clearError()); }; }, [dispatch]);
  useEffect(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setValidationErrors(['Image size should be less than 5MB']);
        return;
      }
      if (!file.type.startsWith('image/')) {
        setValidationErrors(['Please upload an image file']);
        return;
      }
      setProfileImage(file);
      setFormData((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => { setPreviewUrl(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => { setProfileImage(null); setPreviewUrl(''); setFormData((prev) => ({ ...prev, profileImage: null })); };

  // Per-step validation
  const validateStep = () => {
    const errors: string[] = [];
    if (step === 1) {
      if (!formData.name) errors.push('Full Name is required');
      if (!formData.email) errors.push('Email is required');
    } else if (step === 2) {
      if (!formData.employeeCode) errors.push('Employee Code is required');
      if (!formData.department) errors.push('Department is required');
    } else if (step === 3) {
      if (!formData.gender) errors.push('Gender is required');
      if (!formData.hobbies) errors.push('Hobbies are required');
    } else if (step === 4) {
      if (!formData.password) errors.push('Password is required');
      if (!formData.confirmPassword) errors.push('Confirm Password is required');
      if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
      if (formData.password.length < 8) errors.push('Password must be at least 8 characters long');
    } else if (step === 5) {
      if (!formData.profileImage) errors.push('Profile image is required');
    }
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) setStep((s) => s + 1);
  };
  const handleBack = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    if (!validateStep()) { setIsSubmitting(false); return; }
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('department', formData.department);
      submitData.append('employeeCode', formData.employeeCode);
      submitData.append('gender', formData.gender);
      submitData.append('hobbies', formData.hobbies);
      if (formData.profileImage) submitData.append('profileImage', formData.profileImage);
      const result = await dispatch(registerUser(submitData));
      if (registerUser.fulfilled.match(result)) router.push('/login?registered=true');
    } catch (error) {
      setError('An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-emerald-500';
      default: return 'bg-gray-200';
    }
  };

  // Stepper UI
  const steps = [
    'Basic Info',
    'Work Details',
    'Personal Details',
    'Set Password',
    'Profile Image',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white rounded-b-2xl shadow-lg overflow-hidden">
        <TeamPlayBanner />
        <div className="p-6">
          {/* Stepper */}
          <div className="flex justify-between mb-6">
            {steps.map((label, idx) => (
              <div key={label} className="flex-1 flex flex-col items-center">
                <div className={`rounded-full h-8 w-8 flex items-center justify-center font-bold text-white mb-1 ${step === idx+1 ? 'bg-blue-600' : 'bg-gray-300'}`}>{idx+1}</div>
                <span className={`text-xs ${step === idx+1 ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2 mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={step === 5 ? handleSubmit : handleNext} className="space-y-6">
            {/* Step 1: Name, Email */}
            {step === 1 && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name<span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                    <input id="name" name="name" type="text" required value={formData.name} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your full name" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address<span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                    <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your email" />
                  </div>
                </div>
              </>
            )}
            {/* Step 2: Employee Code, Department */}
            {step === 2 && (
              <>
                <div>
                  <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700">Employee Code<span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 className="h-5 w-5 text-gray-400" /></div>
                    <input id="employeeCode" name="employeeCode" type="text" required value={formData.employeeCode} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your employee code" />
                  </div>
                </div>
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department<span className="text-red-500">*</span></label>
                  <div className="mt-1">
                    <select id="department" name="department" required value={formData.department} onChange={handleInputChange} className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select a department</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
            {/* Step 3: Gender, Hobbies */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender<span className="text-red-500">*</span></label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleInputChange} className="form-radio h-4 w-4 text-blue-600" />
                      <span className="ml-2 text-gray-700">Male</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleInputChange} className="form-radio h-4 w-4 text-blue-600" />
                      <span className="ml-2 text-gray-700">Female</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleInputChange} className="form-radio h-4 w-4 text-blue-600" />
                      <span className="ml-2 text-gray-700">Other</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700">Hobbies<span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Heart className="h-5 w-5 text-gray-400" /></div>
                    <input id="hobbies" name="hobbies" type="text" value={formData.hobbies} onChange={handleInputChange} className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your hobbies (comma separated)" />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">Separate multiple hobbies with commas (e.g., Reading, Gaming, Sports)</p>
                </div>
              </>
            )}
            {/* Step 4: Password, Confirm Password */}
            {step === 4 && (
              <>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password<span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                    <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={formData.password} onChange={handleInputChange} className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter your password" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        {showPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)}
                      </button>
                    </div>
                  </div>
                  {/* Password Strength Indicator */}
                  <div className="mt-2">
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getPasswordStrengthColor()}`} style={{ width: `${(passwordStrength / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password<span className="text-red-500">*</span></label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                    <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={formData.confirmPassword} onChange={handleInputChange} className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Confirm your password" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                        {showConfirmPassword ? (<EyeOff className="h-5 w-5" />) : (<Eye className="h-5 w-5" />)}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Step 5: Profile Image + OnBoard Me */}
            {step === 5 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image<span className="text-red-500">*</span></label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      {previewUrl ? (
                        <div className="relative">
                          <Image src={previewUrl} alt="Profile preview" width={150} height={150} className="mx-auto rounded-full object-cover" />
                          <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"><X className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="profile-image" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input id="profile-image" name="profile-image" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
            {/* Stepper Navigation */}
            <div className="flex justify-between items-center mt-4">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">Back</button>
              ) : <div />}
              {step < 5 ? (
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />) : (<><UserPlus className="h-5 w-5 mr-2" />OnBoard Me</>)}
                </button>
              )}
            </div>
            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">Already have an account?{' '}<Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}