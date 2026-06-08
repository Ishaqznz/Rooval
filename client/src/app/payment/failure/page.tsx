'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { paymentServiceApi } from '@/services/paymentApiService';

const commonReasons = [
  { icon: '💳', title: 'Card declined', desc: 'Insufficient funds or card restrictions.' },
  { icon: '🔒', title: 'Authentication failed', desc: '3D Secure or OTP verification failed.' },
  { icon: '🌐', title: 'Network issue', desc: 'Connection interrupted during payment.' },
  { icon: '⏰', title: 'Session expired', desc: 'Payment window timed out.' },
];

function PaymentFailureInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!appointmentId) {
      toast.error('No appointment ID found. Please try booking again.');
      return;
    }

    setRetrying(true);
    try {
      const response = await paymentServiceApi.createCheckoutSession({
        input: { appointmentId },
        fields: `url`,
      });

      if (response?.errors) {
        toast.error('Failed to create a payment session. Please try again.');
        return;
      }

      const checkoutUrl = response?.data?.createPaymentSession?.url;
      if (!checkoutUrl) {
        toast.error('Invalid checkout session. Please contact support.');
        return;
      }

      window.location.href = checkoutUrl;
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f6fb] flex items-center justify-center px-4">
      {/* Subtle background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-red-400/8 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#9b7ab8]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">

          {/* Red gradient header strip */}
          <div className="h-2 bg-gradient-to-r from-red-400 via-rose-400 to-red-500" />

          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">

            {/* Error icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500 stroke-[1.5]" />
              </div>
              <AlertTriangle className="absolute -top-1 -right-1 w-5 h-5 text-amber-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              Your payment could not be processed. Your appointment slot is still reserved — you can retry now.
            </p>

            {appointmentId && (
              <div className="mt-3 mb-6 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl w-full">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Appointment ID</p>
                <p className="text-sm font-mono text-red-600 font-semibold break-all">{appointmentId}</p>
              </div>
            )}

            {/* Common reasons */}
            <div className="w-full mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-left mb-3">Common reasons</p>
              <div className="grid grid-cols-2 gap-2">
                {commonReasons.map((r, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-left">
                    <span className="text-base">{r.icon}</span>
                    <p className="text-xs font-semibold text-gray-700 mt-1">{r.title}</p>
                    <p className="text-xs text-gray-400 leading-tight mt-0.5">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary action: Retry */}
            {appointmentId ? (
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl
                           bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] text-white font-semibold text-sm
                           shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all
                           disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mb-3"
              >
                <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
                {retrying ? 'Creating payment session…' : 'Retry Payment'}
              </button>
            ) : (
              <div className="w-full mb-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-left">
                <p className="text-xs text-amber-700 font-medium">
                  No appointment ID found. Please go back and try booking again.
                </p>
              </div>
            )}

            {/* Secondary actions */}
            <div className="flex gap-2 w-full">
              <button
                onClick={() => router.back()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl
                           border-2 border-gray-200 text-gray-600 font-semibold text-sm
                           hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>
              <button
                onClick={() => router.push('/profile/appointments')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl
                           border-2 border-[#9b7ab8]/30 text-[#9b7ab8] font-semibold text-sm
                           hover:bg-purple-50 hover:border-[#9b7ab8] active:scale-95 transition-all"
              >
                <Calendar className="w-4 h-4" />
                My Appointments
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4" />
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f6fb] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#9b7ab8]/30 border-t-[#9b7ab8] animate-spin" />
      </div>
    }>
      <PaymentFailureInner />
    </Suspense>
  );
}