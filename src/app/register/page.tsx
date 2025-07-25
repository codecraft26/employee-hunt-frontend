'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { registerUser, clearError } from '../../store/authSlice';
import { useCategories } from '../../hooks/useCategories';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, Building2, Upload, X, Heart, CreditCard, FileCheck, Shield } from 'lucide-react';
import Image from 'next/image';
import { compressImage, validateImageFile, getImageDimensions } from '../../utils/imageUtils';
import { uploadProfileImage, uploadIdProof, validateImageFile as validateS3ImageFile, validateDocumentFile } from '../../services/s3Service';
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
          Join your squad in just a few steps
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
  categoryIds: string[];
  employeeCode: string;
  gender: string;
  hobbies: string;
  profileImage: File | null;
  idProof: File | null;
  declarationAccepted: boolean;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    categoryIds: [],
    employeeCode: '',
    gender: '',
    hobbies: '',
    profileImage: null,
    idProof: null,
    declarationAccepted: false,
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [idCardPreviewUrl, setIdCardPreviewUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, isAuthenticated, user, error: authError } = useAppSelector((state) => state.auth);
  
  // Fetch categories
  const { categories, fetchCategories, loading: categoriesLoading } = useCategories();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById('categories-dropdown');
      const dropdownTrigger = document.getElementById('categories-dropdown-trigger');
      
      if (dropdown && dropdownTrigger) {
        if (!dropdown.contains(event.target as Node) && !dropdownTrigger.contains(event.target as Node)) {
          dropdown.classList.add('hidden');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Password strength calculation
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
    
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clear previous errors
      setValidationErrors([]);
      
      // Basic file validation
      const validationError = validateImageFile(file);
      if (validationError) {
        setValidationErrors([validationError]);
        return;
      }
      
      try {
        // Get image dimensions for additional validation
        const dimensions = await getImageDimensions(file);
        
        // Check minimum dimensions
        if (dimensions.width < 100 || dimensions.height < 100) {
          setValidationErrors(['Image should be at least 100x100 pixels']);
          return;
        }
        
        // Check maximum dimensions
        if (dimensions.width > 5000 || dimensions.height > 5000) {
          setValidationErrors(['Image dimensions should not exceed 5000x5000 pixels']);
          return;
        }
        
        // Compress image if it's too large
        let processedFile = file;
        if (file.size > 1 * 1024 * 1024) { // Compress files larger than 1MB
          try {
            processedFile = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1920,
              quality: 0.8
            });
            console.log(`Compressed image from ${file.size} to ${processedFile.size} bytes`);
          } catch (compressionError) {
            console.warn('Image compression failed, using original file:', compressionError);
          }
        }
        
        // If all validations pass, proceed with file processing
        setFormData((prev) => ({ ...prev, profileImage: processedFile }));
        const reader = new FileReader();
        reader.onload = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.onerror = () => {
          setValidationErrors(['Failed to read image file. Please try again.']);
        };
        reader.readAsDataURL(processedFile);
        
      } catch (error) {
        console.error('Error processing image:', error);
        setValidationErrors(['Failed to process image. Please try a different file.']);
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: null }));
    setPreviewUrl('');
  };

  const removeIdCard = () => {
    setFormData((prev) => ({ ...prev, idProof: null }));
    setIdCardPreviewUrl('');
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('ID Card change triggered', e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      
      // Clear previous errors
      setValidationErrors([]);
      
      // File size validation (5MB limit)
      // if (file.size > 5 * 1024 * 1024) {
      //   setValidationErrors(['File size should be less than 5MB']);
      //   return;
      // }
      
      // File type validation
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const allowedDocTypes = ['application/pdf'];
      const isValidImage = allowedImageTypes.includes(file.type.toLowerCase());
      const isValidDoc = allowedDocTypes.includes(file.type.toLowerCase());
      
      if (!isValidImage && !isValidDoc) {
        setValidationErrors(['Please upload a valid image file (JPEG, PNG, GIF, WebP) or PDF document']);
        return;
      }

      // For PDF files, additional validation
      if (file.type === 'application/pdf') {
        // Check if PDF is corrupted by attempting to create object URL
        try {
          const testUrl = URL.createObjectURL(file);
          URL.revokeObjectURL(testUrl);
        } catch (error) {
          setValidationErrors(['Invalid PDF file. Please select a different file.']);
          return;
        }
      }

      setFormData((prev) => ({ ...prev, idProof: file }));
      
      // Only show preview for images, not PDFs
      if (isValidImage) {
        const reader = new FileReader();
        reader.onload = () => {
          setIdCardPreviewUrl(reader.result as string);
        };
        reader.onerror = () => {
          setValidationErrors(['Failed to read image file. Please try again.']);
          setFormData((prev) => ({ ...prev, idProof: null }));
        };
        reader.readAsDataURL(file);
      } else {
        // For PDF files, just show the file name
        setIdCardPreviewUrl('pdf');
      }
    }
  };

  const handleIdProofClick = () => {
    console.log('ID proof button clicked');
    const fileInput = document.getElementById('id-proof') as HTMLInputElement;
    if (fileInput) {
      console.log('File input found, triggering click');
      fileInput.click();
    } else {
      console.log('File input not found');
    }
  };

  // Allowed email domains for registration
  const allowedDomains = [
    '@innovatiview.com',
    '@innovatiview.in',
    '@infraview.in',
    '@getitrent.com',
    '@avagtpl.com'
  ];

  // Validate current step
  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    switch (currentStep) {
      case 1:
        if (!formData.name.trim()) errors.push('Full Name is required');
        if (!formData.email.trim()) errors.push('Email is required');
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
          errors.push('Please enter a valid email address');
        }
        // Domain validation
        if (formData.email) {
          const isAllowedDomain = allowedDomains.some(domain => 
            formData.email.toLowerCase().endsWith(domain.toLowerCase())
          );
          if (!isAllowedDomain) {
            errors.push('Registration is only allowed for employees with company email domains');
          }
        }
        break;
      
      case 2:
        if (!formData.employeeCode.trim()) errors.push('Employee Code is required');
        if (formData.categoryIds.length === 0) errors.push('Personality Traits are required');
        break;
      
      case 3:
        if (!formData.gender) errors.push('Gender is required');
        if (!formData.hobbies.trim()) errors.push('Hobbies are required');
        break;
      
      case 4:
        if (!formData.password) errors.push('Password is required');
        if (!formData.confirmPassword) errors.push('Confirm Password is required');
        if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
        if (formData.password.length < 8) errors.push('Password must be at least 8 characters long');
        break;
      
      case 5:
        if (!formData.profileImage) errors.push('Profile image is required');
        break;
      
      case 6:
        if (!formData.idProof) errors.push('ID proof is required');
        break;
      
      case 7:
        if (!formData.declarationAccepted) errors.push('You must accept the declaration to proceed');
        break;
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setValidationErrors([]);
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!validateCurrentStep()) {
      setIsSubmitting(false);
      return;
    }

    // Retry logic for form submission
    const maxRetries = 3;
    let currentRetry = 0;

    const attemptSubmission = async (): Promise<boolean> => {
      try {
        setError('Uploading images...');
        
        // Upload files to S3 first
        let profileImageUrl = '';
        let idProofUrl = '';

        if (formData.profileImage) {
          // Validate profile image
          const validation = validateS3ImageFile(formData.profileImage);
          if (!validation.isValid) {
            throw new Error(validation.error);
          }
          
          setError('Uploading profile image...');
          profileImageUrl = await uploadProfileImage(formData.profileImage);
        }

        if (formData.idProof) {
          // Validate ID proof (can be image or PDF)
          const validation = validateDocumentFile(formData.idProof);
          if (!validation.isValid) {
            throw new Error(validation.error);
          }
          
          setError('Uploading ID proof...');
          idProofUrl = await uploadIdProof(formData.idProof);
        }

        setError('Creating account...');

        // Create registration data object with URLs
        const registrationData = {
          name: formData.name,
          email: formData.email.toLowerCase(),
          password: formData.password,
          categoryIds: formData.categoryIds,
          employeeCode: formData.employeeCode,
          gender: formData.gender,
          hobbies: formData.hobbies,
          profileImageUrl,
          idProofUrl,
          declarationAccepted: formData.declarationAccepted,
        };

        const result = await dispatch(registerUser(registrationData));
        
        // Check if registration was successful
        if (registerUser.fulfilled.match(result)) {
          // Show success message
          setRegistrationSuccess(true);
          // Redirect to login page after a short delay
          setTimeout(() => {
            router.push('/login?registered=true');
          }, 2000);
          return true;
        } else if (registerUser.rejected.match(result)) {
          throw new Error(result.payload as string || 'Registration failed');
        }
        
        return false;
      } catch (error: any) {
        console.error(`Registration attempt ${currentRetry + 1} failed:`, error);
        
        // Check if it's a network error that we should retry
        const isRetryableError = 
          error.message.includes('Network Error') ||
          error.message.includes('timeout') ||
          error.message.includes('ECONNREFUSED') ||
          error.code === 'NETWORK_ERROR' ||
          (error.response && error.response.status >= 500);
        
        if (isRetryableError && currentRetry < maxRetries - 1) {
          currentRetry++;
          setError(`Connection failed. Retrying... (${currentRetry}/${maxRetries})`);
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, currentRetry) * 1000));
          return await attemptSubmission();
        } else {
          // If it's not retryable or we've exhausted retries
          if (currentRetry >= maxRetries - 1) {
            setError(`Registration failed after ${maxRetries} attempts. Please check your internet connection and try again.`);
          } else {
            setError(error.message || 'An error occurred during registration');
          }
          return false;
        }
      }
    };

    try {
      await attemptSubmission();
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

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 1: return 'Very Weak';
      case 2: return 'Weak';
      case 3: return 'Fair';
      case 4: return 'Good';
      case 5: return 'Strong';
      default: return '';
    }
  };

  const totalSteps = 7; // Updated to 7 steps
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md bg-white rounded-b-2xl shadow-lg overflow-hidden">
          {/* App Logo */}
          <div className="flex justify-center mt-6 mb-2">
            <Image
              src="/dashboard_tiles/bandhan-initial.svg"
              alt="App Logo"
              width={80}
              height={80}
              className="rounded-xl shadow-lg"
              priority
            />
          </div>
          {/* <TeamPlayBanner /> */}
          <div className="p-6">
            
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-600">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentStep === 1 && "Let's Get Started"}
                {currentStep === 2 && "Personality Traits & Work Info"}
                {currentStep === 3 && "Personal Details"}
                {currentStep === 4 && "Secure Your Account"}
                {currentStep === 5 && "Profile Picture"}
                {currentStep === 6 && "ID Verification"}
                {currentStep === 7 && "Declaration"}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {currentStep === 1 && "Enter your basic information"}
                {currentStep === 2 && "Tell us about your personality traits and employee details"}
                {currentStep === 3 && "A bit more about you"}
                {currentStep === 4 && "Create a strong password"}
                {currentStep === 5 && "Add your profile picture"}
                {currentStep === 6 && "Upload your ID proof for verification. (Office Id / Masked Adhaar Card / Pan Card / Driving License )"}
                {currentStep === 7 && "Please read and accept our terms"}
              </p>
            </div>

            {/* Success Display */}
            {registrationSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-2 mb-6">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Welcome aboard! 🎉</p>
                  <p className="text-sm text-green-600">Your account has been created successfully. Redirecting to login...</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && !registrationSuccess && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2 mb-6">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && !registrationSuccess && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm text-red-700">{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {!registrationSuccess && (
              <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }} className="space-y-6" autoComplete="off">
                
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Work Information */}
                {currentStep === 2 && (
                  <>
                    <div>
                      <label htmlFor="employeeCode" className="block text-sm font-medium text-gray-700">
                        Employee Code <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Building2 className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="employeeCode"
                          name="employeeCode"
                          type="text"
                          required
                          value={formData.employeeCode}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your employee code"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Personality Traits <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-gray-600 mb-3">Select your personality traits:</p>
                      
                      {/* Categories Multi-Select Dropdown */}
                      <div className="relative">
                        <div 
                          id="categories-dropdown-trigger"
                          className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                          onClick={() => {
                            const dropdown = document.getElementById('categories-dropdown');
                            if (dropdown) {
                              dropdown.classList.toggle('hidden');
                            }
                          }}
                        >
                          <span className={formData.categoryIds.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                            {formData.categoryIds.length === 0 
                              ? 'Select personality' 
                              : `${formData.categoryIds.length} personality${formData.categoryIds.length > 1 ? '' : ''} selected`
                            }
                          </span>
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        
                        {/* Dropdown Options */}
                        <div 
                          id="categories-dropdown"
                          className="hidden absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {categoriesLoading ? (
                            <div className="p-3 text-center text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                              Loading personas...
                            </div>
                          ) : categories.length === 0 ? (
                            <div className="p-3 text-center text-sm text-gray-500">
                              No personality traits available
                            </div>
                          ) : (
                            categories.map((category) => (
                              <label 
                                key={category.id}
                                className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={category.id}
                                  checked={formData.categoryIds.includes(category.id)}
                                  onChange={(e) => {
                                    const { value, checked } = e.target;
                                    setFormData((prev) => ({
                                      ...prev,
                                      categoryIds: checked 
                                        ? [...prev.categoryIds, value]
                                        : prev.categoryIds.filter(id => id !== value)
                                    }));
                                    if (validationErrors.length > 0) {
                                      setValidationErrors([]);
                                    }
                                  }}
                                  className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mr-3"
                                />
                                <span className="text-sm text-gray-900">{category.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                      
                      {/* Selected Categories Summary */}
                      {formData.categoryIds.length > 0 && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-2">
                            Selected Persona(s) ({formData.categoryIds.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {formData.categoryIds.map((id) => (
                              <span 
                                key={id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {categories.find(c => c.id === id)?.name}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      categoryIds: prev.categoryIds.filter((categoryId) => categoryId !== id),
                                    }));
                                  }}
                                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                                >
                                  <span className="sr-only">Remove {categories.find(c => c.id === id)?.name}</span>
                                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                    <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Helper Text */}
                      <p className="text-xs text-gray-500 mt-2">
                        You can select multiple categories. Choose all that are relevant to your role or interests.
                      </p>
                    </div>
                  </>
                )}

                {/* Step 3: Personal Details */}
                {currentStep === 3 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2 text-gray-700">Male</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2 text-gray-700">Female</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="other"
                            checked={formData.gender === 'other'}
                            onChange={handleInputChange}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2 text-gray-700">Other</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700">
                        Hobbies <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Heart className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="hobbies"
                          name="hobbies"
                          type="text"
                          required
                          value={formData.hobbies}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Reading, Gaming, Sports..."
                        />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Separate multiple hobbies with commas
                      </p>
                    </div>
                  </>
                )}

                {/* Step 4: Password Setup */}
                {currentStep === 4 && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Create a strong password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="mt-2">
                          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getPasswordStrengthColor()}`}
                              style={{ width: `${(passwordStrength / 5) * 100}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Password strength: {getPasswordStrengthText()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Confirm your password"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 5: Profile Image */}
                {currentStep === 5 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Image <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {previewUrl ? (
                          <div className="relative">
                            <Image
                              src={previewUrl}
                              alt="Profile preview"
                              width={120}
                              height={120}
                              className="mx-auto rounded-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="profile-image"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Upload a photo</span>
                                <input
                                  id="profile-image"
                                  name="profile-image"
                                  type="file"
                                  accept="image/*,application/pdf"
                                  className="sr-only"
                                  onChange={handleImageChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 text-center">
                      Upload a clear photo of yourself for your profile
                    </p>
                  </div>
                )}

                {/* Step 6: ID Card Upload */}
                {currentStep === 6 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Proof <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        {idCardPreviewUrl ? (
                          <div className="relative">
                            {idCardPreviewUrl === 'pdf' ? (
                              <div className="mx-auto w-48 h-32 bg-gray-100 border-2 border-gray-200 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <CreditCard className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">PDF Uploaded</p>
                                  <p className="text-xs text-gray-500">{formData.idProof?.name}</p>
                                </div>
                              </div>
                            ) : (
                              <Image
                                src={idCardPreviewUrl}
                                alt="ID proof preview"
                                width={200}
                                height={120}
                                className="mx-auto rounded-lg object-cover border-2 border-gray-200"
                              />
                            )}
                            <button
                              type="button"
                              onClick={removeIdCard}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="space-y-3">
                              <button
                                type="button"
                                onClick={handleIdProofClick}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                              >
                                Upload your ID proof (for hotel check-in)
                              </button>
                              <input
                                id="id-proof"
                                name="id-proof"
                                type="file"
                                accept="image/*,application/pdf"
                                className="hidden"
                                onChange={handleIdCardChange}
                              />
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF, PDF up to 5MB
                              </p>
                              <p className="text-xs text-gray-400">
                                Click the button above or drag and drop files here
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 text-center">
                      Upload a clear photo of your ID proof (ID card, passport, etc.) for verification
                    </p>
                  </div>
                )}

                {/* Step 7: Declaration */}
                {currentStep === 7 && (
                  <div className="space-y-6">
                    {/* Declaration Card */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-amber-900 mb-3">
                            Important Declaration
                          </h3>
                          <div className="bg-white border border-amber-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
                            <p>
                              While every effort is made to ensure the safety and well-being of all participants during the trip, the company shall not be held liable or responsible for any loss, injury, accident, damage, or any other unforeseen incident that may occur during the course of the trip, whether on board or at any destination.
                            </p>
                            <br />
                            <p>
                              All participants are expected to exercise personal responsibility and caution throughout the trip.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acceptance Checkbox */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="declarationAccepted"
                          checked={formData.declarationAccepted}
                          onChange={handleCheckboxChange}
                          className="form-checkbox h-5 w-5 text-blue-600 mt-1 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900">
                            I acknowledge and accept the declaration
                          </span>
                          <p className="text-xs text-gray-600 mt-1">
                            By checking this box, I confirm that I have read, understood, and agree to the terms stated in the declaration above.
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Additional Info */}
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
                        <FileCheck className="h-4 w-4" />
                        <span>This declaration is required to complete your registration</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < totalSteps ? (
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>
                            {uploadProgress > 0 && uploadProgress < 100 
                              ? `Uploading... ${uploadProgress}%` 
                              : 'Processing...'}
                          </span>
                        </div>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5 mr-2" />
                          OnBoard Me
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <SupportFloatingButton />
    </>
  );
}