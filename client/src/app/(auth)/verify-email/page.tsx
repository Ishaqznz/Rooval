'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VERIFY_EMAIL_QUERY } from '@/graphql/queries/auth';
import { apiRequest } from '@/api';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'expired'
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL params
        const token = searchParams.get('token');
        console.log('the uuid token: ', token)
        
        if (!token) {
          setStatus('error');
          setMessage('Invalid verification link. Please check your email and try again.');
          return;
        }

        // Simulate API call - replace with your actual verification logic
        const query = {
          query: VERIFY_EMAIL_QUERY.query,
          variables: {
            input: { token }
          }
        };

        const result = await apiRequest(query)
        // Simulate verification process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate different responses - replace with actual API response handling
        console.log('result from the server: ', result)
        const mockSuccess = !!result; // Replace with: result.verifyEmail.success
        
        if (mockSuccess) {
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to your dashboard...');
          
          // Redirect after 3 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          setStatus('expired');
          setMessage('This verification link has expired or is invalid.');
        }

      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Something went wrong during verification. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResendEmail = () => {
    router.push('/signup');
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'expired':
        return '⏰';
      case 'error':
      default:
        return '❌';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'loading':
        return 'Verifying your email...';
      case 'success':
        return 'Email verified successfully!';
      case 'expired':
        return 'Verification link expired';
      case 'error':
      default:
        return 'Verification failed';
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Main Content */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-2">{getStatusTitle()}</h2>
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Status Display */}
          <div className="mb-8">
            <div className="bg-gray-50 border border-gray-200 rounded px-4 py-6 text-center">
              <div className="text-6xl mb-4">{getStatusIcon()}</div>
              {status === 'loading' && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  <span className="ml-3 text-gray-600">Please wait...</span>
                </div>
              )}
              {status === 'success' && (
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900 mb-2">Welcome to DocEase!</p>
                  <p>You'll be redirected to your dashboard shortly.</p>
                </div>
              )}
              {(status === 'error' || status === 'expired') && (
                <div className="text-gray-600">
                  <p className="font-medium text-gray-900 mb-2">Verification unsuccessful</p>
                  <p>Don't worry, we can help you get back on track.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            {status === 'success' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg"
              >
                Continue to Dashboard
              </button>
            )}

            {status === 'expired' && (
              <>
                <button
                  onClick={handleResendEmail}
                  className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg"
                >
                  Get new verification link
                </button>
                <button
                  onClick={handleGoToLogin}
                  className="w-full border border-gray-200 py-4 px-4 hover:border-gray-300 transition-colors font-medium text-gray-700"
                >
                  Back to Sign In
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 transition-colors font-medium text-lg"
                >
                  Try Again
                </button>
                <button
                  onClick={handleResendEmail}
                  className="w-full border border-gray-200 py-4 px-4 hover:border-gray-300 transition-colors font-medium text-gray-700"
                >
                  Get new verification link
                </button>
              </>
            )}

            {status === 'loading' && (
              <button
                disabled
                className="w-full bg-gray-400 text-white py-4 cursor-not-allowed font-medium text-lg"
              >
                Verifying...
              </button>
            )}
          </div>

          {/* Help Section */}
          {(status === 'error' || status === 'expired') && (
            <>
              <div className="mb-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Need help?</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-8">
                <div className="flex items-start">
                  <span className="text-xl mr-3">💡</span>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Common issues</h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li>• Verification links expire after 15 minutes</li>
                      <li>• Each link can only be used once</li>
                      <li>• Check if you clicked an old verification link</li>
                      <li>• Clear your browser cache and try again</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Footer Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Still having trouble?{' '}
              <a href="#" className="font-medium text-gray-900 hover:underline">
                Contact Support
              </a>
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900">Privacy Policy</a>
              <a href="#" className="hover:text-gray-900">Terms of Service</a>
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
                <span className="text-white text-3xl">🔐</span>
              </div>
              <h3 className="text-3xl font-light text-gray-900 mb-4">
                Account Verification
              </h3>
              <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                Securing your account with email verification
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-6 mb-16">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Secure Process</h4>
                    <p className="text-sm text-gray-600">Advanced verification protects your account</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Quick Verification</h4>
                    <p className="text-sm text-gray-600">One-time process to secure your account</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Ready to Go</h4>
                    <p className="text-sm text-gray-600">Access all features after verification</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Benefits */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50">
              <h4 className="font-medium text-gray-900 mb-6 text-center">Why We Verify</h4>
              <div className="grid grid-cols-1 gap-4 text-center">
                <div>
                  <div className="text-2xl font-light text-gray-900 mb-1">🔒</div>
                  <div className="text-sm text-gray-600">Account Security</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-900 mb-1">📧</div>
                  <div className="text-sm text-gray-600">Valid Email</div>
                </div>
                <div>
                  <div className="text-2xl font-light text-gray-900 mb-1">🚫</div>
                  <div className="text-sm text-gray-600">Spam Prevention</div>
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
}

