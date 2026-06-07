'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSocket } from '@/sockets/socket';

const SESSION_ROUTES = ['/session', '/doctor/session'];

interface IncomingCallPayload {
  appointmentId: string;
  doctorName: string;
  callType: 'video' | 'audio';
}

export default function IncomingCallNotification() {
  const { user }    = useAuth();
  const router      = useRouter();
  const pathname    = usePathname();
  const [incoming, setIncoming] = useState<IncomingCallPayload | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── ALL hooks must come before any early return ──────────────────
  useEffect(() => {
    if (!user || user.status) return;

    const socket = getSocket();
    if (!socket) return;

    const handleIncomingCall = (data: IncomingCallPayload) => {
      setIncoming(data);
      timeoutRef.current = setTimeout(() => setIncoming(null), 30_000);
      ringtoneRef.current?.play().catch(() => {});
    };

    socket.on('incoming_call_notification', handleIncomingCall);
    return () => { socket.off('incoming_call_notification', handleIncomingCall); };
  }, [user]);

  // ── Early returns AFTER all hooks ────────────────────────────────
  if (SESSION_ROUTES.some(route => pathname?.startsWith(route))) return null;
  if (!incoming) return null;

  const dismiss = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    ringtoneRef.current?.pause();
    setIncoming(null);
  };

  const accept = () => {
    if (!incoming) return;
    dismiss();
    router.push(`/session?appointmentId=${incoming.appointmentId}&type=${incoming.callType}`);
  };

  return (
    <>
      <audio ref={ringtoneRef} loop preload="none">
        <source src="/sounds/ringtone.mp3" type="audio/mpeg" />
      </audio>

      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm bg-[#1a1d27] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
          role="alertdialog"
          aria-labelledby="call-title"
          aria-describedby="call-desc"
        >
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 animate-pulse" />

          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                  👨‍⚕️
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-blue-400/40 animate-ping" />
              </div>
              <div>
                <p id="call-title" className="text-white font-semibold text-base leading-tight">
                  {incoming.doctorName || 'Your Doctor'}
                </p>
                <p id="call-desc" className="text-white/50 text-sm mt-0.5 flex items-center gap-1.5">
                  {incoming.callType === 'video' ? (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.72v6.56a1 1 0 0 1-1.45.9L15 14" />
                        <rect x="2" y="7" width="13" height="10" rx="2" />
                      </svg>
                      Incoming video call
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Incoming audio call
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={dismiss}
                className="flex-1 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                aria-label="Decline call"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Decline
              </button>

              <button
                onClick={accept}
                className="flex-1 h-12 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                aria-label="Accept call"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}