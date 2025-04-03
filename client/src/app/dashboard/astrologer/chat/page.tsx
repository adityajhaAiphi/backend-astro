'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,   
  ListItemText,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Paper,
  Badge,
  Chip,
  IconButton,
  Breadcrumbs,
  Alert
} from '@mui/material';
import {
  Search,
  MessageCircle,
  Clock,
  DollarSign,
  Circle,
  X,
  ArrowLeft
} from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { toast } from 'react-toastify';
import { Chat } from '@/components/Chat';
import Link from 'next/link';

interface ChatSession {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: string;
  duration: number;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
  messages?: Array<{
    _id: string;
    senderId: string;
    message: string;
    messageType: string;
    timestamp: string;
  }>;
}

function ChatPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const userId = searchParams.get('userId');
  const userName = searchParams.get('userName');
  const roomId = searchParams.get('roomId');

  useEffect(() => {
    // Validate required parameters
    if (!userId || !userName || !roomId) {
      toast.error('Missing required chat parameters');
      return;
    }

    // Verify user role
    if (!user || user.role !== 'astrologer') {
      toast.error('Only astrologers can access this page');
      router.push('/dashboard/astrologer');
      return;
    }
  }, [userId, userName, roomId, user, router]);

  if (!userId || !userName || !roomId) {
    return (
      <Box p={3}>
        <Box mb={2}>
          <IconButton onClick={() => router.push('/dashboard/astrologer/users')}>
            <ArrowLeft />
          </IconButton>
          <Typography variant="h6">Missing Chat Information</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to initialize chat. Missing required information.
        </Alert>
        <Box mt={2}>
          <Link href="/dashboard/astrologer/users">
            Return to users list
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton 
          onClick={() => router.back()}
          sx={{ mr: 2 }}
        >
          <ArrowLeft />
        </IconButton>
        <Box>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/dashboard/astrologer">
              Dashboard
            </Link>
            <Link href="/dashboard/astrologer/users">
              Users
            </Link>
            <Typography color="text.primary">
              {userName}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h5">
            Chat with {userName}
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
          userId={userId}
          userName={userName}
          isAstrologer={true}
          layout="fullscreen"
          roomId={roomId}
        />
      </Paper>
    </Box>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
