'use client'

import React, { useEffect, useRef, useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { Phone, PhoneOff } from 'lucide-react';

export default function CallPage(props: any) {
  const roomId = props.params?.id;
  const [role, setRole] = useState<'user' | 'astrologer' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isCallStarted, setIsCallStarted] = useState(false);

  useEffect(() => {
    const isAstrologer = window.location.href.includes('/astrologer/');
    setRole(isAstrologer ? 'astrologer' : 'user');

    // Get the WebSocket URL from environment or fallback
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
                 (window.location.protocol === 'https:' ? 
                   'wss://astroalert-backend-m1hn.onrender.com/ws' : 
                   'ws://localhost:3001/ws');

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    function connect() {
      try {
        if (wsRef.current) {
          wsRef.current.close();
        }

        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          console.log('WebSocket Connected');
          setConnectionStatus('connected');
          setError(null);
          reconnectAttempts = 0;

          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'join',
              roomId,
              userId: localStorage.getItem('userId'),
              role: isAstrologer ? 'astrologer' : 'user'
            }));
          }
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          setConnectionStatus('failed');
          setError('Failed to connect to call service. Please check your internet connection.');
          
          // Try to reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connect, 2000 * reconnectAttempts); // Exponential backoff
          }
        };

        wsRef.current.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          setConnectionStatus('failed');
          setError('Call service disconnected. Attempting to reconnect...');

          // Try to reconnect if not intentionally closed
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connect, 2000 * reconnectAttempts);
          }
        };

        wsRef.current.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received message:', data);

            if (!data || !data.type) return;

            switch (data.type) {
              case 'connected':
                setConnectionStatus('connected');
                setError(null);
                break;
              case 'user_joined':
                console.log('User joined:', data);
                break;
              case 'user_left':
                console.log('User left:', data);
                if (peerConnectionRef.current) {
                  peerConnectionRef.current.close();
                }
                setIsCallStarted(false);
                break;
              case 'offer':
              case 'answer':
              case 'candidate':
                await handleSignalingData(data);
                break;
              case 'error':
                setError(data.message || 'An error occurred');
                break;
            }
          } catch (error) {
            console.error('Error handling message:', error);
            setError('Failed to process call data');
          }
        };
      } catch (error) {
        console.error('Failed to setup WebSocket:', error);
        setConnectionStatus('failed');
        setError('Failed to initialize call service');
      }
    }

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Leaving call page');
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [roomId]);

  const handleSignalingData = async (data: any) => {
    try {
      switch (data.type) {
        case 'offer':
          if (!peerConnectionRef.current) {
            await startCall();
          }
          await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnectionRef.current?.createAnswer();
          await peerConnectionRef.current?.setLocalDescription(answer);
          wsRef.current?.send(JSON.stringify({
            type: 'answer',
            answer: answer,
            roomId,
            userId: localStorage.getItem('userId')
          }));
          break;

        case 'answer':
          if (peerConnectionRef.current?.signalingState !== 'stable') {
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
          break;

        case 'candidate':
          if (peerConnectionRef.current && data.candidate) {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
          break;
      }
    } catch (error) {
      console.error('Error in signaling:', error);
    }
  };

  const startCall = async () => {
    try {
      // Check if WebSocket is connected
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket connection not ready');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      }).catch(error => {
        if (error.name === 'NotAllowedError') {
          throw new Error('Please allow camera and microphone access to start the call');
        }
        throw error;
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      });
      
      peerConnectionRef.current = peerConnection;

      // Add all tracks to the peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsCallStarted(true);
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('Connection state:', peerConnection.connectionState);
        switch(peerConnection.connectionState) {
          case 'connected':
            setConnectionStatus('connected');
            setError(null);
            break;
          case 'failed':
            setConnectionStatus('failed');
            setError('Connection failed. Please try again.');
            break;
          case 'disconnected':
            setConnectionStatus('failed');
            setError('Call disconnected');
            break;
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'candidate',
            candidate: event.candidate,
            roomId,
            userId: localStorage.getItem('userId')
          }));
        }
      };

      // Only create offer if we're the initiator (user)
      if (role === 'user') {
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await peerConnection.setLocalDescription(offer);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            offer: offer,
            roomId,
            userId: localStorage.getItem('userId')
          }));
        }
      }

      setIsCallStarted(true);
    } catch (error) {
      console.error('Error starting call:', error);
      setError('Failed to start call: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsCallStarted(false);
    }
  };

  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    wsRef.current?.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-chandan via-white to-sacred-haldi/10 p-4">
      <div className="max-w-6xl mx-auto">
        <Typography variant="h5" className="mb-4 text-sacred-kumkum">
          {role === 'astrologer' ? 'Consultation Session' : 'Meeting with Astrologer'}
        </Typography>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <Typography variant="body2">{error}</Typography>
          </div>
        )}

        <Typography variant="body2" className="mb-4 text-gray-600">
          Status: {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Failed'}
        </Typography>

        <div className="grid grid-cols-2 gap-4 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <div className="bg-black rounded-lg overflow-hidden relative">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
              <Typography className="text-white">You</Typography>
            </div>
          </div>
          <div className="bg-black rounded-lg overflow-hidden relative">
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50">
              <Typography className="text-white">Remote User</Typography>
            </div>
            {!isCallStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <Typography className="text-white">Waiting for connection...</Typography>
              </div>
            )}
          </div>
        </div>

        <Box className="flex justify-center mt-4 gap-4">
          {!isCallStarted ? (
            <Button 
              variant="contained" 
              color="success" 
              onClick={startCall} 
              startIcon={<Phone />}
              disabled={connectionStatus !== 'connected'}
            >
              Start Call
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="error" 
              onClick={endCall} 
              startIcon={<PhoneOff />}
            >
              End Call
            </Button>
          )}
        </Box>
      </div>
    </div>
  );
}
