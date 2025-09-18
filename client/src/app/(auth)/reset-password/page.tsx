'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/api';
import { VERIFY_RESET_PASSWORD } from '@/graphql/queries/auth';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

//   useEffect(() => {
//     // Get the reset token from URL parameters
//     const resetToken = searchParams.get('token');
//     if (resetToken) {
//       setToken(resetToken);
//     } else {
//       // Redirect to forgot password if no token
//       router.push('/forgot-password');
//     }
//   }, [searchParams, router]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    console.log('Reset password submitted:', { token, password: formData.password });

    try {
      // Replace with your actual reset password GraphQL mutation
      const query = {
        query: VERIFY_RESET_PASSWORD.query,
        variables: {
          input: { password: formData.password }
        }
      };

      const data = await apiRequest(query);
      console.log('data from the server: ', data);
      
      if (data) {
        setIsSuccess(true);
      } else {
        setError(data?.resetPassword?.message || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError('An error occurred. Please try again or request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login'); // Adjust the route as needed
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex">
        {/* Left Side - Success Message */}
        <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Header */}
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Password Reset Successfully</h2>
              <p className="text-gray-600">
                Your password has been updated. You can now sign in with your new password.
              </p>
            </div>

            {/* Action */}
            <div className="space-y-4">
              <button
                onClick={handleBackToLogin}
                className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg"
              >
                Continue to Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:flex lg:flex-1 lg:relative bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex flex-col justify-center w-full p-16">
            <div className="relative">
              {/* Header Section */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-900 rounded-2xl mb-8">
                  <span className="text-white text-3xl">🎉</span>
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4">
                  Welcome Back!
                </h3>
                <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                  Your account is secure and ready to use with your new password
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-2">Create New Password</h2>
            <p className="text-gray-600">
              Your new password must be different from your previous password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors pr-12"
                  placeholder="Enter your new password"
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
              <p className="mt-2 text-sm text-gray-500">
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors pr-12"
                  placeholder="Confirm your new password"
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                onClick={handleBackToLogin}
                className="font-medium text-gray-900 hover:underline"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
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
                <span className="text-white text-3xl">🔒</span>
              </div>
              <h3 className="text-3xl font-light text-gray-900 mb-4">
                Secure Your Account
              </h3>
              <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                Create a strong password to keep your healthcare data safe
              </p>
            </div>

            {/* Security Tips */}
            <div className="space-y-6 mb-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🔤</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Strong Characters</h4>
                    <p className="text-sm text-gray-600">Use mix of letters, numbers & symbols</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">📏</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Minimum Length</h4>
                    <p className="text-sm text-gray-600">At least 8 characters for security</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🔐</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Unique Password</h4>
                    <p className="text-sm text-gray-600">Don't reuse passwords from other sites</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-4">Your Data is Protected</h4>
                <p className="text-sm text-gray-600 mb-4">
                  We use industry-standard encryption to protect your personal and medical information.
                </p>
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    SSL Encrypted
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    HIPAA Compliant
                  </span>
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

export default ResetPasswordPage;