'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/api';
import { FORGOT_PASSWORD } from '@/graphql/queries/auth';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const router = useRouter();

  const handleInputChange = (e: any) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('Forgot password submitted for:', email);

    try {
      // Replace with your actual forgot password GraphQL query/mutation
      const query = {
        query: FORGOT_PASSWORD.query,
        variables: {
          input: { email }
        }
      };

      const data = await apiRequest(query);
      console.log('data from the server: ', data);
      
      if (data) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login'); // Adjust the route as needed
  };

  if (isSubmitted) {
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
              <h2 className="text-3xl font-light text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="w-full bg-gray-100 text-gray-700 py-4 hover:bg-gray-200 transition-colors font-medium text-lg"
              >
                Try Another Email
              </button>
              
              <button
                onClick={handleBackToLogin}
                className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg"
              >
                Back to Sign In
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
                  <span className="text-white text-3xl">📧</span>
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4">
                  Email Sent Successfully
                </h3>
                <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                  Follow the instructions in your email to reset your password
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
            <h2 className="text-3xl font-light text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {/* Form */}
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
                value={email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-colors"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                onClick={handleBackToLogin}
                className="font-medium text-gray-900 hover:underline"
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
                <span className="text-white text-3xl">🔐</span>
              </div>
              <h3 className="text-3xl font-light text-gray-900 mb-4">
                Secure Reset Process
              </h3>
              <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                We'll send you a secure link to reset your password safely
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-6 mb-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Quick & Easy</h4>
                    <p className="text-sm text-gray-600">Reset link delivered in seconds</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Secure Process</h4>
                    <p className="text-sm text-gray-600">Encrypted links with time limits</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">📱</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Mobile Friendly</h4>
                    <p className="text-sm text-gray-600">Reset from any device, anywhere</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-4">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  If you're having trouble resetting your password, our support team is here to help.
                </p>
                <a href="#" className="text-gray-900 hover:underline text-sm font-medium">
                  Contact Support →
                </a>
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

export default ForgotPasswordPage;