import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

export function useSocket() {
  const { user, getToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
                   'https://astroalert-backend-m1hn.onrender.com';
    
    console.log('Connecting to Socket.IO server at:', baseUrl);

    // Initialize socket connection with consistent config
    socketRef.current = io(baseUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true,
      auth: {
        userId: user._id,
        token: getToken()
      }
    });

    // Add heartbeat to keep connection alive
    const heartbeat = setInterval(() => {
      socketRef.current?.emit('ping');
    }, 25000);

    // Enhanced connection logging
    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO server with ID:', socketRef.current?.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
      // Improved error handling and reconnection logic
      const retryDelay = Math.min(1000 * Math.pow(2, 0), 10000);
      console.log(`Retrying connection in ${retryDelay}ms...`);
      
      setTimeout(() => {
        if (socketRef.current?.connected) return;
        try {
          socketRef.current?.connect();
        } catch (err) {
          console.error('Reconnection failed:', err);
        }
      }, retryDelay);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Disconnected from socket server:', reason);
    });

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeat);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id, getToken]);

  return socketRef.current;
}