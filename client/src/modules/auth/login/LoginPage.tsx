'use client';
import React, { useState } from 'react';
import { LOGIN_QUERY } from '@/graphql/queries/auth';
import { apiRequest } from '@/api';
import { useRouter } from 'next/navigation';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginPage = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

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
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
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

    console.log('Login submitted:', formData);

    try {
      const query = {
        query: LOGIN_QUERY.query,
        variables: {
          input: {
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          }
        }
      };

      const result = await apiRequest(query);
      console.log('result from the data: ', result);
      
      if (result && !result.errors) {
        // Handle successful login
        if (rememberMe) {
          // Store remember me preference if needed
          localStorage.setItem('rememberMe', 'true');
        }
        router.push('/');
      } else {
        // Handle server errors
        if (result.errors) {
          const serverError = result.errors[0]?.message || 'Invalid email or password';
          setErrors({ general: serverError });
        } else {
          setErrors({ general: 'Invalid email or password' });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ 
        general: error.message || 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password'); // Adjust the route as needed
  };

  const handleSignUp = () => {
    router.push('/signup'); // Adjust the route as needed
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Access your healthcare dashboard</p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your password"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-gray-900 border-gray-200 focus:ring-gray-900"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-3 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-gray-900 hover:underline"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
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

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleSignUp}
                className="font-medium text-gray-900 hover:underline"
                disabled={isLoading}
              >
                Create one here
              </button>
            </p>
          </div>

          {/* Emergency Access */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Emergency Access</p>
              <button 
                type="button"
                className="text-sm text-gray-900 hover:underline font-medium"
                disabled={isLoading}
              >
                Contact Support 24/7
              </button>
            </div>
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
                <span className="text-white text-3xl">🏥</span>
              </div>
              <h3 className="text-3xl font-light text-gray-900 mb-4">
                Welcome Back
              </h3>
              <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                Access your healthcare dashboard and continue your wellness journey
              </p>
            </div>

            {/* Quick Access Cards */}
            <div className="space-y-6 mb-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">📅</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Quick Appointments</h4>
                    <p className="text-sm text-gray-600">Book with your preferred specialists instantly</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">📋</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Health Records</h4>
                    <p className="text-sm text-gray-600">Access your complete medical history</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Live Consultations</h4>
                    <p className="text-sm text-gray-600">Connect with doctors via video or chat</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50">
              <div className="text-center mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Trusted by Healthcare Professionals</h4>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900 mb-2">HIPAA</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Compliant</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900 mb-2">SSL</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Encrypted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900 mb-2">ISO</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Certified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900 mb-2">SOC2</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wider">Verified</div>
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

export default LoginPage;