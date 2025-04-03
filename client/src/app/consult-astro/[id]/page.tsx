'use client'

import React from 'react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Chat } from '@/components/Chat';
import { SparklesCore } from '@/components/ui/sparkles';
import { Alert } from '@mui/material';

interface ChatSession {
  sessionId: string;
  startTime: string;
  endTime: string;
  duration: number;
  messages: Array<{
    id: string;
    text: string;
    senderId: string;
    timestamp: string;
  }>;
}

interface AstrologerDetails {
  _id: string;
  name: string;
  profileImage?: string;
}

// Using a simple type assertion approach that works across Next.js versions
export default function ConsultAstro(props: any) {
  // Access id from props.params
  const id = props.params?.id;

  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [astrologer, setAstrologer] = useState<AstrologerDetails | null>(null);
  const [isLoadingAstrologer, setIsLoadingAstrologer] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchAstrologerDetails = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/astrologers/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch astrologer details');
        }

        const data = await response.json();
        setAstrologer(data);
      } catch (err) {
        console.error('Error fetching astrologer:', err);
        setError('Failed to load astrologer details');
      } finally {
        setIsLoadingAstrologer(false);
      }
    };

    const fetchChatHistory = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }

        const data = await response.json();
        if (data.success) {
          setChatHistory(data.sessions);
        } else {
          throw new Error(data.message || 'Failed to fetch chat history');
        }
      } catch (err) {
        console.error('Error fetching chat history:', err);
        setError('Failed to load chat history');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (user) {
      fetchAstrologerDetails();
      fetchChatHistory();
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-sacred-chandan via-white to-sacred-haldi/10">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-sacred-kumkum via-sacred-haldi to-sacred-tilak blur-2xl opacity-20 animate-pulse" />
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-[200px] h-[200px]"
            particleColor="#FF4B2B"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-sacred-kumkum">॥ Loading ॥</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-sacred-chandan via-white to-sacred-haldi/10">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-sacred-haldi/20">
          <h2 className="text-2xl font-bold text-sacred-kumkum mb-4">॥ Sacred Connection Required ॥</h2>
          <p className="text-sacred-rudraksha/80">Please login to begin your spiritual journey</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sacred-chandan via-white to-sacred-haldi/10 relative">
      {/* Sacred Om Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/om-pattern.png')] bg-repeat opacity-20" />
      </div>

      <BackgroundBeams className="opacity-25" />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {error && (
          <Alert severity="error" className="mb-4 bg-red-50 border border-red-200">
            {error}
          </Alert>
        )}

        {/* Chat History Section with Enhanced Sacred Styling */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative inline-block mb-6"
          >
            <div
              className="relative bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 border-2 border-sacred-haldi/20
                          shadow-[0_0_15px_rgba(255,75,43,0.2)]"
            >
              <span
                className="text-lg bg-gradient-to-r from-sacred-kumkum via-sacred-haldi to-sacred-tilak
                             bg-clip-text text-transparent font-semibold"
              >
                ॥ पूर्व परामर्श ॥
              </span>
            </div>
          </motion.div>

          {isLoadingHistory ? (
            <div className="text-sacred-rudraksha/60 text-center">
              Loading divine wisdom...
            </div>
          ) : (
            <div className="space-y-6">
              {chatHistory.length > 0 ? (
                chatHistory.map((session) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-md border border-sacred-haldi/10
                           hover:shadow-sacred-kumkum/10 transition-shadow duration-300"
                  >
                    <div className="space-y-3">
                      {session.messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, x: msg.senderId === user._id ? 20 : -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-3 rounded-lg max-w-[80%] ${
                            msg.senderId === user._id
                              ? 'ml-auto bg-gradient-to-r from-sacred-kumkum/10 to-sacred-haldi/10 border border-sacred-haldi/20'
                              : 'bg-sacred-chandan/50 border border-sacred-rudraksha/20'
                          }`}
                        >
                          <div className={msg.senderId === user._id ? 'text-sacred-kumkum' : 'text-sacred-rudraksha'}>
                            {msg.text}
                          </div>
                          <div className="text-xs text-sacred-rudraksha/50 mt-1">
                            {format(new Date(msg.timestamp), 'p')}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-sacred-rudraksha/70 text-center py-6">
                  No previous consultations found with this astrologer.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Current Chat Section with Sacred Styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-sacred-haldi/20
                   hover:shadow-sacred-kumkum/10 transition-shadow duration-300"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-sacred-kumkum flex items-center gap-2">
              <span>🕉</span> वर्तमान परामर्श
              {astrologer && <span className="ml-1">with {astrologer.name}</span>}
            </h2>
          </div>
          <Chat astrologerId={id} astrologerName={astrologer?.name || 'Astrologer'} />
        </motion.div>
      </div>
    </main>
  );
}