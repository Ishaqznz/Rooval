// components/session/SessionIcons.tsx

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionState =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'muted'
  | 'on-hold'
  | 'ended'
  | 'error'
  | 'joining'
  | 'ringing'
  | 'waiting';

export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Formats a duration in seconds into a human-readable string.
 * e.g. 90 → "1:30"  |  3661 → "1:01:01"
 */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mm = String(m).padStart(h > 0 ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');

  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// ─── State → human-readable message ──────────────────────────────────────────

export const STATE_MESSAGE: Record<SessionState, string> = {
  idle:       'Ready to connect',
  connecting: 'Connecting…',
  active:     'In session',
  muted:      'Microphone muted',
  'on-hold':  'Session on hold',
  ended:      'Session ended',
  error:      'Connection error',
  joining:    'Joining session…',
  ringing:    'Ringing…',
  waiting:    'Waiting for patient to join…',
};

// ─── Icons ────────────────────────────────────────────────────────────────────

/**
 * Microphone icon.
 * Renders a filled mic when active; crossed-out variant when `muted` prop is set.
 */
export const IconMic: React.FC<IconProps & { muted?: boolean }> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
  muted = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Capsule body */}
    <rect x="9" y="2" width="6" height="11" rx="3" />
    {/* Stand arc */}
    <path d="M5 10a7 7 0 0 0 14 0" />
    {/* Stem */}
    <line x1="12" y1="17" x2="12" y2="22" />
    {/* Base */}
    <line x1="8" y1="22" x2="16" y2="22" />
    {/* Strike-through when muted */}
    {muted && <line x1="3" y1="3" x2="21" y2="21" strokeWidth={strokeWidth + 0.5} />}
  </svg>
);

/**
 * Video camera icon.
 */
export const IconVideo: React.FC<IconProps & { off?: boolean }> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
  off = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Camera body */}
    <rect x="2" y="7" width="13" height="10" rx="2" />
    {/* Camera lens arrow */}
    <polyline points="15 10 21 7 21 17 15 14" />
    {/* Strike-through when off */}
    {off && <line x1="2" y1="2" x2="22" y2="22" strokeWidth={strokeWidth + 0.5} />}
  </svg>
);

/**
 * Phone icon — used for call controls.
 * Pass `variant="end"` for a hang-up style (rotated red phone).
 */
export const IconPhone: React.FC<IconProps & { variant?: 'default' | 'end' }> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
  variant = 'default',
}) => {
  const transform = variant === 'end' ? 'rotate(135, 12, 12)' : undefined;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <g transform={transform}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </g>
    </svg>
  );
};

// ─── Demo page (default export) ──────────────────────────────────────────────

const DEMO_STATES: SessionState[] = [
  'idle', 'connecting', 'joining', 'ringing', 'waiting', 'active', 'muted', 'on-hold', 'ended', 'error',
];

const STATE_COLOR: Record<SessionState, string> = {
  idle:       '#94a3b8',
  connecting: '#f59e0b',
  active:     '#22c55e',
  muted:      '#f97316',
  'on-hold':  '#a78bfa',
  ended:      '#64748b',
  error:      '#ef4444',
  joining:    '#38bdf8',
  ringing:    '#818cf8',
  waiting:    '#fb7185',
};

export default function SessionIconsPage() {
  const [elapsed, setElapsed] = React.useState(0);
  const [state, setState] = React.useState<SessionState>('idle');

  // Tick the demo timer when "active"
  React.useEffect(() => {
    if (state !== 'active') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const accent = STATE_COLOR[state];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#e2e8f0',
      fontFamily: '"DM Mono", "Fira Code", monospace',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2.5rem',
      padding: '2rem',
    }}>

      {/* Title */}
      <h1 style={{ fontSize: '0.75rem', letterSpacing: '0.25em', color: '#475569', margin: 0, textTransform: 'uppercase' }}>
        SessionIcons · Component Preview
      </h1>

      {/* Status badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        background: '#111118',
        border: `1px solid ${accent}33`,
        borderRadius: '999px',
        padding: '0.4rem 1.1rem',
        fontSize: '0.78rem',
        letterSpacing: '0.05em',
        color: accent,
        transition: 'all 0.3s ease',
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: accent,
          boxShadow: `0 0 8px ${accent}`,
          animation: state === 'connecting' ? 'pulse 1s infinite' : 'none',
        }} />
        {STATE_MESSAGE[state]}
        {state === 'active' && (
          <span style={{ marginLeft: '0.5rem', opacity: 0.7 }}>{formatDuration(elapsed)}</span>
        )}
      </div>

      {/* Icon row */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
      }}>
        {/* Mic */}
        <button
          title={state === 'muted' ? 'Unmute' : 'Mute'}
          onClick={() => setState(s => s === 'muted' ? 'active' : 'muted')}
          style={iconBtn(state === 'muted' ? '#f97316' : '#1e293b')}
        >
          <IconMic size={22} muted={state === 'muted'} color={state === 'muted' ? '#f97316' : '#94a3b8'} />
        </button>

        {/* Video */}
        <button
          title="Toggle video"
          style={iconBtn('#1e293b')}
        >
          <IconVideo size={22} color="#94a3b8" />
        </button>

        {/* End call */}
        <button
          title="End call"
          onClick={() => { setState('ended'); setElapsed(0); }}
          style={iconBtn('#ef4444', true)}
        >
          <IconPhone size={22} variant="end" color="#fff" />
        </button>
      </div>

      {/* State picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: 480 }}>
        {DEMO_STATES.map(s => (
          <button
            key={s}
            onClick={() => { setState(s); if (s !== 'active') setElapsed(0); }}
            style={{
              background: state === s ? `${STATE_COLOR[s]}22` : 'transparent',
              border: `1px solid ${state === s ? STATE_COLOR[s] : '#1e293b'}`,
              borderRadius: '6px',
              color: state === s ? STATE_COLOR[s] : '#475569',
              padding: '0.3rem 0.75rem',
              fontSize: '0.7rem',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s ease',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Export reference */}
      <pre style={{
        background: '#0f1117',
        border: '1px solid #1e293b',
        borderRadius: '10px',
        padding: '1rem 1.5rem',
        fontSize: '0.7rem',
        color: '#64748b',
        lineHeight: 1.8,
        maxWidth: 480,
        width: '100%',
      }}>
{`import {
  IconMic,        // <IconMic muted? />
  IconVideo,      // <IconVideo off? />
  IconPhone,      // <IconPhone variant="end" />
  formatDuration, // (seconds: number) => string
  STATE_MESSAGE,  // Record<SessionState, string>
} from '@/components/session/SessionIcons';`}
      </pre>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        button:hover { filter: brightness(1.2); }
      `}</style>
    </div>
  );
}

function iconBtn(bg: string, filled = false): React.CSSProperties {
  return {
    width: 52,
    height: 52,
    borderRadius: '50%',
    background: filled ? bg : bg,
    border: `1px solid ${bg === '#1e293b' ? '#334155' : bg}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
}