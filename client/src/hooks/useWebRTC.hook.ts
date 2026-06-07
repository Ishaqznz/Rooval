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
  authToken?: string;
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
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioMutedRef  = useRef(false);
  const videoOffRef    = useRef(false);

  // ICE candidate queue — holds candidates that arrive before remoteDescription is set
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

  // ── Flush queued ICE candidates after remoteDescription is set ─────────
  const flushIceQueue = useCallback(async (pc: RTCPeerConnection) => {
    const queue = iceCandidateQueue.current;
    if (queue.length === 0) return;

    log(`Flushing ${queue.length} queued ICE candidates`);
    iceCandidateQueue.current = [];

    for (const candidate of queue) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        log('Flushed queued ICE candidate');
      } catch (e) {
        warn('Failed to add queued ICE candidate', e);
      }
    }
  }, []);

  // ── Create peer connection (reuses existing one if already created) ─────
  const getOrCreatePC = useCallback(() => {
    if (pcRef.current) {
      log('Reusing existing PeerConnection');
      return pcRef.current;
    }

    log('Creating new RTCPeerConnection');
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    const tracks = localStream.current?.getTracks() ?? [];
    log(`Adding ${tracks.length} local tracks to PC`);
    tracks.forEach(track => {
      pc.addTrack(track, localStream.current!);
      log(`Added track: kind=${track.kind} enabled=${track.enabled}`);
    });

    // ── FIX: For audio-only calls, ensure the remote stream handles audio tracks correctly
    // Previously, audio-only remote tracks might not attach to the remoteVideoEl srcObject
    // because the video element isn't rendered — we still need the MediaStream for audio output.
    pc.ontrack = (event) => {
      log(`ontrack fired: kind=${event.track.kind} streams=${event.streams.length}`);
      if (!remoteStream.current) remoteStream.current = new MediaStream();

      const stream = event.streams[0];
      if (stream) {
        stream.getTracks().forEach(track => {
          // Avoid adding duplicate tracks
          const exists = remoteStream.current!.getTracks().find(t => t.id === track.id);
          if (!exists) {
            remoteStream.current!.addTrack(track);
            log(`Remote track added: kind=${track.kind}`);
          }
        });
      } else {
        // Fallback: add the track directly if no stream is attached
        const exists = remoteStream.current!.getTracks().find(t => t.id === event.track.id);
        if (!exists) {
          remoteStream.current!.addTrack(event.track);
          log(`Remote track added (fallback, no stream): kind=${event.track.kind}`);
        }
      }

      if (callType === 'video') {
        // Video call: attach to the <video> element
        if (remoteVideoEl.current) {
          remoteVideoEl.current.srcObject = remoteStream.current;
          log('Remote stream attached to video element');
        } else {
          warn('remoteVideoEl is null when ontrack fired — stream stored, will attach on ref mount');
        }
      } else {
        // ── FIX: Audio-only call — attach stream to a hidden <audio> element
        // When there's no <video> element rendered (isVideo = false), the audio
        // track is in remoteStream but never gets played because nothing has
        // srcObject set. We must play it through an <audio> element instead.
        attachAudioOnly(remoteStream.current!);
        log('Audio-only: attached remote stream to audio element');
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        log(`Sending ICE candidate: type=${event.candidate.type} protocol=${event.candidate.protocol}`);
        socketRef.current?.emit('ice_candidate', {
          appointmentId,
          candidate: event.candidate.toJSON(),
        });
      } else {
        log('ICE gathering complete (null candidate)');
      }
    };

    pc.onicegatheringstatechange = () => {
      log(`ICE gathering state: ${pc.iceGatheringState}`);
    };

    pc.oniceconnectionstatechange = () => {
      log(`ICE connection state: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'failed') {
        warn('ICE failed — if both sides are on different networks, you need a TURN server');
      }
    };

    pc.onsignalingstatechange = () => {
      log(`Signaling state: ${pc.signalingState}`);
    };

    pc.onconnectionstatechange = () => {
      log(`Connection state: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        startTimer();
      }
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        warn('Connection dropped');
        setCallState('ended');
        stopTimer();
      }
    };

    return pc;
  }, [appointmentId, callType, startTimer, stopTimer, flushIceQueue]);

  // ── Hidden <audio> element for audio-only calls ───────────────────────
  // We create one imperatively so it works even without a rendered <video>.
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const attachAudioOnly = useCallback((stream: MediaStream) => {
    if (!audioElRef.current) {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      audio.style.display = 'none';
      document.body.appendChild(audio);
      audioElRef.current = audio;
      log('Created hidden <audio> element for audio-only playback');
    }
    audioElRef.current.srcObject = stream;
    // Some browsers require a user-gesture to play; call play() defensively
    audioElRef.current.play().catch(e => warn('audio.play() failed', e));
  }, []);

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

    // ── FIX: Clean up hidden audio element on call end
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
      audioElRef.current.remove();
      audioElRef.current = null;
      log('Removed hidden audio element');
    }
  }, [stopTimer]);

  // ── Create and send offer ──────────────────────────────────────────────
  const createAndSendOffer = useCallback(async (socket: Socket) => {
    log('Creating offer...');
    const pc = getOrCreatePC();

    if (pc.localDescription) {
      warn('Already have localDescription, skipping offer creation');
      return;
    }

    try {
      // ── FIX: For audio-only calls, explicitly set offerToReceiveAudio
      // Without this, some browsers may not negotiate the audio m-line correctly.
      const offerOptions: RTCOfferOptions = callType === 'audio'
        ? { offerToReceiveAudio: true, offerToReceiveVideo: false }
        : { offerToReceiveAudio: true, offerToReceiveVideo: true };

      const offer = await pc.createOffer(offerOptions);
      await pc.setLocalDescription(offer);
      log('Offer created and set as local description, sending...');
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
      log(`Initialising. role=${role} appointmentId=${appointmentId} callType=${callType}`);

      // ── Step 1: Get media ──────────────────────────────────────────────
      let stream: MediaStream;
      try {
        const constraints: MediaStreamConstraints = {
          audio: true,
          // ── FIX: For audio-only calls set video: false explicitly
          video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
        };
        log('Requesting getUserMedia with constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        log(`getUserMedia success: ${stream.getTracks().map(t => `${t.kind}(${t.readyState})`).join(', ')}`);
      } catch (err: any) {
        warn('getUserMedia failed', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          warn('Camera/mic PERMISSION DENIED');
        } else if (err.name === 'NotFoundError') {
          warn('No camera/mic device found');
        } else if (err.name === 'NotReadableError') {
          warn('Camera/mic in use by another app');
        }
        setCallState('error');
        return;
      }

      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

      localStream.current = stream;

      if (localVideoEl.current && callType === 'video') {
        localVideoEl.current.srcObject = stream;
        log('Local stream attached to video element immediately');
      }

      // ── Step 2: Connect socket ─────────────────────────────────────────
      const socketUrl = `${process.env.NEXT_PUBLIC_SOCKET_BACKEND_URL2}/call`;
      log(`Connecting socket to: ${socketUrl}`);

      const socket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket'],
      });
      socketRef.current = socket;

      // ── Step 3: Socket event handlers ──────────────────────────────────

      socket.on('connect', () => {
        log(`Socket connected: id=${socket.id}`);
        socket.emit('join_room', { appointmentId, callType });
        log(`Emitted join_room: appointmentId=${appointmentId} callType=${callType}`);
      });

      socket.on('connect_error', (err) => {
        warn('Socket connection error', err.message);
        setCallState('error');
      });

      socket.on('room_state', ({ bothPresent, callType: ct }: { bothPresent: boolean; callType: string }) => {
        log(`room_state: bothPresent=${bothPresent} serverCallType=${ct}`);

        if (!bothPresent) {
          setCallState('waiting');
          return;
        }

        if (role === 'doctor') {
          log('Both present on room_state, doctor creating offer now');
          createAndSendOffer(socket);
        } else {
          log('Both present on room_state, user waiting for offer from doctor');
          setCallState('ringing');
        }
      });

      socket.on('peer_joined', () => {
        log(`peer_joined received. role=${role}`);

        if (role === 'doctor') {
          log('Doctor received peer_joined — creating offer');
          createAndSendOffer(socket);
        } else {
          log('User received peer_joined — waiting for doctor offer');
          setCallState('ringing');
        }
      });

      socket.on('incoming_call', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        log(`incoming_call received: sdp.type=${sdp.type}`);
        const pc = getOrCreatePC();

        try {
          log('Setting remote description from offer...');
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          log('Remote description set. Creating answer...');

          await flushIceQueue(pc);

          // ── FIX: Pass offerToReceiveAudio for audio-only answer as well
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          log('Answer created and set as local description. Sending...');
          socket.emit('call_answer', { appointmentId, sdp: pc.localDescription });
        } catch (err) {
          warn('Error handling incoming_call', err);
          setCallState('error');
        }
      });

      socket.on('call_answered', async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        log(`call_answered received: sdp.type=${sdp.type}`);
        const pc = pcRef.current;
        if (!pc) { warn('call_answered: pcRef is null!'); return; }

        try {
          log('Setting remote description from answer...');
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          log('Remote description set from answer');
          await flushIceQueue(pc);
        } catch (err) {
          warn('setRemoteDescription failed on answer', err);
        }
      });

      socket.on('ice_candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        const pc = pcRef.current;

        if (!pc) {
          warn('ice_candidate: no PeerConnection yet, queuing');
          iceCandidateQueue.current.push(candidate);
          return;
        }

        if (!pc.remoteDescription) {
          warn(`ice_candidate: remoteDescription not set yet — queuing (queue size: ${iceCandidateQueue.current.length + 1})`);
          iceCandidateQueue.current.push(candidate);
          return;
        }

        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          log(`ICE candidate added successfully`);
        } catch (e) {
          warn('addIceCandidate failed', e);
        }
      });

      socket.on('peer_media_toggle', ({ audio, video }: { audio: boolean; video: boolean }) => {
        log(`peer_media_toggle: audio=${audio} video=${video}`);
        setPeerAudioMuted(!audio);
        setPeerVideoOff(!video);
      });

      socket.on('call_ended', () => {
        log('call_ended received from peer');
        setCallState('ended');
        cleanup();
      });

      socket.on('disconnect', (reason) => {
        warn(`Socket disconnected: reason=${reason}`);
        if (!cancelled) setCallState('ended');
      });
    }

    init();
    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId, callType, role]);

  // ── Video ref callbacks ────────────────────────────────────────────────
  const setLocalVideoRef = useCallback((el: HTMLVideoElement | null) => {
    localVideoEl.current = el;
    if (el && localStream.current && callType === 'video') {
      el.srcObject = localStream.current;
      log('Local stream attached via ref callback');
    }
  }, [callType]);

  const setRemoteVideoRef = useCallback((el: HTMLVideoElement | null) => {
    remoteVideoEl.current = el;
    if (el && remoteStream.current && callType === 'video') {
      el.srcObject = remoteStream.current;
      log('Remote stream attached via ref callback');
    }
  }, [callType]);

  // ── Controls ───────────────────────────────────────────────────────────
  const toggleAudio = useCallback(() => {
    if (!localStream.current) return;
    const newMuted = !audioMutedRef.current;
    audioMutedRef.current = newMuted;

    localStream.current.getAudioTracks().forEach(t => {
      t.enabled = !newMuted;
      log(`Audio track enabled=${t.enabled}`);
    });

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

    localStream.current.getVideoTracks().forEach(t => {
      t.enabled = !newOff;
      log(`Video track enabled=${t.enabled}`);
    });

    setVideoOff(newOff);
    socketRef.current?.emit('media_toggle', {
      appointmentId,
      audio: !audioMutedRef.current,
      video: !newOff,
    });
  }, [appointmentId]);

  const endCall = useCallback(() => {
    log('endCall called');
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