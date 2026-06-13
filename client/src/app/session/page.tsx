'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useWebRTC } from '@/hooks/useWebRTC.hook';
import { useAuth } from '@/context/AuthContext';

function formatDuration(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function IconMic({ muted, className = '' }: { muted: boolean; className?: string }) {
  return muted ? (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ) : (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function IconVideo({ off, className = '' }: { off: boolean; className?: string }) {
  return off ? (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34" />
      <path d="M23 7l-7 5 7 5V7z" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.72v6.56a1 1 0 0 1-1.45.9L15 14" />
      <rect x="2" y="7" width="13" height="10" rx="2" />
    </svg>
  );
}

function IconPhone({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

const STATE_LABEL: Record<string, string> = {
  idle:    'Getting ready…',
  joining: 'Setting up your microphone…',
  waiting: 'Waiting for your doctor to join…',
  ringing: 'Connecting to your doctor…',
};

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

function SessionInner() {
  const params   = useSearchParams();
  const router   = useRouter();
  const { user } = useAuth();

  const appointmentId = params.get('appointmentId') ?? '';
  const callType      = (params.get('type') as 'video' | 'audio') ?? 'video';

  const {
    callState, audioMuted, videoOff, peerAudioMuted, peerVideoOff,
    duration, localVideoRef, remoteVideoRef, remoteAudioRef,
    toggleAudio, toggleVideo, endCall,
  } = useWebRTC({ appointmentId, callType, role: 'user' });

  useEffect(() => {
    if (callState === 'ended') {
      const t = setTimeout(() => router.push('/profile/appointments'), 3000);
      return () => clearTimeout(t);
    }
  }, [callState, router]);

  const isVideo = callType === 'video';

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <p className="text-white/50 text-sm">Authenticating…</p>
      </div>
    );
  }

  if (callState === 'ended') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-4 text-white text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <IconPhone className="w-8 h-8 text-red-400" />
        </div>
        <p className="text-xl font-semibold">Call ended</p>
        <p className="text-sm text-white/40">Redirecting you back…</p>
      </div>
    );
  }

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

  if (callState !== 'connected') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-5 text-white text-center px-4">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
          {isVideo
            ? <IconVideo off={false} className="w-8 h-8 text-white/70" />
            : <IconPhone className="w-8 h-8 text-white/70" />}
        </div>
        <p className="text-lg font-medium text-white/80">
          {STATE_LABEL[callState] ?? 'Connecting…'}
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
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-3xl text-white/40">👨‍⚕️</span>
              </div>
            </div>
          )}

          {(peerAudioMuted || peerVideoOff) && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {peerAudioMuted && (
                <span className="flex items-center gap-1 bg-black/60 text-white/80 text-[10px] px-2 py-1 rounded-full">
                  <IconMic muted className="w-3 h-3" /> Muted
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
            👨‍⚕️
          </div>
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-semibold">Your Doctor</p>
          <p className="text-emerald-400 text-sm mt-0.5 font-mono">{formatDuration(duration)}</p>
        </div>
        {peerAudioMuted && (
          <span className="flex items-center gap-1.5 bg-white/10 text-white/60 text-xs px-3 py-1.5 rounded-full">
            <IconMic muted className="w-3.5 h-3.5" /> Doctor is muted
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

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
          <svg className="w-8 h-8 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M15 10l4.55-2.27A1 1 0 0 1 21 8.72v6.56a1 1 0 0 1-1.45.9L15 14" />
            <rect x="2" y="7" width="13" height="10" rx="2" />
          </svg>
        </div>
      </div>
    }>
      <SessionInner />
    </Suspense>
  );
}