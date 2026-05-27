'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, ArrowRight, Sparkles } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const DURATION = 5000; // 5 seconds total
    const TICK = 50; // update every 50ms for smooth progress bar
    let elapsed = 0;

    intervalRef.current = setInterval(() => {
      elapsed += TICK;
      const pct = Math.min((elapsed / DURATION) * 100, 100);
      setProgress(pct);
      setCountdown(Math.max(Math.ceil((DURATION - elapsed) / 1000), 0));

      if (elapsed >= DURATION) {
        clearInterval(intervalRef.current!);
        router.push('/profile/appointments');
      }
    }, TICK);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8f6fb] flex items-center justify-center px-4">
      {/* Subtle background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#9b7ab8]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full bg-[#7d5d9a]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">

          {/* Purple gradient header */}
          <div className="h-2 bg-gradient-to-r from-[#9b7ab8] via-[#b399c9] to-[#7d5d9a]" />

          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center">

            {/* Animated success icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center
                             animate-[scale-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)_both]">
                <CheckCircle className="w-12 h-12 text-green-500 stroke-[1.5]" />
              </div>
              {/* Sparkle accents */}
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-400 animate-pulse" />
              <Sparkles className="absolute -bottom-1 -left-2 w-4 h-4 text-[#9b7ab8] animate-pulse [animation-delay:0.3s]" />
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              Your appointment has been confirmed and payment received.
            </p>

            {appointmentId && (
              <div className="mt-3 mb-6 px-4 py-2.5 bg-purple-50 border border-purple-100 rounded-xl w-full">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Appointment ID</p>
                <p className="text-sm font-mono text-[#7d5d9a] font-semibold break-all">{appointmentId}</p>
              </div>
            )}

            {/* What's next */}
            <div className="w-full bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-3">
              {[
                { icon: '📧', text: "A confirmation has been sent to your registered email." },
                { icon: '🔔', text: "You'll receive a reminder before your appointment." },
                { icon: '📋', text: "View full details in My Appointments." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-lg leading-none mt-0.5">{item.icon}</span>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Countdown progress */}
            <div className="w-full mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-gray-400">Redirecting to appointments…</p>
                <p className="text-xs font-semibold text-[#9b7ab8]">{countdown}s</p>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] rounded-full transition-[width] ease-linear"
                  style={{ width: `${progress}%`, transitionDuration: '50ms' }}
                />
              </div>
            </div>

            {/* CTA button */}
            <button
              onClick={() => router.push('/profile/appointments')}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl
                         bg-gradient-to-r from-[#9b7ab8] to-[#7d5d9a] text-white font-semibold text-sm
                         shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Calendar className="w-4 h-4" />
              Go to My Appointments
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom tag */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Secured by <span className="font-semibold text-[#9b7ab8]">HealthConnect</span>
        </p>
      </div>
    </div>
  );
}