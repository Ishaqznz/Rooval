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

  const socketRef     = useRef<Socket | null>(null);
  const pcRef         = useRef<RTCPeerConnection | null>(null);
  const localStream   = useRef<MediaStream | null>(null);
  const remoteStream  = useRef<MediaStream | null>(null);
  const localVideoEl  = useRef<HTMLVideoElement | null>(null);
  const remoteVideoEl = useRef<HTMLVideoElement | null>(null);
  const remoteAudioEl = useRef<HTMLAudioElement | null>(null);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioMutedRef = useRef(false);
  const videoOffRef   = useRef(false);

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

  // ── Attach remote stream to all output elements ────────────────────────
  const attachRemoteStream = useCallback((stream: MediaStream) => {
    // Always pipe through the declarative <audio> ref — browser autoplay policy
    // is satisfied because the element comes from JSX (autoPlay attribute),
    // not document.createElement().
    if (remoteAudioEl.current) {
      remoteAudioEl.current.srcObject = stream;
      remoteAudioEl.current.play().catch(e => warn('remoteAudioEl.play() failed', e));
      log('Remote stream attached to <audio> element');
    } else {
      warn('remoteAudioEl is null — audio will not play');
    }

    // For video calls also attach to the <video> element when it is mounted
    if (callType === 'video' && remoteVideoEl.current) {
      remoteVideoEl.current.srcObject = stream;
      log('Remote stream attached to <video> element');
    }
  }, [callType]);

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
        // Re-attach after React re-renders the connected UI and mounts the elements
        setTimeout(() => {
          if (remoteStream.current) attachRemoteStream(remoteStream.current);
        }, 100);
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
    if (remoteAudioEl.current) remoteAudioEl.current.srcObject = null;
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

      const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL2}/call`, {
        withCredentials: true,
        transports: ['websocket'],
      });
      socketRef.current = socket;

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
    if (el && remoteStream.current && callType === 'video') {
      el.srcObject = remoteStream.current;
      log('Remote stream attached to video element via ref callback');
    }
  }, [callType]);

  // ── Key fix: declarative ref for the <audio> element in JSX ───────────
  // The browser grants autoplay because the element is rendered via JSX
  // with the autoPlay attribute — not created imperatively via JS.
  const setRemoteAudioRef = useCallback((el: HTMLAudioElement | null) => {
    remoteAudioEl.current = el;
    if (el && remoteStream.current) {
      el.srcObject = remoteStream.current;
      el.play().catch(e => warn('remoteAudioEl.play() via ref failed', e));
      log('Remote stream attached to audio element via ref callback');
    }
  }, []);

  // ── Controls ───────────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    if (!localStream.current) return;
    const newMuted = !audioMutedRef.current;
    audioMutedRef.current = newMuted;
    localStream.current.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setAudioMuted(newMuted);

    // Piggyback on this user gesture to unlock remote audio if still paused
    if (remoteAudioEl.current?.paused && remoteAudioEl.current.srcObject) {
      remoteAudioEl.current.play().catch(() => {});
    }

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
    remoteAudioRef: setRemoteAudioRef,  // ← new
    toggleAudio, toggleVideo, endCall,
  };
}