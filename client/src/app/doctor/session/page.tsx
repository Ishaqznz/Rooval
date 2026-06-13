'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC.hook';
import { IconMic, IconVideo, IconPhone, formatDuration, STATE_MESSAGE } from '@/components/sessions/sessionIcons';
import { SessionCompleteModal } from '@/components/sessions/sessioncompleteModal';
import { appointmentServiceApi } from '@/services/appointmentApiService';
import { AppointmentStatus } from '@/interfaces/user/appointment.interface';

function Controls({
  audioMuted, videoOff, isVideo,
  toggleAudio, toggleVideo, endCall,
}: {
  audioMuted: boolean; videoOff: boolean; isVideo: boolean;
  toggleAudio: () => void; toggleVideo: () => void; endCall: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleAudio}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          audioMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        aria-label={audioMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        <IconMic muted={audioMuted} className="w-5 h-5" />
      </button>

      {isVideo && (
        <button
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            videoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          aria-label={videoOff ? 'Turn on camera' : 'Turn off camera'}
        >
          <IconVideo off={videoOff} className="w-5 h-5" />
        </button>
      )}

      <button
        onClick={endCall}
        className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-lg"
        aria-label="End call"
      >
        <IconPhone className="w-6 h-6 rotate-[135deg]" />
      </button>
    </div>
  );
}

function DoctorSessionInner() {
  const params        = useSearchParams();
  const router        = useRouter();
  const appointmentId = params.get('appointmentId') ?? '';
  const callType      = (params.get('type') as 'video' | 'audio') ?? 'video';

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [sessionMarked, setSessionMarked]         = useState(false);

  const {
    callState, audioMuted, videoOff, peerAudioMuted, peerVideoOff,
    duration, localVideoRef, remoteVideoRef, remoteAudioRef,
    toggleAudio, toggleVideo, endCall,
  } = useWebRTC({ appointmentId, callType, role: 'doctor' });

  useEffect(() => {
    if (callState === 'ended' && !sessionMarked) {
      const t = setTimeout(() => setShowCompleteModal(true), 800);
      return () => clearTimeout(t);
    }
  }, [callState, sessionMarked]);

  useEffect(() => {
    if (sessionMarked) {
      const t = setTimeout(() => router.push('/doctor/dashboard/appointments'), 2000);
      return () => clearTimeout(t);
    }
  }, [sessionMarked, router]);

  useEffect(() => {
    if (callState === 'ended' && !showCompleteModal && !sessionMarked) {
      const t = setTimeout(() => router.push('/doctor/dashboard/appointments'), 3000);
      return () => clearTimeout(t);
    }
  }, [callState, showCompleteModal, sessionMarked, router]);

  async function handleConfirmComplete() {
    try {
      await appointmentServiceApi.changeAppointmentStatus({
        input: { appointmentId, status: 'COMPLETED' as AppointmentStatus },
      });
      setSessionMarked(true);
      setShowCompleteModal(false);
    } catch (err) {
      throw err;
    }
  }

  const isVideo = callType === 'video';

  // ── Session marked ────────────────────────────────────────────────
  if (sessionMarked) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="text-xl font-semibold text-emerald-300">Session Completed</p>
        <p className="text-sm text-white/40">Returning to appointments…</p>
      </div>
    );
  }

  // ── Call ended ────────────────────────────────────────────────────
  if (callState === 'ended') {
    return (
      <>
        <SessionCompleteModal
          isOpen={showCompleteModal}
          appointmentId={appointmentId}
          onConfirm={handleConfirmComplete}
          onDismiss={() => setShowCompleteModal(false)}
        />
        <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <IconPhone className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-xl font-semibold">Call ended</p>
        </div>
      </>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (callState === 'error') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="text-lg font-semibold text-red-300">Permission denied</p>
        <p className="text-sm text-white/50 max-w-xs">
          Could not access camera or microphone. Please check your browser permissions and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Connecting / waiting ──────────────────────────────────────────
  if (callState !== 'connected') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-5 text-white text-center px-4">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
          <IconPhone className="w-8 h-8 text-white/70" />
        </div>
        <p className="text-lg font-medium text-white/80">
          {callState === 'waiting'
            ? 'Waiting for patient to join…'
            : STATE_MESSAGE[callState as keyof typeof STATE_MESSAGE] ?? 'Connecting…'}
        </p>
        <Controls
          audioMuted={audioMuted} videoOff={videoOff} isVideo={isVideo}
          toggleAudio={toggleAudio} toggleVideo={toggleVideo} endCall={endCall}
        />
      </div>
    );
  }

  // ── Connected — video ─────────────────────────────────────────────
  if (isVideo) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center p-4">
        {/* Hidden audio element — autoPlay in JSX satisfies browser autoplay policy */}
        <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

        <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-[#1a1d27]">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

          {peerVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1d27]">
              <span className="text-5xl text-white/20">👤</span>
            </div>
          )}

          {(peerAudioMuted || peerVideoOff) && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {peerAudioMuted && (
                <span className="flex items-center gap-1 bg-black/60 text-white/80 text-[10px] px-2 py-1 rounded-full">
                  <IconMic muted className="w-3 h-3" /> Patient muted
                </span>
              )}
              {peerVideoOff && (
                <span className="flex items-center gap-1 bg-black/60 text-white/80 text-[10px] px-2 py-1 rounded-full">
                  <IconVideo off className="w-3 h-3" /> No video
                </span>
              )}
            </div>
          )}

          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-mono">
            {formatDuration(duration)}
          </div>

          <div className="absolute bottom-4 right-4 w-32 aspect-video rounded-xl overflow-hidden border border-white/10 bg-[#0f1117] shadow-lg">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {videoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1a1d27]">
                <IconVideo off className="w-5 h-5 text-white/30" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Controls
            audioMuted={audioMuted} videoOff={videoOff} isVideo={isVideo}
            toggleAudio={toggleAudio} toggleVideo={toggleVideo} endCall={endCall}
          />
        </div>
      </div>
    );
  }

  // ── Connected — audio only ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-8 px-4">
      {/* Hidden audio element — autoPlay in JSX satisfies browser autoplay policy */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-white/10 ring-2 ring-emerald-500/40 ring-offset-4 ring-offset-[#0f1117] flex items-center justify-center text-4xl">
            👤
          </div>
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-semibold">Patient</p>
          <p className="text-emerald-400 text-sm mt-0.5 font-mono">{formatDuration(duration)}</p>
        </div>
        {peerAudioMuted && (
          <span className="flex items-center gap-1.5 bg-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full">
            <IconMic muted className="w-3.5 h-3.5" /> Patient is muted
          </span>
        )}
      </div>

      <Controls
        audioMuted={audioMuted} videoOff={videoOff} isVideo={false}
        toggleAudio={toggleAudio} toggleVideo={toggleVideo} endCall={endCall}
      />
    </div>
  );
}

export default function DoctorSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>
      </div>
    }>
      <DoctorSessionInner />
    </Suspense>
  );
}