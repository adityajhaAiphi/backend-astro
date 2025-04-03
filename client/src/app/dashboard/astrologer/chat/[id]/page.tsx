'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, IconButton, Breadcrumbs } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Chat } from '@/components/Chat';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ChatSession {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  lastMessage: string;
  startTime: string;
  status: 'active' | 'completed' | 'cancelled';
}

// Using a simple type assertion approach that works across Next.js versions
export default function SingleChatPage(props: any) {
  const { id } = props.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchChatSession = async () => {
      try {
        const response = await fetch(`/api/astrologer/chat?id=${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chat session');
        }

        const data = await response.json();
        setChatSession(data);
      } catch (error) {
        console.error('Error fetching chat session:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'astrologer' && id) {
      fetchChatSession();
    }
  }, [id, user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!chatSession) {
    return (
      <Box p={3}>
        <Box mb={2}>
          <IconButton onClick={() => router.push('/dashboard/astrologer/chats')}>
            <ArrowLeft />
          </IconButton>
          <Typography variant="h6">Chat not found</Typography>
        </Box>
        <Typography>
          This chat session may have been deleted or you don't have permission to view it.
        </Typography>
        <Box mt={2}>
          <Link href="/dashboard/astrologer/chats">
            Return to all chats
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton 
          onClick={() => router.push('/dashboard/astrologer/chats')}
          sx={{ mr: 2 }}
        >
          <ArrowLeft />
        </IconButton>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/dashboard/astrologer">
              Dashboard
            </Link>
            <Link href="/dashboard/astrologer/chats">
              Chats
            </Link>
            <Typography color="text.primary">
              {chatSession.userId.name}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h5">
            Chat with {chatSession.userId.name}
          </Typography>
        </Box>
      </Box>

      <Paper 
        elevation={2} 
        sx={{ 
          height: 'calc(100vh - 180px)', 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2
        }}
      >
        <Chat
          astrologerId={user?._id || ''}
          astrologerName={user?.name || 'Astrologer'}
          userId={chatSession.userId._id}
          userName={chatSession.userId.name}
          isAstrologer={true}
          layout="fullscreen"
        />
      </Paper>
    </Box>
  );
} 