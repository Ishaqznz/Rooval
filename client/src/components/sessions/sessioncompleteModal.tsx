'use client';

import { AppointmentStatus } from '@/interfaces/user/appointment.interface';
import { appointmentServiceApi } from '@/services/appointmentApiService';
import { useState } from 'react';

interface SessionCompleteModalProps {
  isOpen: boolean;
  appointmentId: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

export function SessionCompleteModal({
  isOpen,
  appointmentId,
  onConfirm,
  onDismiss,
}: SessionCompleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentServiceApi.changeAppointmentStatus({
        input: {
          appointmentId,
          status: 'COMPLETED' as AppointmentStatus
        }
      })
      onConfirm();
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#1a1d27] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-white text-lg font-semibold mb-1">Complete Session?</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Mark this appointment as completed. This confirms the consultation has finished and cannot be undone.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs text-center bg-red-500/10 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-white/8 hover:bg-white/12 text-white/70 hover:text-white text-sm font-medium transition-colors disabled:opacity-40"
          >
            Dismiss
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving…
              </>
            ) : (
              'Complete Session'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}