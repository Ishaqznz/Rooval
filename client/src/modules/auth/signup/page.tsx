'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SIGNUP_QUERY } from '@/graphql/queries/auth';
import { apiRequest } from '@/api';

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const router = useRouter()

  const validateFullName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters long';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
    if (/\d/.test(name)) {
      return 'Full name cannot contain numbers';
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const fullNameError = validateFullName(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleTermsChange = (e: any) => {
    setTermsAccepted(e.target.checked);
    if (errors.terms) {
      setErrors(prev => ({
        ...prev,
        terms: undefined
      }));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    console.log('Form submitted:', formData);

    try {
      const query = {
        query: SIGNUP_QUERY.query,
        variables: {
          input: {
            fullName: formData.fullName.trim(),
            email: formData.email.trim().toLowerCase(),
            role: termsAccepted ? 'doctor': 'user',
            password: formData.password,
          }
        }
      };

      const data = await apiRequest(query);
      
      if (data && !data.errors) {
        router.push('/sendEmail');
      } else {
        if (data.errors) {
          const serverError = data.errors[0]?.message || 'An error occurred during signup';
          setErrors({ general: serverError });
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ 
        general: error.message || 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join thousands of patients accessing quality healthcare</p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.fullName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-900 focus:border-transparent'
                } focus:ring-2 outline-none transition-colors`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${
                  errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-900 focus:border-transparent'
                } focus:ring-2 outline-none transition-colors`}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-900 focus:border-transparent'
                  } focus:ring-2 outline-none transition-colors pr-12`}
                  placeholder="Create a secure password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">{errors.password}</p>
              )}
              {!errors.password && formData.password && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-1">{formData.password.length >= 6 ? '✓' : '○'}</span>
                      6+ characters
                    </span>
                    <span className={`flex items-center ${/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-1">{/(?=.*[a-z])/.test(formData.password) ? '✓' : '○'}</span>
                      Lowercase
                    </span>
                    <span className={`flex items-center ${/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-1">{/(?=.*[A-Z])/.test(formData.password) ? '✓' : '○'}</span>
                      Uppercase
                    </span>
                    <span className={`flex items-center ${/(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <span className="mr-1">{/(?=.*\d)/.test(formData.password) ? '✓' : '○'}</span>
                      Number
                    </span>
                  </div>
                  <span className={`flex items-center text-xs ${/(?=.*[@$!%*?&])/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <span className="mr-1">{/(?=.*[@$!%*?&])/.test(formData.password) ? '✓' : '○'}</span>
                    Special character (@$!%*?&)
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-gray-900 focus:border-transparent'
                  } focus:ring-2 outline-none transition-colors pr-12`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
              {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <span className="mr-1">✓</span>
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={handleTermsChange}
                  className={`mt-1 h-4 w-4 ${
                    errors.terms ? 'border-red-300 text-red-600 focus:ring-red-500' : 'text-gray-900 border-gray-200 focus:ring-gray-900'
                  }`}
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                  I want to be a {' '}
                  <a href="#" className="text-gray-900 hover:underline">Doctor in </a>
                  <a href="#" className="text-gray-900 hover:underline">Rooval</a>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-2 text-sm text-red-600">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
              type="button"
              disabled={isLoading}
              className="w-full border border-gray-200 py-3 px-4 hover:border-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">📧</span>
              <span className="text-sm font-medium text-gray-700">Google</span>
            </button>
            <button 
              type="button"
              disabled={isLoading}
              className="w-full border border-gray-200 py-3 px-4 hover:border-gray-300 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-2">🍎</span>
              <span className="text-sm font-medium text-gray-700">Apple</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="#" className="font-medium text-gray-900 hover:underline">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 lg:relative bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col justify-center w-full p-16">
          
          {/* Main Content Container */}
          <div className="relative">
            {/* Header Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl mb-8">
                <span className="text-white text-3xl">⚡</span>
              </div>
              <h3 className="text-3xl font-light text-gray-900 mb-4">
                Healthcare Simplified
              </h3>
              <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                Join thousands of patients experiencing seamless healthcare access
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-6 mb-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">👨‍⚕️</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Expert Specialists</h4>
                    <p className="text-sm text-gray-600">Board-certified doctors available 24/7</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🔒</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Secure & Private</h4>
                    <p className="text-sm text-gray-600">HIPAA compliant with end-to-end encryption</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">📱</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Digital First</h4>
                    <p className="text-sm text-gray-600">Consultations, prescriptions, all online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">50K+</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wider">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">500+</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wider">Doctors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">98%</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wider">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-gray-900 mb-2">24/7</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wider">Available</div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gray-200/30 rounded-full -z-10"></div>
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-gray-300/20 rounded-full -z-10"></div>
            <div className="absolute top-1/3 -left-6 w-16 h-16 bg-gray-200/40 rounded-full -z-10"></div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;