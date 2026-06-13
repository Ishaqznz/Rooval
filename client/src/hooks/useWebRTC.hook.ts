// hooks/useWebRTC.hook.ts
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export type CallState = 'idle' | 'joining' | 'waiting' | 'ringing' | 'connected' | 'ended' | 'error';

interface UseWebRTCOptions {
  appointmentId: string;
  callType: 'video' | 'audio';
  role: 'user' | 'doctor';
}

export function useWebRTC({ appointmentId, callType, role }: UseWebRTCOptions) {
  const [callState, setCallState]           = useState<CallState>('idle');
  const [audioMuted, setAudioMuted]         = useState(false);
  const [videoOff, setVideoOff]             = useState(false);
  const [peerAudioMuted, setPeerAudioMuted] = useState(false);
  const [peerVideoOff, setPeerVideoOff]     = useState(false);
  const [duration, setDuration]             = useState(0);

  const socketRef      = useRef<Socket | null>(null);
  const pcRef          = useRef<RTCPeerConnection | null>(null);
  const localStream    = useRef<MediaStream | null>(null);
  const remoteStream   = useRef<MediaStream | null>(null);
  const localVideoEl   = useRef<HTMLVideoElement | null>(null);
  const remoteVideoEl  = useRef<HTMLVideoElement | null>(null);
  // Always-present hidden <audio> element — handles audio for both call types.
  // For video calls this ensures audio plays even before the <video> element mounts.
  // For audio-only calls this is the sole output element.
  const remoteAudioEl  = useRef<HTMLAudioElement | null>(null);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioMutedRef  = useRef(false);
  const videoOffRef    = useRef(false);

  const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

  const log  = (msg: string, data?: any) => console.log(`[WebRTC][${role}] ${msg}`, data ?? '');
  const warn = (msg: string, data?: any) => console.warn(`[WebRTC][${role}] ⚠️ ${msg}`, data ?? '');

  // ── Timer ──────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setDuration(0);
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // ── Ensure the hidden <audio> element exists ───────────────────────────
  const ensureAudioEl = useCallback(() => {
    if (!remoteAudioEl.current) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.style.display = 'none';
      document.body.appendChild(audio);
      remoteAudioEl.current = audio;
      log('Created hidden <audio> element for remote audio');
    }
    return remoteAudioEl.current;
  }, []);

  // ── Attach remote stream to outputs ───────────────────────────────────
  // Always pipes audio through the hidden <audio> element.
  // For video calls, also pipes the full stream to the <video> element
  // (video element handles video track; audio element handles audio track).
  const attachRemoteStream = useCallback((stream: MediaStream) => {
    // Audio — always attach to the hidden audio element
    const audioEl = ensureAudioEl();
    audioEl.srcObject = stream;
    audioEl.play().catch(e => warn('remoteAudioEl.play() failed', e));
    log('Remote stream attached to hidden audio element');

    // Video — attach to the video element only for video calls
    if (callType === 'video' && remoteVideoEl.current) {
      remoteVideoEl.current.srcObject = stream;
      log('Remote stream also attached to video element');
    }
  }, [callType, ensureAudioEl]);

  // ── Flush queued ICE candidates ────────────────────────────────────────
  const flushIceQueue = useCallback(async (pc: RTCPeerConnection) => {
    const queue = iceCandidateQueue.current;
    if (queue.length === 0) return;
    log(`Flushing ${queue.length} queued ICE candidates`);
    iceCandidateQueue.current = [];
    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        warn('Failed to add queued ICE candidate', e);
      }
    }
  }, []);

  // ── Create peer connection ─────────────────────────────────────────────
  const getOrCreatePC = useCallback(() => {
    if (pcRef.current) return pcRef.current;

    log('Creating new RTCPeerConnection');
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    const tracks = localStream.current?.getTracks() ?? [];
    log(`Adding ${tracks.length} local tracks to PC`);
    tracks.forEach(track => {
      pc.addTrack(track, localStream.current!);
      log(`Added track: kind=${track.kind} enabled=${track.enabled}`);
    });

    pc.ontrack = (event) => {
      log(`ontrack fired: kind=${event.track.kind} streams=${event.streams.length}`);

      if (!remoteStream.current) remoteStream.current = new MediaStream();

      // Collect all tracks from the event
      const tracksToAdd = event.streams[0]
        ? event.streams[0].getTracks()
        : [event.track];

      tracksToAdd.forEach(track => {
        const exists = remoteStream.current!.getTracks().find(t => t.id === track.id);
        if (!exists) {
          remoteStream.current!.addTrack(track);
          log(`Remote track added: kind=${track.kind}`);
        }
      });

      // Always re-attach whenever a new track arrives so nothing is missed
      attachRemoteStream(remoteStream.current!);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice_candidate', {
          appointmentId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      log(`ICE connection state: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'failed') {
        warn('ICE failed — TURN server may be needed for cross-network calls');
      }
    };

    pc.onconnectionstatechange = () => {
      log(`Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        startTimer();
        // Re-attach in case the video element mounted after ontrack fired
        if (remoteStream.current) attachRemoteStream(remoteStream.current);
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        warn('Connection dropped');
        setCallState('ended');
        stopTimer();
      }
    };

    return pc;
  }, [appointmentId, callType, attachRemoteStream, startTimer, stopTimer]);

  // ── Cleanup ────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    log('Cleaning up');
    stopTimer();
    localStream.current?.getTracks().forEach(t => t.stop());
    localStream.current  = null;
    remoteStream.current = null;
    iceCandidateQueue.current = [];
    pcRef.current?.close();
    pcRef.current = null;
    socketRef.current?.disconnect();
    socketRef.current = null;
    if (localVideoEl.current)  localVideoEl.current.srcObject  = null;
    if (remoteVideoEl.current) remoteVideoEl.current.srcObject = null;
    if (remoteAudioEl.current) {
      remoteAudioEl.current.srcObject = null;
      remoteAudioEl.current.remove();
      remoteAudioEl.current = null;
      log('Removed hidden audio element');
    }
  }, [stopTimer]);

  // ── Create and send offer (doctor only) ───────────────────────────────
  const createAndSendOffer = useCallback(async (socket: Socket) => {
    const pc = getOrCreatePC();
    if (pc.localDescription) {
      warn('Already have localDescription, skipping offer');
      return;
    }
    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      await pc.setLocalDescription(offer);
      socket.emit('call_offer', { appointmentId, sdp: pc.localDescription });
      setCallState('ringing');
    } catch (err) {
      warn('Failed to create offer', err);
      setCallState('error');
    }
  }, [appointmentId, callType, getOrCreatePC]);

  // ── Main init effect ───────────────────────────────────────────────────
  useEffect(() => {
    if (!appointmentId) return;
    let cancelled = false;

    async function init() {
      setCallState('joining');

      // Step 1: Get media
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video'
            ? { width: { ideal: 1280 }, height: { ideal: 720 } }
            : false,
        });
        log(`getUserMedia success: ${stream.getTracks().map(t => `${t.kind}(${t.readyState})`).join(', ')}`);
      } catch (err: any) {
        warn('getUserMedia failed', err);
        setCallState('error');
        return;
      }

      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

      localStream.current = stream;
      if (localVideoEl.current && callType === 'video') {
        localVideoEl.current.srcObject = stream;
      }

      // Step 2: Connect socket
      const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL2}/call`, {
        withCredentials: true,
        transports: ['websocket'],
      });
      socketRef.current = socket;

      // Step 3: Socket events
      socket.on('connect', () => {
        log(`Socket connected: id=${socket.id}`);
        socket.emit('join_room', { appointmentId, callType });
      });

      socket.on('connect_error', (err) => {
        warn('Socket connection error', err.message);
        setCallState('error');
      });

      socket.on('room_state', ({ bothPresent }: { bothPresent: boolean }) => {
        if (!bothPresent) { setCallState('waiting'); return; }
        if (role === 'doctor') createAndSendOffer(socket);
        else setCallState('ringing');
      });

      socket.on('peer_joined', () => {
        if (role === 'doctor') createAndSendOffer(socket);
        else setCallState('ringing');
      });

      socket.on('incoming_call', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        log(`incoming_call: sdp.type=${sdp.type}`);
        const pc = getOrCreatePC();
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await flushIceQueue(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('call_answer', { appointmentId, sdp: pc.localDescription });
        } catch (err) {
          warn('Error handling incoming_call', err);
          setCallState('error');
        }
      });

      socket.on('call_answered', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        const pc = pcRef.current;
        if (!pc) { warn('call_answered: pcRef is null'); return; }
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await flushIceQueue(pc);
        } catch (err) {
          warn('setRemoteDescription failed on answer', err);
        }
      });

      socket.on('ice_candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        const pc = pcRef.current;
        if (!pc || !pc.remoteDescription) {
          iceCandidateQueue.current.push(candidate);
          return;
        }
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          warn('addIceCandidate failed', e);
        }
      });

      socket.on('peer_media_toggle', ({ audio, video }: { audio: boolean; video: boolean }) => {
        setPeerAudioMuted(!audio);
        setPeerVideoOff(!video);
      });

      socket.on('call_ended', () => {
        log('call_ended received');
        setCallState('ended');
        cleanup();
      });

      socket.on('disconnect', (reason) => {
        warn(`Socket disconnected: ${reason}`);
        if (!cancelled) setCallState('ended');
      });
    }

    init();
    return () => { cancelled = true; cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, callType, role]);

  // ── Ref callbacks ──────────────────────────────────────────────────────
  const setLocalVideoRef = useCallback((el: HTMLVideoElement | null) => {
    localVideoEl.current = el;
    if (el && localStream.current && callType === 'video') {
      el.srcObject = localStream.current;
    }
  }, [callType]);

  const setRemoteVideoRef = useCallback((el: HTMLVideoElement | null) => {
    remoteVideoEl.current = el;
    // When the video element mounts (after state becomes 'connected'),
    // attach the stream if we already have it
    if (el && remoteStream.current && callType === 'video') {
      el.srcObject = remoteStream.current;
      log('Remote stream attached to video element via ref callback');
    }
  }, [callType]);

  // ── Controls ───────────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    if (!localStream.current) return;
    const newMuted = !audioMutedRef.current;
    audioMutedRef.current = newMuted;
    localStream.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setAudioMuted(newMuted);
    socketRef.current?.emit('media_toggle', {
      appointmentId,
      audio: !newMuted,
      video: !videoOffRef.current,
    });
  }, [appointmentId]);

  const toggleVideo = useCallback(() => {
    if (!localStream.current) return;
    const newOff = !videoOffRef.current;
    videoOffRef.current = newOff;
    localStream.current.getVideoTracks().forEach(t => { t.enabled = !newOff; });
    setVideoOff(newOff);
    socketRef.current?.emit('media_toggle', {
      appointmentId,
      audio: !audioMutedRef.current,
      video: !newOff,
    });
  }, [appointmentId]);

  const endCall = useCallback(() => {
    socketRef.current?.emit('end_call', { appointmentId });
    setCallState('ended');
    cleanup();
  }, [appointmentId, cleanup]);

  return {
    callState, audioMuted, videoOff,
    peerAudioMuted, peerVideoOff,
    duration,
    localVideoRef:  setLocalVideoRef,
    remoteVideoRef: setRemoteVideoRef,
    toggleAudio, toggleVideo, endCall,
  };
}