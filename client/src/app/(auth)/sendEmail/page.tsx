'use client';
import { useState, useEffect } from 'react';

export default function CheckInboxPage() {
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const handleResend = async () => {
    setIsResending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsResending(false);
    setCanResend(false);
    setTimeLeft(60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Main Content */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-2">Check your inbox!</h2>
            <p className="text-gray-600">We've sent a secure sign-in link to your email address</p>
          </div>

          {/* Email Display */}
          <div className="mb-8">
            {/* <div className="bg-gray-50 border border-gray-200 rounded px-4 py-3">
               <div className="flex items-center">
                <span className="text-2xl mr-3">📧</span>
                <span className="text-gray-900 font-medium">user@email.com</span>
              </div> 
            </div> */}
            <p className="text-sm text-gray-600 mt-3">
              Click the link in the email to continue to your dashboard.
            </p>
          </div>

          {/* Security Info */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-8">
            <div className="flex items-start">
              <span className="text-xl mr-3 mt-1">🔒</span>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Secure Authentication</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  For your security, this link is valid for 15 minutes and can only be used once. 
                  If you don't see the email, check your spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleResend}
              disabled={!canResend || isResending}
              className="w-full bg-gray-900 text-white py-4 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-lg flex items-center justify-center"
            >
              {isResending ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Sending new link...
                </>
              ) : canResend ? (
                <>
                  <span className="mr-2">🔄</span>
                  Resend verification email
                </>
              ) : (
                <>
                  <span className="mr-2">⏰</span>
                  Resend in {formatTime(timeLeft)}
                </>
              )}
            </button>

            <button className="w-full border border-gray-200 py-4 px-4 hover:border-gray-300 transition-colors font-medium text-gray-700 flex items-center justify-center">
              Use a different email address
              <span className="ml-2">→</span>
            </button>
          </div>

          {/* Divider */}
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

          {/* Help Section */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-8">
            <div className="flex items-start">
              <span className="text-xl mr-3">💡</span>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Troubleshooting</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Check your spam or junk folder</li>
                  <li>• Ensure user@email.com is correct</li>
                  <li>• Try adding noreply@collabhub.com to your contacts</li>
                  <li>• Wait a few minutes - emails can sometimes be delayed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Having trouble?{' '}
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
                <span className="text-white text-3xl">📧</span>
              </div>
              <h3 className="text-3xl font-light text-gray-900 mb-4">
                Secure Email Verification
              </h3>
              <p className="text-gray-600 text-lg max-w-sm mx-auto leading-relaxed">
                Your account security is our top priority
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
                    <h4 className="font-medium text-gray-900 mb-1">Instant Access</h4>
                    <p className="text-sm text-gray-600">One-click sign-in with secure magic links</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">🛡️</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Military-Grade Security</h4>
                    <p className="text-sm text-gray-600">Advanced encryption protects your data</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">✨</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Seamless Experience</h4>
                    <p className="text-sm text-gray-600">No passwords to remember or manage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50">
              <h4 className="font-medium text-gray-900 mb-6 text-center">Verification Process</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                    ✓
                  </div>
                  <span className="text-sm text-gray-600">Account created successfully</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                    2
                  </div>
                  <span className="text-sm text-gray-900 font-medium">Check your email inbox</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                    3
                  </div>
                  <span className="text-sm text-gray-500">Click verification link</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                    4
                  </div>
                  <span className="text-sm text-gray-500">Access your dashboard</span>
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