'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Box, Card, Button } from '@mui/material';
import { Phone } from 'lucide-react';

interface ActiveCall {
  roomId: string;
  userId: string;
  timestamp: string;
}

export default function AstrologerCalls() {
  const router = useRouter();
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('wss://astroalert-backend-m1hn.onrender.com/calls');

    ws.onopen = () => {
      console.log('Connected to call service');
      setWsConnected(true);
      // Identify as astrologer to receive active calls
      ws.send(JSON.stringify({
        type: 'join',
        role: 'astrologer',
        userId: Math.random().toString(36).substring(7)
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received:', data);

      if (data.type === 'join' && data.role === 'user') {
        // Add new call to the list
        setActiveCalls(prev => [...prev, {
          roomId: data.roomId,
          userId: data.userId,
          timestamp: data.timestamp
        }]);
      }

      if (data.type === 'active_calls') {
        setActiveCalls(data.calls);
      }

      // Remove call when user leaves
      if (data.type === 'user_left') {
        setActiveCalls(prev => prev.filter(call => call.roomId !== data.roomId));
      }
    };

    return () => ws.close();
  }, []);

  const joinCall = (roomId: string) => {
    router.push(`/call/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sacred-chandan via-white to-sacred-haldi/10 p-8">
      <div className="max-w-3xl mx-auto">
        <Typography variant="h4" className="mb-6 text-sacred-kumkum">Active Call Requests</Typography>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-sacred-haldi/20">
          {wsConnected ? (
            activeCalls.length > 0 ? (
              <div className="space-y-4">
                {activeCalls.map((call) => (
                  <Card key={call.roomId} className="p-4 border-l-4 border-l-sacred-kumkum">
                    <Box className="flex justify-between items-center">
                      <div>
                        <Typography variant="h6">New Call Request</Typography>
                        <Typography variant="body2" color="textSecondary">
                          Started {new Date(call.timestamp).toLocaleTimeString()}
                        </Typography>
                      </div>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Phone />}
                        onClick={() => joinCall(call.roomId)}
                        className="bg-sacred-kumkum hover:bg-sacred-kumkum/90"
                      >
                        Join Now
                      </Button>
                    </Box>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Typography variant="h6" className="text-sacred-rudraksha mb-2">
                  No Active Calls
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  When users start a call, it will appear here instantly
                </Typography>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Typography variant="h6" className="text-sacred-rudraksha">
                Connecting to call service...
              </Typography>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
