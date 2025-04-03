'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Typography,
  Box,
  CircularProgress,
  Paper,
  IconButton,
  Breadcrumbs,
  Alert
} from '@mui/material';
import {
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Chat } from '@/components/Chat';
import Link from 'next/link';

function ChatPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const astrologerId = searchParams.get('astrologerId');
  const astrologerName = searchParams.get('astrologerName');
  const roomId = searchParams.get('roomId');

  useEffect(() => {
    // Validate required parameters
    if (!astrologerId || !astrologerName || !roomId) {
      toast.error('Missing required chat parameters');
      return;
    }

    // Verify user role
    if (!user || user.role !== 'user') {
      toast.error('Only users can access this page');
      router.push('/dashboard/user');
      return;
    }
  }, [astrologerId, astrologerName, roomId, user, router]);

  if (!astrologerId || !astrologerName || !roomId) {
    return (
      <Box p={3}>
        <Box mb={2}>
          <IconButton onClick={() => router.push('/dashboard/user/astrologers')}>
            <ArrowLeft />
          </IconButton>
          <Typography variant="h6">Missing Chat Information</Typography>
        </Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Unable to initialize chat. Missing required information.
        </Alert>
        <Box mt={2}>
          <Link href="/dashboard/user/astrologers">
            Return to astrologers list
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
            <Link href="/dashboard/user">
              Dashboard
            </Link>
            <Link href="/dashboard/user/astrologers">
              Astrologers
            </Link>
            <Typography color="text.primary">
              {astrologerName}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h5">
            Chat with {astrologerName}
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
          astrologerId={astrologerId}
          astrologerName={astrologerName}
          userId={user?._id || ''}
          userName={user?.name || 'User'}
          isAstrologer={false}
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